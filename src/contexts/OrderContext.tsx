"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Order, CreateOrderInput } from '@/types/order';
import type { AdminAction } from '@/types/print-job';

interface Context {
  orders: Order[]; loading: boolean; error: string | null;
  refreshOrders: () => Promise<void>;
  adminAction: (order: Order, action: AdminAction, extra?: Record<string, unknown>) => Promise<boolean>;
  getQueueInfo: () => {count:number;estimatedTime:number};
  addOrder: (input: CreateOrderInput) => Promise<Order | null>;
}
const OrderContext = createContext<Context | null>(null);
export function OrderProvider({children}: {children:ReactNode}) {
  const pathname = usePathname();
  const admin = pathname === '/admin';
  const [orders,setOrders] = useState<Order[]>([]);
  const [queue,setQueue] = useState({count:0,estimatedTime:0});
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState<string | null>(null);
  const refreshOrders = useCallback(async () => {
    setLoading(true);
    try {
      let headers: Record<string,string> = {};
      if (admin) {
        const {data} = await createClient().auth.getSession();
        if (!data.session) { setOrders([]); throw new Error('Harap login sebagai admin.'); }
        headers = {Authorization:'Bearer '+data.session.access_token};
      }
      const response = await fetch(admin ? '/api/orders' : '/api/queue',{headers,cache:'no-store'});
      const data = await response.json();
      if (!response.ok || data.demoMode) throw new Error('Backend lokal belum tersedia atau akses ditolak.');
      if (admin) setOrders(Array.isArray(data) ? data : data.orders ?? []);
      else if (Number.isFinite(data.count) && Number.isFinite(data.estimatedTime)) setQueue(data);
      else throw new Error('Respons antrean tidak valid.');
      setError(null);
    } catch (e) {
      setOrders([]); setError(e instanceof Error ? e.message : 'Gagal memuat status.');
    } finally {setLoading(false);}
  },[admin]);
  useEffect(() => {
    void refreshOrders();
    const timer = setInterval(() => void refreshOrders(),20000);
    return () => clearInterval(timer);
  },[refreshOrders]);
  const adminAction = async (order: Order, action: AdminAction, extra: Record<string,unknown> = {}) => {
    try {
      const {data} = await createClient().auth.getSession();
      if (!data.session) throw new Error('Harap login sebagai admin.');
      const response = await fetch('/api/admin/orders/'+order.id+'/action',{
        method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+data.session.access_token},
        body:JSON.stringify({action,expectedVersion:order.version,...extra}),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.code ?? 'Aksi ditolak.');
      await refreshOrders(); return true;
    } catch (e) {setError(e instanceof Error ? e.message : 'Aksi ditolak.'); return false;}
  };
  const addOrder = async (input: CreateOrderInput) => {
    const response = await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)});
    if (!response.ok) return null;
    const value = await response.json();
    return value.demoMode ? null : value;
  };
  return <OrderContext.Provider value={{orders,loading,error,refreshOrders,adminAction,getQueueInfo:()=>queue,addOrder}}>{children}</OrderContext.Provider>;
}
export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) throw new Error('OrderProvider required');
  return context;
}
