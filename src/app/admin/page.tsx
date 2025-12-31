"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOrders } from "@/contexts/OrderContext";
import { CheckCircle, Clock, Printer } from "lucide-react";

export default function Admin() {
  const { orders, updateOrderStatus } = useOrders();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-secondary/10 text-secondary hover:bg-secondary/20">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "printing":
        return (
          <Badge className="bg-warning/10 text-warning hover:bg-warning/20">
            <Printer className="mr-1 h-3 w-3" />
            Printing
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-success/10 text-success hover:bg-success/20">
            <CheckCircle className="mr-1 h-3 w-3" />
            Selesai
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleStatusUpdate = (id: string, currentStatus: string) => {
    if (currentStatus === "pending") {
      updateOrderStatus(id, "printing");
    } else if (currentStatus === "printing") {
      updateOrderStatus(id, "completed");
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            Dashboard Admin
          </h1>
          <p className="mt-2 text-muted-foreground">
            Kelola pesanan cetak dokumen
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pesanan</p>
                <p className="text-3xl font-bold text-foreground">
                  {orders.length}
                </p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Printer className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sedang Diproses</p>
                <p className="text-3xl font-bold text-warning">
                  {orders.filter((o) => o.status === "printing").length}
                </p>
              </div>
              <div className="rounded-full bg-warning/10 p-3">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Selesai</p>
                <p className="text-3xl font-bold text-success">
                  {orders.filter((o) => o.status === "completed").length}
                </p>
              </div>
              <div className="rounded-full bg-success/10 p-3">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
            </div>
          </Card>
        </div>

        {/* Orders Table */}
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Pelanggan</TableHead>
                  <TableHead>Nama File</TableHead>
                  <TableHead>Mode Cetak</TableHead>
                  <TableHead>Salinan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-muted-foreground">
                        Belum ada pesanan
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.customerName}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {order.fileName}
                      </TableCell>
                      <TableCell>
                        {order.colorMode === "bw"
                          ? "Hitam Putih"
                          : "Berwarna"}
                      </TableCell>
                      <TableCell>{order.copies}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        {order.status !== "completed" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleStatusUpdate(order.id, order.status)
                            }
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            {order.status === "pending"
                              ? "Mulai Cetak"
                              : "Tandai Selesai"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
