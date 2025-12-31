import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from './providers'
import { Navbar } from '@/components/Navbar'
import './globals.css'
import { ScrollToTop } from '@/components/ScrollToTop'

export const metadata: Metadata = {
  title: 'ARSC Printing - Cetak Dokumen Tanpa Antre',
  description: 'Layanan cetak dokumen resmi organisasi kampus. Upload, pantau status real-time, dan ambil hasil cetak dengan mudah.',
  authors: [{ name: 'ARSC Printing' }],
  openGraph: {
    title: 'ARSC Printing - Cetak Dokumen Tanpa Antre',
    description: 'Layanan cetak dokumen resmi organisasi kampus. Upload, pantau status real-time, dan ambil hasil cetak dengan mudah.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@arsc_printing',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          {/* Scroll to top on route change */}
          <ScrollToTop />
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
