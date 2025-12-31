"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { Order, CreateOrderInput } from "@/types/order";
import { createClient } from "@/lib/supabase/client";

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  error: string | null;
  demoMode: boolean;
  addOrder: (order: CreateOrderInput, fileUrl?: string) => Promise<Order | null>;
  updateOrderStatus: (id: string, status: Order["status"]) => Promise<void>;
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch('/api/orders');
      let data;

      // Try parsing JSON safely
      try {
        data = await response.json();
      } catch (jsonErr) {
        console.error('Failed to parse orders response, using demo mode:', jsonErr);
        setDemoMode(true);
        setOrders(demoOrders);
        setError('Failed to fetch orders');
        return;
      }

      // Handle non-OK responses without throwing so we don't spam the console
      if (!response.ok) {
        if (data?.demoMode || data?.error) {
          setDemoMode(true);
          setOrders(demoOrders);
          setError(null);
        } else {
          setDemoMode(true);
          setOrders(demoOrders);
          setError(data?.error || 'Failed to fetch orders');
        }
        return;
      }

      // Check if it's an error response (Supabase not configured)
      if (data.error || data.demoMode) {
        setDemoMode(true);
        setOrders(demoOrders);
        setError(null);
      } else {
        setOrders(Array.isArray(data) ? data : []);
        setError(null);
      }
    } catch (err) {
      console.error('Network error fetching orders, using demo mode:', err);
      setDemoMode(true);
      setOrders(demoOrders);
      setError('Failed to fetch orders');
    } finally {
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
              console.log('Real-time update:', payload);
              
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
        console.error('Failed to set up realtime subscription:', error);
      }
    }
  }, [fetchOrders]);

  const addOrder = async (orderData: CreateOrderInput, fileUrl?: string): Promise<Order | null> => {
    // Demo mode: create order locally
    if (demoMode) {
      const newOrder: Order = {
        id: `demo-${Date.now()}`,
        customer_name: orderData.customer_name,
        contact: orderData.contact,
        file_name: orderData.file_name,
        file_url: fileUrl || null,
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

  const updateOrderStatus = async (id: string, status: Order["status"]) => {
    // Demo mode: update order locally
    if (demoMode) {
      setOrders((prev) =>
        prev.map((order) => (order.id === id ? { ...order, status } : order))
      );
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }

      // Real-time subscription will handle updating state
    } catch (err) {
      console.error('Error updating order:', err);
      setError('Failed to update order');
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

  const refreshOrders = async () => {
    setLoading(true);
    await fetchOrders();
  };

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
