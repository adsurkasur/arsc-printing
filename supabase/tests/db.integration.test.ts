import test from 'node:test'
import assert from 'node:assert/strict'
import {randomUUID,createHash} from 'node:crypto'

type Row=Record<string,unknown>
interface Pg {unsafe(q:string,args?:unknown[]):Promise<Row[]>;begin<T>(fn:(tx:Pg)=>Promise<T>):Promise<T>;close():Promise<void>}
const hash=(s:string)=>createHash('sha256').update(s).digest('hex')

const integration=process.env.ARSC_DB_TEST_URL?test:test.skip
integration('real Supabase database invariants', async ()=>{
 const check=async(name:string,fn:()=>Promise<void>)=>{await fn();console.log("PASS "+name)}
 const NativeSQL=(globalThis as unknown as {Bun:{SQL:new(url:string)=>Pg}}).Bun.SQL
 const db=new NativeSQL(process.env.ARSC_DB_TEST_URL!)
 const admin=randomUUID(),worker=randomUUID(),token=hash(randomUUID())
 const q=(s:string,a:unknown[]=[])=>db.unsafe(s,a)
 const action=async(id:string,body:Row)=> (await q('select public.admin_print_action($1,$2,$3::jsonb) as value',[admin,id,body]))[0].value as {order:Row;job:Row}
 const makeOrder=async()=>{
  const id=randomUUID()
  await q(`insert into public.orders(id,customer_name,contact,file_name,file_path,file_mime,file_sha256,file_size,actual_pages,pages,payment_proof_path,amount_due)
   values($1,'Synthetic DB test','synthetic','test.pdf',$2,'application/pdf',$3,100,1,1,$4,500)`,[id,`orders/${id}/document/test.pdf`,hash(id),`orders/${id}/proof/test.png`])
  return id
 }
 const approve=async()=>{const id=await makeOrder();await action(id,{action:'verify_payment',expectedVersion:0});return action(id,{action:'approve',expectedVersion:1,workerId:worker,printerKey:'fake'})}
 const claim=async(conn:Pg=db)=> (await conn.unsafe('select public.claim_print_job($1,$2,$3,$4) as value',[worker,randomUUID(),'fake',token]))[0].value as Row|null
 const event=async(job:Row,type:string,extra:Row={},eventId=randomUUID(),requestHash=hash(eventId))=>{
  const body={eventId,type,version:job.version,generation:job.generation,...extra}
  return (await q('select public.report_print_event($1,$2,$3,$4::jsonb,$5) as value',[worker,job.id,token,body,requestHash]))[0].value as Row
 }
 try{
  await q("insert into auth.users(id,aud,role,email) values($1,'authenticated','authenticated',$2)",[admin,`${admin}@synthetic.invalid`])
  await q("insert into public.user_roles(user_id,role) values($1,'admin')",[admin])
  await q("insert into storage.objects(bucket_id,name) values('documents',$1)",["synthetic-rls/"+randomUUID()])
  await q("insert into public.print_workers(id,credential_hash,printer_key) values($1,$2,'fake')",[worker,hash(worker)])
  await check('RLS denies anon/authenticated orders and storage reads',async()=>{
   for(const role of ['anon','authenticated'])for(const table of ['public.orders','storage.objects']){
    await db.begin(async tx=>{
     await tx.unsafe("select set_config('request.jwt.claim.sub',$1,true)",[randomUUID()])
     await tx.unsafe(`set local role ${role}`)
     if(table==='public.orders'&&role==='anon')await assert.rejects(tx.unsafe(`select * from ${table}`),/permission denied/)
     else assert.equal((await tx.unsafe(`select * from ${table}`)).length,0)
    })
   }
  })
  await check('admin RLS allows orders; non-admin cannot approve',async()=>{
   const id=await makeOrder()
   await db.begin(async tx=>{
    await tx.unsafe("select set_config('request.jwt.claim.sub',$1,true)",[admin]);await tx.unsafe('set local role authenticated')
    assert.equal((await tx.unsafe('select id from public.orders where id=$1',[id])).length,1)
   })
   await assert.rejects(q('select public.admin_print_action($1,$2,$3::jsonb)',[randomUUID(),id,{action:'verify_payment',expectedVersion:0}]),/FORBIDDEN/)
  })
  await check('approval retry creates exactly one job',async()=>{
   const result=await approve();const retry=await action(String(result.order.id),{action:'approve',expectedVersion:1,workerId:worker,printerKey:'fake'})
   assert.equal(result.job.id,retry.job.id)
   assert.equal(Number((await q('select count(*) as n from public.print_jobs where order_id=$1',[result.order.id]))[0].n),1)
  })
  await check('real SKIP LOCKED: concurrent claims have exactly one winner',async()=>{
   const other=new NativeSQL(process.env.ARSC_DB_TEST_URL!)
   try{await db.begin(async tx=>{
    const first=await claim(tx);assert.ok(first)
    const second=await Promise.race([claim(other),new Promise<never>((_,reject)=>setTimeout(()=>reject(new Error('SKIP LOCKED blocked')),2500))])
    assert.equal(second,null)
   })}finally{await other.close()}
  })
  await check('fence rejects wrong token, generation, version and expired claim',async()=>{
   await approve();const job=(await claim())!
   await assert.rejects(q('select public.print_job_document($1,$2,$3,$4)',[worker,job.id,job.generation,hash('wrong')]),/STALE_CLAIM/)
   await assert.rejects(event({...job,generation:Number(job.generation)+1},'heartbeat'),/STALE_CLAIM/)
   await assert.rejects(event({...job,version:Number(job.version)+1},'heartbeat'),/STALE_VERSION/)
   await q("update public.print_jobs set lease_until=clock_timestamp()-interval '1 second' where id=$1",[job.id])
   await assert.rejects(event(job,'heartbeat'),/STALE_CLAIM/)
  })
  await check('expiry before intent requeues; after intent requires reconciliation',async()=>{
   await claim() // reap expired pre-intent; five-second backoff prevents immediate reclaim
   await approve();let job=(await claim())!;assert.ok(job)
   job=await event(job,'submission_started')
   await q("update public.print_jobs set lease_until=clock_timestamp()-interval '1 second' where id=$1",[job.id])
   await claim()
   assert.equal((await q('select status from public.print_jobs where id=$1',[job.id]))[0].status,'needs_reconciliation')
   assert.ok((await q("select id from public.print_jobs where target_worker_id=$1 and status='ready'",[worker])).length>=1)
  })
  await check('event replay is idempotent; conflicting payload is rejected',async()=>{
   await approve();const job=(await claim())!,id=randomUUID(),digest=hash(id)
   const one=await event(job,'heartbeat',{},id,digest),two=await event(job,'heartbeat',{},id,digest)
   assert.deepEqual(one,two)
   await assert.rejects(event(job,'heartbeat',{},id,hash('different')),/IDEMPOTENCY_CONFLICT/)
  })
  await check('legacy rows remain review-required and are never enqueued',async()=>{
   const rows=await q("select id from public.orders where customer_name='Synthetic legacy migration test'")
   assert.equal(rows.length,1)
   assert.equal(Number((await q('select count(*) as n from public.print_jobs where order_id=$1',[rows[0].id]))[0].n),0)
   assert.equal((await q('select legacy_review_required from public.orders where id=$1',[rows[0].id]))[0].legacy_review_required,true)
  })
 }finally{await db.close()}
})
