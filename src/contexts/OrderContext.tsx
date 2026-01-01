"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { Order, CreateOrderInput } from "@/types/order";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  error: string | null;
  demoMode: boolean;
  addOrder: (order: CreateOrderInput, fileUrl?: string, filePath?: string, paymentProofUrl?: string, paymentProofPath?: string) => Promise<Order | null>;
  updateOrderStatus: (id: string, status: Order["status"]) => Promise<boolean>;
  getQueueInfo: () => { count: number; estimatedTime: number };
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Demo data for when Supabase is not configured
const demoOrders: Order[] = [
  {
    id: "demo-1",
    customer_name: "Ahmad Fauzi",
    contact: "081234567890",
    file_name: "Laporan_Akhir.pdf",
    file_url: null,
    color_mode: "bw",
    copies: 2,
    paper_size: "A4",
    status: "printing",
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
    estimated_time: 4,
  },
  {
    id: "demo-2",
    customer_name: "Siti Nurhaliza",
    contact: "082345678901",
    file_name: "Presentasi_Tugas.pdf",
    file_url: null,
    color_mode: "color",
    copies: 1,
    paper_size: "A4",
    status: "pending",
    created_at: new Date(Date.now() - 3 * 60000).toISOString(),
    estimated_time: 3,
  },
];

