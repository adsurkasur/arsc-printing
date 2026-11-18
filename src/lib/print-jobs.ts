import { createHmac } from 'node:crypto'
import {JobError,localDb,readJson,json,jobFailure,workerAuth,adminAuth,sha256} from './api-security'
export {JobError,localDb,readJson,json,jobFailure,workerAuth,adminAuth,sha256} from './api-security'
import { z } from 'zod'
import type { JobStatus, JobEventType } from '../types/print-job'

export function transition(status: JobStatus, type: JobEventType, started: boolean): JobStatus {
  if (!['claimed', 'submitted'].includes(status)) throw new JobError('INVALID_TRANSITION')
  if (type === 'heartbeat') return status
  if (type === 'uncertain') return 'needs_reconciliation'
  if (status === 'claimed' && type === 'submission_started' && !started) return status
  if (status === 'claimed' && type === 'submitted' && started) return 'submitted'
  if (status === 'submitted' && type === 'backend_completed') return 'backend_completed'
  if (type === 'failed' && (status === 'submitted' || !started)) return 'failed'
  throw new JobError('INVALID_TRANSITION')
}
export function expiryStatus(status: JobStatus, started: boolean, attempts: number): JobStatus {
  if (status === 'submitted' || started) return 'needs_reconciliation'
  return attempts >= 3 ? 'failed' : 'ready'
}
export function assertFence(
  current: {workerId: string; tokenHash: string; generation: number; version: number; leaseUntil: number},
  request: {workerId: string; tokenHash: string; generation: number; version: number}, now: number,
) {
  if (current.workerId !== request.workerId || current.tokenHash !== request.tokenHash ||
      current.generation !== request.generation || current.leaseUntil <= now) throw new JobError('STALE_CLAIM')
  if (current.version !== request.version) throw new JobError('STALE_VERSION')
}
const safeId = z.string().regex(/^[a-zA-Z0-9_.:-]{1,128}$/)
const eventSchema = z.object({
  eventId: z.string().uuid(), type: z.enum(['heartbeat','submission_started','submitted','backend_completed','failed','uncertain']),
  version: z.number().int().nonnegative(), generation: z.number().int().positive(),
  claimToken: z.string().regex(/^[a-f0-9]{64}$/), backendJobId: safeId.optional(), backendInstanceId: safeId.optional(),
  errorCode: z.enum(['FILE_INVALID','DOWNLOAD_FAILED','BACKEND_REJECTED','BACKEND_FAILED','SUBMIT_UNKNOWN','WORKER_RESTART']).optional(),
}).strict().superRefine((v, ctx) => {
  if (v.type === 'submitted' && (!v.backendJobId || !v.backendInstanceId)) ctx.addIssue({code:'custom', message:'receipt required'})
  if (['failed','uncertain'].includes(v.type) && !v.errorCode) ctx.addIssue({code:'custom',message:'error code required'})
})
export function validateEvent(input: unknown) {
  const parsed = eventSchema.safeParse(input)
  if (!parsed.success) throw new JobError('INVALID_INPUT', 400)
  return parsed.data
}
const rpcErrors: Record<string,number> = {NOT_FOUND:404,FORBIDDEN:403,INVALID_INPUT:400,DOCUMENT_DELETED:410,
  STALE_VERSION:409,STALE_CLAIM:409,INVALID_TRANSITION:409,IDEMPOTENCY_CONFLICT:409,PAYMENT_NOT_VERIFIED:409,
  DOCUMENT_NOT_READY:409,LEGACY_REVIEW_REQUIRED:409}
export async function rpc(db: ReturnType<typeof localDb>, name: string, args: Record<string, unknown>) {
  const {data,error} = await db.rpc(name,args)
  if (error) { const code = Object.keys(rpcErrors).find(k => error.message === k); throw new JobError(code ?? 'INTERNAL_ERROR',code ? rpcErrors[code] : 500) }
  return data
}
export async function claimJob(request: Request) {
  const {db,worker,secret} = await workerAuth(request)
  const parsed = z.object({requestId:z.string().uuid(),printerKey:safeId}).strict().safeParse(await readJson(request))
  if (!parsed.success) throw new JobError('INVALID_INPUT',400)
  if (parsed.data.printerKey !== worker.printer_key) throw new JobError('FORBIDDEN',403)
  const token = createHmac('sha256',secret).update(`${worker.id}:${parsed.data.requestId}`).digest('hex')
  const data = await rpc(db,'claim_print_job',{p_worker:worker.id,p_request:parsed.data.requestId,p_printer:parsed.data.printerKey,p_token_hash:sha256(token)})
  return json({job:data ? {...data,claimToken:token} : null})
}
export async function reportEvent(request: Request, id: string) {
  if (!z.string().uuid().safeParse(id).success) throw new JobError('INVALID_INPUT',400)
  const {db,worker} = await workerAuth(request)
  const event = validateEvent(await readJson(request))
  const {claimToken,...body} = event
  const data = await rpc(db,'report_print_event',{p_worker:worker.id,p_job:id,p_token_hash:sha256(claimToken),p_event:body,p_hash:sha256(JSON.stringify(event))})
  return json({job:data})
}
export async function jobDocument(request: Request, id: string) {
  const {db,worker} = await workerAuth(request)
  const token = request.headers.get('x-claim-token') ?? ''
  const generation = Number(request.headers.get('x-lease-generation'))
  if (!z.string().uuid().safeParse(id).success || !/^[a-f0-9]{64}$/.test(token) || !Number.isInteger(generation) || generation < 1) throw new JobError('INVALID_INPUT',400)
  const document = await rpc(db,'print_job_document',{p_worker:worker.id,p_job:id,p_generation:generation,p_token_hash:sha256(token)})
  const {data,error} = await db.storage.from('documents').createSignedUrl(document.path,60)
  if (error || !data) throw new JobError('LOCAL_BACKEND_UNAVAILABLE',503)
  return json({url:data.signedUrl,expiresIn:60,sha256:document.sha256,size:document.size})
}
export async function adminAction(request: Request, id: string) {
  const {db,user} = await adminAuth(request)
  const parsed = z.object({action:z.enum(['verify_payment','reject_payment','approve','cancel','deliver','review_legacy','reconcile','reprint']),
    expectedVersion:z.number().int().nonnegative(),workerId:z.string().uuid().optional(),printerKey:safeId.optional(),
    resolution:z.literal('backend_completed').optional(),reasonCode:z.literal('OPERATOR_VERIFIED').optional(),backendJobId:safeId.optional(),
    acknowledgeDuplicateRisk:z.boolean().optional()}).strict().safeParse(await readJson(request))
  if (!z.string().uuid().safeParse(id).success || !parsed.success) throw new JobError('INVALID_INPUT',400)
  return json(await rpc(db,'admin_print_action',{p_admin:user.id,p_order:id,p_action:parsed.data}))
}
