import { adminAction, jobFailure } from '@/lib/print-jobs'
export const runtime = 'nodejs'
export async function POST(request: Request, context: {params: Promise<{id:string}>}) {
  try { return await adminAction(request,(await context.params).id) } catch (error) { return jobFailure(error) }
}
