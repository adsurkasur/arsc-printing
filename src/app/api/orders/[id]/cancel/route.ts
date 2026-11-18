import {z} from 'zod'
import {customerAuth,readJson,sha256,json,JobError,jobFailure} from '@/lib/api-security'
import {rpc} from '@/lib/print-jobs'
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){try{const {id}=await params;const {db,token}=await customerAuth(request,id,true);const parsed=z.object({expectedVersion:z.number().int().nonnegative()}).strict().safeParse(await readJson(request));if(!parsed.success)throw new JobError('INVALID_INPUT',400);return json(await rpc(db,'customer_cancel_order',{p_order:id,p_token_hash:sha256(token),p_version:parsed.data.expectedVersion}))}catch(error){return jobFailure(error)}}
