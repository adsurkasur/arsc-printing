import {createHash,createHmac,timingSafeEqual} from 'node:crypto'
import {z} from 'zod'
import {JobError,localDb} from './supabase/service'
export {JobError,localDb}
export const sha256=(value:string)=>createHash('sha256').update(value).digest('hex')
export function equalSecret(a:string,b:string){
  const x=Buffer.from(sha256(a),'hex'),y=Buffer.from(sha256(b),'hex')
  return timingSafeEqual(x,y)
}
export function assertOrigin(request:Request){
  const target=new URL(request.url)
  // Next dev may reconstruct request.url as localhost even when bound to 127.0.0.1.
  // Use the actual Host only for this explicitly loopback-only application.
  const host=request.headers.get('host')
  if(host){
    let incoming:URL
    try{incoming=new URL(target.protocol+'//'+host)}catch{throw new JobError('FORBIDDEN',403)}
    if(!['localhost','127.0.0.1','[::1]'].includes(incoming.hostname)||incoming.username||incoming.password||incoming.pathname!=='/'||incoming.search||incoming.hash)throw new JobError('FORBIDDEN',403)
    if(request.headers.get('origin')!==incoming.origin)throw new JobError('FORBIDDEN',403)
  }else if(request.headers.get('origin')!==target.origin)throw new JobError('FORBIDDEN',403)
}
export function signingSecret(){
  const secret=process.env.ARSC_LOCAL_CAPABILITY_SECRET
  if(!secret||secret.length<32)throw new JobError('LOCAL_BACKEND_UNAVAILABLE',503)
  return secret
}
// Idempotency-Key is a confidential 128-bit creation receipt. Never log it.
// Derivation lets the same creation request recover its 256-bit capability after a lost response.
export function capabilityToken(key:string,secret:string){return createHmac('sha256',secret).update('order:'+key).digest('hex')}
export function csrfFor(token:string){return createHmac('sha256',token).update('csrf-v1').digest('hex')}
export function cookieName(id:string){return 'arsc_order_'+id}
export function capabilityCookie(id:string,token:string,secure:boolean){
  return `${cookieName(id)}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800${secure?'; Secure':''}`
}
export function cookieToken(request:Request,id:string){
  const cookies=(request.headers.get('cookie')??'').split(';').map(s=>s.trim().split('='))
  const token=cookies.find(([name])=>name===cookieName(id))?.[1]??''
  return /^[a-f0-9]{64}$/.test(token)?token:''
}
export function assertCapability(request:Request,id:string,expectedToken:string){
  const token=cookieToken(request,id)
  if(!token||!equalSecret(token,expectedToken))throw new JobError('FORBIDDEN',403)
}
export function assertCsrf(request:Request,token:string){
  if(!equalSecret(request.headers.get('x-csrf-token')??'',csrfFor(token)))throw new JobError('FORBIDDEN',403)
}
export async function readBoundedBody(request:Request,max:number,inspect?:(prefix:Uint8Array,total:number)=>number){
  const reader=request.body?.getReader();if(!reader)throw new JobError('INVALID_INPUT',400)
  const parts:Uint8Array[]=[];let total=0;let limit=max;let prefix=Buffer.alloc(0)
  try{
    while(true){
      const {done,value}=await reader.read();if(done)break
      total+=value.length
      if(prefix.length<16384)prefix=Buffer.concat([prefix,Buffer.from(value.subarray(0,16384-prefix.length))])
      if(inspect)limit=Math.min(limit,inspect(prefix,total))
      if(total>limit)throw new JobError('PAYLOAD_TOO_LARGE',413)
      parts.push(value)
    }
  }catch(error){await reader.cancel().catch(()=>{});throw error}
  return new Uint8Array(Buffer.concat(parts))
}
export async function readJson(request:Request):Promise<Record<string,unknown>>{
  if(!request.headers.get('content-type')?.startsWith('application/json'))throw new JobError('INVALID_INPUT',400)
  let bytes:Uint8Array
  try{bytes=await readBoundedBody(request,8192)}catch(error){if(error instanceof JobError&&error.code==='PAYLOAD_TOO_LARGE')throw new JobError('INVALID_INPUT',400);throw error}
  try{const value=JSON.parse(Buffer.from(bytes).toString('utf8'));if(!value||typeof value!=='object'||Array.isArray(value))throw 0;return value}catch{throw new JobError('INVALID_INPUT',400)}
}
export function json(value:unknown,status=200){return Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}
export function jobFailure(error:unknown){
  const e=error instanceof JobError?error:new JobError('INTERNAL_ERROR',500)
  return json({error:{code:e.code,message:'Request rejected'}},e.status)
}
export async function adminAuth(request:Request){
  if(!['GET','HEAD'].includes(request.method))assertOrigin(request)
  const token=/^Bearer (\S+)$/.exec(request.headers.get('authorization')??'')?.[1]
  if(!token)throw new JobError('UNAUTHENTICATED',401)
  const db=localDb();const {data:{user},error}=await db.auth.getUser(token)
  if(error||!user)throw new JobError('UNAUTHENTICATED',401)
  const {data:role,error:roleError}=await db.from('user_roles').select('user_id').eq('user_id',user.id).eq('role','admin').maybeSingle()
  if(roleError||!role)throw new JobError('FORBIDDEN',403)
  return {db,user}
}
export async function workerAuth(request:Request){
  const m=/^Bearer ([a-f0-9-]{36})\.([A-Za-z0-9_-]{32,128})$/.exec(request.headers.get('authorization')??'')
  if(!m||!z.string().uuid().safeParse(m[1]).success)throw new JobError('UNAUTHENTICATED',401)
  const db=localDb();const {data,error}=await db.from('print_workers').select('id,credential_hash,printer_key,enabled').eq('id',m[1]).single()
  if(error||!data||!data.enabled||!/^[a-f0-9]{64}$/.test(data.credential_hash)||!equalSecret(sha256(m[2]),data.credential_hash))throw new JobError('UNAUTHENTICATED',401)
  return {db,worker:data,secret:m[2]}
}
export async function customerAuth(request:Request,id:string,mutation=false){
  if(!z.string().uuid().safeParse(id).success)throw new JobError('INVALID_INPUT',400)
  if(mutation)assertOrigin(request)
  const token=cookieToken(request,id)
  if(!token)throw new JobError('FORBIDDEN',403)
  if(mutation)assertCsrf(request,token)
  const db=localDb();const {data:order,error}=await db.from('orders').select('id,status,version,pickup_code,capability_hash,file_path,file_deleted,payment_proof_path,payment_proof_deleted,copies,color_mode,file_sha256,amount_due,actual_pages,created_at,estimated_time').eq('id',id).maybeSingle()
  if(error)throw new JobError('LOCAL_BACKEND_UNAVAILABLE',503)
  if(!order||!order.capability_hash||!equalSecret(sha256(token),order.capability_hash)||!Number.isFinite(Date.parse(order.created_at))||Date.now()-Date.parse(order.created_at)>7*86400000)throw new JobError('FORBIDDEN',403)
  return {db,order,token}
}
const orderSchema=z.object({customer_name:z.string().trim().min(1).max(100),contact:z.string().trim().min(1).max(100),
 copies:z.number().int().min(1).max(100),color_mode:z.enum(['bw','color']),paper_size:z.enum(['A4','F4']),
 layout:z.enum(['1-up','2-up','4-up']).default('1-up'),scale_mode:z.enum(['fit','fill','100']).default('fit'),
 orientation:z.enum(['portrait','landscape']).default('portrait'),user_note:z.string().max(500).default('')}).strict()
export function parseOrder(input:unknown){const p=orderSchema.safeParse(input);if(!p.success)throw new JobError('INVALID_INPUT',400);return p.data}
export function customerOrder(order:Record<string,unknown>){
 return {id:order.id,status:order.status,version:order.version,pickupCode:order.pickup_code,created_at:order.created_at,estimated_time:order.estimated_time,amount_due:order.amount_due}
}
export function requireCron(request:Request,secret:string|undefined=process.env.ARSC_LOCAL_CRON_SECRET){
  if(!secret||!equalSecret(request.headers.get('authorization')??'','Bearer '+secret))throw new JobError('UNAUTHENTICATED',401)
}
