"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import StatusBadge from './StatusBadge';
import { CheckCircle2, Clock, MapPin, ArrowRight, Copy, Check, AlertCircle, Ban, Tag } from 'lucide-react';

export default function OrderSuccessClient({ initialOrderId }: { initialOrderId: string | null }) {
  const [status, setStatus] = useState<string | null>(null);
  const [pickupCode, setPickupCode] = useState<string | null>(null);
  const [version, setVersion] = useState<number | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [amountDue, setAmountDue] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialOrderId) return;
    const controller = new AbortController();
    fetch('/api/orders?id=' + encodeURIComponent(initialOrderId), {
      cache: 'no-store',
      signal: controller.signal
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Pesanan tidak ditemukan atau akses terbatas pada browser ini.');
        return response.json();
      })
      .then((order) => {
        if (order.demoMode) throw new Error('Backend lokal simulasi belum terhubung.');
        setStatus(order.status);
        if (order.pickupCode) setPickupCode(order.pickupCode);
        if (order.version !== undefined) setVersion(order.version);
        if (order.csrfToken) setCsrfToken(order.csrfToken);
        if (order.amount_due !== undefined) setAmountDue(order.amount_due);
      })
      .catch((e) => {
        if (e.name !== 'AbortError') setError(e.message);
      });
    return () => controller.abort();
  }, [initialOrderId]);

  const copyOrderId = () => {
    if (!initialOrderId) return;
    navigator.clipboard.writeText(initialOrderId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const copyPickupCode = () => {
    if (!pickupCode) return;
    navigator.clipboard.writeText(pickupCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCancel = async () => {
    if (!initialOrderId || version === null || version === undefined) return;
    const confirmed = window.confirm('Apakah Anda yakin ingin membatalkan pesanan ini? Tindakan ini tidak dapat dibatalkan.');
    if (!confirmed) return;

    setCancelling(true);
    setCancelError(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(initialOrderId)}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {})
        },
        body: JSON.stringify({ expectedVersion: version })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || data.error?.code || 'Gagal membatalkan pesanan.');
      }
      setStatus('cancelled');
      if (data.version !== undefined) setVersion(data.version);
    } catch (err: unknown) {
      setCancelError(err instanceof Error ? err.message : 'Terjadi kendala saat membatalkan.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:py-16 max-w-2xl w-full min-w-0">
      <div className="rounded-lg border border-border bg-card p-6 sm:p-8 shadow-card space-y-6">
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {status === 'cancelled' ? 'Pesanan Telah Dibatalkan' : 'Pesanan Berhasil Dikirim'}
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {status === 'cancelled'
              ? 'Pesanan ini telah resmi dibatalkan sesuai permintaan Anda.'
              : 'Berkas dan bukti bayar Anda telah diterima oleh sistem ARSC Printing.'}
          </p>
        </div>

        {/* Pickup Code Card (Prominent) */}
        {pickupCode && (
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
                <Tag className="h-3.5 w-3.5" />
                Kode Pengambilan Fisik (Pickup Code)
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-primary mt-1 tracking-wider">
                {pickupCode}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tunjukkan kode ini kepada operator kasir saat mengambil cetakan fisik.
              </p>
            </div>
            <button
              type="button"
              onClick={copyPickupCode}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md border border-primary/30 bg-background text-primary hover:bg-primary/10 transition-colors shrink-0"
            >
              {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedCode ? 'Tersalin' : 'Salin Kode'}
            </button>
          </div>
        )}

        {/* Order Identifier Box */}
        {initialOrderId ? (
          <div className="p-4 rounded-md border border-border bg-secondary/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">ID Pesanan (UUID):</span>
              <button
                type="button"
                onClick={copyOrderId}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
              >
                {copiedId ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                {copiedId ? 'Tersalin' : 'Salin ID'}
              </button>
            </div>
            <code className="block text-sm font-mono font-semibold text-foreground break-all bg-background p-2 rounded border border-border">
              {initialOrderId}
            </code>
            <p className="text-xs text-muted-foreground">
              Simpan ID ini untuk melacak status pesanan secara mandiri di menu Lacak Pesanan.
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-md border border-border bg-secondary/30 text-center text-sm text-muted-foreground">
            ID pesanan tidak terdeteksi pada parameter URL.
          </div>
        )}

        {/* Current Order Status */}
        <div className="border-t border-b border-border py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs text-muted-foreground block">Status Terkini:</span>
            <div className="mt-1">
              <StatusBadge status={status || 'pending_verification'} />
            </div>
          </div>
          <div className="text-xs text-muted-foreground sm:text-right">
            {amountDue !== null && (
              <span className="font-mono text-sm font-bold text-foreground block mb-0.5">
                Tagihan: Rp {amountDue.toLocaleString('id-ID')}
              </span>
            )}
            Verifikasi dan cetak dilakukan oleh operator ARSC saat jam operasional.
          </div>
        </div>

        {error && (
          <div role="alert" className="p-3 bg-red-50 border border-red-200 text-red-900 rounded-md text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-700 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Cancel Order Section (Only when pending_verification) */}
        {status === 'pending_verification' && (
          <div className="p-4 rounded-md border border-destructive/20 bg-destructive/5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-semibold text-destructive uppercase tracking-wider flex items-center gap-1.5">
                  <Ban className="h-3.5 w-3.5" />
                  Batalkan Pesanan Ini
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pembatalan hanya dapat dilakukan selama pesanan belum diverifikasi operator.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={cancelling}
                onClick={handleCancel}
                className="border-destructive/30 text-destructive hover:bg-destructive hover:text-white text-xs h-9 font-medium shrink-0"
              >
                {cancelling ? 'Membatalkan…' : 'Batalkan Pesanan'}
              </Button>
            </div>
            {cancelError && (
              <p className="text-xs text-destructive font-medium">{cancelError}</p>
            )}
          </div>
        )}

        {/* Next Steps Card */}
        {status !== 'cancelled' && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary" />
              Langkah Selanjutnya:
            </h2>
            <ul className="text-xs text-muted-foreground space-y-2 pl-4 list-disc leading-relaxed">
              <li>Admin memeriksa kesesuaian berkas PDF dan bukti transfer pembayaran Anda.</li>
              <li>Setelah disetujui, pesanan akan otomatis masuk ke antrean cetak worker lokal.</li>
              <li>Saat status berubah menjadi <strong>Selesai di Printer</strong>, Anda dapat mengambil hasil cetak fisik di:</li>
            </ul>
            <div className="p-3 rounded-md bg-secondary/50 text-xs text-foreground flex items-start gap-2 border border-border">
              <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>Sekretariat ARSC</strong> — Gedung F Lantai 1, Fakultas Teknologi Agroindustri dan Biosistem (FTAB), Universitas Brawijaya. Tunjukkan Kode Pengambilan ({pickupCode || 'ARSC-XXXX'}) kepada operator.
              </span>
            </div>
          </div>
        )}

        {/* Action Navigation */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Button asChild className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/queue">
              Pantau Antrean Cetak
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 border-border">
            <Link href="/order">
              Buat Pesanan Baru
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
