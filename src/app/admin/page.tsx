"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, Clock, Printer, LogOut, RefreshCw, Download, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const router = useRouter();
  const { toast } = useToast();
  const { orders, updateOrderStatus, loading, refreshOrders } = useOrders();
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({ email: user.email || '' });
      }
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  const getStatusBadge = (status: string) => {
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
      case "cancelled":
        return (
          <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">
            <XCircle className="mr-1 h-3 w-3" />
            Dibatalkan
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleStatusUpdate = async (id: string, currentStatus: string) => {
    if (currentStatus === "pending") {
      await updateOrderStatus(id, "printing");
      toast({ title: "Status diperbarui", description: "Pesanan sedang dicetak" });
    } else if (currentStatus === "printing") {
      await updateOrderStatus(id, "completed");
      toast({ title: "Status diperbarui", description: "Pesanan selesai" });
    }
  };

  const handleCancelOrder = async (id: string) => {
    await updateOrderStatus(id, "cancelled");
    toast({ title: "Pesanan dibatalkan", variant: "destructive" });
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
              Dashboard Admin
            </h1>
            <p className="mt-2 text-muted-foreground">
              {user ? `Logged in as ${user.email}` : 'Kelola pesanan cetak dokumen'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refreshOrders} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
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
                <p className="text-sm text-muted-foreground">Menunggu</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {orders.filter((o) => o.status === "pending").length}
                </p>
              </div>
              <div className="rounded-full bg-yellow-500/10 p-3">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sedang Dicetak</p>
                <p className="text-3xl font-bold text-blue-600">
                  {orders.filter((o) => o.status === "printing").length}
                </p>
              </div>
              <div className="rounded-full bg-blue-500/10 p-3">
                <Printer className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Selesai</p>
                <p className="text-3xl font-bold text-green-600">
                  {orders.filter((o) => o.status === "completed").length}
                </p>
              </div>
              <div className="rounded-full bg-green-500/10 p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
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
                  <TableHead>Kontak</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Salinan</TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p className="text-muted-foreground">Memuat pesanan...</p>
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <p className="text-muted-foreground">Belum ada pesanan</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.customer_name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {order.contact}
                      </TableCell>
                      <TableCell className="max-w-[150px]">
                        <div className="flex items-center gap-2">
                          <span className="truncate">{order.file_name}</span>
                          {order.file_url && (
                            <a
                              href={order.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.color_mode === "bw" ? "B/W" : "Warna"}
                      </TableCell>
                      <TableCell>{order.copies}x {order.paper_size}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: idLocale })}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {order.status !== "completed" && order.status !== "cancelled" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(order.id, order.status)}
                              >
                                {order.status === "pending" ? "Cetak" : "Selesai"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelOrder(order.id)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
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
