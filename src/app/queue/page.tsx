"use client";

import React, { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useOrders } from "@/contexts/OrderContext";
import { motion, PageTransition, FadeInUp } from "@/components/animations";
import { RefreshCw, Clock, Printer, CheckCircle, XCircle, Home } from "lucide-react";
import StatusBadge from "@/components/StatusBadge"; 

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

  // Use reusable StatusBadge component for consistency
  // Replaced inline helper with component usage below
  // (component located at src/components/StatusBadge.tsx)

  return (
    <PageTransition>
      <div className="min-h-full py-8 px-4 w-full">
        <div className="mx-auto w-full max-w-screen-xl">
          <FadeInUp className="mb-6 sm:mb-8">
            <div className="mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold">Status Antrean</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Lihat antrean cetak: jumlah dan status</p>
            </div>

            <div className="flex items-center gap-3 justify-between">
              <div className="text-sm text-muted-foreground">
                <div className="text-xs sm:text-sm">Dalam Antrean</div>
                <div className="text-base sm:text-lg font-semibold">{loading ? '—' : `${count} dokumen`}</div>
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
                            toast({ title: 'Sukses', description: 'Status antrean diperbarui' });
                          }
                        } catch (err) {
                          toast({ title: 'Gagal', description: 'Terjadi kesalahan saat menyegarkan', variant: 'destructive' });
                        } finally {
                          setRefreshing(false);
                        }
                      }}
                      aria-label="Segarkan antrean"
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
                  <TooltipContent>Segarkan status antrean</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </FadeInUp>

          <FadeInUp>
            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-3">
              {/* Loading states */}
              {loading && !slowLoading && (
                <Card className="p-6 text-center text-muted-foreground">Memuat...</Card>
              )}

              {loading && slowLoading && (
                <Card className="p-6">
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-sm text-muted-foreground">Proses memakan waktu atau gagal memuat data.</p>
                    <Button size="sm" variant="outline" onClick={async () => { setRefreshing(true); try { await refreshOrders(); if (error) toast({ title: 'Gagal', description: error, variant: 'destructive' }); else toast({ title: 'Sukses', description: 'Status antrean diperbarui' }); } catch (err) { toast({ title: 'Gagal', description: 'Terjadi kesalahan saat menyegarkan', variant: 'destructive' }); } finally { setRefreshing(false); } }}>Segarkan</Button>
                  </div>
                </Card>
              )}

              {/* Error state */}
              {(!loading && error) && (
                <Card className="p-6">
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-sm text-destructive">{error}</p>
                    <Button size="sm" onClick={async () => { setRefreshing(true); try { await refreshOrders(); if (error) toast({ title: 'Gagal', description: error, variant: 'destructive' }); else toast({ title: 'Sukses', description: 'Status antrean diperbarui' }); } catch (err) { toast({ title: 'Gagal', description: 'Terjadi kesalahan saat menyegarkan', variant: 'destructive' }); } finally { setRefreshing(false); } }}>Segarkan</Button>
                  </div>
                </Card>
              )}

              {/* Empty state */}
              {(!loading && !error && queue.length === 0) && (
                <Card className="p-6 text-center text-muted-foreground">Tidak ada antrean saat ini</Card>
              )}

              {/* Queue cards */}
              {queue.map((order, idx) => (
                <Card key={order.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">#{idx + 1}</span>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="font-medium truncate">{order.customer_name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Desktop Table View */}
            <Card className="w-full hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No.</TableHead>
                    <TableHead>Nama Pelanggan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Masuk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Loading short -> show spinner text; if loading persists, show a helpful message with action */}
                  {loading && !slowLoading && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Memuat...</TableCell>
                    </TableRow>
                  )}

                  {loading && slowLoading && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <div className="flex flex-col items-center gap-3">
                          <p className="text-sm text-muted-foreground">Proses memakan waktu atau gagal memuat data.</p>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={async () => { setRefreshing(true); try { await refreshOrders(); if (error) toast({ title: 'Gagal', description: error, variant: 'destructive' }); else toast({ title: 'Sukses', description: 'Status antrean diperbarui' }); } catch (err) { toast({ title: 'Gagal', description: 'Terjadi kesalahan saat menyegarkan', variant: 'destructive' }); } finally { setRefreshing(false); } }}>Segarkan</Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Error state (non-loading) */}
                  {(!loading && error) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <div className="flex flex-col items-center gap-3">
                          <p className="text-sm text-destructive">{error}</p>
                          <Button size="sm" onClick={async () => { setRefreshing(true); try { await refreshOrders(); if (error) toast({ title: 'Gagal', description: error, variant: 'destructive' }); else toast({ title: 'Sukses', description: 'Status antrean diperbarui' }); } catch (err) { toast({ title: 'Gagal', description: 'Terjadi kesalahan saat menyegarkan', variant: 'destructive' }); } finally { setRefreshing(false); } }}>Segarkan</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Empty state when not loading */}
                  {(!loading && !error && queue.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Tidak ada antrean saat ini</TableCell>
                    </TableRow>
                  )}

                  {queue.map((order, idx) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{idx + 1}</TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
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
