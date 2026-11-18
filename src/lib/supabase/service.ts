import {createClient} from '@supabase/supabase-js'
export class JobError extends Error {
  constructor(public code:string,public status=409){super(code)}
}
export function localUrl() {
  const value=process.env.ARSC_LOCAL_SUPABASE_URL
  try {
    const u=new URL(value??'')
    if(process.env.ARSC_LOCAL_MODE==='true'&&u.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(u.hostname)&&!u.username&&!u.password&&!u.search&&!u.hash&&u.pathname==='/')return u.origin
  }catch{/* fail closed */}
  throw new JobError('LOCAL_BACKEND_UNAVAILABLE',503)
}
export function localDb(){
  if(typeof window!=='undefined')throw new JobError('FORBIDDEN',403)
  const url=localUrl();const key=process.env.ARSC_LOCAL_SUPABASE_SERVICE_ROLE_KEY
  if(!key)throw new JobError('LOCAL_BACKEND_UNAVAILABLE',503)
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})
}
