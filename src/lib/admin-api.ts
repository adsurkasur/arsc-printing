import {z} from 'zod'
import {JobError} from './api-security'
export function dateValue(value:string){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value)throw new JobError('INVALID_INPUT',400)
 return value
}
export function searchParams(params:URLSearchParams){
 if([...params.keys()].some(k=>!['page','pageSize','status','from','to','q'].includes(k))||[...params.keys()].some(k=>params.getAll(k).length!==1))throw new JobError('INVALID_INPUT',400)
 const parsed=z.object({page:z.coerce.number().int().min(1).max(10000).default(1),pageSize:z.coerce.number().int().min(1).max(100).default(20),status:z.enum(['pending_verification','approved','delivered','cancelled']).optional(),q:z.string().trim().max(100).optional(),from:z.string().optional(),to:z.string().optional()}).safeParse(Object.fromEntries(params))
 if(!parsed.success)throw new JobError('INVALID_INPUT',400)
 const p=parsed.data;if(p.from)dateValue(p.from);if(p.to)dateValue(p.to);if(p.from&&p.to&&p.from>p.to)throw new JobError('INVALID_INPUT',400)
 return {p_page:p.page,p_size:p.pageSize,p_status:p.status??null,p_from:p.from??null,p_to:p.to??null,p_query:p.q||null}
}
export function summaryDate(params:URLSearchParams){
 if([...params.keys()].some(k=>k!=='date')||params.getAll('date').length>1)throw new JobError('INVALID_INPUT',400)
 return dateValue(params.get('date')??new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()))
}
