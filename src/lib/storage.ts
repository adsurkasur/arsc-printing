import {Worker} from 'node:worker_threads'
import {createHash} from 'node:crypto'
import {z} from 'zod'
import {JobError,readBoundedBody,localDb} from './api-security'
export type FileKind='document'|'proof'
export function canonicalPath(id:string,kind:FileKind,path:string){
 if(!z.string().uuid().safeParse(id).success||!['document','proof'].includes(kind)||!new RegExp('^orders/'+id+'/'+kind+'/[a-zA-Z0-9_.-]+$').test(path)||path.includes('..'))throw new JobError('INVALID_INPUT',400)
 return path
}
export function computePrice(pages:number,copies:number,color:'bw'|'color'){
 if(!Number.isInteger(pages)||!Number.isInteger(copies)||pages<1||pages>500||copies<1||copies>100||pages*copies>1000||!['bw','color'].includes(color))throw new JobError('INVALID_INPUT',400)
 return pages*copies*(color==='color'?750:500)
}
// Isolate untrusted parsers with a deadline and V8 heap budget. No shell/remote code.
const parserCode=`const {parentPort,workerData}=require('node:worker_threads');
const {PDFDocument}=require('pdf-lib');
(async()=>{try{let pages=null;if(workerData.kind==='document'){
const doc=await PDFDocument.load(workerData.bytes,{ignoreEncryption:false,throwOnInvalidObject:true});pages=doc.getPageCount();if(pages<1||pages>500)throw 0;
}else{const doc=await PDFDocument.create();const image=workerData.mime==='image/png'?await doc.embedPng(workerData.bytes):await doc.embedJpg(workerData.bytes);if(image.width*image.height>20000000)throw 0;}
parentPort.postMessage({pages});}catch{parentPort.postMessage({error:true});}})();`
export async function validateFile(kind:FileKind,bytes:Uint8Array,mime:string):Promise<{mime:string;pages:number|null;sha256:string;size:number}>{
 if(bytes.length>(kind==='document'?10:5)*1024*1024)throw new JobError('PAYLOAD_TOO_LARGE',413)
 const b=Buffer.from(bytes)
 const pdf=b.subarray(0,5).toString()==='%PDF-'
 const png=b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
 const jpeg=b[0]===255&&b[1]===216&&b[2]===255
 if(!bytes.length||(kind==='document'?mime!=='application/pdf'||!pdf:!((mime==='image/png'&&png)||(mime==='image/jpeg'&&jpeg))))throw new JobError('FILE_INVALID',400)
 const pages=await new Promise<number|null>((resolve,reject)=>{
  const worker=new Worker(parserCode,{eval:true,workerData:{kind,bytes,mime},resourceLimits:{maxOldGenerationSizeMb:128}})
  let finished=false
  const finish=(value:number|null,error=false)=>{if(finished)return;finished=true;clearTimeout(timer);void worker.terminate();if(error)reject(new JobError('FILE_INVALID',400));else resolve(value)}
  const timer=setTimeout(()=>finish(null,true),5000)
  worker.on('message',value=>finish(value.pages,!!value.error));worker.on('error',()=>finish(null,true));worker.on('exit',()=>{if(!finished)finish(null,true)})
 })
 return {mime,pages,sha256:createHash('sha256').update(bytes).digest('hex'),size:bytes.length}
}
export async function readUpload(request:Request){
 const contentType=request.headers.get('content-type')??''
 if(!/^multipart\/form-data;\s*boundary=(?:"[a-zA-Z0-9'()+_,./:=? -]{1,70}"|[a-zA-Z0-9'()+_,./:=?-]{1,70})$/.test(contentType))throw new JobError('INVALID_INPUT',400)
 const overhead=16384
 const bytes=await readBoundedBody(request,10*1024*1024+overhead,(prefix,total)=>{
  const text=Buffer.from(prefix).toString('latin1')
  const m=/name="kind"\r\n\r\n(document|proof)\r\n/.exec(text)
  // UI sends metadata first. Reject metadata after file, rather than buffering unbounded proof bytes.
  if((text.includes('name="file"')||total>=overhead)&&!m)throw new JobError('INVALID_INPUT',400)
  return m?.[1]==='proof'?5*1024*1024+overhead:10*1024*1024+overhead
 })
 let form:FormData
 try{form=await new Response(bytes,{headers:{'content-type':contentType}}).formData()}catch{throw new JobError('INVALID_INPUT',400)}
 const entries=Array.from(form.entries())
 if(entries.length!==3||!['orderId','kind','file'].every(key=>form.getAll(key).length===1))throw new JobError('INVALID_INPUT',400)
 const id=form.get('orderId');const kind=form.get('kind');const file=form.get('file')
 if(typeof id!=='string'||!z.string().uuid().safeParse(id).success||!['document','proof'].includes(String(kind))||!file||typeof file==='string')throw new JobError('INVALID_INPUT',400)
 const data=new Uint8Array(await file.arrayBuffer())
 if(data.length>(kind==='document'?10:5)*1024*1024)throw new JobError('PAYLOAD_TOO_LARGE',413)
 return {id,kind:kind as FileKind,file,bytes:data}
}
// Delete only terminal/abandoned pending orders; never race active jobs or reprints.
// Keep paths as durable tombstones so failed storage removal can be retried safely.
export async function deleteStoredFile(db:ReturnType<typeof localDb>,id:string,kind:FileKind){
 const fields='id,status,version,file_path,payment_proof_path,file_deleted,payment_proof_deleted'
 const {data:o,error}=await db.from('orders').select(fields).eq('id',id).maybeSingle()
 if(error)throw new JobError('LOCAL_BACKEND_UNAVAILABLE',503)
 if(!o)throw new JobError('NOT_FOUND',404)
 if(!['delivered','cancelled'].includes(o.status))throw new JobError('INVALID_TRANSITION')
 const path=kind==='document'?o.file_path:o.payment_proof_path
 if(!path)return
 canonicalPath(id,kind,path)
 const patch=kind==='document'?{file_deleted:true,file_url:null}:{payment_proof_deleted:true,payment_proof_url:null}
 const {data:marked,error:markError}=await db.from('orders').update({...patch,version:o.version+1}).eq('id',id).eq('version',o.version).eq('status',o.status).select('id').maybeSingle()
 if(markError||!marked)throw new JobError('STALE_VERSION')
 const {error:removeError}=await db.storage.from('documents').remove([path])
 if(removeError)throw new JobError('STORAGE_DELETE_PENDING',503)
}
export async function cleanupExpired(db:ReturnType<typeof localDb>){
 const now=new Date().toISOString();let count=0
 // Bounded batch per invocation. Repeated runs make progress using expiry cursor fields.
 const {data:orders,error}=await db.from('orders').select('id,file_expires_at,payment_proof_expires_at').in('status',['delivered','cancelled']).or('file_expires_at.lte.'+now+',payment_proof_expires_at.lte.'+now).order('id').limit(100)
 if(error)throw new JobError('LOCAL_BACKEND_UNAVAILABLE',503)
 for(const o of orders??[]){
  for(const kind of ['document','proof'] as const){
   const expiry=kind==='document'?o.file_expires_at:o.payment_proof_expires_at
   if(!expiry||new Date(expiry).getTime()>Date.now())continue
   try{
    await deleteStoredFile(db,o.id,kind)
    const column=kind==='document'?'file_expires_at':'payment_proof_expires_at'
    const {error:finalize}=await db.from('orders').update({[column]:null}).eq('id',o.id).in('status',['delivered','cancelled'])
    if(finalize)throw new JobError('STORAGE_DELETE_PENDING',503)
    count++
   }catch(error){if(error instanceof JobError&&error.code==='STORAGE_DELETE_PENDING')continue;throw error}
  }
 }
 return {deletedCount:count}
}
