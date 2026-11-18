export type JobStatus = 'ready' | 'claimed' | 'submitted' | 'backend_completed' | 'failed' | 'needs_reconciliation'
export type JobEventType = 'heartbeat' | 'submission_started' | 'submitted' | 'backend_completed' | 'failed' | 'uncertain'
export type WorkerErrorCode = 'FILE_INVALID' | 'DOWNLOAD_FAILED' | 'BACKEND_REJECTED' | 'BACKEND_FAILED' | 'SUBMIT_UNKNOWN' | 'WORKER_RESTART'
export interface JobEvent {
  eventId: string; type: JobEventType; version: number; generation: number; claimToken: string
  backendJobId?: string; backendInstanceId?: string; errorCode?: WorkerErrorCode
}
export interface PrintJob {
  id: string; order_id: string; revision: number; status: JobStatus; version: number
  target_worker_id: string; printer_key: string; lease_generation: number
  lease_until: string | null; submission_started_at: string | null
  backend_job_id: string | null; last_error_code: string | null
}
export type AdminAction = 'verify_payment' | 'reject_payment' | 'approve' | 'cancel' | 'deliver' | 'review_legacy' | 'reconcile' | 'reprint'
