import OrderSuccessClient from "@/components/OrderSuccessClient";
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function OrderSuccessPage({ searchParams }: { searchParams?: { orderId?: string } }) {
  const orderId = searchParams?.orderId;

  if (orderId) {
    // Validate on the server that the order exists
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('orders')
        .select('id')
        .eq('id', orderId)
        .single();

      if (error || !data) {
        return notFound();
      }
    } catch (err) {
      // On any unexpected error, show 404 as a safe fallback
      return notFound();
    }
  }

  return <OrderSuccessClient initialOrderId={orderId || null} />;
}

