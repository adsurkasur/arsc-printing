"use client";

import { useOrders } from '@/contexts/OrderContext';
import { Button } from '@/components/ui/button';
import { Clock, RefreshCw, ShieldCheck, Printer, CheckCircle2 } from 'lucide-react';

export default function Queue() {
  const { getQueueInfo, refreshOrders, loading, error } = useOrders();
  const queue = getQueueInfo();

  return (
    <div className="container mx-auto px-4 py-8 sm:py-16 max-w-3xl">
      <div className="rounded-lg border border-border bg-card p-6 sm:p-8 shadow-card space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Status Antrean Cetak
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Ringkasan beban kerja printer di sekretariat ARSC FTAB UB.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => void refreshOrders()}
            className="border-border hover:bg-secondary shrink-0 h-9"
          >
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Segarkan
          </Button>
        </div>

        {/* Big Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-6 rounded-lg border border-border bg-secondary/30 text-center space-y-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Pesanan dalam Antrean
            </span>
            <div className="text-4xl sm:text-5xl font-bold font-mono text-primary">
              {queue.count}
            </div>
            <span className="text-xs text-muted-foreground">Pekerjaan disetujui & aktif</span>
          </div>

          <div className="p-6 rounded-lg border border-border bg-secondary/30 text-center space-y-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Estimasi Total Waktu
            </span>
            <div className="text-4xl sm:text-5xl font-bold font-mono text-foreground">
              {queue.estimatedTime}
            </div>
            <span className="text-xs text-muted-foreground">Menit pemrosesan rata-rata</span>
          </div>
        </div>

        {error && (
          <div role="alert" className="p-3 bg-red-50 border border-red-200 text-red-900 rounded-md text-xs">
            {error}
          </div>
        )}

        {/* Informational Cards */}
        <div className="border-t border-border pt-6 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Ketentuan Antrean Cetak:
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div className="p-3 rounded border border-border bg-background space-y-1">
              <strong className="text-foreground font-medium block">Perlindungan Privasi</strong>
              Halaman publik ini hanya menampilkan agregat jumlah pekerjaan tanpa mengungkap nama, kontak, maupun isi berkas.
            </div>
            <div className="p-3 rounded border border-border bg-background space-y-1">
              <strong className="text-foreground font-medium block">Konfirmasi Fisik</strong>
              Status selesai di printer menandakan dokumen fisik telah dicetak dan siap diambil di meja kasir sekretariat.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
