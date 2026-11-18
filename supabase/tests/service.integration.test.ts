import test from 'node:test'
import assert from 'node:assert/strict'
import {randomUUID,randomBytes,createHash} from 'node:crypto'
import {createClient} from '@supabase/supabase-js'

type Row=Record<string,unknown>
interface Pg {unsafe(q:string,args?:unknown[]):Promise<Row[]>;begin<T>(fn:(tx:Pg)=>Promise<T>):Promise<T>;close():Promise<void>}
type Result={id:string;status:string;csrfToken:string;pickupCode:string;version:number;items:Row[];page:number;pageSize:number;total:number;date:string;timeZone:string;orderCount:number;pages:number;revenueVerified:number;order:Row;jobs:Row[];events:Row[];backendCompletionIsPhysicalProof:boolean;error:{code:string}}
const integration=process.env.ARSC_DB_TEST_URL?test:test.skip
integration('service features against real Supabase and Next API',async()=>{
 const check=async(name:string,fn:()=>Promise<void>)=>{await fn();console.log('PASS '+name)}
 const NativeSQL=(globalThis as unknown as {Bun:{SQL:new(url:string)=>Pg}}).Bun.SQL
 const db=new NativeSQL(process.env.ARSC_DB_TEST_URL!),q=(sql:string,args:unknown[]=[])=>db.unsafe(sql,args)
 const base=process.env.ARSC_E2E_API_URL??'http://127.0.0.1:3100';assert.equal(new URL(base).hostname,'127.0.0.1')
 const service=createClient(process.env.ARSC_LOCAL_SUPABASE_URL!,process.env.ARSC_LOCAL_SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false}})
 const login=createClient(process.env.ARSC_LOCAL_SUPABASE_URL!,process.env.ARSC_LOCAL_SUPABASE_ANON_KEY!,{auth:{persistSession:false}})
 const email=`feature-${randomUUID()}@synthetic.invalid`,password=randomBytes(32).toString('hex')
 const user=await service.auth.admin.createUser({email,password,email_confirm:true});assert.ok(user.data.user&&!user.error)
 await q("insert into public.user_roles(user_id,role) values($1,'admin')",[user.data.user!.id])
 const session=await login.auth.signInWithPassword({email,password});assert.ok(session.data.session&&!session.error)
 const admin={Authorization:'Bearer '+session.data.session!.access_token}
 const api=async(path:string,headers:Record<string,string>={},body?:Row)=>{
  const r=await fetch(base+path,{method:body?'POST':'GET',headers:{Origin:base,'Content-Type':'application/json',...headers},body:body?JSON.stringify(body):undefined})
  return {status:r.status,value:await r.json() as Result,cookie:r.headers.get('set-cookie')?.split(';')[0]??''}
 }
 const create=async(name='Feature '+randomUUID())=>{
  const r=await api('/api/orders',{'Idempotency-Key':randomUUID()},{customer_name:name,contact:'synthetic',copies:1,color_mode:'bw',paper_size:'A4'})
  assert.equal(r.status,201);return r
 }
 try{
  const tag='Feature-'+randomUUID(),first=await create(tag+' Alice'),second=await create(tag+' Bob')
  const detail=await api('/api/orders?id='+first.value.id,{Cookie:first.cookie});assert.equal(detail.status,200)
  const owner={Cookie:first.cookie,'X-CSRF-Token':detail.value.csrfToken}
  await check('pickup format, concurrent uniqueness and capability-only visibility',async()=>{
   assert.match(first.value.pickupCode,/^ARSC-\d{4}$/)
   const codes=await Promise.all(Array.from({length:12},()=>create()))
   assert.equal(new Set(codes.map(c=>c.value.pickupCode)).size,12)
   assert.equal((await api('/api/orders?id='+first.value.id)).status,403)
   assert.equal((await api('/api/orders?id='+first.value.id,{Cookie:second.cookie})).status,403)
   assert.equal((await api('/api/orders?id='+first.value.pickupCode)).status,400)
   assert.equal((await api('/api/orders?pickupCode='+first.value.pickupCode)).status,400)
   assert.equal((await api('/api/admin/orders?q='+first.value.pickupCode)).status,401)
   const queue=await api('/api/queue');assert.ok(!JSON.stringify(queue.value).includes('pickup'))
   assert.equal(detail.value.pickupCode,first.value.pickupCode)
   await assert.rejects(q("update public.orders set pickup_code=$1 where id=$2",[first.value.pickupCode,second.value.id]),/duplicate key/)
  })
  await check('cancel requires CSRF/capability, version; retry is idempotent',async()=>{
   assert.equal((await api(`/api/orders/${first.value.id}/cancel`,{Cookie:first.cookie},{expectedVersion:0})).status,403)
   assert.equal((await api(`/api/orders/${first.value.id}/cancel`,{Cookie:second.cookie,'X-CSRF-Token':detail.value.csrfToken},{expectedVersion:0})).status,403)
   assert.equal((await api(`/api/orders/${first.value.id}/cancel`,owner,{expectedVersion:99})).status,409)
   const cancelled=await api(`/api/orders/${first.value.id}/cancel`,owner,{expectedVersion:0});assert.equal(cancelled.status,200);assert.equal(cancelled.value.status,'cancelled')
   const retry=await api(`/api/orders/${first.value.id}/cancel`,owner,{expectedVersion:0});assert.deepEqual(retry.value,cancelled.value)
   const expiry=(await q('select file_expires_at,payment_proof_expires_at from public.orders where id=$1',[first.value.id]))[0];assert.ok(expiry.file_expires_at&&expiry.payment_proof_expires_at)
   // Reuse is allowed only after the previous holder is terminal.
   await q('update public.orders set pickup_code=$1 where id=$2',[first.value.pickupCode,second.value.id])
  })
  await check('cancel rejected whenever a job exists, including pending inconsistent row',async()=>{
   const worker=randomUUID();await q("insert into public.print_workers(id,credential_hash,printer_key) values($1,$2,'fake')",[worker,'a'.repeat(64)])
   await q("insert into public.print_jobs(order_id,revision,target_worker_id,printer_key,document_path,document_sha256,document_size,options) values($1,1,$2,'fake','synthetic','"+'a'.repeat(64)+"',1,'{}')",[second.value.id,worker])
   const d=await api('/api/orders?id='+second.value.id,{Cookie:second.cookie})
   const headers={Cookie:second.cookie,'X-CSRF-Token':d.value.csrfToken}
   assert.equal((await api(`/api/orders/${second.value.id}/cancel`,headers,{expectedVersion:0})).status,409)
   await q("update public.orders set status='approved' where id=$1",[second.value.id])
   assert.equal((await api(`/api/orders/${second.value.id}/cancel`,headers,{expectedVersion:0})).status,409)
  })
  await check('admin pagination, status/name/code/date filters and literal search',async()=>{
   const r=await api('/api/admin/orders?page=1&pageSize=1&q='+encodeURIComponent(tag),admin)
   assert.equal(r.status,200);assert.equal(r.value.total,2);assert.equal(r.value.items.length,1)
   const next=await api('/api/admin/orders?page=2&pageSize=1&q='+encodeURIComponent(tag),admin)
   assert.notEqual(r.value.items[0].id,next.value.items[0].id)
   assert.equal((await api('/api/admin/orders?status=approved&q='+encodeURIComponent(tag),admin)).value.total,1)
   assert.equal((await api('/api/admin/orders?q='+second.value.pickupCode,admin)).status,200)
   assert.equal((await api('/api/admin/orders?q='+encodeURIComponent('%'),admin)).value.total,0)
   assert.equal((await api('/api/admin/orders?q='+encodeURIComponent('x),status.eq.approved'),admin)).value.total,0)
   for(const input of ['page=0','pageSize=101','from=2026-02-30','from=2026-12-02&to=2026-12-01','status=printing','other=x'])assert.equal((await api('/api/admin/orders?'+input,admin)).status,400)
   assert.ok(!JSON.stringify(r.value).includes('capability_hash'));assert.ok(!JSON.stringify(r.value).includes('credential_hash'))
  })
  await check('Jakarta day boundaries and revenue only verified non-cancelled',async()=>{
   const day='2098-02-04'
   // Use a unique future day per run by rolling fixtures into a transaction below.
   await assert.rejects(db.begin(async tx=>{
    await tx.unsafe("insert into public.orders(customer_name,contact,status,payment_status,amount_due,actual_pages,copies,created_at,verified_at) values('TZ verified','synthetic','pending_verification','verified',1250,2,3,'2098-02-03T17:00:00Z','2098-02-03T17:00:00Z'),('TZ cancelled','synthetic','cancelled','verified',9000,1,1,'2098-02-04T16:59:59Z','2098-02-04T16:59:59Z'),('TZ rejected','synthetic','pending_verification','rejected',8000,1,1,'2098-02-04T16:00:00Z','2098-02-04T16:00:00Z'),('TZ outside','synthetic','pending_verification','verified',3000,1,1,'2098-02-04T17:00:00Z','2098-02-04T17:00:00Z')")
    const result=(await tx.unsafe('select public.admin_daily_summary($1::date) as value',[day]))[0].value as Row
    assert.equal(result.orderCount,3);assert.equal(result.pages,8);assert.equal(result.revenueVerified,1250)
   throw new Error('ROLLBACK_SYNTHETIC_FIXTURES')
   }),/ROLLBACK_SYNTHETIC_FIXTURES/)
   const result=await api('/api/admin/summary?date='+day,admin);assert.equal(result.status,200);assert.equal(result.value.timeZone,'Asia/Jakarta');assert.equal(result.value.revenueVerified,0)
   assert.equal((await api('/api/admin/summary?date=2098-02-30',admin)).status,400)
  })
  await check('worker list and receipt are admin-only and exclude secrets',async()=>{
   for(const path of ['/api/admin/workers',`/api/admin/orders/${second.value.id}/receipt`,'/api/admin/summary'])assert.equal((await api(path)).status,401)
   const workers=await api('/api/admin/workers',admin);assert.equal(workers.status,200);assert.ok(workers.value.items.length)
   assert.ok(workers.value.items.every(w=>Object.keys(w).sort().join(',')==='enabled,id,printerKey'))
   const receipt=await api(`/api/admin/orders/${second.value.id}/receipt`,admin);assert.equal(receipt.status,200);assert.equal(receipt.value.backendCompletionIsPhysicalProof,false);assert.equal(receipt.value.jobs.length,1)
   assert.ok(!JSON.stringify(receipt.value).includes('claim_token'));assert.ok(!JSON.stringify(receipt.value).includes('credential'))
   assert.equal((await api(`/api/admin/orders/${randomUUID()}/receipt`,admin)).status,404)
  })
 }finally{await db.close()}
})
