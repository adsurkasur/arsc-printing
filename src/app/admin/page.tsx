"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { m3Transition } from '@/lib/motion';
import { createClient } from '@/lib/supabase/client';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { M3ResponsiveDialog, m3Toast, CountUp } from '@/components/m3';
import {
  RefreshCw as ArrowsClockwise,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  RotateCcw as ArrowCounterClockwise,
  AlertTriangle as Warning,
  ShieldCheck,
  Search as MagnifyingGlass,
  Printer,
  Receipt,
  ChevronLeft as CaretLeft,
  ChevronRight as CaretRight,
  Calendar as CalendarBlank,
  Info,
  Ban as Prohibit,
} from 'lucide-react';
import { COPY_PAGES, formatReceiptEvent } from '@/lib/copy';
import type { Order } from '@/types/order';
import type { AdminAction } from '@/types/print-job';

const IS_SIMULATION = process.env.NEXT_PUBLIC_ARSC_SIMULATION === 'true';
const COPY_SIMULATION_DISCLOSURE =
  'Mode simulasi: alur ini memakai printer uji. Tidak ada dokumen fisik yang dicetak.';

const formatCopy = (template: string, vars: Record<string, string | number>) => {
  let out = template;
  for (const [k, v] of Object.entries(vars)) {
    out = out.split(`{${k}}`).join(String(v));
  }
  return out;
};

interface WorkerItem {
  id: string;
  printerKey: string;
  enabled: boolean;
}

interface DailySummary {
  date: string;
  timeZone: string;
  orderCount: number;
  pages: number;
  revenueVerified: number;
}

interface ReceiptData {
  order: {
    id: string;
    pickupCode: string;
    customerName: string;
    status: string;
    paymentStatus: string;
    amountDue: number;
    pages: number;
    copies: number;
    createdAt: string;
    verifiedAt: string | null;
    approvedAt: string | null;
    deliveredAt: string | null;
  };
  jobs: Array<{
    id: string;
    revision: number;
    status: string;
    printerKey: string;
    workerId: string;
    backendJobId: string | null;
    backendInstanceId: string | null;
    lastErrorCode: string | null;
  }>;
  events: Array<{
    eventId: string;
    jobId: string;
    type: string;
    createdAt: string;
  }>;
}

type ConfirmModalState =
  | { type: 'verify'; order: Order }
  | { type: 'reject'; order: Order }
  | { type: 'approve'; order: Order }
  | { type: 'deliver'; order: Order }
  | { type: 'reprint'; order: Order }
  | { type: 'cancel'; order: Order }
  | null;

const formatWib = (iso: string | null | undefined) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  });
};

