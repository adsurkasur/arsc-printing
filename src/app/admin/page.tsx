"use client";

import { useEffect, useState, useRef, useCallback } from "react";

// Small helper: Download link that shows countdown until deletion on hover
function DownloadWithCountdown({ fileUrl, expiresAt }: { fileUrl: string; expiresAt?: string | null }) {
  const [remaining, setRemaining] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  const computeRemaining = useCallback(() => {
    if (!expiresAt) {
      setRemaining(null);
      return;
    }
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) {
      setRemaining('0s');
      return;
    }
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    if (hours > 0) setRemaining(`${hours}h ${minutes}m ${seconds}s`);
    else if (minutes > 0) setRemaining(`${minutes}m ${seconds}s`);
    else setRemaining(`${seconds}s`);
  }, [expiresAt]);

  useEffect(() => {
    // Keep updating in the background when the component mounts
    computeRemaining();
    intervalRef.current = window.setInterval(computeRemaining, 1000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [computeRemaining]);

  // Ensure immediate calculation when user hovers (avoids initial 'Download' showing briefly)
  const handleMouseEnter = () => {
    computeRemaining();
  };

  // Programmatic download helper (uses fetch to ensure download even when server doesn't set content-disposition)
  const downloadFile = async (url: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Network response was not ok');
      const blob = await res.blob();
      const contentDisposition = res.headers.get('content-disposition');
      let filename = 'file';
      if (contentDisposition) {
        const match = /filename\*=UTF-8''(.+)|filename="?([^";]+)"?/.exec(contentDisposition);
        if (match) filename = decodeURIComponent(match[1] || match[2]);
      } else {
        try {
          const urlObj = new URL(url);
          filename = decodeURIComponent(urlObj.pathname.split('/').pop() || filename);
        } catch (e) {
          console.warn('Failed to derive filename from URL', e);
        }
      }

      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // Fallback: open in new tab
      window.open(url, '_blank');
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onMouseEnter={handleMouseEnter}
          onClick={() => downloadFile(fileUrl)}
          className="text-primary hover:text-primary/80"
        >
          <Download className="h-4 w-4" />
        </motion.button>
      </TooltipTrigger>
      <TooltipContent side="top">{remaining ? `Hapus file dalam ${remaining}` : 'Download'}</TooltipContent>
    </Tooltip>
  );
}

