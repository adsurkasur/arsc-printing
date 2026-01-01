"use client";

import React, { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useOrders } from "@/contexts/OrderContext";
import { motion } from "@/components/animations";
import { RefreshCw } from "lucide-react"; 

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
    .filter((o) => o.status === "pending" || o.status === "printing")
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const statusVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "printing":
        return "default";
      case "completed":
        return "destructive";
      case "cancelled":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Status Antrian</h1>
          <p className="text-sm text-muted-foreground">Lihat antrian cetak: jumlah dan estimasi waktu</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Dalam Antrian</div>
            <div className="text-lg font-semibold">{count} dokumen</div>
            <div className="text-sm text-muted-foreground">Estimasi {estimatedTime} menit</div>
          </div>

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

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead>Nama Pelanggan</TableHead>
              <TableHead>Copy</TableHead>
              <TableHead>Warna</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Masuk</TableHead>
              <TableHead>Estimasi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {queue.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Tidak ada antrian saat ini</TableCell>
              </TableRow>
            ) : null}

            {queue.map((order, idx) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{idx + 1}</TableCell>
                <TableCell>{order.customer_name}</TableCell>
                <TableCell>{order.copies}</TableCell>
                <TableCell className="capitalize">{order.color_mode}</TableCell>
                <TableCell>
                  {/* @ts-expect-error: Badge variant expects predefined variants */}
                  <Badge variant={statusVariant(order.status)}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(order.created_at).toLocaleString()}</TableCell>
                <TableCell>{order.estimated_time} menit</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
