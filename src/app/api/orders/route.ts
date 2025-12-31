import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { CreateOrderInput } from '@/types/order'

// Check if Supabase is properly configured
function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return url && key && !url.includes('placeholder') && !key.includes('placeholder')
}

// GET /api/orders - Get all orders or filter by ID
export async function GET(request: NextRequest) {
  // Return demo mode flag if Supabase not configured
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ demoMode: true, orders: [] })
  }

  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const trackingId = searchParams.get('trackingId')

    if (id) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
      return NextResponse.json(data)
    }

    if (trackingId) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', trackingId)
        .single()

      if (error) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
      // Return limited info for public tracking
      return NextResponse.json({
        id: data.id,
        customer_name: data.customer_name,
        file_name: data.file_name,
        status: data.status,
        created_at: data.created_at,
        estimated_time: data.estimated_time,
      })
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', demoMode: true }, { status: 500 })
  }
}

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderInput = await request.json()
    
    // Calculate estimated time based on copies and color mode
    const estimated_time = body.copies * (body.color_mode === 'color' ? 3 : 2)

    // Return demo order if Supabase not configured
    if (!isSupabaseConfigured()) {
      const demoOrder = {
        id: crypto.randomUUID(),
        customer_name: body.customer_name,
        contact: body.contact,
        file_name: body.file_name,
        file_url: body.file_url || null,
        color_mode: body.color_mode,
        copies: body.copies,
        paper_size: body.paper_size,
        status: 'pending' as const,
        estimated_time,
        notes: body.notes || null,
        created_at: new Date().toISOString(),
        demoMode: true,
      }
      return NextResponse.json(demoOrder, { status: 201 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('orders')
      .insert({
        customer_name: body.customer_name,
        contact: body.contact,
        file_name: body.file_name,
        file_url: body.file_url || null,
        color_mode: body.color_mode,
        copies: body.copies,
        paper_size: body.paper_size,
        status: 'pending',
        estimated_time,
        notes: body.notes || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/orders - Update order status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 })
    }

    // Return demo response if Supabase not configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ 
        id, 
        status, 
        demoMode: true,
        updated_at: new Date().toISOString() 
      })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
