import { reportEvent, jobFailure } from '@/lib/print-jobs'
export const runtime = 'nodejs'
export async function POST(request: Request, context: {params: Promise<{id:string}>}) {
  try { return await reportEvent(request,(await context.params).id) } catch (error) { return jobFailure(error) }
}
