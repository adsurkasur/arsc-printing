import {localDb,json,jobFailure,JobError} from '@/lib/api-security'
export async function GET(){
 try{
  const {data,error}=await localDb().from('orders').select('estimated_time').in('status',['pending_verification','approved']).limit(1001)
  if(error||!data||data.length>1000)throw new JobError('LOCAL_BACKEND_UNAVAILABLE',503)
  return json({count:data.length,estimatedTime:data.reduce((sum,o)=>sum+Math.max(0,Number(o.estimated_time)||0),0)})
 }catch(error){return jobFailure(error)}
}
