import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from './providers'
import { Navbar } from '@/components/Navbar'
import './globals.css'

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
      <body className="min-h-screen flex flex-col bg-background">
        {/* Global shadow/gradient background layer to prevent seams between sections */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)/0.08)_0%,_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_hsl(var(--secondary)/0.05)_0%,_transparent_50%)]" />
        </div>
        <Providers>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <footer className="py-6 border-t border-border bg-background">
            <div className="container mx-auto px-4 text-center">
              <p className="text-sm text-muted-foreground">© 2026 Agritech Research and Study Club (ARSC)</p>
            </div>
          </footer>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
