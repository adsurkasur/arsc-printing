import {createServerClient} from '@supabase/ssr'
import {NextResponse,type NextRequest} from 'next/server'
export async function updateSession(request:NextRequest){
 // APIs enforce their own authorization; avoid connecting any public page to a remote environment.
 if(!request.nextUrl.pathname.startsWith('/admin')||request.nextUrl.pathname.startsWith('/admin/login'))return NextResponse.next()
 try{
  const url=new URL(process.env.ARSC_LOCAL_SUPABASE_URL??'')
  const key=process.env.ARSC_LOCAL_SUPABASE_ANON_KEY
  if(process.env.ARSC_LOCAL_MODE!=='true'||url.protocol!=='http:'||!['localhost','127.0.0.1','[::1]'].includes(url.hostname)||url.username||url.password||url.pathname!=='/'||url.search||url.hash||!key)throw new Error('unavailable')
  let response=NextResponse.next({request})
  const client=createServerClient(url.origin,key,{cookies:{getAll:()=>request.cookies.getAll(),setAll(items){
   for(const {name,value} of items)request.cookies.set(name,value)
   response=NextResponse.next({request})
   for(const {name,value,options} of items)response.cookies.set(name,value,options)
  }}})
  const {data:{user},error}=await client.auth.getUser()
  if(error||!user)return NextResponse.redirect(new URL('/admin/login',request.url))
  const {data:isAdmin,error:roleError}=await client.rpc('is_admin')
  if(roleError||isAdmin!==true)return NextResponse.json({error:{code:'FORBIDDEN'}},{status:403})
  return response
 }catch{return NextResponse.json({error:{code:'LOCAL_BACKEND_UNAVAILABLE'}},{status:503})}
}