const formatWorkerOption = (w: WorkerItem) => {
  const last4 = w.id.slice(-4);
  if (!w.enabled) {
    return formatCopy(COPY_PAGES.admin.text028, { last4ofId: last4 });
  }
  if (w.printerKey.toLowerCase().includes('fake')) {
    return formatCopy(COPY_PAGES.admin.text026, { last4ofId: last4 });
  }
  return formatCopy(COPY_PAGES.admin.text027, { printerKey: w.printerKey });
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [appliedFromDate, setAppliedFromDate] = useState('');
  const [appliedToDate, setAppliedToDate] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [summaryDate, setSummaryDate] = useState<string>(() => {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
  });
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [summaryError, setSummaryError] = useState(false);

  const [workers, setWorkers] = useState<WorkerItem[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');

  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<ReceiptData | null>(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);
  const [showDeviceInfo, setShowDeviceInfo] = useState(false);

  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [confirmChecked, setConfirmChecked] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const supabase = createClient();

  const getAuthHeaders = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
    };
  }, [supabase]);

  // Debounce search 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchWorkers = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/admin/workers', { headers });
      if (res.ok) {
        const data = await res.json();
        const list: WorkerItem[] = data.items || data.workers || [];
        setWorkers(list);
        if (!selectedWorkerId && list.length > 0) {
          const active = list.find((w) => w.enabled);
          if (active) setSelectedWorkerId(active.id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch workers', err);
    }
  }, [getAuthHeaders, selectedWorkerId]);

  const fetchSummary = useCallback(async () => {
    try {
      setSummaryError(false);
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/admin/summary?date=${summaryDate}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      } else {
        setSummary(null);
        setSummaryError(true);
      }
    } catch {
      setSummary(null);
      setSummaryError(true);
    }
  }, [getAuthHeaders, summaryDate]);

  const fetchOrders = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      setError(null);
      const headers = await getAuthHeaders();
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (debouncedQuery.trim()) params.set('q', debouncedQuery.trim());
      if (appliedFromDate) params.set('from', appliedFromDate);
      if (appliedToDate) params.set('to', appliedToDate);

      const res = await fetch(`/api/admin/orders?${params.toString()}`, {
        headers,
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new Error('Gagal memuat daftar pesanan.');
      }
      const data = await res.json();
      setOrders(data.items || data.orders || []);
      setTotalOrders(data.total ?? (data.items?.length || 0));
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat pesanan.');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, page, pageSize, statusFilter, debouncedQuery, appliedFromDate, appliedToDate]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOpenFile = async (orderId: string, kind: 'document' | 'payment-proof') => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/admin/orders/${orderId}/${kind}`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membuka berkas.');
      if (data.url) {
        window.open(data.url, '_blank', 'noopener,noreferrer');
      }
    } catch (err: unknown) {
      m3Toast.error(err instanceof Error ? err.message : 'Gagal membuka berkas.');
    }
  };

  const handleOpenReceipt = async (orderId: string) => {
    try {
      setLoadingReceipt(true);
      setShowDeviceInfo(false);
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/admin/orders/${orderId}/receipt`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memuat rincian pesanan.');
      setActiveReceipt(data);
    } catch (err: unknown) {
      m3Toast.error(err instanceof Error ? err.message : 'Gagal memuat rincian pesanan.');
    } finally {
      setLoadingReceipt(false);
    }
  };

  const executeAdminAction = async (
    order: Order,
    action: AdminAction,
    extraBody?: Record<string, unknown>
  ) => {
    try {
      setProcessingOrderId(order.id);
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/admin/orders/${order.id}/action`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action,
          expectedVersion: (order as Order & { version?: number }).version,
          ...extraBody,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Tindakan gagal dijalankan.');
      }
      m3Toast.success('Status pesanan diperbarui.');
      await Promise.all([fetchOrders(), fetchSummary()]);
      setConfirmModal(null);
      setRejectReason('');
      setConfirmChecked(false);
    } catch (err: unknown) {
      m3Toast.error(err instanceof Error ? err.message : 'Tindakan gagal dijalankan.');
    } finally {
      setProcessingOrderId(null);
    }
  };

  const todayJakarta = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(
    new Date()
  );
  const totalPages = Math.max(1, Math.ceil(totalOrders / pageSize));
  const selectedWorker = workers.find((w) => w.id === selectedWorkerId);
  const hasActiveWorker = workers.some((w) => w.enabled);

  const statusChips = [
    { key: 'all', label: COPY_PAGES.admin.text009 },
    { key: 'pending_verification', label: COPY_PAGES.admin.text010 },
    { key: 'approved', label: COPY_PAGES.admin.text011 },
    { key: 'delivered', label: COPY_PAGES.admin.text012 },
    { key: 'cancelled', label: COPY_PAGES.admin.text013 },
  ];

  return (
    <div className="max-w-[1200px] mx-auto page-padding pt-6 md:pt-8 page-bottom">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-headlineMedium font-display text-[var(--md-sys-color-on-surface)]">
            {COPY_PAGES.admin.text002}
          </h1>
          <p className="text-bodyMedium text-[var(--md-sys-color-on-surface-variant)] mt-1">
            {COPY_PAGES.admin.text004}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label
              htmlFor="summary-date"
              className="text-labelMedium text-[var(--md-sys-color-on-surface-variant)]"
            >
              {COPY_PAGES.admin.text003}
            </label>
            <input
              id="summary-date"
              type="date"
              value={summaryDate}
              onChange={(e) => setSummaryDate(e.target.value)}
              className="h-10 px-3 rounded-lg border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] text-bodyMedium text-[var(--md-sys-color-on-surface)]"
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              fetchOrders();
              fetchSummary();
              fetchWorkers();
            }}
            disabled={loading}
          >
            <ArrowsClockwise className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Muat ulang
          </Button>
        </div>
      </header>

      {IS_SIMULATION && (
        <div
          role="status"
          className="mt-6 md:mt-8 flex items-start gap-2.5 p-4 rounded-2xl bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)] text-bodySmall w-full"
        >
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{COPY_SIMULATION_DISCLOSURE}</span>
        </div>
      )}

      {/* Summary Section: ONE card with 3 metric columns separated by 24px */}
      <section id="summary" aria-label={COPY_PAGES.admin.text003} className="mt-6">
        {summaryError ? (
          <div className="rounded-2xl border border-[var(--md-sys-color-outline-variant)] p-4 sm:p-6 flex items-center justify-between gap-4">
            <span className="text-bodyMedium text-[var(--md-sys-color-error)]">
              {COPY_PAGES.admin.text021}
            </span>
            <Button variant="ghost" onClick={fetchSummary}>
              Coba lagi
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-labelMedium text-[var(--md-sys-color-on-surface-variant)]">
                {COPY_PAGES.admin.text005}
              </p>
              <p className="text-headlineSmall font-display tabular-nums text-[var(--md-sys-color-on-surface)]">
                {summary ? <CountUp value={summary.orderCount} duration={0.6} /> : '—'}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-labelMedium text-[var(--md-sys-color-on-surface-variant)]">
                {COPY_PAGES.admin.text006}
              </p>
              <p className="text-headlineSmall font-display tabular-nums text-[var(--md-sys-color-on-surface)]">
                {summary ? <CountUp value={summary.pages} duration={0.6} /> : '—'}
              </p>
              <p className="text-bodySmall text-[var(--md-sys-color-on-surface-variant)] max-w-[40ch]">
                {COPY_PAGES.admin.text024}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-labelMedium text-[var(--md-sys-color-on-surface-variant)]">
                {COPY_PAGES.admin.text007}
              </p>
              <p className="text-headlineSmall font-display tabular-nums text-[var(--md-sys-color-on-surface)]">
                {summary ? (
                  <CountUp
                    value={summary.revenueVerified}
                    duration={0.6}
                    formatter={(n) => `Rp ${Math.round(n).toLocaleString('id-ID')}`}
                  />
                ) : (
                  '—'
                )}
              </p>
              <p className="text-bodySmall text-[var(--md-sys-color-on-surface-variant)] max-w-[40ch]">
                {summaryDate === todayJakarta ? COPY_PAGES.admin.text022 : COPY_PAGES.admin.text023}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Filter Card: 2-row grid with 16px gaps */}
      <section id="workers" className="mt-8 rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] p-4 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-start">
          <div className="flex-1 space-y-1.5">
            <label
              htmlFor="admin-search-input"
              className="text-labelMedium text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1.5"
            >
              <MagnifyingGlass className="w-4 h-4" />
              {COPY_PAGES.admin.text072}
            </label>
            <input
              id="admin-search-input"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setDebouncedQuery(searchQuery);
                  setPage(1);
                }
              }}
              placeholder={COPY_PAGES.admin.text008}
              className="w-full h-12 px-4 rounded-xl border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] text-bodyMedium"
            />
          </div>

          <div className="w-full lg:w-[320px] space-y-1.5">
            <label
              htmlFor="worker-select"
              className="text-labelMedium text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              {COPY_PAGES.admin.text016}
            </label>
            <select
              id="worker-select"
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              className="w-full h-12 px-3 rounded-lg border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] text-bodyMedium text-[var(--md-sys-color-on-surface)]"
            >
              <option value="">{COPY_PAGES.admin.text025}</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id} disabled={!w.enabled}>
                  {formatWorkerOption(w)}
                </option>
              ))}
            </select>
            {!hasActiveWorker && (
              <p className="text-bodySmall text-[var(--md-sys-color-error)]">
                {COPY_PAGES.admin.text029}
              </p>
            )}
            {selectedWorker?.printerKey.toLowerCase().includes('fake') && (
              <p className="text-bodySmall text-[var(--md-sys-color-on-surface-variant)]">
                {COPY_PAGES.admin.text031}
              </p>
            )}
          </div>
        </div>

        {/* Status Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {statusChips.map((chip) => (
            <button type="button"
              key={chip.key}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border ${statusFilter === chip.key ? "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] border-transparent" : "border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface-variant)]"}`}
              onClick={() => {
                setStatusFilter(chip.key);
                setPage(1);
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Date Range Filters */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div>
              <label
                htmlFor="filter-from"
                className="block text-labelSmall text-[var(--md-sys-color-on-surface-variant)] mb-1"
              >
                Dari tanggal
              </label>
              <input
                id="filter-from"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-10 px-3 rounded-lg border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] text-bodyMedium"
              />
            </div>
            <div>
              <label
                htmlFor="filter-to"
                className="block text-labelSmall text-[var(--md-sys-color-on-surface-variant)] mb-1"
              >
                Sampai tanggal
              </label>
              <input
                id="filter-to"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="h-10 px-3 rounded-lg border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] text-bodyMedium"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setAppliedFromDate(fromDate);
                setAppliedToDate(toDate);
                setPage(1);
              }}
            >
              <CalendarBlank className="w-4 h-4" />
              {COPY_PAGES.admin.text014}
            </Button>
            {(appliedFromDate || appliedToDate || searchQuery || statusFilter !== 'all') && (
              <Button
                variant="ghost"
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                  setAppliedFromDate('');
                  setAppliedToDate('');
                  setSearchQuery('');
                  setDebouncedQuery('');
                  setStatusFilter('all');
                  setPage(1);
                }}
              >
                {COPY_PAGES.admin.text015}
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Orders List */}
      <section id="orders" className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-labelLarge text-[var(--md-sys-color-on-surface-variant)]">
            {formatCopy(COPY_PAGES.admin.text017, { total: totalOrders })}
          </p>
        </div>

        {error && (
          <div className="p-4 text-[var(--md-sys-color-error)] text-bodyMedium">
            {error}
          </div>
        )}

        {!loading && orders.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <p className="text-titleMedium text-[var(--md-sys-color-on-surface)]">
              {COPY_PAGES.admin.text019}
            </p>
            <p className="text-bodyMedium text-[var(--md-sys-color-on-surface-variant)]">
              {COPY_PAGES.admin.text020}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isBusy = processingOrderId === order.id;
              const isPendingPayment =
                order.status === 'pending_verification' && order.payment_status !== 'verified';
              const canApprove =
                order.status === 'pending_verification' &&
                order.payment_status === 'verified' &&
                Boolean(selectedWorkerId) &&
                Boolean(selectedWorker?.enabled);
              const canDeliver = order.status === 'approved';
              const canCancel =
                order.status !== 'cancelled' && order.status !== 'delivered';

              return (
                <div key={order.id} className="rounded-2xl bg-[var(--md-sys-color-surface-container-low)] p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-[22px] leading-7 font-bold tracking-tight text-[var(--md-sys-color-primary)]">
                          {(order as Order & { pickupCode?: string; pickup_code?: string }).pickupCode || (order as Order & { pickup_code?: string }).pickup_code || order.id.slice(0, 8)}
                        </span>
                        <span className="text-[16px] font-semibold text-[var(--md-sys-color-on-surface)]">
                          {order.customer_name}
                        </span>
                      </div>
                      <p className="text-[14px] text-[var(--md-sys-color-on-surface-variant)]">
                        {(order as Order & { contact?: string; customer_contact?: string }).contact || (order as Order & { customer_contact?: string }).customer_contact || '—'} · {formatWib(order.created_at)}
                      </p>
                    </div>

                    <div className="flex flex-col sm:items-end gap-1">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={order.status}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={m3Transition('effectsFast', false)}
                        >
                          <StatusBadge status={order.status} />
                        </motion.span>
                      </AnimatePresence>
                      <span className="text-[24px] leading-8 font-bold tabular-nums text-[var(--md-sys-color-on-surface)]">
                        Rp {order.amount_due.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  <p className="text-bodyMedium text-[var(--md-sys-color-on-surface-variant)]">
                    {formatCopy(COPY_PAGES.admin.text032, {
                      pages: order.pages,
                      copies: order.copies,
                      color: order.color_mode === 'color' ? 'Berwarna' : 'Hitam putih',
                      paper: order.paper_size,
                    })}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--md-sys-color-outline-variant)]">
                    <Button
                      variant="outline"
                      onClick={() => handleOpenFile(order.id, 'document')}
                    >
                      <FileText className="w-4 h-4" />
                      {COPY_PAGES.admin.text033}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => handleOpenFile(order.id, 'payment-proof')}
                    >
                      <ImageIcon className="w-4 h-4" />
                      {COPY_PAGES.admin.text034}
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={() => handleOpenReceipt(order.id)}
                      disabled={loadingReceipt}
                    >
                      <Receipt className="w-4 h-4" />
                      {COPY_PAGES.admin.text035}
                    </Button>

                    <div className="flex-1" />

                    {isPendingPayment && (
                      <>
                        <Button
                          variant="ghost"
                          onClick={() => setConfirmModal({ type: 'reject', order })}
                          disabled={isBusy}
                        >
                          <XCircle className="w-4 h-4" />
                          {COPY_PAGES.admin.text045}
                        </Button>
                        <Button
                          variant="default"
                          onClick={() => setConfirmModal({ type: 'verify', order })}
                          disabled={isBusy}
                        >
                          <CheckCircle className="w-4 h-4" />
                          {COPY_PAGES.admin.text038}
                        </Button>
                      </>
                    )}

                    {order.status === 'pending_verification' &&
                      order.payment_status === 'verified' && (
                        <Button
                          variant="default"
                          onClick={() => setConfirmModal({ type: 'approve', order })}
                          disabled={isBusy || !canApprove}
                        >
                          <ShieldCheck className="w-4 h-4" />
                          {COPY_PAGES.admin.text039}
                        </Button>
                      )}

                    {canDeliver && (
                      <Button
                        variant="default"
                        onClick={() => {
                          setConfirmChecked(false);
                          setConfirmModal({ type: 'deliver', order });
                        }}
                        disabled={isBusy}
                      >
                        <CheckCircle className="w-4 h-4" />
                        Konfirmasi penyerahan
                      </Button>
                    )}

                    {order.status === 'approved' && (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setConfirmChecked(false);
                          setConfirmModal({ type: 'reprint', order });
                        }}
                        disabled={isBusy}
                      >
                        <ArrowCounterClockwise className="w-4 h-4" />
                        {COPY_PAGES.admin.text037}
                      </Button>
                    )}

                    {canCancel && (
                      <Button
                        variant="ghost"
                        onClick={() => setConfirmModal({ type: 'cancel', order })}
                        disabled={isBusy}
                      >
                        <Prohibit className="w-4 h-4" />
                        {COPY_PAGES.admin.text036}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-bodySmall text-[var(--md-sys-color-on-surface-variant)]">
            {formatCopy(COPY_PAGES.admin.text018, { page, pages: totalPages })}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <CaretLeft className="w-4 h-4" />
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Berikutnya
              <CaretRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Receipt Dialog / Bottom Sheet */}
      <M3ResponsiveDialog
        open={Boolean(activeReceipt)}
        onOpenChange={(open) => {
          if (!open) setActiveReceipt(null);
        }}
        title="Rincian pesanan"
      >
        {activeReceipt && (
          <div className="space-y-4">
            {IS_SIMULATION && (
              <div className="p-3 rounded-lg bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)] text-bodySmall">
                {COPY_SIMULATION_DISCLOSURE}
              </div>
            )}

            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-titleMedium font-bold">
                  {activeReceipt.order.pickupCode}
                </span>
                <StatusBadge status={activeReceipt.order.status} />
              </div>
              <p className="text-bodyMedium font-medium">{activeReceipt.order.customerName}</p>
              <p className="text-bodyMedium tabular-nums">
                Rp {activeReceipt.order.amountDue.toLocaleString('id-ID')}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-titleSmall font-semibold">Riwayat proses</h3>
              {activeReceipt.events.length === 0 ? (
                <p className="text-bodySmall text-[var(--md-sys-color-on-surface-variant)]">
                  Belum ada catatan proses.
                </p>
              ) : (
                <ul className="space-y-1.5 text-bodySmall">
                  {activeReceipt.events.map((ev) => (
                    <li key={ev.eventId} className="flex justify-between gap-2">
                      <span>{formatReceiptEvent(ev.type)}</span>
                      <span className="text-[var(--md-sys-color-on-surface-variant)]">
                        {formatWib(ev.createdAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowDeviceInfo((v) => !v)}
                className="text-labelLarge text-[var(--md-sys-color-primary)] underline"
              >
                Informasi perangkat
              </button>
              {showDeviceInfo && (
                <div className="p-3 rounded-lg bg-[var(--md-sys-color-surface-container)] text-bodySmall space-y-1">
                  {activeReceipt.jobs.map((job) => (
                    <div key={job.id} className="space-y-0.5">
                      <p>Perangkat: {job.printerKey}</p>
                      <p className="break-all">
                        Nomor proses: {job.backendJobId || '—'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="text-bodySmall text-[var(--md-sys-color-on-surface-variant)]">
              Status proses belum membuktikan hasil cetak fisik. Petugas tetap perlu memeriksa
              dokumen.
            </p>

            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setActiveReceipt(null)}>
                Tutup
              </Button>
            </div>
          </div>
        )}
      </M3ResponsiveDialog>

      {/* Action Confirmation Dialogs */}
      <M3ResponsiveDialog
        open={Boolean(confirmModal)}
        onOpenChange={(open) => {
          if (!open) setConfirmModal(null);
        }}
        title={
          confirmModal?.type === 'verify'
            ? COPY_PAGES.admin.text046
            : confirmModal?.type === 'reject'
            ? COPY_PAGES.admin.text041
            : confirmModal?.type === 'approve'
            ? COPY_PAGES.admin.text048
            : confirmModal?.type === 'deliver'
            ? 'Dokumen sudah diserahkan?'
            : confirmModal?.type === 'reprint'
            ? 'Cetak ulang pesanan?'
            : 'Batalkan pesanan?'
        }
      >
        {confirmModal?.type === 'verify' && (
          <div className="space-y-4">
            <p className="text-bodyMedium">
              {formatCopy(COPY_PAGES.admin.text047, {
                amount: `Rp ${confirmModal.order.amount_due.toLocaleString('id-ID')}`,
              })}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmModal(null)}>
                {COPY_PAGES.admin.text044}
              </Button>
              <Button
                variant="default"
                onClick={() => executeAdminAction(confirmModal.order, 'verify_payment')}
                disabled={processingOrderId === confirmModal.order.id}
              >
                {COPY_PAGES.admin.text038}
              </Button>
            </div>
          </div>
        )}

        {confirmModal?.type === 'reject' && (
          <div className="space-y-4">
            <input id="reject-reason-input" type="text" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder={COPY_PAGES.admin.text043} className="w-full h-12 px-4 rounded-xl border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] text-bodyMedium" />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmModal(null)}>
                {COPY_PAGES.admin.text044}
              </Button>
              <Button
                variant="default"
                onClick={() =>
                  executeAdminAction(confirmModal.order, 'reject_payment', {
                    reason: rejectReason.trim(),
                  })
                }
                disabled={!rejectReason.trim() || processingOrderId === confirmModal.order.id}
              >
                {COPY_PAGES.admin.text045}
              </Button>
            </div>
          </div>
        )}

        {confirmModal?.type === 'approve' && (
          <div className="space-y-4">
            <p className="text-bodyMedium">{COPY_PAGES.admin.text049}</p>
            {selectedWorker?.printerKey.toLowerCase().includes('fake') && (
              <p className="text-bodySmall text-[var(--md-sys-color-on-surface-variant)]">
                Perangkat yang dipilih adalah simulasi. Tidak ada cetak fisik.
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmModal(null)}>
                {COPY_PAGES.admin.text044}
              </Button>
              <Button
                variant="default"
                onClick={() =>
                  executeAdminAction(confirmModal.order, 'approve', {
                    workerId: selectedWorkerId,
                    printerKey: selectedWorker?.printerKey || 'fake',
                  })
                }
                disabled={processingOrderId === confirmModal.order.id}
              >
                {COPY_PAGES.admin.text039}
              </Button>
            </div>
          </div>
        )}

        {confirmModal?.type === 'deliver' && (
          <div className="space-y-4">
            <p className="text-bodyMedium">
              {IS_SIMULATION
                ? 'Ini simulasi penyerahan. Tidak ada dokumen fisik yang dicetak atau diserahkan.'
                : 'Periksa hasil cetak dan pastikan dokumen sudah diterima pelanggan sebelum mengonfirmasi.'}
            </p>
            <label className="flex items-start gap-2.5 text-bodyMedium cursor-pointer">
              <input
                type="checkbox"
                checked={confirmChecked}
                onChange={(e) => setConfirmChecked(e.target.checked)}
                className="mt-1 h-4 w-4"
              />
              <span>
                {IS_SIMULATION
                  ? 'Saya mengonfirmasi penyerahan simulasi.'
                  : 'Saya sudah memeriksa hasil dan menyerahkannya kepada pelanggan.'}
              </span>
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmModal(null)}>
                Belum diserahkan
              </Button>
              <Button
                variant="default"
                onClick={() => executeAdminAction(confirmModal.order, 'deliver')}
                disabled={!confirmChecked || processingOrderId === confirmModal.order.id}
              >
                Sudah diserahkan
              </Button>
            </div>
          </div>
        )}

        {confirmModal?.type === 'reprint' && (
          <div className="space-y-4">
            <p className="text-bodyMedium flex items-start gap-2">
              <Warning className="w-5 h-5 shrink-0 text-[var(--md-sys-color-error)]" />
              Hasil sebelumnya mungkin sudah tercetak. Cetak ulang dapat menghasilkan dokumen ganda.
            </p>
            <label className="flex items-start gap-2.5 text-bodyMedium cursor-pointer">
              <input
                type="checkbox"
                checked={confirmChecked}
                onChange={(e) => setConfirmChecked(e.target.checked)}
                className="mt-1 h-4 w-4"
              />
              <span>Saya memahami risiko dokumen ganda.</span>
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmModal(null)}>
                {COPY_PAGES.admin.text044}
              </Button>
              <Button
                variant="default"
                onClick={() =>
                  executeAdminAction(confirmModal.order, 'reprint', {
                    workerId: selectedWorkerId,
                    printerKey: selectedWorker?.printerKey || 'fake',
                  })
                }
                disabled={!confirmChecked || processingOrderId === confirmModal.order.id}
              >
                {COPY_PAGES.admin.text037}
              </Button>
            </div>
          </div>
        )}

        {confirmModal?.type === 'cancel' && (
          <div className="space-y-4">
            <p className="text-bodyMedium">
              Pesanan {(confirmModal.order as Order & { pickup_code?: string }).pickup_code || confirmModal.order.id.slice(0, 8)} akan dibatalkan dan tidak dapat dilanjutkan.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmModal(null)}>
                {COPY_PAGES.admin.text044}
              </Button>
              <Button
                variant="default"
                onClick={() => executeAdminAction(confirmModal.order, 'cancel')}
                disabled={processingOrderId === confirmModal.order.id}
              >
                {COPY_PAGES.admin.text036}
              </Button>
            </div>
          </div>
        )}
      </M3ResponsiveDialog>
    </div>
  );
}
