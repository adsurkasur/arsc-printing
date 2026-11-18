import { jobDocument, jobFailure } from '@/lib/print-jobs'
export const runtime = 'nodejs'
export async function GET(request: Request, context: {params: Promise<{id:string}>}) {
  try { return await jobDocument(request,(await context.params).id) } catch (error) { return jobFailure(error) }
}
