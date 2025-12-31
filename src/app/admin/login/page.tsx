'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Printer, LogIn, AlertCircle } from 'lucide-react'

// Demo credentials for testing
const DEMO_EMAIL = 'admin@arsc-printing.com'
const DEMO_PASSWORD = 'admin123'

// Check if Supabase is properly configured
function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return url && key && !url.includes('placeholder') && !key.includes('placeholder')
}

export default function AdminLogin() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [demoMode, setDemoMode] = useState(false)
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

    // Demo mode login
    if (demoMode) {
      if (formData.email === DEMO_EMAIL && formData.password === DEMO_PASSWORD) {
        // Set demo auth in localStorage
        localStorage.setItem('demo_admin_auth', JSON.stringify({
          email: DEMO_EMAIL,
          authenticated: true,
          timestamp: Date.now()
        }))
        
        toast({
          title: 'Login Berhasil (Demo Mode)',
          description: 'Selamat datang di Dashboard Admin',
        })
        
        router.push('/admin')
        router.refresh()
      } else {
        toast({
          title: 'Login Gagal',
          description: 'Email atau password salah. Gunakan demo credentials.',
          variant: 'destructive',
        })
        setLoading(false)
      }
      return
    }

    // Real Supabase login
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        toast({
          title: 'Login Gagal',
          description: error.message,
          variant: 'destructive',
        })
        setLoading(false)
        return
      }

      toast({
        title: 'Login Berhasil',
        description: 'Selamat datang di Dashboard Admin',
      })

      router.push('/admin')
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat login',
        variant: 'destructive',
      })
      setLoading(false)
    }
  }

  const handleDemoLogin = () => {
    setFormData({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    })
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Printer className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
          <p className="text-muted-foreground mt-2">
            Masuk untuk mengelola pesanan cetak
          </p>
        </div>

        {demoMode && (
          <div className="mb-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-600">Demo Mode Active</p>
                <p className="text-muted-foreground mt-1">
                  Supabase belum dikonfigurasi. Gunakan demo credentials untuk testing.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              'Loading...'
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Masuk
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDemoLogin}
            className="text-xs"
          >
            Isi Demo Credentials
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            <span className="font-mono">{DEMO_EMAIL}</span> / <span className="font-mono">{DEMO_PASSWORD}</span>
          </p>
        </div>
      </Card>
    </div>
  )
}
