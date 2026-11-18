import test from 'node:test'
import assert from 'node:assert/strict'
import {randomUUID,randomBytes,createHash} from 'node:crypto'
import {readFileSync,mkdirSync} from 'node:fs'
import {spawnSync} from 'node:child_process'
import {createClient} from '@supabase/supabase-js'

const integration=process.env.ARSC_DB_TEST_URL?test:test.skip
integration('Next API + real Node worker + real Supabase full synthetic flow',async()=>{
 const base=process.env.ARSC_E2E_API_URL??'http://127.0.0.1:3100'
 assert.equal(new URL(base).hostname,'127.0.0.1')
 const backend=createClient(process.env.ARSC_LOCAL_SUPABASE_URL!,process.env.ARSC_LOCAL_SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false}})
 const email=`arsc-${randomUUID()}@synthetic.invalid`,password=randomBytes(32).toString('hex')
 const created=await backend.auth.admin.createUser({email,password,email_confirm:true})
 assert.ok(!created.error&&created.data.user,'synthetic auth admin creation must succeed')
 const uid=created.data.user!.id
 const grant=await backend.from('user_roles').insert({user_id:uid,role:'admin'});assert.equal(grant.error,null)
 const login=createClient(process.env.ARSC_LOCAL_SUPABASE_URL!,process.env.ARSC_LOCAL_SUPABASE_ANON_KEY!,{auth:{persistSession:false}})
 const signed=await login.auth.signInWithPassword({email,password});assert.ok(!signed.error&&signed.data.session,'synthetic admin login must succeed')
 const auth={'Authorization':'Bearer '+signed.data.session!.access_token,'Origin':base,'Content-Type':'application/json'}
 const worker=randomUUID(),secret=randomBytes(32).toString('hex')
 const registered=await backend.from('print_workers').insert({id:worker,credential_hash:createHash('sha256').update(secret).digest('hex'),printer_key:'fake'})
 assert.equal(registered.error,null)
 const orderResponse=await fetch(base+'/api/orders',{method:'POST',headers:{Origin:base,'Content-Type':'application/json','Idempotency-Key':randomUUID()},body:JSON.stringify({customer_name:'Synthetic E2E customer',contact:'synthetic-only',copies:2,color_mode:'bw',paper_size:'A4'})})
 assert.equal(orderResponse.status,201,'create order')
 const order=await orderResponse.json() as {id:string;status:string;csrfToken:string}
 assert.equal(order.status,'pending_verification')
 const cookie=orderResponse.headers.get('set-cookie')!.split(';')[0]
 console.log('E2E order',order.id,'pending_verification')
 for(const [kind,name,mime] of [['document','minimal.pdf','application/pdf'],['proof','proof.png','image/png']]){
  const form=new FormData();form.set('orderId',order.id);form.set('kind',kind);form.set('file',new Blob([readFileSync('tests/fixtures/'+name)],{type:mime}),name)
  const response=await fetch(base+'/api/upload',{method:'POST',headers:{Origin:base,Cookie:cookie,'X-CSRF-Token':order.csrfToken},body:form})
  const result=await response.json();assert.equal(response.status,200,`upload ${kind}: ${JSON.stringify(result)}`)
  if(kind==='document'){assert.equal(result.actualPages,1);assert.equal(result.amountDue,1000)}
 }
 const act=async(body:Record<string,unknown>)=>{
  const response=await fetch(base+`/api/admin/orders/${order.id}/action`,{method:'POST',headers:auth,body:JSON.stringify(body)})
  const result=await response.json();assert.equal(response.status,200,`admin ${body.action}: ${JSON.stringify(result)}`);return result
 }
 const verified=await act({action:'verify_payment',expectedVersion:2})
 const approved=await act({action:'approve',expectedVersion:verified.order.version,workerId:worker,printerKey:'fake'})
 console.log('E2E approved job',approved.job.id,'ready')
 const signedDoc=await fetch(base+`/api/admin/orders/${order.id}/document?kind=document`,{headers:auth});assert.equal(signedDoc.status,200)
 const code=`import {PrintWorker} from './worker/main.mjs';import {FakePrinterAdapter} from './worker/fake-printer.mjs';
 const dir=process.env.ARSC_E2E_STATE;
 const printer=new FakePrinterAdapter({receiptsDir:dir+'/receipts'});
 const w=new PrintWorker({workerId:process.env.ARSC_E2E_WORKER,workerSecret:process.env.ARSC_E2E_SECRET,apiBaseUrl:process.env.ARSC_E2E_BASE,stateDir:dir+'/state',tempDir:dir+'/temp',printer,allowedOrigins:[process.env.ARSC_LOCAL_SUPABASE_URL]});
 if(!w.state.acquireLock(w.workerId))throw Error('lock');
 try{const job=await w.claimJob();if(!job)throw Error('no claim');const result=await w.processJob(job);console.log(JSON.stringify({status:result.status,success:result.success,jobId:job.id}));if(!result.success)process.exitCode=1;}finally{w.stopHeartbeat();w.state.releaseLock();}`
 const state='.audit/e2e/'+randomUUID();mkdirSync(state,{recursive:true})
 const run=spawnSync(process.execPath.includes('bun')?'node':process.execPath,['--input-type=module','-e',code],{cwd:process.cwd(),encoding:'utf8',timeout:60000,env:{...process.env,ARSC_E2E_STATE:state,ARSC_E2E_WORKER:worker,ARSC_E2E_SECRET:secret,ARSC_E2E_BASE:base}})
 assert.equal(run.status,0,'real Node worker must finish: '+run.stdout+' '+run.stderr)
 const workerResult=JSON.parse(run.stdout.trim());assert.equal(workerResult.status,'backend_completed');console.log('E2E worker',workerResult)
 const delivered=await act({action:'deliver',expectedVersion:approved.order.version})
 assert.equal(delivered.order.status,'delivered');console.log('E2E order',order.id,'delivered')
 const events=await backend.from('print_job_events').select('type').eq('job_id',approved.job.id).order('created_at')
 console.log('E2E events',events.data?.map(row=>row.type).join(' -> '))
 assert.ok(events.data?.some(row=>row.type==='backend_completed'))
})
