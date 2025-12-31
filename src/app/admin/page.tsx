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
import { CheckCircle, Clock, Printer, LogOut, RefreshCw, Download, XCircle, Shield, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { motion, PageTransition, FadeInUp, StaggerContainer, StaggerItem } from "@/components/animations";

// Check if Supabase is properly configured
function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return url && key && !url.includes('placeholder') && !key.includes('placeholder')
}

export default function Admin() {
  const router = useRouter();
  const { toast } = useToast();
  const { orders, updateOrderStatus, loading, refreshOrders } = useOrders();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    const checkDemoMode = !isSupabaseConfigured();
    setDemoMode(checkDemoMode);

    if (checkDemoMode) {
      // Check demo auth from localStorage
      const demoAuth = localStorage.getItem('demo_admin_auth');
      if (demoAuth) {
        try {
          const auth = JSON.parse(demoAuth);
          // Check if demo auth is less than 24 hours old
          if (auth.authenticated && Date.now() - auth.timestamp < 24 * 60 * 60 * 1000) {
            setUser({ email: auth.email });
            return;
          }
        } catch {
          // Invalid auth, redirect to login
        }
      }
      // No valid demo auth, redirect to login
      router.push('/admin/login');
    } else {
      // Check real Supabase auth
      const checkUser = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser({ email: user.email || '' });
        }
      };
      checkUser();
    }
  }, [router]);

  const handleLogout = async () => {
    if (demoMode) {
      localStorage.removeItem('demo_admin_auth');
    } else {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
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
    <PageTransition>
      <div className="min-h-full py-8 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <FadeInUp className="mb-8">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg"
                >
                  <Shield className="h-7 w-7 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground md:text-4xl tracking-tight">
                    Dashboard Admin
                  </h1>
                  <div className="mt-1 text-muted-foreground flex items-center gap-2 flex-wrap">
                    <span>{user ? `${user.email}` : 'Kelola pesanan cetak dokumen'}</span>
                    {demoMode && <Badge variant="outline">Demo</Badge>}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" onClick={refreshOrders} disabled={loading} className="rounded-xl">
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" onClick={handleLogout} className="rounded-xl">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </motion.div>
              </div>
            </div>
          </FadeInUp>

          {/* Stats Cards */}
          <StaggerContainer className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Pesanan */}
            <StaggerItem>
                <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ duration: 0.2 }}>
                  <Card className="p-6 border-border/50 shadow-smooth bg-gradient-to-br from-primary/10 to-primary/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Pesanan</p>
                        <motion.p
                          key={orders.length}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-3xl font-bold text-primary"
                        >
                          {orders.length}
                        </motion.p>
                      </div>
                      <div className="rounded-xl bg-primary/10 p-3">
                        <TrendingUp className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </StaggerItem>
              
              {/* Menunggu */}
              <StaggerItem>
                <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ duration: 0.2 }}>
                  <Card className="p-6 border-border/50 shadow-smooth bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Menunggu</p>
                        <motion.p
                          key={orders.filter((o) => o.status === "pending").length}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-3xl font-bold text-yellow-600"
                        >
                          {orders.filter((o) => o.status === "pending").length}
                        </motion.p>
                      </div>
                      <div className="rounded-xl bg-yellow-500/10 p-3">
                        <Clock className="h-6 w-6 text-yellow-600" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </StaggerItem>
              
              {/* Sedang Dicetak */}
              <StaggerItem>
                <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ duration: 0.2 }}>
                  <Card className="p-6 border-border/50 shadow-smooth bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Sedang Dicetak</p>
                        <motion.p
                          key={orders.filter((o) => o.status === "printing").length}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-3xl font-bold text-blue-600"
                        >
                          {orders.filter((o) => o.status === "printing").length}
                        </motion.p>
                      </div>
                      <div className="rounded-xl bg-blue-500/10 p-3">
                        <Printer className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </StaggerItem>
              
              {/* Selesai */}
              <StaggerItem>
                <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ duration: 0.2 }}>
                  <Card className="p-6 border-border/50 shadow-smooth bg-gradient-to-br from-green-500/10 to-green-500/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Selesai</p>
                        <motion.p
                          key={orders.filter((o) => o.status === "completed").length}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-3xl font-bold text-green-600"
                        >
                          {orders.filter((o) => o.status === "completed").length}
                        </motion.p>
                      </div>
                      <div className="rounded-xl bg-green-500/10 p-3">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </StaggerItem>
            </StaggerContainer>

          {/* Orders Table */}
          <FadeInUp delay={0.2}>
            <Card className="shadow-smooth border-border/50 overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/30">
                <h2 className="font-semibold">Daftar Pesanan</h2>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20">
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
                        <TableCell colSpan={8} className="text-center py-12">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="inline-block"
                          >
                            <RefreshCw className="h-8 w-8 text-primary mx-auto mb-3" />
                          </motion.div>
                          <p className="text-muted-foreground">Memuat pesanan...</p>
                        </TableCell>
                      </TableRow>
                    ) : orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12">
                          <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
                            <Printer className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <p className="text-muted-foreground">Belum ada pesanan</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order, index) => (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-border hover:bg-muted/30 transition-colors"
                        >
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
                                <motion.a
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  href={order.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:text-primary/80"
                                >
                                  <Download className="h-4 w-4" />
                                </motion.a>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="rounded-lg">
                              {order.color_mode === "bw" ? "B/W" : "Warna"}
                            </Badge>
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
                                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                      size="sm"
                                      className="rounded-lg"
                                      onClick={() => handleStatusUpdate(order.id, order.status)}
                                    >
                                      {order.status === "pending" ? "Cetak" : "Selesai"}
                                    </Button>
                                  </motion.div>
                                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="rounded-lg"
                                      onClick={() => handleCancelOrder(order.id)}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </motion.div>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </FadeInUp>
        </div>
      </div>
    </PageTransition>
  );
}
