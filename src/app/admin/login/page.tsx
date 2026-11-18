'use client'

import { useState, useEffect } from 'react'
import { COPY_PAGES } from '@/lib/copy'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Printer, Shield, Lock, Mail, AlertCircle, Info } from 'lucide-react'

// Demo credentials for local simulation
const DEMO_EMAIL = 'admin@arsc-printing.com'
const DEMO_PASSWORD = 'admin123'

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return url && key && !url.includes('placeholder') && !key.includes('placeholder')
}

export default function AdminLogin() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [demoMode, setDemoMode] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  useEffect(() => {
    setDemoMode(!isSupabaseConfigured())
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Demo mode login
    if (demoMode) {
      if (formData.email === DEMO_EMAIL && formData.password === DEMO_PASSWORD) {
        localStorage.setItem('demo_admin_auth', JSON.stringify({
          email: DEMO_EMAIL,
          authenticated: true,
          timestamp: Date.now()
        }))
        router.push('/admin')
      } else {
        setError('Kredensial demo tidak cocok. Gunakan admin@arsc-printing.com / admin123.')
      }
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) throw error

      if (data.user) {
        window.location.href = '/admin'
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal masuk ke portal admin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 sm:py-20 max-w-md">
      <div className="rounded-lPlus bg-[var(--md-sys-color-surface-container-low)] p-space6 sm:p-space8 shadow-elevation-1 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-m bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center mx-auto">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-headlineSmall-emphasized font-display text-[var(--md-sys-color-on-surface)]">
            {COPY_PAGES.login.text001}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Akses khusus staf piket dan operator cetak ARSC FTAB UB.
          </p>
        </div>

        {demoMode && (
          <div className="p-3.5 rounded-md bg-secondary/50 border border-border text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <Info className="h-3.5 w-3.5 text-primary" />
              Mode Simulasi Lokal Aktif
            </div>
            <p>
              Gunakan email <code className="font-mono text-foreground font-semibold">{DEMO_EMAIL}</code> dan sandi <code className="font-mono text-foreground font-semibold">{DEMO_PASSWORD}</code> untuk pengujian.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-foreground mb-1.5">
              Alamat Email Operator
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@arsc-printing.com"
                className="w-full h-11 pl-10 pr-3 text-sm rounded-md border border-input bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-foreground mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-3 text-sm rounded-md border border-input bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {error && (
            <div role="alert" className="p-3 bg-red-50 border border-red-200 text-red-900 rounded-md text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-700 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 text-sm bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
          >
            {loading ? 'Memverifikasi…' : 'Masuk ke Dashboard'}
          </Button>
        </form>
      </div>
    </div>
  )
}
