import {adminAuth,json,jobFailure} from '@/lib/api-security'
import {rpc} from '@/lib/print-jobs'
import {summaryDate} from '@/lib/admin-api'
export async function GET(request:Request){try{const {db}=await adminAuth(request);return json(await rpc(db,'admin_daily_summary',{p_date:summaryDate(new URL(request.url).searchParams)}))}catch(error){return jobFailure(error)}}
