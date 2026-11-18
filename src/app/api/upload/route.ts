import {randomUUID} from 'node:crypto'
import {assertOrigin,customerAuth,JobError,json,jobFailure} from '@/lib/api-security'
import {readUpload,validateFile,computePrice} from '@/lib/storage'
export const runtime='nodejs'
export async function POST(request:Request){
 try{
  assertOrigin(request)
  // Reject missing CSRF before parsing expensive multipart content.
  if(!/^[a-f0-9]{64}$/.test(request.headers.get('x-csrf-token')??''))throw new JobError('FORBIDDEN',403)
  const raw=await readUpload(request)
  const {db,order}=await customerAuth(request,raw.id,true)
  if(order.status!=='pending_verification')throw new JobError('INVALID_TRANSITION')
  const upload={...raw,...await validateFile(raw.kind,raw.bytes,raw.file.type)}
  const old=upload.kind==='document'?order.file_path:order.payment_proof_path
  const suffix=upload.sha256+(upload.mime==='application/pdf'?'.pdf':upload.mime==='image/png'?'.png':'.jpg')
  if(old){
   if(!old.endsWith('_'+suffix))throw new JobError('IDEMPOTENCY_CONFLICT')
   return json({uploaded:true,actualPages:order.actual_pages,amountDue:order.amount_due})
  }
  const path='orders/'+order.id+'/'+upload.kind+'/'+randomUUID()+'_'+suffix
  const amount=upload.kind==='document'?computePrice(upload.pages!,order.copies,order.color_mode):order.amount_due
  const {error:storageError}=await db.storage.from('documents').upload(path,upload.bytes,{contentType:upload.mime,cacheControl:'0',upsert:false})
  if(storageError)throw new JobError('LOCAL_BACKEND_UNAVAILABLE',503)
  const patch=upload.kind==='document'?{
   file_path:path,file_name:Array.from(upload.file.name).filter(c=>c.charCodeAt(0)>=32&&c.charCodeAt(0)!==127).join('').slice(0,128),file_sha256:upload.sha256,file_size:upload.size,file_mime:upload.mime,
   actual_pages:upload.pages,pages:upload.pages,amount_due:amount,estimated_time:upload.pages!*order.copies*(order.color_mode==='color'?3:2),
   file_deleted:false,file_url:null,payment_status:'pending',verified_by:null,verified_at:null,
  }:{payment_proof_path:path,payment_proof_deleted:false,payment_proof_url:null,payment_status:'pending',verified_by:null,verified_at:null}
  const {data,error}=await db.from('orders').update({...patch,version:order.version+1}).eq('id',order.id).eq('version',order.version).eq('status','pending_verification').select('id').maybeSingle()
  if(error||!data){
   const cleanup=await db.storage.from('documents').remove([path])
   if(cleanup.error)throw new JobError('STORAGE_DELETE_PENDING',503)
   throw new JobError('STALE_VERSION')
  }
  return json({uploaded:true,actualPages:upload.pages,amountDue:amount})
 }catch(error){return jobFailure(error)}
}
