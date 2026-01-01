'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Printer, LogIn, AlertCircle, Shield, Lock, Mail, Sparkles } from 'lucide-react'
import { motion, PageTransition, FadeInUp, ScaleIn } from '@/components/animations'

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
    <PageTransition>
      <div className="min-h-full flex items-center justify-center py-8 px-4 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 1 }}
            className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
          />
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Header above card */}
          <FadeInUp className="text-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg mb-6"
            >
              <Shield className="h-10 w-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Admin Portal</h1>
            <p className="text-muted-foreground mt-2">
              Masuk untuk mengelola pesanan cetak
            </p>
          </FadeInUp>

          <ScaleIn delay={0.2}>
            <Card className="p-8 shadow-smooth border-border/50 backdrop-blur-sm bg-card/80">
              {demoMode && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-yellow-500/20 p-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-yellow-600">Demo Mode Active</p>
                      <p className="text-muted-foreground mt-1">
                        Supabase belum dikonfigurasi. Gunakan demo credentials.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2"
                >
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="pl-10 rounded-xl h-12 bg-background/50 border-border/50 focus:border-primary transition-colors"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="pl-10 rounded-xl h-12 bg-background/50 border-border/50 focus:border-primary transition-colors"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity text-white font-medium"
                    disabled={loading}
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-2"
                      >
                        <Printer className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        Masuk
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>

{/*
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 pt-6 border-t border-border/50"
              >
                <div className="text-center">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDemoLogin}
                      className="rounded-xl gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      Isi Demo Credentials
                    </Button>
                  </motion.div>
                  <p className="text-xs text-muted-foreground mt-3">
                    <code className="px-2 py-1 rounded bg-muted text-xs">{DEMO_EMAIL}</code>
                    <span className="mx-2">/</span>
                    <code className="px-2 py-1 rounded bg-muted text-xs">{DEMO_PASSWORD}</code>
                  </p>
                </div>
              </motion.div>
*/}
            </Card>
          </ScaleIn>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-xs text-muted-foreground mt-6"
          >
            © 2026 Agritech Research and Study Club (ARSC)
          </motion.p>
        </div>
      </div>
    </PageTransition>
  )
}
