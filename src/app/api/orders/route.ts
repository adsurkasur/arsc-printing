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
        file_path: body.file_path || null,
        payment_proof_url: body.payment_proof_url || null,
        payment_proof_path: body.payment_proof_path || null,
        // If payment proof provided, set demo expiry to 24 hours
        payment_proof_expires_at: body.payment_proof_url ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null,
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

    // Build insert payload dynamically
    const insertPayload: { customer_name: string; contact: string; file_name: string; file_url?: string | null; file_path?: string | null; color_mode: string; copies: number; paper_size: string; status: string; estimated_time: number; notes?: string | null; payment_proof_url?: string | null; payment_proof_path?: string | null; payment_proof_expires_at?: string | null; payment_proof_deleted?: boolean } = {
      customer_name: body.customer_name,
      contact: body.contact,
      file_name: body.file_name,
      file_url: body.file_url || null,
      file_path: body.file_path || null,
      color_mode: body.color_mode,
      copies: body.copies,
      paper_size: body.paper_size,
      status: 'pending',
      estimated_time,
      notes: body.notes || null,
    }

    // If payment proof present, set an expiry (default 24 hours)
    if (body.payment_proof_url) {
      insertPayload.payment_proof_url = body.payment_proof_url
      insertPayload.payment_proof_path = body.payment_proof_path || null
      insertPayload.payment_proof_expires_at = new Date(Date.now() + (Number(process.env.PAYMENT_PROOF_TTL_HOURS || 24) * 60 * 60 * 1000)).toISOString();
      insertPayload.payment_proof_deleted = false
    }

    const { data, error } = await supabase
      .from('orders')
      .insert(insertPayload)
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

    const updatePayload: { status: string; file_expires_at?: string | null; file_deleted?: boolean; payment_proof_expires_at?: string | null; payment_proof_deleted?: boolean } = { status };

    // If marking as completed, set expiry 1 hour from now for file and payment proof
    if (status === 'completed') {
      updatePayload.file_expires_at = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      updatePayload.file_deleted = false;
      updatePayload.payment_proof_expires_at = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      updatePayload.payment_proof_deleted = false;
    } else {
      // Clear expiry for non-completed statuses
      updatePayload.file_expires_at = null;
      updatePayload.payment_proof_expires_at = null;
    }

    // If Authorization header present, forward update to PostgREST using the provided token (so RLS is applied based on the JWT)
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const restUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(id)}`;
        const restRes = await fetch(restUrl, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(updatePayload),
        });

        const body = await restRes.json().catch(() => null);
        if (!restRes.ok) {
          console.error('PostgREST returned non-OK', restRes.status, body);
          return NextResponse.json({ error: body?.message || body || 'Unauthorized or invalid token' }, { status: restRes.status });
        }

        // If PostgREST returned empty array, log token's user info to help debug RLS
        if (Array.isArray(body) && body.length === 0) {
          try {
            const authUserRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const authUser = await authUserRes.json().catch(() => null);
            console.error('PostgREST returned empty array and token did not update any rows. Token user:', authUser);
          } catch (e) {
            console.error('Failed to fetch auth user for diagnostic:', e);
          }
          // Return empty response same as before
          return NextResponse.json([]);
        }

        // PostgREST returns an array when using return=representation. Return first item for compatibility
        return NextResponse.json(Array.isArray(body) ? body[0] ?? body : body);
      } catch (error) {
        console.error('PostgREST update error:', error);
        return NextResponse.json({ error: 'Failed to update order via PostgREST' }, { status: 500 });
      }
    }

    // Fallback: use server-side client (will rely on cookies/session)
    try {
      const supabase = await createClient()

      const { data, error } = await supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(data)
    } catch (error) {
      console.error('Server update error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
