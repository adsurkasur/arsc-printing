'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Search, Clock, Printer, CheckCircle, FileText, AlertCircle, Package } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import { motion, PageTransition, FadeInUp } from '@/components/animations'
import { AnimatePresence } from 'framer-motion'

interface TrackedOrder {
  id: string
  customer_name: string
  file_name: string
  status: string
  created_at: string
  estimated_time: number
}

export default function TrackOrder() {
  const { toast } = useToast()
  const [trackingId, setTrackingId] = useState('')
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState<TrackedOrder | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [demoMode, setDemoMode] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackingId.trim()) {
      toast({
        title: 'Error',
        description: 'Masukkan ID pesanan',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    setNotFound(false)
    setOrder(null)
    setDemoMode(false)

    try {
      const response = await fetch('/api/orders?trackingId=' + encodeURIComponent(trackingId.trim()))
      
      if (!response.ok) {
        setNotFound(true)
        setLoading(false)
        return
      }

      const data = await response.json()
      
      // Check if API returned demo mode response
      if (data.demoMode) {
        setDemoMode(true)
        setLoading(false)
        return
      }
      
      setOrder(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal mencari pesanan',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          label: 'Menunggu',
          color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
          bgColor: 'bg-yellow-500',
          description: 'Pesanan Anda sedang dalam antrian',
          step: 1
        }
      case 'printing':
        return {
          icon: Printer,
          label: 'Sedang Dicetak',
          color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
          bgColor: 'bg-blue-500',
          description: 'Pesanan Anda sedang diproses',
          step: 2
        }
      case 'completed':
        return {
          icon: CheckCircle,
          label: 'Selesai',
          color: 'bg-green-500/10 text-green-600 border-green-500/20',
          bgColor: 'bg-green-500',
          description: 'Pesanan Anda sudah selesai dan siap diambil',
          step: 3
        }
      case 'cancelled':
        return {
          icon: AlertCircle,
          label: 'Dibatalkan',
          color: 'bg-red-500/10 text-red-600 border-red-500/20',
          bgColor: 'bg-red-500',
          description: 'Pesanan Anda telah dibatalkan',
          step: 0
        }
      default:
        return {
          icon: Clock,
          label: status,
          color: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
          bgColor: 'bg-gray-500',
          description: '',
          step: 0
        }
    }
  }

  const timelineSteps = [
    { step: 1, icon: Package, label: 'Pesanan Diterima' },
    { step: 2, icon: Printer, label: 'Sedang Dicetak' },
    { step: 3, icon: CheckCircle, label: 'Selesai' },
  ]

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Header */}
          <FadeInUp className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Lacak Pesanan
            </span>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl tracking-tight">
              Cek Status Pesanan
            </h1>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">
              Masukkan ID pesanan untuk melihat status terkini
            </p>
          </FadeInUp>

          {/* Search Box */}
          <FadeInUp delay={0.1}>
            <Card className="p-6 mb-8 shadow-smooth border-border/50">
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="trackingId"
                    type="text"
                    placeholder="Masukkan ID Pesanan..."
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="h-14 pl-12 text-base rounded-xl"
                  />
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    type="submit" 
                    className="h-14 px-8 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90" 
                    disabled={loading}
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Search className="h-5 w-5" />
                      </motion.div>
                    ) : (
                      'Lacak'
                    )}
                  </Button>
                </motion.div>
              </form>
            </Card>
          </FadeInUp>

          <AnimatePresence mode="wait">
            {/* Demo Mode */}
            {demoMode && (
              <motion.div
                key="demomode"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="p-12 text-center shadow-smooth border-border/50">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="mx-auto h-20 w-20 rounded-2xl bg-yellow-500/10 flex items-center justify-center mb-6"
                  >
                    <AlertCircle className="h-10 w-10 text-yellow-600" />
                  </motion.div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Demo Mode Aktif
                  </h2>
                  <p className="text-muted-foreground">
                    Fitur pelacakan memerlukan koneksi database. Hubungi administrator untuk mengaktifkan Supabase.
                  </p>
                </Card>
              </motion.div>
            )}

            {/* Not Found */}
            {notFound && (
              <motion.div
                key="notfound"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="p-12 text-center shadow-smooth border-border/50">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="mx-auto h-20 w-20 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6"
                  >
                    <AlertCircle className="h-10 w-10 text-destructive" />
                  </motion.div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Pesanan Tidak Ditemukan
                  </h2>
                  <p className="text-muted-foreground">
                    ID pesanan tidak valid atau pesanan tidak ada.
                  </p>
                </Card>
              </motion.div>
            )}

            {/* Order Details */}
            {order && (
              <motion.div
                key="order"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="overflow-hidden shadow-smooth border-border/50">
                  {/* Status Header */}
                  {(() => {
                    const statusInfo = getStatusInfo(order.status)
                    const StatusIcon = statusInfo.icon
                    return (
                      <div className={`p-6 ${statusInfo.color} border-b`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className={`h-12 w-12 rounded-xl ${statusInfo.bgColor} flex items-center justify-center shadow-lg`}
                            >
                              <StatusIcon className="h-6 w-6 text-white" />
                            </motion.div>
                            <div>
                              <p className="font-semibold text-lg">{statusInfo.label}</p>
                              <p className="text-sm opacity-80">{statusInfo.description}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  <div className="p-6 space-y-6">
                    {/* Order Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">ID Pesanan</p>
                        <p className="font-mono text-sm font-medium truncate">{order.id.slice(0, 8)}...</p>
                      </div>
                      <div className="p-4 rounded-xl bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Estimasi</p>
                        <p className="text-sm font-medium">{order.estimated_time} menit</p>
                      </div>
                    </div>

                    {/* File Info */}
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-border/50"
                    >
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{order.file_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Dibuat {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: id })}
                        </p>
                      </div>
                    </motion.div>

                    {/* Status Timeline */}
                    <div className="pt-4">
                      <p className="font-medium mb-6">Riwayat Status</p>
                      <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-muted" />
                        
                        <div className="space-y-6">
                          {timelineSteps.map((item, index) => {
                            const currentStep = getStatusInfo(order.status).step
                            const isCompleted = item.step <= currentStep
                            const isCurrent = item.step === currentStep
                            
                            return (
                              <motion.div
                                key={item.step}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative flex items-center gap-4"
                              >
                                <motion.div
                                  animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                                  transition={{ duration: 2, repeat: isCurrent ? Infinity : 0 }}
                                  className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                                    isCompleted ? 'bg-success' : 'bg-muted'
                                  }`}
                                >
                                  <item.icon className={`h-5 w-5 ${isCompleted ? 'text-white' : 'text-muted-foreground'}`} />
                                </motion.div>
                                <div className="flex-1">
                                  <p className={`font-medium ${!isCompleted && 'text-muted-foreground'}`}>
                                    {item.label}
                                  </p>
                                  {isCurrent && (
                                    <motion.p
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      className="text-sm text-primary"
                                    >
                                      Status saat ini
                                    </motion.p>
                                  )}
                                </div>
                                {isCompleted && (
                                  <CheckCircle className="h-5 w-5 text-success" />
                                )}
                              </motion.div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  )
}
