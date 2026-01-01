import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Check if Supabase is properly configured
function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return url && key && !url.includes('placeholder') && !key.includes('placeholder')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, type } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ demoMode: true, deleted: true })
    }

    const supabase = await createClient()

    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Determine which file to delete based on requested type
    let filePath: string | null = null;
    if (type === 'payment_proof') {
      filePath = order.payment_proof_path;
      if (!filePath && order.payment_proof_url) {
        try {
          const url = new URL(order.payment_proof_url);
          const match = url.pathname.match(/\/documents\/(.+)$/);
          if (match) filePath = decodeURIComponent(match[1]);
        } catch (e) {
          // ignore
        }
      }
    } else {
      filePath = order.file_path;
      if (!filePath && order.file_url) {
        try {
          const url = new URL(order.file_url);
          const match = url.pathname.match(/\/documents\/(.+)$/);
          if (match) filePath = decodeURIComponent(match[1]);
        } catch (e) {
          // ignore
        }
      }
    }

    if (!filePath) {
      return NextResponse.json({ error: 'No file to delete' }, { status: 400 })
    }

    // Delete file from storage
    const { error: removeError } = await supabase.storage.from('documents').remove([filePath])
    if (removeError) {
      console.error('Failed to remove file:', removeError)
      return NextResponse.json({ error: removeError.message || 'Failed to remove file' }, { status: 500 })
    }

    // Update order row depending on type
    const updatePayload: { payment_proof_url?: null; payment_proof_path?: null; payment_proof_deleted?: boolean; file_url?: null; file_path?: null; file_deleted?: boolean } =
      type === 'payment_proof'
        ? { payment_proof_url: null, payment_proof_path: null, payment_proof_deleted: true }
        : { file_url: null, file_path: null, file_deleted: true }

    const { error: updateError } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', id)

    if (updateError) {
      console.error('Failed to update order after delete:', updateError)
      return NextResponse.json({ error: updateError.message || 'Failed to update order' }, { status: 500 })
    }

    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error('Delete-file error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}