// Simple inline deletion timer shown in the proof modal
function DeletionTimer({ expiresAt }: { expiresAt?: string | null }) {
  const [remaining, setRemaining] = useState<string | null>(null);

  useEffect(() => {
    if (!expiresAt) {
      setRemaining(null);
      return;
    }

    const compute = () => {
      const diff = new Date(expiresAt!).getTime() - Date.now();
      if (diff <= 0) return setRemaining('0s');
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      if (hours > 0) setRemaining(`${hours}h ${minutes}m ${seconds}s`);
      else if (minutes > 0) setRemaining(`${minutes}m ${seconds}s`);
      else setRemaining(`${seconds}s`);
    };

    compute();
    const id = window.setInterval(compute, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (!expiresAt) return null;

  return <p className="text-sm text-muted-foreground mt-2">Hapus bukti dalam {remaining ?? '—'}</p>;
}

// Tooltip content component that updates every second while mounted (used for proof tooltip)
function ProofTooltipContent({ expiresAt }: { expiresAt?: string | null }) {
  const [remaining, setRemaining] = useState<string | null>(null);

  useEffect(() => {
    if (!expiresAt) {
      setRemaining(null);
      return;
    }

    const compute = () => {
      const diff = new Date(expiresAt!).getTime() - Date.now();
      if (diff <= 0) return setRemaining('0s');
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      if (hours > 0) setRemaining(`${hours}h ${minutes}m ${seconds}s`);
      else if (minutes > 0) setRemaining(`${minutes}m ${seconds}s`);
      else setRemaining(`${seconds}s`);
    };

    compute();
    const id = window.setInterval(compute, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (!expiresAt) return <>Lihat bukti pembayaran</>;
  return <>Hapus bukti dalam {remaining ?? '—'}</>;
}

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
import { CheckCircle, Clock, Printer, LogOut, RefreshCw, Download, XCircle, Shield, TrendingUp, Trash, Home, FileText } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { motion, PageTransition, FadeInUp, StaggerContainer, StaggerItem } from "@/components/animations";
import { ToastAction } from "@/components/ui/toast";
import type { OrderStatus } from "@/types/order";

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
          const demoAdminTtlHours = Number(process.env.NEXT_PUBLIC_DEMO_ADMIN_AUTH_TTL_HOURS ?? process.env.NEXT_PUBLIC_ADMIN_AUTH_TTL_HOURS ?? 24);
          if (auth.authenticated && Date.now() - auth.timestamp < demoAdminTtlHours * 60 * 60 * 1000) {
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
        return null;
    }
  };

  const handleStatusUpdate = async (id: string, currentStatus: string) => {
    if (currentStatus === "pending") {
      const ok = await updateOrderStatus(id, "printing");
      if (ok) toast({ title: "Status diperbarui", description: "Pesanan sedang dicetak" });
    } else if (currentStatus === "printing") {
      const ok = await updateOrderStatus(id, "completed");
      if (ok) toast({ title: "Status diperbarui", description: "Pesanan selesai" });
    }
  };

  const handleCancelOrder = async (id: string) => {
    const ok = await updateOrderStatus(id, "cancelled");
    if (ok) toast({ title: "Pesanan dibatalkan", variant: "destructive" });
  };

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Payment proof modal state
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [proofOrderId, setProofOrderId] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [proofExpiresAt, setProofExpiresAt] = useState<string | null>(null);
  const [proofDeleting, setProofDeleting] = useState(false);

  // Minimal typed order shape for payment proof actions
  type ProofableOrder = {
    id: string;
    payment_proof_url?: string | null;
    payment_proof_expires_at?: string | null;
  };

  const openProofModal = (order: ProofableOrder) => {
    setProofOrderId(order.id);
    setProofUrl(order.payment_proof_url ?? null);
    setProofExpiresAt(order.payment_proof_expires_at ?? null);
    // Open modal on next tick
    setTimeout(() => setProofModalOpen(true), 0);
  };

  const closeProofModal = () => {
    setProofModalOpen(false);
    setProofOrderId(null);
    setProofUrl(null);
    setProofExpiresAt(null);
  };

  const confirmDeletePaymentProof = async () => {
    if (!proofOrderId) return setProofModalOpen(false);
    setProofDeleting(true);
    try {
      const res = await fetch('/api/delete-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: proofOrderId, type: 'payment_proof' }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Gagal menghapus bukti pembayaran');
      }
      toast({ title: 'Bukti pembayaran dihapus', description: 'Bukti pembayaran berhasil dihapus dari storage' });
      await refreshOrders();
      setProofModalOpen(false);
      setProofOrderId(null);
    } catch (err: unknown) {
      console.error('Delete payment proof error:', err);
      const message = err instanceof Error ? err.message : String(err);
      toast({ title: 'Gagal', description: message || 'Tidak dapat menghapus bukti pembayaran', variant: 'destructive' });
    } finally {
      setProofDeleting(false);
    }
  };

  const requestDeleteFile = (id: string) => {
    setDeleteTargetId(id);
    // Open modal on next tick to avoid immediate click on the confirm button
    setTimeout(() => setDeleteModalOpen(true), 0);
  };

  const confirmDeleteFile = async () => {
    if (!deleteTargetId) return setDeleteModalOpen(false);
    setDeleting(true);
    try {
      const res = await fetch('/api/delete-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteTargetId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Gagal menghapus file');
      }
      toast({ title: 'File dihapus', description: 'File berhasil dihapus dari storage' });
      await refreshOrders();
      setDeleteModalOpen(false);
      setDeleteTargetId(null);
    } catch (err: unknown) {
      console.error('Delete file error:', err);
      const message = err instanceof Error ? err.message : String(err);
      toast({ title: 'Gagal', description: message || 'Tidak dapat menghapus file', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  const requestCancelOrder = (id: string) => {
    setCancelTargetId(id);
    setTimeout(() => setCancelModalOpen(true), 0);
  };

  const confirmCancelOrder = async () => {
    if (!cancelTargetId) return setCancelModalOpen(false);
    setCancelling(true);
    try {
      // capture previous status for undo
      const order = orders.find((o) => o.id === cancelTargetId);
      const prevStatus = order?.status || 'pending';

      const ok = await updateOrderStatus(cancelTargetId, 'cancelled');

      if (!ok) {
        // update failed; keep modal open and let the toast from updateOrderStatus explain the error
        setCancelling(false);
        return;
      }

      // show toast with undo action
      toast({
        title: 'Pesanan dibatalkan',
        variant: 'destructive',
        action: (
          <ToastAction altText="Undo" onClick={async () => {
            // revert status
            try {
              const rev = await updateOrderStatus(cancelTargetId, prevStatus as OrderStatus); // prevStatus is one of OrderStatus types
              if (rev) {
                await refreshOrders();
                toast({ title: 'Undo: Pesanan dipulihkan', description: `Status dikembalikan ke ${prevStatus}` });
              } else {
                toast({ title: 'Gagal', description: 'Tidak dapat memulihkan status', variant: 'destructive' });
              }
            } catch (e) {
              toast({ title: 'Gagal', description: 'Tidak dapat memulihkan status', variant: 'destructive' });
            }
          }}>
            Undo
          </ToastAction>
        ),
      });

      await refreshOrders();
      setCancelModalOpen(false);
      setCancelTargetId(null);
    } catch (err: unknown) {
      console.error('Cancel order error:', err);
      const message = err instanceof Error ? err.message : String(err);
      toast({ title: 'Gagal', description: message || 'Tidak dapat membatalkan pesanan', variant: 'destructive' });
    } finally {
      setCancelling(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-full py-8 px-4">
        <div className="container mx-auto">

        {/* Delete confirmation modal */}
        <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hapus file</DialogTitle>
              <DialogDescription>
                Hapus file terkait pesanan ini sekarang? Tindakan ini tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setDeleteModalOpen(false); setDeleteTargetId(null); }}>
                  Batal
                </Button>
                <Button variant="destructive" onClick={confirmDeleteFile} disabled={deleting}>
                  {deleting ? 'Menghapus...' : 'Hapus file'}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cancel confirmation modal */}
        <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Batalkan pesanan</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin membatalkan pesanan ini? Pesanan yang dibatalkan tidak akan diproses.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setCancelModalOpen(false); setCancelTargetId(null); }}>
                  Batal
                </Button>
                <Button variant="destructive" onClick={confirmCancelOrder} disabled={cancelling}>
                  {cancelling ? 'Membatalkan...' : 'Batalkan pesanan'}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Payment proof modal */}
        <Dialog open={proofModalOpen} onOpenChange={setProofModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bukti Pembayaran</DialogTitle>
              <DialogDescription>Preview dan unduh bukti pembayaran</DialogDescription>
              <DeletionTimer expiresAt={proofExpiresAt} />
            </DialogHeader>

            <div className="py-4">
              {proofUrl ? (
                // Detect file type by extension and show preview for images, link for PDFs, or download link for others
                (() => {
                  const lower = proofUrl.toLowerCase();
                  const isPdf = lower.endsWith('.pdf');
                  const isImage = /\.(png|jpe?g|webp|svg|tiff?|gif)$/.test(lower);

                  // programmatic download helper (we keep this inline to have access to proofUrl)
                  const downloadProof = async (url: string) => {
                    try {
                      const res = await fetch(url);
                      if (!res.ok) throw new Error('Network response was not ok');
                      const blob = await res.blob();
                      const contentDisposition = res.headers.get('content-disposition');
                      let filename = 'bukti';
                      if (contentDisposition) {
                        const match = /filename\*=UTF-8''(.+)|filename="?([^";]+)"?/.exec(contentDisposition);
                        if (match) filename = decodeURIComponent(match[1] || match[2]);
                      } else {
                        try {
                          const urlObj = new URL(url);
                          filename = decodeURIComponent(urlObj.pathname.split('/').pop() || filename);
                        } catch (e) {
                          console.warn('Failed to derive filename from proof URL', e);
                        }
                      }

                      const blobUrl = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = blobUrl;
                      a.download = filename;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      URL.revokeObjectURL(blobUrl);
                    } catch (err) {
                      window.open(url, '_blank');
                    }
                  };

                  if (isPdf) {
                    return (
                      <button className="text-primary underline" onClick={() => downloadProof(proofUrl)}>
                        Buka PDF bukti pembayaran
                      </button>
                    );
                  }
                  if (isImage) {
                    return (
                      <div className="w-full h-96 flex items-center justify-center bg-muted/10 rounded-md p-4">
                        <img src={proofUrl} alt="Bukti pembayaran" className="max-h-full object-contain" />
                      </div>
                    );
                  }
                  // Fallback: provide a download/open link
                  return (
                    <button className="text-primary underline" onClick={() => downloadProof(proofUrl)}>
                      Buka/Unduh bukti pembayaran
                    </button>
                  );
                })()
              ) : (
                <p className="text-muted-foreground">Tidak ada bukti pembayaran</p>
              )}

              {/* Show helpful note only when no timer is scheduled (the timer is displayed in the header) */}
              {proofUrl && !proofExpiresAt && (
                <p className="text-sm text-muted-foreground mt-2">Jadwal penghapusan belum diatur. Penghapusan akan dihitung saat pesanan ditandai sebagai Diambil.</p>
              )}
            </div>

            <DialogFooter>
              <div className="flex gap-2">
                {proofUrl && (
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        // reuse the download helper logic - fetch blob and download
                        const res = await fetch(proofUrl);
                        if (!res.ok) throw new Error('Network response was not ok');
                        const blob = await res.blob();
                        const contentDisposition = res.headers.get('content-disposition');
                        let filename = 'bukti';
                        if (contentDisposition) {
                          const match = /filename\*=UTF-8''(.+)|filename="?([^";]+)"?/.exec(contentDisposition);
                          if (match) filename = decodeURIComponent(match[1] || match[2]);
                        } else {
                          try {
                            const urlObj = new URL(proofUrl);
                            filename = decodeURIComponent(urlObj.pathname.split('/').pop() || filename);
                          } catch (e) {
                            console.warn('Failed to derive filename from proof URL', e);
                          }
                        }

                        const blobUrl = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = blobUrl;
                        a.download = filename;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        URL.revokeObjectURL(blobUrl);
                      } catch (err) {
                        window.open(proofUrl, '_blank');
                      }
                    }}
                  >
                    Unduh
                  </Button>
                )}
                <Button variant="destructive" onClick={confirmDeletePaymentProof} disabled={proofDeleting}>{proofDeleting ? 'Menghapus...' : 'Hapus bukti'}</Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
          <StaggerContainer className="mb-8 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
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

              {/* Diambil */}
              <StaggerItem>
                <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ duration: 0.2 }}>
                  <Card className="p-6 border-border/50 shadow-smooth bg-gradient-to-br from-indigo-500/10 to-indigo-500/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Diambil</p>
                        <motion.p
                          key={orders.filter((o) => o.status === "delivered").length}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-3xl font-bold text-indigo-600"
                        >
                          {orders.filter((o) => o.status === "delivered").length}
                        </motion.p>
                      </div>
                      <div className="rounded-xl bg-indigo-500/10 p-3">
                        <Home className="h-6 w-6 text-indigo-600" />
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
                      <TableHead>Bukti Bayar</TableHead>
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
                        <TableCell colSpan={9} className="text-center py-12">
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
                        <TableCell colSpan={9} className="text-center py-12">
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

                              {/* Deleted file indicator */}
                              {order.file_deleted || !order.file_url ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <motion.span whileHover={{ scale: 1.05 }} className="text-muted-foreground">
                                      <XCircle className="h-4 w-4" />
                                    </motion.span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">File sudah dihapus</TooltipContent>
                                </Tooltip>
                              ) : (
                                // Active file with download and expiry countdown hover
                                <DownloadWithCountdown fileUrl={order.file_url} expiresAt={order.file_expires_at} />
                              )}
                            </div>
                          </TableCell>

                          {/* Payment Proof Column */}
                          <TableCell className="max-w-[150px]">
                            <div className="flex items-center gap-2">
                              {order.payment_proof_deleted || !order.payment_proof_url ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <motion.span whileHover={{ scale: 1.05 }} className="text-muted-foreground">
                                      <XCircle className="h-4 w-4" />
                                    </motion.span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">Bukti pembayaran tidak tersedia</TooltipContent>
                                </Tooltip>
                              ) : (
                                // Show button to open modal preview
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button size="sm" variant="outline" className="rounded-lg" onClick={() => openProofModal(order)}>
                                        <FileText className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      <ProofTooltipContent expiresAt={order.payment_proof_expires_at} />
                                    </TooltipContent>
                                  </Tooltip>
                                </motion.div>
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
                              {order.status === "pending" && (
                                <>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                          size="sm"
                                          className="rounded-lg"
                                          onClick={() => handleStatusUpdate(order.id, order.status)}
                                        >
                                          Cetak
                                        </Button>
                                      </motion.div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">Mulai cetak (tandai sebagai sedang dicetak)</TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="rounded-lg hover:!bg-destructive/90 hover:!text-destructive-foreground focus-visible:!ring-destructive"
                                          onClick={() => requestCancelOrder(order.id)}
                                        >
                                          <XCircle className="h-4 w-4" />
                                        </Button>
                                      </motion.div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">Batalkan pesanan</TooltipContent>
                                  </Tooltip>
                                </>
                              )}

                              {order.status === "printing" && (
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button
                                    size="sm"
                                    className="rounded-lg"
                                    onClick={() => handleStatusUpdate(order.id, order.status)}
                                  >
                                    Selesai
                                  </Button>
                                </motion.div>
                              )}

                              {order.status === "completed" && (
                                <>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                          size="sm"
                                          className="rounded-lg"
                                          onClick={async () => {
                                            const ok = await updateOrderStatus(order.id, 'delivered');
                                            if (ok) {
                                              toast({ title: 'Diambil', description: 'Pesanan ditandai sebagai diambil' });
                                            } else {
                                              toast({ title: 'Gagal', description: 'Tidak dapat menandai sebagai diambil', variant: 'destructive' });
                                            }
                                          }}
                                        >
                                          Diambil
                                        </Button>
                                      </motion.div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">Tandai pesanan sudah diambil</TooltipContent>
                                  </Tooltip>
                                </>
                              )}

                              {/* Allow admins to delete uploaded file immediately for completed orders */}
                              {(order.status === "completed" || order.status === "delivered" || order.status === "cancelled") && (order.file_url || order.file_path) && !order.file_deleted && (
                                <>
                                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="rounded-lg hover:!bg-destructive/90 hover:!text-destructive-foreground focus-visible:!ring-destructive"
                                          onClick={() => requestDeleteFile(order.id)}
                                        >
                                          <Trash className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">Hapus file</TooltipContent>
                                    </Tooltip>

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
