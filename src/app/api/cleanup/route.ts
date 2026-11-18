import {requireCron,localDb,json,jobFailure} from '@/lib/api-security'
import {cleanupExpired} from '@/lib/storage'
export async function POST(request:Request){
 try{requireCron(request);return json(await cleanupExpired(localDb()))}catch(error){return jobFailure(error)}
}
export async function GET(){return json({error:{code:'METHOD_NOT_ALLOWED',message:'POST required'}},405)}
