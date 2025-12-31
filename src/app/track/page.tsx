'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Search, Clock, Printer, CheckCircle, FileText, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

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

    try {
      const response = await fetch('/api/orders?trackingId=' + encodeURIComponent(trackingId.trim()))
      
      if (!response.ok) {
        setNotFound(true)
        setLoading(false)
        return
      }

      const data = await response.json()
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
          color: 'bg-yellow-500/10 text-yellow-600',
          description: 'Pesanan Anda sedang dalam antrian',
        }
      case 'printing':
        return {
          icon: Printer,
          label: 'Sedang Dicetak',
          color: 'bg-blue-500/10 text-blue-600',
          description: 'Pesanan Anda sedang diproses',
        }
      case 'completed':
        return {
          icon: CheckCircle,
          label: 'Selesai',
          color: 'bg-green-500/10 text-green-600',
          description: 'Pesanan Anda sudah selesai dan siap diambil',
        }
      case 'cancelled':
        return {
          icon: AlertCircle,
          label: 'Dibatalkan',
          color: 'bg-red-500/10 text-red-600',
          description: 'Pesanan Anda telah dibatalkan',
        }
      default:
        return {
          icon: Clock,
          label: status,
          color: 'bg-gray-500/10 text-gray-600',
          description: '',
        }
    }
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            Lacak Pesanan
          </h1>
          <p className="mt-2 text-muted-foreground">
            Masukkan ID pesanan untuk melihat status
          </p>
        </div>

        <Card className="p-6 mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="trackingId" className="sr-only">
                ID Pesanan
              </Label>
              <Input
                id="trackingId"
                type="text"
                placeholder="Masukkan ID Pesanan..."
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className="h-12"
              />
            </div>
            <Button type="submit" className="h-12 px-6" disabled={loading}>
              {loading ? (
                'Mencari...'
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Lacak
                </>
              )}
            </Button>
          </form>
        </Card>

        {notFound && (
          <Card className="p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Pesanan Tidak Ditemukan
            </h2>
            <p className="text-muted-foreground">
              ID pesanan tidak valid atau pesanan tidak ada.
            </p>
          </Card>
        )}

        {order && (
          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-sm text-muted-foreground">ID Pesanan</p>
                <p className="font-mono text-lg font-medium">{order.id}</p>
              </div>
              {(() => {
                const statusInfo = getStatusInfo(order.status)
                const StatusIcon = statusInfo.icon
                return (
                  <Badge className={statusInfo.color}>
                    <StatusIcon className="mr-1 h-3 w-3" />
                    {statusInfo.label}
                  </Badge>
                )
              })()}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">{order.file_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Dibuat {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: id })}
                  </p>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <p className="font-medium mb-2">Status Pesanan</p>
                <p className="text-muted-foreground">
                  {getStatusInfo(order.status).description}
                </p>
                {order.status !== 'completed' && order.status !== 'cancelled' && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Estimasi waktu: {order.estimated_time} menit
                  </p>
                )}
              </div>

              {/* Status Timeline */}
              <div className="pt-4">
                <p className="font-medium mb-4">Riwayat Status</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <span>Pesanan diterima</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={'w-8 h-8 rounded-full flex items-center justify-center ' + 
                      (order.status === 'printing' || order.status === 'completed' ? 'bg-green-500' : 'bg-muted')}>
                      <Printer className={'h-4 w-4 ' + 
                        (order.status === 'printing' || order.status === 'completed' ? 'text-white' : 'text-muted-foreground')} />
                    </div>
                    <span className={order.status === 'pending' ? 'text-muted-foreground' : ''}>
                      Sedang dicetak
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={'w-8 h-8 rounded-full flex items-center justify-center ' + 
                      (order.status === 'completed' ? 'bg-green-500' : 'bg-muted')}>
                      <CheckCircle className={'h-4 w-4 ' + 
                        (order.status === 'completed' ? 'text-white' : 'text-muted-foreground')} />
                    </div>
                    <span className={order.status !== 'completed' ? 'text-muted-foreground' : ''}>
                      Selesai - Siap diambil
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
