import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Check if Supabase is properly configured
function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return url && key && !url.includes('placeholder') && !key.includes('placeholder')
}

export async function POST(request: NextRequest) {
  // This endpoint should be called by a scheduler (e.g., Cron job) to purge expired files
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ demoMode: true, deleted: [] })
  }

  try {
    const supabase = await createClient()

    // Find orders with expired files that are not yet deleted
    const { data: expiredOrders, error: selectError } = await supabase
      .from('orders')
      .select('*')
      .lt('file_expires_at', new Date().toISOString())
      .eq('file_deleted', false)

    if (selectError) {
      console.error('Error querying expired orders:', selectError)
      return NextResponse.json({ error: selectError.message }, { status: 500 })
    }

    const deleted: string[] = []

    for (const order of expiredOrders || []) {
      // Determine file path (fallback to parsing public URL)
      let filePath = order.file_path;
      if (!filePath && order.file_url) {
        try {
          const url = new URL(order.file_url);
          const match = url.pathname.match(/\/documents\/(.+)$/);
          if (match) filePath = decodeURIComponent(match[1]);
        } catch (e) {
          // ignore
        }
      }

      if (!filePath) continue

      // Attempt to delete file from Supabase Storage
      const { error: removeError } = await supabase.storage.from('documents').remove([filePath])
      if (removeError) {
        console.error(`Failed to remove file ${filePath}:`, removeError)
        continue
      }

      // Mark order as file deleted and clear urls/paths
      const { error: updateError } = await supabase
        .from('orders')
        .update({ file_url: null, file_path: null, file_deleted: true })
        .eq('id', order.id)

      if (updateError) {
        console.error(`Failed to update order ${order.id} after deletion:`, updateError)
        continue
      }

      deleted.push(order.id)
    }

    return NextResponse.json({ deleted })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}