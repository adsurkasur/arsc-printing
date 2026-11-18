"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  RefreshCw, FileText, ImageIcon, CheckCircle, XCircle, RotateCcw,
  AlertTriangle, Shield, CheckCheck, Search, Filter, HardDrive,
  Receipt, X, ChevronLeft, ChevronRight, Info, Calendar, DollarSign,
  Printer, Check, AlertCircle
} from 'lucide-react';
import type { Order } from '@/types/order';
import type { AdminAction } from '@/types/print-job';

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
  backendCompletionIsPhysicalProof: boolean;
}

export default function Admin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  // Daily summary & workers state
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [workers, setWorkers] = useState<WorkerItem[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');

  // Receipt modal state
  const [activeReceipt, setActiveReceipt] = useState<ReceiptData | null>(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);

  const [busy, setBusy] = useState(false);

  // Helper for admin headers
  const getAuthHeaders = useCallback(async () => {
    const { data } = await createClient().auth.getSession();
    if (!data.session) throw new Error('Harap masuk terlebih dahulu.');
    return {
      Authorization: 'Bearer ' + data.session.access_token,
      'Content-Type': 'application/json'
    };
  }, []);

  // Fetch daily summary
  const fetchSummary = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/admin/summary', { headers, cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch {
      // Ignore background summary failure
    }
  }, [getAuthHeaders]);

  // Fetch workers
  const fetchWorkers = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/admin/workers', { headers, cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const items = data.items || [];
        setWorkers(items);
        if (items.length > 0 && !selectedWorkerId) {
          const firstEnabled = items.find((w: WorkerItem) => w.enabled) || items[0];
          setSelectedWorkerId(firstEnabled.id);
        }
      }
    } catch {
      // Ignore background worker failure
    }
  }, [getAuthHeaders, selectedWorkerId]);

  // Fetch orders with search, filter, pagination
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      if (statusFilter) params.set('status', statusFilter);
      if (searchQuery.trim()) params.set('q', searchQuery.trim());

      const res = await fetch(`/api/admin/orders?${params.toString()}`, { headers, cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || data.error?.code || 'Gagal memuat data pesanan.');
      }
      setOrders(data.items || []);
      setTotalOrders(data.total || 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kendala.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, page, pageSize, statusFilter, searchQuery]);

  // Refresh all
  const refreshAll = useCallback(async () => {
    await Promise.all([fetchOrders(), fetchSummary(), fetchWorkers()]);
  }, [fetchOrders, fetchSummary, fetchWorkers]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  // Action handler
  const handleAdminAction = async (order: Order, action: AdminAction, extra: Record<string, unknown> = {}) => {
    setBusy(true);
    setMessage('');
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/admin/orders/' + order.id + '/action', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action,
          expectedVersion: order.version,
          ...extra
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || data.error?.code || 'Aksi ditolak.');
      }
      setMessage(`Aksi '${action}' berhasil diproses.`);
      await refreshAll();
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Aksi gagal.');
    } finally {
      setBusy(false);
    }
  };

  // View Receipt
  const handleViewReceipt = async (orderId: string) => {
    setLoadingReceipt(true);
    setMessage('');
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/admin/orders/${orderId}/receipt`, { headers, cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || data.error?.code || 'Gagal memuat receipt.');
      }
      setActiveReceipt(data);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Gagal memuat receipt.');
    } finally {
      setLoadingReceipt(false);
    }
  };

  // Document preview
  const handleOpenDoc = async (id: string, kind: string) => {
    try {
      const { data } = await createClient().auth.getSession();
      if (!data.session) {
        setMessage('Harap masuk terlebih dahulu.');
        return;
      }
      const response = await fetch('/api/admin/orders/' + id + '/document?kind=' + kind, {
        headers: { Authorization: 'Bearer ' + data.session.access_token },
        cache: 'no-store'
      });
      if (!response.ok) {
        setMessage('Akses berkas ditolak.');
        return;
      }
      const value = await response.json();
      if (typeof value.url === 'string') {
        const url = new URL(value.url, location.origin);
        if (['http:', 'https:'].includes(url.protocol)) {
          window.open(url.toString(), '_blank', 'noopener,noreferrer');
        }
      }
    } catch {
      setMessage('Gagal membuka berkas.');
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalOrders / pageSize));

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary text-primary text-xs font-semibold mb-1.5">
            <Shield className="h-3.5 w-3.5" />
            Portal Kontrol Operator
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Review Pesanan & Antrean Cetak
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Verifikasi bukti bayar, setujui pekerjaan cetak, dan kelola serah-terima fisik dokumen.
          </p>
        </div>
        <Button
          disabled={loading || busy}
          onClick={() => void refreshAll()}
          variant="outline"
          className="border-border hover:bg-secondary h-10 shrink-0"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Segarkan Data
        </Button>
      </div>

      {/* Daily Summary Card */}
      {summary && (
        <div className="rounded-lg border border-border bg-card p-5 shadow-card space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-primary" />
              Ringkasan Harian Operasional ({summary.date} · {summary.timeZone})
            </h2>
            <span className="text-xs text-muted-foreground font-medium">Rekapitulasi Manual</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-3.5 rounded-md bg-secondary/30 border border-border space-y-1">
              <span className="text-xs text-muted-foreground block">Total Pesanan Masuk:</span>
              <div className="text-2xl font-bold font-mono text-foreground">{summary.orderCount}</div>
              <span className="text-[11px] text-muted-foreground">Semua pesanan dibuat hari ini</span>
            </div>
            <div className="p-3.5 rounded-md bg-secondary/30 border border-border space-y-1">
              <span className="text-xs text-muted-foreground block">Total Lembar/Halaman:</span>
              <div className="text-2xl font-bold font-mono text-foreground">{summary.pages}</div>
              <span className="text-[11px] text-muted-foreground">Akumulasi halaman dokumen</span>
            </div>
            <div className="p-3.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1">
              <span className="text-xs text-emerald-800 dark:text-emerald-300 font-medium block">Pendapatan Terverifikasi:</span>
              <div className="text-2xl font-bold font-mono text-emerald-900 dark:text-emerald-100">
                Rp {summary.revenueVerified.toLocaleString('id-ID')}
              </div>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400">Pembayaran disetujui kasir</span>
            </div>
          </div>
        </div>
      )}

      {/* Operator Worker Selection & Filter Bar */}
      <div className="rounded-lg border border-border bg-card p-5 shadow-card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Worker Dropdown from /api/admin/workers */}
          <div>
            <label htmlFor="worker-select" className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
              <HardDrive className="h-3.5 w-3.5 text-primary" />
              Target Worker Cetak Aktif
            </label>
            <select
              id="worker-select"
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="">-- Pilih Worker Printer --</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.printerKey} {w.enabled ? '(Aktif)' : '(Nonaktif)'}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-muted-foreground mt-1 block">
              Pekerjaan yang disetujui akan dialokasikan ke antrean worker ini.
            </span>
          </div>

          {/* Search Input (q) */}
          <div>
            <label htmlFor="admin-search-input" className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5 text-primary" />
              Cari Nama / Kode Pengambilan
            </label>
            <div className="flex gap-2">
              <input
                id="admin-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Contoh: Budi atau ARSC-4821"
                className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              <Button
                size="sm"
                onClick={() => { setPage(1); void fetchOrders(); }}
                className="h-10 px-4 bg-primary text-primary-foreground text-xs font-semibold shrink-0"
              >
                Cari
              </Button>
            </div>
            <span className="text-[11px] text-muted-foreground mt-1 block">
              Pencarian literal substring nama pemesan atau pickup code.
            </span>
          </div>
        </div>

        {/* Status Filter Tab row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 mr-1">
            <Filter className="h-3 w-3" /> Filter Status:
          </span>
          {[
            { key: '', label: 'Semua' },
            { key: 'pending_verification', label: 'Menunggu Verifikasi' },
            { key: 'approved', label: 'Disetujui / Antrean' },
            { key: 'delivered', label: 'Diserahkan' },
            { key: 'cancelled', label: 'Dibatalkan' }
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => { setStatusFilter(item.key); setPage(1); }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
                statusFilter === item.key
                  ? 'bg-primary text-primary-foreground border-primary font-semibold'
                  : 'bg-background border-border text-muted-foreground hover:bg-secondary'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {(error || message) && (
        <div role="alert" className="p-3.5 bg-secondary/80 border border-border rounded-md text-xs sm:text-sm text-foreground flex items-center justify-between">
          <span>{error || message}</span>
          <button type="button" onClick={() => { setError(null); setMessage(''); }} className="text-xs font-semibold underline ml-2">
            Tutup
          </button>
        </div>
      )}

      {/* Orders List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Daftar Pesanan ({totalOrders} hasil)
          </h2>
          <span className="text-xs text-muted-foreground">
            Halaman {page} dari {totalPages}
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center text-muted-foreground space-y-2">
            <p className="text-sm font-medium">Tidak ada pesanan yang sesuai dengan filter.</p>
            <p className="text-xs">Coba sesuaikan kata kunci pencarian atau ubah filter status.</p>
          </div>
        ) : (
          orders.map((order) => {
            const job = order.print_jobs?.find((j) => j.revision === order.revision);
            const pickupCode = (order as unknown as { pickupCode?: string; pickup_code?: string }).pickupCode ||
                               (order as unknown as { pickupCode?: string; pickup_code?: string }).pickup_code;

            return (
              <article key={order.id} className="rounded-lg border border-border bg-card p-5 sm:p-6 shadow-card space-y-4 w-full min-w-0">
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-foreground">
                        {order.customer_name}
                      </h3>
                      {pickupCode && (
                        <span className="px-2 py-0.5 rounded text-xs font-extrabold font-mono bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {pickupCode}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5 break-all">
                      ID: {order.id} · Kontak: <span className="text-foreground font-sans font-medium">{order.contact}</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusBadge status={order.status} />
                    {job && <StatusBadge status={job.status} />}
                  </div>
                </div>

                {/* Financial & Job Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-secondary/25 p-3 rounded-md">
                  <div>
                    <span className="text-muted-foreground block">Status Bayar:</span>
                    <strong className="text-foreground capitalize">{order.payment_status}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Tagihan Server:</span>
                    <strong className="text-foreground font-mono">Rp {order.amount_due?.toLocaleString('id-ID') || '—'}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Versi Dokumen:</span>
                    <strong className="text-foreground font-mono">Rev {order.revision}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">ID Pekerjaan:</span>
                    <strong className="text-foreground font-mono truncate block">{job?.id || 'Belum dibuat'}</strong>
                  </div>
                </div>

                {/* Document & Receipt Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/60">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => void handleOpenDoc(order.id, 'document')}
                    className="h-8 text-xs border-border"
                  >
                    <FileText className="mr-1.5 h-3.5 w-3.5 text-primary" />
                    Tinjau PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => void handleOpenDoc(order.id, 'proof')}
                    className="h-8 text-xs border-border"
                  >
                    <ImageIcon className="mr-1.5 h-3.5 w-3.5 text-primary" />
                    Tinjau Bukti Bayar
                  </Button>

                  {/* Receipt Viewer Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy || loadingReceipt}
                    onClick={() => void handleViewReceipt(order.id)}
                    className="h-8 text-xs border-primary/30 text-primary hover:bg-primary/10 font-medium"
                  >
                    <Receipt className="mr-1.5 h-3.5 w-3.5" />
                    Lihat Receipt
                  </Button>

                  {order.legacy_review_required && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() => void handleAdminAction(order, 'review_legacy')}
                      className="h-8 text-xs border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                    >
                      <AlertTriangle className="mr-1.5 h-3.5 w-3.5 text-amber-700" />
                      Catat Review Data Lama
                    </Button>
                  )}

                  {/* Verification Workflow Buttons */}
                  {order.status === 'pending_verification' && (
                    <>
                      <Button
                        size="sm"
                        disabled={busy}
                        onClick={() => void handleAdminAction(order, 'verify_payment')}
                        className="h-8 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-medium"
                      >
                        <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                        Verifikasi Bayar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() => void handleAdminAction(order, 'reject_payment')}
                        className="h-8 text-xs border-red-200 text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="mr-1.5 h-3.5 w-3.5" />
                        Tolak Bayar
                      </Button>
                      <Button
                        size="sm"
                        disabled={busy || order.payment_status !== 'verified' || order.legacy_review_required || !selectedWorkerId}
                        onClick={() => void handleAdminAction(order, 'approve', { workerId: selectedWorkerId, printerKey: 'fake' })}
                        className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                      >
                        Setujui Cetak
                      </Button>
                    </>
                  )}

                  {/* Cancellation */}
                  {(!job || job.status === 'ready') && ['pending_verification', 'approved'].includes(order.status) && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() => void handleAdminAction(order, 'cancel')}
                      className="h-8 text-xs border-border text-muted-foreground hover:text-destructive"
                    >
                      Batalkan Pesanan
                    </Button>
                  )}

                  {/* Physical Delivery Confirmation */}
                  {job?.status === 'backend_completed' && order.status === 'approved' && (
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() => {
                        if (window.confirm('Pastikan dokumen fisik telah diperiksa dan diserahkan kepada pelanggan?')) {
                          void handleAdminAction(order, 'deliver');
                        }
                      }}
                      className="h-8 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
                    >
                      <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
                      Konfirmasi Serah-Terima Fisik
                    </Button>
                  )}

                  {/* Reprint Workflow */}
                  {job && ['failed', 'needs_reconciliation', 'backend_completed'].includes(job.status) && order.status === 'approved' && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy || !selectedWorkerId}
                      onClick={() => {
                        if (window.confirm('PERINGATAN: Dokumen fisik mungkin telah tercetak. Setujui cetak ulang dengan risiko duplikasi?')) {
                          void handleAdminAction(order, 'reprint', { workerId: selectedWorkerId, printerKey: 'fake', acknowledgeDuplicateRisk: true });
                        }
                      }}
                      className="h-8 text-xs border-amber-300 text-amber-900 hover:bg-amber-50"
                    >
                      <RotateCcw className="mr-1.5 h-3.5 w-3.5 text-amber-700" />
                      Reprint (Revisi Baru)
                    </Button>
                  )}
                </div>
              </article>
            );
          })
        )}

        {/* Pagination Navigation */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border pt-4">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" />
              Sebelumnya
            </Button>
            <span className="text-xs text-muted-foreground font-mono">
              Halaman {page} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 text-xs"
            >
              Selanjutnya
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* Receipt Modal Viewer */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-background rounded-lg border border-border shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">
                  Detail Audit Receipt Pesanan
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveReceipt(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Disclaimer Banner per ADMIN_API.md */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
              <Info className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Perhatian:</strong> Selesainya pekerjaan di backend (status backend_completed) bukan merupakan bukti otomatis bahwa dokumen fisik telah selesai dicetak di printer atau diserahkan kepada pelanggan.
              </span>
            </div>

            {/* Order Projections */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Informasi Pesanan:
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-secondary/30 rounded-md text-xs">
                <div>
                  <span className="text-muted-foreground block">ID:</span>
                  <span className="font-mono font-semibold break-all">{activeReceipt.order.id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Pickup Code:</span>
                  <span className="font-mono font-bold text-primary">{activeReceipt.order.pickupCode || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Pelanggan:</span>
                  <span className="font-semibold">{activeReceipt.order.customerName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Status Order:</span>
                  <StatusBadge status={activeReceipt.order.status} />
                </div>
                <div>
                  <span className="text-muted-foreground block">Status Bayar:</span>
                  <span className="capitalize">{activeReceipt.order.paymentStatus}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Total Tagihan:</span>
                  <span className="font-mono font-bold">Rp {activeReceipt.order.amountDue?.toLocaleString('id-ID') || 0}</span>
                </div>
              </div>
            </div>

            {/* Jobs List */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Riwayat Pekerjaan Cetak ({activeReceipt.jobs.length}):
              </h4>
              {activeReceipt.jobs.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Belum ada pekerjaan cetak untuk pesanan ini.</p>
              ) : (
                <div className="space-y-2">
                  {activeReceipt.jobs.map((j) => (
                    <div key={j.id} className="p-3 border border-border rounded-md bg-secondary/15 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold">Job Rev {j.revision} ({j.id.slice(0, 8)}…)</span>
                        <StatusBadge status={j.status} />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-muted-foreground text-[11px] pt-1">
                        <div>Worker ID: <span className="font-mono text-foreground">{j.workerId || '—'}</span></div>
                        <div>Printer Key: <span className="font-mono text-foreground">{j.printerKey}</span></div>
                        <div>Backend Job ID: <span className="font-mono text-foreground break-all">{j.backendJobId || '—'}</span></div>
                        <div>Instance: <span className="font-mono text-foreground">{j.backendInstanceId || '—'}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Events Timeline */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Linimasa Audit Event ({activeReceipt.events.length}):
              </h4>
              {activeReceipt.events.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Belum ada audit event tercatat.</p>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 bg-secondary/10 rounded-md border border-border">
                  {activeReceipt.events.map((e) => (
                    <div key={e.eventId} className="text-[11px] flex items-center justify-between py-1 border-b border-border/40 last:border-0">
                      <span className="font-mono font-semibold text-primary">{e.type}</span>
                      <span className="text-muted-foreground font-mono">{new Date(e.createdAt).toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Button size="sm" onClick={() => setActiveReceipt(null)} className="h-9 px-5">
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
