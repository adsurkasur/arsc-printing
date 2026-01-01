"use client";

import React, { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ColorModeBadge from "../../components/ColorModeBadge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useOrders } from "@/contexts/OrderContext";
import { motion, PageTransition, FadeInUp } from "@/components/animations";
import { RefreshCw, Clock, Printer, CheckCircle, XCircle, Home } from "lucide-react"; 

export default function QueuePage() {
  const { orders, loading, error, getQueueInfo, refreshOrders } = useOrders();
  const { count, estimatedTime } = getQueueInfo();
  const [refreshing, setRefreshing] = useState(false);
  const lastClickRef = useRef<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Refresh when page mounts
    refreshOrders().catch(() => {});
  }, [refreshOrders]);

  const queue = orders
    .filter((o) => o.status === "pending" || o.status === "printing" || o.status === "completed")
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  // If loading takes longer than this threshold, show a helpful message instead of indefinite "Memuat..."
  const [slowLoading, setSlowLoading] = useState(false);
  useEffect(() => {
    if (!loading) {
      setSlowLoading(false);
      return;
    }
    const t = setTimeout(() => setSlowLoading(true), 2000); // 2s
    return () => {
      clearTimeout(t);
      setSlowLoading(false);
    };
  }, [loading]);

  // Match admin dashboard badge styles for consistency
  const statusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "printing":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">
            <Printer className="mr-1 h-3 w-3" />
            Printing
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
            <CheckCircle className="mr-1 h-3 w-3" />
            Selesai
          </Badge>
        );
      case "delivered":
        return (
          <Badge className="bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20">
            <Home className="mr-1 h-3 w-3" />
            Diambil
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">
            <XCircle className="mr-1 h-3 w-3" />
            Dibatalkan
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <PageTransition>
      <div className="min-h-full py-8 px-4 w-full">
        <div className="mx-auto w-full max-w-screen-xl">
          <FadeInUp className="mb-8">
            <div className="mb-2">
              <h1 className="text-3xl font-bold">Status Antrian</h1>
              <p className="text-sm text-muted-foreground">Lihat antrian cetak: jumlah dan status</p>
            </div>

            <div className="flex items-center gap-3 justify-between">
              <div className="text-sm text-muted-foreground">
                <div>Dalam Antrian</div>
                <div className="text-lg font-semibold">{loading ? '—' : `${count} dokumen`}</div>
              </div>

              <div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      onClick={async () => {
                        const now = Date.now();
                        if (refreshing) return;
                        if (lastClickRef.current && now - lastClickRef.current < 1000) return; // 1s debounce
                        lastClickRef.current = now;

                        setRefreshing(true);
                        try {
                          await refreshOrders();
                          // After refresh, check for errors reported by context
                          if (error) {
                            toast({ title: 'Gagal', description: error, variant: 'destructive' });
                          } else {
                            toast({ title: 'Sukses', description: 'Status antrian diperbarui' });
                          }
                        } catch (err) {
                          toast({ title: 'Gagal', description: 'Terjadi kesalahan saat menyegarkan', variant: 'destructive' });
                        } finally {
                          setRefreshing(false);
                        }
                      }}
                      aria-label="Segarkan antrian"
                      disabled={refreshing}
                    >
                      {refreshing ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </motion.div>
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      {refreshing ? 'Menyegarkan...' : 'Segarkan'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Segarkan status antrian</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </FadeInUp>

          <FadeInUp>
            <Card className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No.</TableHead>
                    <TableHead>Nama Pelanggan</TableHead>
                    <TableHead>Salinan</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Masuk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Loading short -> show spinner text; if loading persists, show a helpful message with action */}
                  {loading && !slowLoading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Memuat...</TableCell>
                    </TableRow>
                  )}

                  {loading && slowLoading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center gap-3">
                          <p className="text-sm text-muted-foreground">Proses memakan waktu atau gagal memuat data.</p>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={async () => { setRefreshing(true); try { await refreshOrders(); if (error) toast({ title: 'Gagal', description: error, variant: 'destructive' }); else toast({ title: 'Sukses', description: 'Status antrian diperbarui' }); } catch (err) { toast({ title: 'Gagal', description: 'Terjadi kesalahan saat menyegarkan', variant: 'destructive' }); } finally { setRefreshing(false); } }}>Segarkan</Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Error state (non-loading) */}
                  {(!loading && error) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center gap-3">
                          <p className="text-sm text-destructive">{error}</p>
                          <Button size="sm" onClick={async () => { setRefreshing(true); try { await refreshOrders(); if (error) toast({ title: 'Gagal', description: error, variant: 'destructive' }); else toast({ title: 'Sukses', description: 'Status antrian diperbarui' }); } catch (err) { toast({ title: 'Gagal', description: 'Terjadi kesalahan saat menyegarkan', variant: 'destructive' }); } finally { setRefreshing(false); } }}>Segarkan</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Empty state when not loading */}
                  {(!loading && !error && queue.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Tidak ada antrian saat ini</TableCell>
                    </TableRow>
                  )}

                  {queue.map((order, idx) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{idx + 1}</TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell>{order.copies}</TableCell>
                      <TableCell>
                        <ColorModeBadge mode={order.color_mode} />
                      </TableCell>
                      <TableCell>
                        {statusBadge(order.status)}
                      </TableCell>
                      <TableCell>{new Date(order.created_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </FadeInUp>
        </div>
      </div>
    </PageTransition>
  );
}
