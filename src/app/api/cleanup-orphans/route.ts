import {requireCron,localDb,json,jobFailure} from '@/lib/api-security'
import {cleanupExpired} from '@/lib/storage'
export async function POST(request:Request){
 try{
  requireCron(request)
  // Never infer orphan status from a root-bucket listing: in-flight uploads may not be linked yet.
  // Until a transactional upload manifest exists, this endpoint only cleans referenced expired files.
  return json({...await cleanupExpired(localDb()),mode:'referenced_expired_only',orphanSweep:'disabled'})
 }catch(error){return jobFailure(error)}
}
export async function GET(){return json({error:{code:'METHOD_NOT_ALLOWED',message:'GET never performs cleanup'}},405)}
