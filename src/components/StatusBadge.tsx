import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const badgeConfig: Record<string, { label: string; className: string }> = {
  pending_verification: {
    label: 'Menunggu Verifikasi Bayar',
    className: 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800'
  },
  approved: {
    label: 'Disetujui Admin (Siap Antre)',
    className: 'bg-blue-50 text-blue-900 border-blue-300 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-800'
  },
  ready: {
    label: 'Siap Diambil Worker',
    className: 'bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800'
  },
  claimed: {
    label: 'Diproses Worker',
    className: 'bg-sky-50 text-sky-900 border-sky-300 dark:bg-sky-950/40 dark:text-sky-200 dark:border-sky-800'
  },
  submitted: {
    label: 'Terkirim ke Printer',
    className: 'bg-indigo-50 text-indigo-900 border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-200 dark:border-indigo-800'
  },
  backend_completed: {
    label: 'Selesai di Printer (Ambil di Kasir)',
    className: 'bg-emerald-100 text-emerald-950 border-emerald-400 dark:bg-emerald-900/50 dark:text-emerald-100 dark:border-emerald-700 font-semibold'
  },
  delivered: {
    label: 'Telah Diserahkan ke Pelanggan',
    className: 'bg-zinc-100 text-zinc-900 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700'
  },
  needs_reconciliation: {
    label: 'Perlu Rekonsiliasi Operator',
    className: 'bg-amber-100 text-amber-950 border-amber-400 dark:bg-amber-900/50 dark:text-amber-100 dark:border-amber-700 font-medium'
  },
  failed: {
    label: 'Gagal Diproses',
    className: 'bg-red-50 text-red-900 border-red-300 dark:bg-red-950/40 dark:text-red-200 dark:border-red-800'
  },
  cancelled: {
    label: 'Pesanan Dibatalkan',
    className: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800'
  },
  pending: {
    label: 'Data Lama (Perlu Review)',
    className: 'bg-zinc-100 text-zinc-800 border-zinc-300'
  },
  printing: {
    label: 'Status Lama (Belum Terbukti)',
    className: 'bg-zinc-100 text-zinc-800 border-zinc-300'
  },
  completed: {
    label: 'Status Lama (Belum Terbukti)',
    className: 'bg-zinc-100 text-zinc-800 border-zinc-300'
  }
};

export default function StatusBadge({ status, className }: { status?: string | null; className?: string }) {
  const config = badgeConfig[status ?? ''] ?? {
    label: 'Status Tidak Diketahui',
    className: 'bg-zinc-100 text-zinc-700 border-zinc-300'
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-normal text-xs px-2.5 py-0.5 rounded-full border transition-colors inline-flex items-center gap-1.5",
        config.className,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {config.label}
    </Badge>
  );
}
