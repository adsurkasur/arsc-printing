import {z} from 'zod'
import {adminAuth,json,JobError,jobFailure} from '@/lib/api-security'
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
 try{const {id}=await params;if(!z.string().uuid().safeParse(id).success)throw new JobError('INVALID_INPUT',400)
 const {db}=await adminAuth(request)
 const {data:o,error}=await db.from('orders').select('id,pickup_code,customer_name,status,payment_status,amount_due,actual_pages,copies,created_at,verified_at,approved_at,delivered_at').eq('id',id).maybeSingle()
 if(error)throw new JobError('LOCAL_BACKEND_UNAVAILABLE',503);if(!o)throw new JobError('NOT_FOUND',404)
 const jobs=await db.from('print_jobs').select('id,revision,status,printer_key,target_worker_id,backend_job_id,backend_instance_id,last_error_code').eq('order_id',id).order('revision')
 if(jobs.error)throw new JobError('LOCAL_BACKEND_UNAVAILABLE',503)
 const events=jobs.data.length?await db.from('print_job_events').select('event_id,job_id,type,created_at').in('job_id',jobs.data.map(j=>j.id)).order('created_at').order('event_id'):{data:[],error:null}
 if(events.error)throw new JobError('LOCAL_BACKEND_UNAVAILABLE',503)
 return json({order:{id:o.id,pickupCode:o.pickup_code,customerName:o.customer_name,status:o.status,paymentStatus:o.payment_status,amountDue:o.amount_due,pages:o.actual_pages,copies:o.copies,createdAt:o.created_at,verifiedAt:o.verified_at,approvedAt:o.approved_at,deliveredAt:o.delivered_at},jobs:jobs.data.map(j=>({id:j.id,revision:j.revision,status:j.status,printerKey:j.printer_key,workerId:j.target_worker_id,backendJobId:j.backend_job_id,backendInstanceId:j.backend_instance_id,lastErrorCode:j.last_error_code})),events:events.data.map(e=>({eventId:e.event_id,jobId:e.job_id,type:e.type,createdAt:e.created_at})),backendCompletionIsPhysicalProof:false})
 }catch(error){return jobFailure(error)}
}
