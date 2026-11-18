import { claimJob, jobFailure } from '@/lib/print-jobs'
export const runtime = 'nodejs'
export async function POST(request: Request) {
  try { return await claimJob(request) } catch (error) { return jobFailure(error) }
}
