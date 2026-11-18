"use client";

import { useState, useId } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { FileUp, Image as ImageIcon, CheckCircle2, AlertCircle, QrCode, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import LivePDFPreview from '@/components/LivePDFPreview';
import { COPY_PAGES } from '@/lib/copy';

export default function OrderPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState<{ id: string; csrfToken?: string } | null>(null);
  const [key] = useState(() => crypto.randomUUID());

  // Form state for live price estimation
  const [copies, setCopies] = useState<number>(1);
  const [colorMode, setColorMode] = useState<'bw' | 'color'>('bw');
  const [paperSize, setPaperSize] = useState<'A4' | 'F4'>('A4');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [showQris, setShowQris] = useState<boolean>(true);

  // Pricing formula: BW = 500/page, Color = 750/page
  const unitRate = colorMode === 'color' ? 750 : 500;
  const estimatedTotal = Math.max(1, pageCount) * unitRate * Math.max(1, copies);

  const handlePageCountChange = (count: number) => {
    if (count > 0) setPageCount(count);
  };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');

    const form = new FormData(e.currentTarget);
    const file = pdfFile || (form.get('document') as File);
    const proof = proofFile || (form.get('proof') as File);

    try {
      if (!file || file.type !== 'application/pdf' || file.size === 0 || file.size > 10 * 1024 * 1024) {
        throw new Error('Dokumen harus PDF, ukuran maksimum 10 MiB.');
      }
      if (!proof || !['image/png', 'image/jpeg'].includes(proof.type) || proof.size === 0 || proof.size > 5 * 1024 * 1024) {
        throw new Error('Bukti pembayaran harus format PNG atau JPEG, maksimum 5 MiB.');
      }

      let order = draft;
      if (!order) {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': key
          },
          body: JSON.stringify({
            customer_name: form.get('customer_name'),
            contact: form.get('contact'),
            copies: Number(form.get('copies') || copies),
            color_mode: form.get('color_mode') || colorMode,
            paper_size: form.get('paper_size') || paperSize,
            layout: form.get('layout') || '1-up',
            scale_mode: 'fit',
            orientation: form.get('orientation') || 'portrait',
            user_note: form.get('user_note') || '',
          })
        });

        const value = await response.json();
        if (!response.ok || value.demoMode || typeof value.id !== 'string' || value.status !== 'pending_verification') {
          throw new Error('Gagal membuat draft pesanan di backend lokal. Periksa status server.');
        }
        order = { id: value.id, csrfToken: value.csrfToken };
        setDraft(order);
      }

      if (!order.csrfToken) {
        throw new Error('Token otorisasi draft tidak valid. Harap muat ulang halaman.');
      }

      // Upload files sequentially
      for (const [kind, selected] of [['document', file], ['proof', proof]] as const) {
        const body = new FormData();
        body.set('orderId', order.id);
        body.set('kind', kind);
        body.set('file', selected);

        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'X-CSRF-Token': order.csrfToken },
          body
        });

        const result = await response.json();
        if (!response.ok || result.demoMode) {
          throw new Error(`Unggah berkas ${kind} gagal. Silakan coba kembali.`);
        }
      }

      router.push('/order-success?orderId=' + encodeURIComponent(order.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Terjadi kendala saat memproses pesanan.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl w-full min-w-0">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-headlineMedium-emphasized md:text-headlineLarge-emphasized font-display text-[var(--md-sys-color-on-surface)]">
          {COPY_PAGES.order.text001}
        </h1>
        <p className="text-bodyLarge text-[var(--md-sys-color-on-surface-variant)] mt-space2 break-words">
          {COPY_PAGES.order.text002}
        </p>

        {/* §5 Stepper: Berkas, Pembayaran, Kirim */}
        <ol className="grid grid-cols-3 gap-2 mt-6 p-2 bg-[var(--md-sys-color-surface-container-low)] rounded-l border border-[var(--md-sys-color-outline-variant)] text-labelLarge text-center">
          <li aria-current="step" className="py-2 px-2 rounded-m bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-bold truncate">
            1. Berkas
          </li>
          <li className="py-2 px-2 text-[var(--md-sys-color-on-surface-variant)] truncate">
            2. Pembayaran
          </li>
          <li className="py-2 px-2 text-[var(--md-sys-color-on-surface-variant)] truncate">
            3. Kirim
          </li>
        </ol>
      </div>

      <form onSubmit={submit} className="space-y-8">
        {/* Section 1: Data Pemesan */}
        <div className="rounded-lg border border-border bg-card p-5 sm:p-6 shadow-card space-y-4">
          <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-secondary text-primary flex items-center justify-center text-xs font-bold">1</span>
            Identitas Pemesan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="customer_name" className="block text-xs font-medium text-foreground mb-1.5">
                Nama Lengkap <span className="text-destructive">*</span>
              </label>
              <input
                id="customer_name"
                name="customer_name"
                required
                maxLength={100}
                disabled={!!draft || busy}
                placeholder="Contoh: Budi Santoso"
                className="w-full h-11 px-3 text-sm rounded-md border border-input bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
              />
            </div>
            <div>
              <label htmlFor="contact" className="block text-xs font-medium text-foreground mb-1.5">
                Nomor WhatsApp / Telegram <span className="text-destructive">*</span>
              </label>
              <input
                id="contact"
                name="contact"
                required
                maxLength={100}
                disabled={!!draft || busy}
                placeholder="Contoh: 081234567890"
                className="w-full h-11 px-3 text-sm rounded-md border border-input bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Preferensi Cetak */}
        <div className="rounded-lg border border-border bg-card p-5 sm:p-6 shadow-card space-y-4">
          <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-secondary text-primary flex items-center justify-center text-xs font-bold">2</span>
            Preferensi Cetak
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="copies" className="block text-xs font-medium text-foreground mb-1.5">
                Jumlah Salinan
              </label>
              <input
                id="copies"
                name="copies"
                type="number"
                min={1}
                max={100}
                value={copies}
                onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={!!draft || busy}
                className="w-full h-11 px-3 text-sm rounded-md border border-input bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60 font-mono"
              />
            </div>
            <div>
              <label htmlFor="color_mode" className="block text-xs font-medium text-foreground mb-1.5">
                Mode Warna
              </label>
              <select
                id="color_mode"
                name="color_mode"
                value={colorMode}
                onChange={(e) => setColorMode(e.target.value as 'bw' | 'color')}
                disabled={!!draft || busy}
                className="w-full h-11 px-3 text-sm rounded-md border border-input bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
              >
                <option value="bw">Hitam Putih (Rp500)</option>
                <option value="color">Warna (Rp750)</option>
              </select>
            </div>
            <div>
              <label htmlFor="paper_size" className="block text-xs font-medium text-foreground mb-1.5">
                Ukuran Kertas
              </label>
              <select
                id="paper_size"
                name="paper_size"
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value as 'A4' | 'F4')}
                disabled={!!draft || busy}
                className="w-full h-11 px-3 text-sm rounded-md border border-input bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
              >
                <option value="A4">A4 (210 × 297 mm)</option>
                <option value="F4">F4 / Folio (215 × 330 mm)</option>
              </select>
            </div>
            <div>
              <label htmlFor="layout" className="block text-xs font-medium text-foreground mb-1.5">
                Tata Letak
              </label>
              <select
                id="layout"
                name="layout"
                disabled={!!draft || busy}
                className="w-full h-11 px-3 text-sm rounded-md border border-input bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
              >
                <option value="1-up">1 Halaman per Lembar</option>
                <option value="2-up">2 Halaman per Lembar</option>
                <option value="4-up">4 Halaman per Lembar</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label htmlFor="orientation" className="block text-xs font-medium text-foreground mb-1.5">
                Orientasi Cetak
              </label>
              <select
                id="orientation"
                name="orientation"
                disabled={!!draft || busy}
                className="w-full h-11 px-3 text-sm rounded-md border border-input bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
              >
                <option value="portrait">Potret (Tegak)</option>
                <option value="landscape">Lansekap (Mendatar)</option>
              </select>
            </div>
            <div>
              <label htmlFor="user_note" className="block text-xs font-medium text-foreground mb-1.5">
                Catatan Tambahan (Opsional)
              </label>
              <input
                id="user_note"
                name="user_note"
                maxLength={500}
                disabled={!!draft || busy}
                placeholder="Contoh: Jilid staples sudut kiri atas"
                className="w-full h-11 px-3 text-sm rounded-md border border-input bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Berkas Dokumen PDF */}
        <div className="rounded-lg border border-border bg-card p-5 sm:p-6 shadow-card space-y-4">
          <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-secondary text-primary flex items-center justify-center text-xs font-bold">3</span>
              Unggah Dokumen PDF
            </span>
            <span className="text-xs text-muted-foreground font-normal">Maks. 10 MiB</span>
          </h2>

          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors bg-secondary/15">
            <FileUp className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">
              {pdfFile ? pdfFile.name : 'Pilih berkas PDF dari perangkat Anda'}
            </p>
            <p className="text-xs text-muted-foreground mt-1 mb-3">
              Format didukung: PDF standar (dokumen teks/laporan/skripsi)
            </p>
            <label className="inline-block">
              <span className="sr-only">Pilih berkas PDF</span>
              <input
                name="document"
                type="file"
                required
                accept="application/pdf"
                disabled={!!draft || busy}
                onChange={async (e) => {
                  const f = e.target.files?.[0] || null;
                  setPdfFile(f);
                  if (f) {
                    const url = URL.createObjectURL(f);
                    setPdfUrl(url);
                    // Approximate page count from file size or pdf-lib in browser if needed, defaults to 1
                    try {
                      const buffer = await f.arrayBuffer();
                      const bytes = new Uint8Array(buffer);
                      // Simple /Type /Page scanner for fast client-side count
                      const str = new TextDecoder('latin1').decode(bytes);
                      const matches = str.match(/\/Type\s*\/Page\b/g);
                      if (matches && matches.length > 0) {
                        setPageCount(matches.length);
                      }
                    } catch {
                      // Fallback to 1
                    }
                  } else {
                    setPdfUrl(null);
                  }
                }}
                className="block w-full max-w-full text-xs text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer truncate"
              />
            </label>
          </div>

          {/* Interactive PDF Preview */}
          {pdfUrl && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Pratinjau PDF Terdeteksi ({pageCount} Halaman)
              </p>
              <LivePDFPreview
                fileUrl={pdfUrl}
                colorMode={colorMode}
                paperSize={paperSize}
                layout="1-up"
                scaleMode="fit"
                orientation="portrait"
                actualPages={pageCount}
              />
            </div>
          )}
        </div>

        {/* Section 4: Estimasi Biaya & Pembayaran QRIS */}
        <div className="rounded-lg border border-border bg-card p-5 sm:p-6 shadow-card space-y-4">
          <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-secondary text-primary flex items-center justify-center text-xs font-bold">4</span>
              Estimasi Biaya & Pembayaran QRIS
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-secondary text-primary font-medium">
              Tarif Resmi
            </span>
          </h2>

          {/* Price Breakdown Banner */}
          <div className="rounded-md border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-xs text-emerald-900 dark:text-emerald-300 font-medium">
                  Rincian Perhitungan Estimasi:
                </p>
                <p className="text-sm text-emerald-950 dark:text-emerald-100 font-mono mt-0.5">
                  {pageCount} halaman × Rp {unitRate.toLocaleString('id-ID')} ({colorMode === 'color' ? 'Warna' : 'Hitam Putih'}) × {copies} salinan
                </p>
              </div>
              <div className="text-right sm:border-l sm:border-emerald-200 sm:dark:border-emerald-800 sm:pl-4">
                <span className="text-xs text-emerald-800 dark:text-emerald-400 font-medium block">Total Estimasi</span>
                <span className="text-2xl font-bold font-mono text-emerald-900 dark:text-emerald-100">
                  Rp {estimatedTotal.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 border-t border-emerald-200/60 dark:border-emerald-900/60 pt-2 flex items-center gap-1">
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
              Estimasi awal dihitung dari pratinjau halaman; tagihan final diverifikasi oleh server secara otomatis.
            </p>
          </div>

          {/* Inline QRIS Display Card */}
          <div className="border border-border rounded-lg p-4 bg-background space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-foreground">QRIS Layanan ARSC UB</span>
              </div>
              <button
                type="button"
                onClick={() => setShowQris(!showQris)}
                className="text-xs text-primary hover:underline font-medium"
              >
                {showQris ? 'Sembunyikan QRIS' : 'Tampilkan QRIS'}
              </button>
            </div>

            {showQris && (
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <div className="w-44 h-44 relative rounded-md border border-border p-1 bg-white shrink-0 shadow-xs">
                  <Image
                    src="/qris-arsc.jpeg"
                    alt="Kode QRIS ARSC UB"
                    fill
                    className="object-contain p-1"
                  />
                </div>
                <div className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
                  <p className="font-medium text-foreground">Instruksi Pembayaran Mandiri:</p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Buka aplikasi m-Banking (BCA, Mandiri, BRI, BNI) atau e-Wallet (Gopay, OVO, ShopeePay, Dana).</li>
                    <li>Pindai kode QRIS di samping dan masukkan nominal transfer sesuai total estimasi: <strong className="text-foreground font-mono">Rp {estimatedTotal.toLocaleString('id-ID')}</strong>.</li>
                    <li>Simpan tangkapan layar (screenshot) bukti transfer Anda.</li>
                    <li>Unggah berkas bukti pembayaran di formulir bawah ini.</li>
                  </ol>
                </div>
              </div>
            )}
          </div>

          {/* Upload Proof Input */}
          <div className="border-2 border-dashed border-border rounded-lg p-5 text-center bg-secondary/15">
            <ImageIcon className="h-6 w-6 text-primary mx-auto mb-1.5" />
            <p className="text-sm font-medium text-foreground">
              {proofFile ? proofFile.name : 'Unggah Bukti Transfer QRIS (PNG/JPEG)'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 mb-2">Maks. 5 MiB (verifikasi manual admin)</p>
            <input
              name="proof"
              type="file"
              required
              accept="image/png,image/jpeg"
              disabled={!!draft || busy}
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setProofFile(f);
              }}
              className="block w-full max-w-full text-xs text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer truncate"
            />
          </div>
        </div>

        {/* Draft Notification if Present */}
        {draft && (
          <div className="p-3 bg-secondary border border-border rounded-md text-xs text-foreground">
            Draft ID: <code className="font-mono font-semibold">{draft.id}</code>. Preferensi cetak terkunci selama proses unggah berkas.
          </div>
        )}

        {/* Action Error Message */}
        {error && (
          <div role="alert" className="p-3 bg-red-50 border border-red-200 text-red-900 rounded-md text-sm flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-700 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            disabled={busy || !pdfFile || !proofFile}
            type="submit"
            className="w-full sm:w-auto h-12 px-8 text-base bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
          >
            {busy ? 'Mengunggah & Menyimpan…' : 'Kirim Pesanan & Unggah Berkas'}
          </Button>
        </div>
      </form>
    </div>
  );
}