export function OrderProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null);

  const fetchOrders = useCallback(async () => {
    // Use AbortController to avoid hanging fetches
    const controller = new AbortController();
    const timeoutMs = 8000; // 8s timeout
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch('/api/orders', { signal: controller.signal });
      let data;

      // Try parsing JSON safely
      try {
        data = await response.json();
      } catch (jsonErr) {
        const je = jsonErr as { name?: string; message?: string };
        console.warn('Failed to parse orders response:', je?.message ?? jsonErr);
        // If parsing failed due to an abort, treat it as non-error (it'll be handled in outer catch)
        if (je?.name === 'AbortError' || /aborted/i.test(je?.message ?? '')) {
          console.info('Orders response parsing aborted');
          return;
        }
        // Don't immediately switch to demo mode on parse errors; keep previous state and surface an error
        setError('Failed to parse orders response');
        return;
      }

      // Handle non-OK responses
      if (!response.ok) {
        // If server explicitly requested demo mode, use demo data
        if (data?.demoMode) {
          setDemoMode(true);
          setOrders(demoOrders);
          setError(null);
        } else {
          setError(data?.error || 'Failed to fetch orders');
        }
        return;
      }

      // Check if it's a demo-mode response
      if (data?.demoMode) {
        setDemoMode(true);
        setOrders(demoOrders);
        setError(null);
      } else {
        setDemoMode(false);
        setOrders(Array.isArray(data) ? data : []);
        setError(null);
      }
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string };
      if (e?.name === 'AbortError') {
        // Expected timeout - log at info level (not an error)
        console.info('Orders fetch aborted due to timeout');
        // Do not set an error here to avoid UI flip-flopping when requests are aborted
      } else {
        // Network errors: surface a concise warning but avoid noisy stack traces
        console.warn('Network error fetching orders:', e?.message ?? err);
        setError('Failed to fetch orders');
      }
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }, []);

  // Initial fetch and real-time subscription
  useEffect(() => {
    fetchOrders();

    // Only set up real-time subscription if not in demo mode
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
      try {
        const supabase = createClient();
        
        channelRef.current = supabase
          .channel('orders-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'orders',
            },
            (payload) => {
              console.debug('Real-time update:', payload);
              
              if (payload.eventType === 'INSERT') {
                setOrders((prev) => [payload.new as Order, ...prev]);
              } else if (payload.eventType === 'UPDATE') {
                setOrders((prev) =>
                  prev.map((order) =>
                    order.id === (payload.new as Order).id ? (payload.new as Order) : order
                  )
                );
              } else if (payload.eventType === 'DELETE') {
                setOrders((prev) =>
                  prev.filter((order) => order.id !== (payload.old as { id: string }).id)
                );
              }
            }
          )
          .subscribe();

        return () => {
          if (channelRef.current) {
            supabase.removeChannel(channelRef.current);
          }
        };
      } catch (error) {
        console.warn('Failed to set up realtime subscription:', (error as Error)?.message ?? error);
      }
    }
  }, [fetchOrders]);

  const addOrder = async (orderData: CreateOrderInput, fileUrl?: string, filePath?: string, paymentProofUrl?: string, paymentProofPath?: string): Promise<Order | null> => {
    // Demo mode: create order locally
    if (demoMode) {
      const newOrder: Order = {
        id: `demo-${Date.now()}`,
        customer_name: orderData.customer_name,
        contact: orderData.contact,
        file_name: orderData.file_name,
        file_url: fileUrl || null,
        file_path: filePath || null,
        payment_proof_url: paymentProofUrl || null,
        payment_proof_path: paymentProofPath || null,
        payment_proof_expires_at: paymentProofUrl ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null,
        color_mode: orderData.color_mode,
        copies: orderData.copies,
        paper_size: orderData.paper_size,
        status: 'pending',
        created_at: new Date().toISOString(),
        estimated_time: orderData.copies * (orderData.color_mode === 'color' ? 3 : 2),
      };
      setOrders((prev) => [newOrder, ...prev]);
      return newOrder;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderData,
          file_url: fileUrl || null,
          file_path: filePath || null,
          payment_proof_url: paymentProofUrl || null,
          payment_proof_path: paymentProofPath || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const newOrder = await response.json();
      // Real-time subscription will handle adding to state
      return newOrder;
    } catch (err) {
      console.error('Error creating order:', err);
      setError('Failed to create order');
      return null;
    }
  };

  const updateOrderStatus = async (id: string, status: Order["status"]) : Promise<boolean> => {
    // Demo mode: update order locally
    if (demoMode) {
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id === id) {
            const updated = { ...order, status } as Order & { file_expires_at?: string | null, payment_proof_expires_at?: string | null };
            if (status === 'completed') {
              updated.file_expires_at = new Date(Date.now() + 60 * 60 * 1000).toISOString();
              updated.file_deleted = false;
              updated.payment_proof_expires_at = new Date(Date.now() + 60 * 60 * 1000).toISOString();
              updated.payment_proof_deleted = false;
            } else {
              updated.file_expires_at = null;
              updated.payment_proof_expires_at = null;
            }
            return updated;
          }
          return order;
        })
      );
      return true;
    }

    try {
      // Prefer server-side update but include the user's access token so the server can perform actions on behalf of the user (RLS enforced)
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token ?? null;

      if (!token) {
        setError('Admin session not available. Please login.');
        toast({ title: 'Harap login sebagai admin', description: 'Harap login sebagai admin untuk melakukan aksi ini.', variant: 'destructive' });
        return false;
      }

      const updatePayload: { status: Order["status"]; file_expires_at?: string | null; file_deleted?: boolean; payment_proof_expires_at?: string | null; payment_proof_deleted?: boolean } = { status };
      if (status === 'completed') {
        updatePayload.file_expires_at = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        updatePayload.file_deleted = false;
        updatePayload.payment_proof_expires_at = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        updatePayload.payment_proof_deleted = false;
      } else {
        updatePayload.file_expires_at = null;
        updatePayload.payment_proof_expires_at = null;
      }

      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status }),
      });

      // Parse response body for verification
      const resBody = await res.json().catch(() => null);

      if (!res.ok) {
        console.error('Server PATCH error:', res.status, resBody);
        const message = resBody?.error || resBody?.message || 'Gagal memperbarui pesanan';
        setError(message);
        if (res.status === 401 || res.status === 403) {
          toast({ title: 'Harap login sebagai admin', description: 'Harap login sebagai admin untuk membatalkan pesanan', variant: 'destructive' });
        } else {
          toast({ title: 'Gagal', description: message, variant: 'destructive' });
        }
        return false;
      }

      // If PostgREST returned an empty array, treat as failure (RLS likely blocked the update)
      if (Array.isArray(resBody) && resBody.length === 0) {
        console.error('PostgREST returned empty array — update likely blocked by RLS', { requested: status, resBody });
        toast({ title: 'Gagal', description: 'Tidak ada baris yang diperbarui. Periksa peran admin atau kebijakan RLS.', variant: 'destructive' });
        return false;
      }

      // If server returned a representation, verify the returned row has the requested status
      if (resBody && (resBody.status ?? (Array.isArray(resBody) ? resBody[0]?.status : undefined))) {
        const returnedStatus = Array.isArray(resBody) ? resBody[0]?.status : resBody.status;
        if (returnedStatus !== status) {
          console.warn('Status update apparent success but returned status mismatch', { requested: status, returned: returnedStatus, resBody });
          toast({ title: 'Gagal', description: 'Status tidak berubah di database', variant: 'destructive' });
          return false;
        }
      }

      // Ensure UI is current
      await refreshOrders();
      return true;
    } catch (err: unknown) {
      console.error('Error updating order:', err);
      const message = err instanceof Error ? err.message : 'Gagal memperbarui pesanan';
      setError(message);
      toast({ title: 'Gagal', description: message, variant: 'destructive' });
      return false;
    }
  };

  const getQueueInfo = () => {
    const pendingOrders = orders.filter(
      (order) => order.status === "pending" || order.status === "printing"
    );
    const totalTime = pendingOrders.reduce(
      (sum, order) => sum + order.estimated_time,
      0
    );
    return { count: pendingOrders.length, estimatedTime: totalTime };
  };

  const refreshOrders = useCallback(async () => {
    setLoading(true);
    await fetchOrders();
  }, [fetchOrders]);

  return (
    <OrderContext.Provider
      value={{ orders, loading, error, demoMode, addOrder, updateOrderStatus, getQueueInfo, refreshOrders }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders must be used within OrderProvider");
  }
  return context;
}
