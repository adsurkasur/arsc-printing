"use client";

import { useEffect, useState } from "react";
import type { Order } from "@/types/order";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Home, Search, Copy, Check, Sparkles, PartyPopper, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, PageTransition, FadeInUp, ScaleIn, StaggerContainer, StaggerItem } from "@/components/animations";

type Props = {
  initialOrderId?: string | null;
};

// Confetti particle component
function ConfettiParticle({ delay, x }: { delay: number; x: number }) {
  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  return (
    <motion.div
      initial={{ y: -20, x, opacity: 1, rotate: 0 }}
      animate={{
        y: 400,
        x: x + (Math.random() - 0.5) * 100,
        opacity: 0,
        rotate: Math.random() * 360,
      }}
      transition={{
        duration: 3,
        delay,
        ease: "easeOut",
      }}
      className="absolute top-0 w-2 h-2 rounded-sm"
      style={{ backgroundColor: color, left: `${x}%` }}
    />
  );
}

import NoOrderFound from "@/components/NoOrderFound";

export default function OrderSuccessClient({ initialOrderId }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [orderId, setOrderId] = useState<string | null>(initialOrderId || null);
  // Copy feature disabled for now (kept for future re-enable)
  // const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const [downloading, setDownloading] = useState(false);
  // Used to avoid rendering the lookup input until we've checked sessionStorage
  const [checkedSession, setCheckedSession] = useState(false);

  useEffect(() => {
    // Check sessionStorage (do this once on mount) and hydrate orderId if available
    try {
      const id = sessionStorage.getItem('lastOrderId');
      if (!orderId && id) setOrderId(id);
    } catch (e) {
      // ignore (e.g., in sandboxed environments where sessionStorage is not available)
    }

    // Hide confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 4000);

    setCheckedSession(true);

    return () => clearTimeout(timer);
  }, [orderId]);

  /* Copy feature disabled for now (kept for future re-enable)
  const copyOrderId = async () => {
    if (orderId) {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      toast({
        title: "ID Pesanan disalin",
        description: "Gunakan ID ini untuk melacak pesanan Anda",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };
  */

  const [orderData, setOrderData] = useState<Order | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [lookupId, setLookupId] = useState('');
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Fetch order details when orderId is set
  useEffect(() => {
    const load = async () => {
      if (!orderId) {
        setOrderData(null);
        return;
      }
      setLoadingOrder(true);
      setLookupError(null);
      try {
        const res = await fetch(`/api/orders?id=${orderId}`);
        if (!res.ok) throw new Error('Order not found');
        const data = await res.json();
        setOrderData(data);
      } catch (err: unknown) {
        setOrderData(null);
        setLookupError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoadingOrder(false);
      }
    };
    load();
  }, [orderId]);

  const downloadReceipt = async () => {
    if (!orderId) return;
    setDownloading(true);
    try {
      // Prefer using fetched order data if available to avoid refetch
      let data = orderData;
      if (!data) {
        const res = await fetch(`/api/orders?id=${orderId}`);
        if (!res.ok) throw new Error('Gagal mengambil data pesanan');
        data = await res.json();
      }

      const receipt = `ARSC Printing - Bukti Pesanan\n\nID: ${data.id}\nNama: ${data.customer_name}\nKontak: ${data.contact}\nFile: ${data.file_name}\nMode: ${data.color_mode === 'bw' ? 'B/W' : 'Warna'}\nSalinan: ${data.copies}\nHalaman per Salinan: ${data.pages ?? 1}\nTotal Halaman: ${(data.pages ?? 1) * data.copies}\nUkuran: ${data.paper_size}\nStatus: ${data.status}\nWaktu: ${data.created_at}\n\nTerima kasih telah menggunakan ARSC Printing.`;

      const blob = new Blob([receipt], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `arsc-receipt-${data.id}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast({ title: 'Unduhan dimulai', description: 'Bukti pesanan berhasil diunduh.' });
    } catch (err) {
      console.error('Download receipt error:', err);
      toast({ title: 'Gagal', description: 'Tidak dapat mengunduh bukti pesanan', variant: 'destructive' });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-full py-16 px-4 flex items-center justify-center relative overflow-hidden">
        {/* Confetti animation (only when we actually have an orderId) */}
        {orderId && showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <ConfettiParticle
                key={i}
                delay={i * 0.1}
                x={Math.random() * 100}
              />
            ))}
          </div>
        )}

        {/* Background decorative elements (show only when an order exists to avoid seams) */}
        {orderId && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.1 }}
              transition={{ duration: 1 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-3xl"
            />
          </div>
        )}

        <div className="max-w-md w-full relative z-10">
          {!checkedSession ? (
            // subtle loading skeleton while we check sessionStorage
            <div className="rounded-xl p-6">
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
          ) : !orderId ? (
            <NoOrderFound />
          ) : (
            // Success UI — shown only when we have an orderId
            <>
              <FadeInUp className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
                  className="relative inline-block"
                >
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg">
                    <CheckCircle className="h-14 w-14 text-white" />
                  </div>
                  {/* Sparkle decorations */}
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-2 -right-2"
                  >
                    <Sparkles className="h-6 w-6 text-yellow-500" />
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    className="absolute -bottom-1 -left-3"
                  >
                    <PartyPopper className="h-5 w-5 text-purple-500" />
                  </motion.div>
                </motion.div>
              </FadeInUp>

              <ScaleIn delay={0.3}>
                <Card className="p-8 text-center shadow-smooth border-border/50 bg-card/80 backdrop-blur-sm">
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-3 text-3xl font-bold text-foreground tracking-tight"
                  >
                    Pesanan Berhasil! 🎉
                  </motion.h1>
                  
                  {/* Original message (disabled for now):
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mb-6 text-muted-foreground"
                  >
                    Pesanan Anda telah diterima dan sedang diproses. Simpan ID pesanan di bawah untuk melacak status.
                  </motion.p>
                  */}

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mb-6 text-muted-foreground"
                  >
                    Cek status pesanan Anda di Status Antrian.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mb-8 rounded-2xl bg-gradient-to-r from-muted to-muted/50 p-6 border border-border/50"
                  >
                    <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-medium">
                      ID Pesanan Anda
                    </p>

                    {loadingOrder ? (
                      <p className="text-sm text-muted-foreground">Memuat data pesanan…</p>
                    ) : lookupError ? (
                      <p className="text-sm text-destructive">{lookupError}</p>
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <code className="text-xl font-mono font-bold bg-background px-4 py-2 rounded-xl break-all">
                          {orderId}
                        </code>
                        {/* Copy ID UI disabled for now (kept for future re-enable)
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={copyOrderId}
                            className="h-10 w-10 p-0 rounded-xl"
                          >
                            {copied ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </motion.div>
                        */}
                      </div>
                    )}
                  </motion.div>

                  <StaggerContainer className="space-y-3">
                    <StaggerItem>
                      {/* Original 'Lacak Pesanan' button (disabled for now)
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={() => router.push("/track")}
                          className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                          size="lg"
                        >
                          <Search className="mr-2 h-5 w-5" />
                          Lacak Pesanan
                        </Button>
                      </motion.div>
                      */}

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={() => router.push("/queue")}
                          className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                          size="lg"
                        >
                          <Search className="mr-2 h-5 w-5" />
                          Status Antrian
                        </Button>
                      </motion.div>
                    </StaggerItem>

                    {/* Download receipt button */}
                    <StaggerItem>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={downloadReceipt}
                          className="w-full h-12 rounded-xl border-border/50"
                          size="lg"
                          variant="outline"
                          disabled={!orderId || downloading}
                        >
                          <Download className="mr-2 h-5 w-5" />
                          {downloading ? 'Mengunduh...' : 'Unduh Bukti Pesanan'}
                        </Button>
                      </motion.div>
                    </StaggerItem>

                    <StaggerItem>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={() => router.push("/")}
                          variant="outline"
                          className="w-full h-12 rounded-xl border-border/50"
                          size="lg"
                        >
                          <Home className="mr-2 h-5 w-5" />
                          Kembali ke Beranda
                        </Button>
                      </motion.div>
                    </StaggerItem>

                    <StaggerItem>
                      <Button
                        onClick={() => router.push("/order")}
                        variant="outline"
                        className="w-full h-12 rounded-xl border-border/50"
                        size="lg"
                      >
                        Buat Pesanan Baru
                      </Button>
                    </StaggerItem>
                  </StaggerContainer>
                </Card>
              </ScaleIn>
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
