import {z} from 'zod'
import {adminAuth,readJson,json,jobFailure,JobError} from '@/lib/api-security'
import {deleteStoredFile} from '@/lib/storage'
export async function POST(request:Request){
 try{
  const {db}=await adminAuth(request)
  const body=await readJson(request)
  const input=z.object({id:z.string().uuid(),type:z.enum(['document','payment_proof'])}).strict().safeParse(body)
  if(!input.success)throw new JobError('INVALID_INPUT',400)
  await deleteStoredFile(db,input.data.id,input.data.type==='payment_proof'?'proof':'document')
  return json({deleted:true})
 }catch(error){return jobFailure(error)}
}
