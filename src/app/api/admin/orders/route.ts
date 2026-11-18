import {adminAuth,json,jobFailure} from '@/lib/api-security'
import {rpc} from '@/lib/print-jobs'
import {searchParams} from '@/lib/admin-api'
export async function GET(request:Request){try{const {db}=await adminAuth(request);return json(await rpc(db,'admin_order_search',searchParams(new URL(request.url).searchParams)))}catch(error){return jobFailure(error)}}
