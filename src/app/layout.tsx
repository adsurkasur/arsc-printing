import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Bricolage_Grotesque, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import { Providers } from './providers'
import { Navbar } from '@/components/Navbar'
import './globals.css'

const fontDisplay = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const fontBody = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const fontCode = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-code',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ARSC Printing — Layanan Cetak Kampus FTP UB',
  description: 'Layanan cetak dokumen resmi Agritech Research and Study Club (ARSC). Kirim berkas PDF, periksa estimasi biaya, dan pantau status pesanan mandiri.',
  authors: [{ name: 'ARSC Printing' }],
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    title: 'ARSC Printing — Layanan Cetak Kampus FTP UB',
    description: 'Layanan cetak dokumen terstruktur oleh ARSC FTP Universitas Brawijaya.',
    type: 'website',
    images: ['/qris-arsc.jpeg'],
  },
  twitter: {
    card: 'summary',
    site: '@arsc_printing',
    images: ['/qris-arsc.jpeg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={`${fontDisplay.variable} ${fontBody.variable} ${fontCode.variable}`}>
      <body className="min-h-screen flex flex-col font-body bg-background text-foreground antialiased selection:bg-primary/15 selection:text-primary">
        <Providers>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <footer className="py-8 border-t border-border bg-card/60 text-muted-foreground text-sm">
            <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div>
                <p className="font-medium text-foreground">ARSC Printing Service</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Agritech Research and Study Club · Fakultas Teknologi Pertanian, Universitas Brawijaya
                </p>
              </div>
              <div className="text-xs text-muted-foreground flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1">
                <span>Sekretariat ARSC Gedung F FTP UB</span>
                <span className="hidden sm:inline">•</span>
                <span>Tarif: Rp500 (B/W) / Rp750 (Warna)</span>
              </div>
            </div>
          </footer>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
