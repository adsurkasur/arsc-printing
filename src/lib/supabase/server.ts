import {createServerClient} from '@supabase/ssr'
import {cookies} from 'next/headers'
import {localUrl,JobError} from './service'
export async function createClient(){
 const url=localUrl();const key=process.env.ARSC_LOCAL_SUPABASE_ANON_KEY
 if(!key)throw new JobError('LOCAL_BACKEND_UNAVAILABLE',503)
 const store=await cookies()
 return createServerClient(url,key,{cookies:{getAll:()=>store.getAll(),setAll(items){try{for(const {name,value,options} of items)store.set(name,value,options)}catch{/* Server component cookie writes are unavailable. */}}}})
}
