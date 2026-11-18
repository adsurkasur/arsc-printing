'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { QueueWidget } from '@/components/QueueWidget'
import { FileText, ShieldCheck, Clock, CheckCircle2, ArrowRight, Printer, AlertCircle } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Editorial Hero Section */}
      <section className="border-b border-border bg-card/40 py-16 sm:py-24">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-background text-xs text-muted-foreground mb-6 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            Layanan Resmi ARSC FTAB Universitas Brawijaya
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.15] mb-6">
            Cetak dokumen kuliah,<br className="hidden sm:inline" />
            tertib dan terprediksi.
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Kirim berkas PDF dari ponsel atau laptop, dapatkan estimasi tarif transparan,
            dan ambil cetakan fisik langsung di sekretariat ARSC setelah disetujui operator.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button asChild size="lg" className="w-full sm:w-auto h-12 px-7 text-base bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs">
              <Link href="/order">
                <FileText className="mr-2 h-5 w-5" />
                Mulai Pesan Cetak
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-12 px-6 text-base border-border hover:bg-secondary">
              <Link href="/track">
                Lacak Status Pesanan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t border-border/60 flex flex-wrap justify-center items-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Tarif Hitam Putih Rp500/halaman
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Tarif Warna Rp750/halaman
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Ukuran A4 & F4
            </span>
          </div>
        </div>
      </section>

      {/* Alur & Status Section */}
      <section className="py-12 sm:py-16 container mx-auto px-4 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1 */}
          <div className="rounded-lg border border-border bg-card p-6 shadow-card">
            <div className="w-10 h-10 rounded-md bg-secondary text-primary flex items-center justify-center font-bold mb-4">
              1
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Unggah PDF & Hitung Tarif</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Pilih opsi salinan, warna, dan ukuran kertas. Jumlah halaman dan estimasi tagihan dihitung transparan sebelum transfer.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-lg border border-border bg-card p-6 shadow-card">
            <div className="w-10 h-10 rounded-md bg-secondary text-primary flex items-center justify-center font-bold mb-4">
              2
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Verifikasi Admin Mandiri</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Upload bukti transfer QRIS. Admin memeriksa keabsahan berkas dan bukti sebelum mencetak agar tidak terjadi kesalahan.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-lg border border-border bg-card p-6 shadow-card">
            <div className="w-10 h-10 rounded-md bg-secondary text-primary flex items-center justify-center font-bold mb-4">
              3
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Ambil di Sekretariat</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Pantau status antrean berkala. Ambil fisik dokumen di sekretariat ARSC Gedung F FTAB UB setelah selesai dicetak.
            </p>
          </div>
        </div>

        {/* Live Queue Overview Widget */}
        <div className="rounded-lg border border-border bg-card p-6 sm:p-8 shadow-card max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-primary mb-3">
            <Clock className="h-4 w-4" />
            Ringkasan Antrean Saat Ini
          </div>
          <QueueWidget />
          <p className="text-xs text-muted-foreground mt-4">
            Data antrean menampilkan jumlah total pesanan yang sedang diproses tanpa memuat data pribadi pemesan.
          </p>
        </div>
      </section>

      {/* Operator Notice / Policy */}
      <section className="mt-auto border-t border-border bg-secondary/30 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-start gap-3 text-xs sm:text-sm text-muted-foreground">
            <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-foreground font-semibold">Pemberitahuan Layanan:</strong> ARSC Printing beroperasi sesuai jam piket sekretariat mahasiswa. Pesanan yang disubmit di luar jam operasional akan diverifikasi dan dicetak pada sesi piket berikutnya. Hubungi admin ARSC bila memerlukan bantuan mendesak.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
