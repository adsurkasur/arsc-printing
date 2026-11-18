import {z} from 'zod'
import {randomUUID} from 'node:crypto'
import {adminAuth,assertOrigin,capabilityToken,capabilityCookie,csrfFor,customerAuth,customerOrder,parseOrder,readJson,localDb,signingSecret,sha256,JobError,json,jobFailure} from '@/lib/api-security'
export const runtime='nodejs'
const adminColumns='id,pickup_code,customer_name,contact,file_name,status,version,revision,payment_status,amount_due,legacy_review_required,created_at,estimated_time,copies,pages,actual_pages,paper_size,color_mode,layout,scale_mode,orientation,user_note,file_deleted,payment_proof_deleted,print_jobs(id,order_id,revision,status,version,target_worker_id,printer_key,lease_generation,lease_until,submission_started_at,backend_job_id,last_error_code)'
export async function GET(request:Request){
 try{
  const params=new URL(request.url).searchParams
  if([...params.keys()].some(k=>k!=='id'))throw new JobError('INVALID_INPUT',400)
  const id=params.get('id')
  if(id){
   const {order,token:customerAuthToken}=await customerAuth(request,id)
   return json({...customerOrder(order),csrfToken:csrfFor(customerAuthToken)})
  }
  const {db}=await adminAuth(request)
  const {data,error}=await db.from('orders').select(adminColumns).order('created_at',{ascending:false}).limit(200)
  if(error)throw new JobError('LOCAL_BACKEND_UNAVAILABLE',503)
  return json(data.map(o=>({...o,pickupCode:o.pickup_code})))
 }catch(error){return jobFailure(error)}
}
export async function POST(request:Request){
 try{
  assertOrigin(request)
  const key=request.headers.get('idempotency-key')
  if(!z.string().uuid().safeParse(key).success)throw new JobError('INVALID_INPUT',400)
  const input=parseOrder(await readJson(request))
  const requestHash=sha256(JSON.stringify(input));const token=capabilityToken(key!,signingSecret())
  const db=localDb()
  const {data:existing,error:lookupError}=await db.from('orders').select('id,status,request_hash,pickup_code').eq('creation_key',key).maybeSingle()
  if(lookupError)throw new JobError('LOCAL_BACKEND_UNAVAILABLE',503)
  let order=existing
  if(!order){
   const {data,error}=await db.from('orders').insert({...input,id:randomUUID(),file_name:'',status:'pending_verification',
    payment_status:'pending',file_deleted:false,payment_proof_deleted:false,capability_hash:sha256(token),
    creation_key:key,request_hash:requestHash,amount_due:0,estimated_time:0}).select('id,status,request_hash,pickup_code').single()
   if(error?.message==='PICKUP_CAPACITY')throw new JobError('PICKUP_CAPACITY',503)
   if(error&&error.code!=='23505')throw new JobError('LOCAL_BACKEND_UNAVAILABLE',503)
   order=data
   if(!order){const retry=await db.from('orders').select('id,status,request_hash,pickup_code').eq('creation_key',key).maybeSingle();order=retry.data}
  }
  if(!order)throw new JobError('LOCAL_BACKEND_UNAVAILABLE',503)
  if(order.request_hash!==requestHash)throw new JobError('IDEMPOTENCY_CONFLICT')
  const response=json({id:order.id,status:order.status,csrfToken:csrfFor(token),pickupCode:order.pickup_code},existing?200:201)
  response.headers.set('Set-Cookie',capabilityCookie(order.id,token,new URL(request.url).protocol==='https:'))
  return response
 }catch(error){return jobFailure(error)}
}
export async function PATCH(){return json({error:{code:'METHOD_NOT_ALLOWED',message:'Use authorized admin actions'}},405)}
