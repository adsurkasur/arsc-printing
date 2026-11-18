import {z} from 'zod'
import {adminAuth,json,jobFailure,JobError} from '@/lib/api-security'
import {canonicalPath} from '@/lib/storage'
export async function GET(request:Request,context:{params:Promise<{id:string}>}){
 try{
  const {db}=await adminAuth(request);const {id}=await context.params
  const kind=new URL(request.url).searchParams.get('kind')
  if(!z.string().uuid().safeParse(id).success||!['document','proof'].includes(kind??''))throw new JobError('INVALID_INPUT',400)
  const {data:o,error}=await db.from('orders').select('file_path,file_deleted,payment_proof_path,payment_proof_deleted').eq('id',id).maybeSingle()
  if(error)throw new JobError('LOCAL_BACKEND_UNAVAILABLE',503)
  if(!o)throw new JobError('NOT_FOUND',404)
  const path=kind==='document'?o.file_path:o.payment_proof_path
  if(!path||(kind==='document'?o.file_deleted:o.payment_proof_deleted))throw new JobError('DOCUMENT_DELETED',410)
  canonicalPath(id,kind as 'document'|'proof',path)
  const {data,error:signError}=await db.storage.from('documents').createSignedUrl(path,60,{download:true})
  if(signError||!data)throw new JobError('LOCAL_BACKEND_UNAVAILABLE',503)
  return json({url:data.signedUrl,expiresIn:60})
 }catch(error){return jobFailure(error)}
}
