import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Bricolage_Grotesque, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import { Providers } from './providers'
import { TopAppBar, PublicNavBar, CreateOrderFab, Footer } from '@/components/shell'
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
  title: 'ARSC Printing — Layanan Cetak Kampus FTAB UB',
  description: 'Layanan cetak dokumen resmi Agritech Research and Study Club (ARSC), Fakultas Teknologi Agroindustri dan Biosistem (FTAB), Universitas Brawijaya.',
  authors: [{ name: 'ARSC Printing' }],
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    title: 'ARSC Printing — Layanan Cetak Kampus FTAB UB',
    description: 'Layanan cetak dokumen terstruktur oleh ARSC FTAB Universitas Brawijaya.',
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
    <html lang="id" suppressHydrationWarning className={`${fontDisplay.variable} ${fontBody.variable} ${fontCode.variable}`}>
      <body className="min-h-screen flex flex-col font-body bg-background text-foreground antialiased selection:bg-primary/15 selection:text-primary">
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[90] focus:px-4 focus:py-3 focus:rounded-full focus:bg-[var(--md-sys-color-primary)] focus:text-[var(--md-sys-color-on-primary)]"
          >
            Lewati ke isi utama
          </a>
          <TopAppBar />
          <main id="main-content" className="flex-1 pb-[calc(104px+env(safe-area-inset-bottom))] md:pb-0">
            {children}
          </main>
          <CreateOrderFab />
          <PublicNavBar />
          <Footer />
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
