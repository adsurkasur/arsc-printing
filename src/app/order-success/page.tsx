"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Home, Search, Copy, Check, Sparkles, PartyPopper, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, PageTransition, FadeInUp, ScaleIn, StaggerContainer, StaggerItem } from "@/components/animations";

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

export default function OrderSuccess() {
  const router = useRouter();
  const { toast } = useToast();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const id = sessionStorage.getItem('lastOrderId');
    if (id) {
      setOrderId(id);
    }
    
    // Hide confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

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

  const downloadReceipt = async () => {
    if (!orderId) return;
    setDownloading(true);
    try {
      const res = await fetch(`/api/orders?id=${orderId}`);
      if (!res.ok) throw new Error('Gagal mengambil data pesanan');
      const data = await res.json();

      const receipt = `ARSC Printing - Bukti Pesanan\n\nID: ${data.id}\nNama: ${data.customer_name}\nKontak: ${data.contact}\nFile: ${data.file_name}\nMode: ${data.color_mode === 'bw' ? 'B/W' : 'Warna'}\nSalinan: ${data.copies}\nUkuran: ${data.paper_size}\nStatus: ${data.status}\nWaktu: ${data.created_at}\n\nTerima kasih telah menggunakan ARSC Printing.`;

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
      <div className="min-h-full bg-gradient-to-b from-transparent via-green-50/20 to-transparent py-16 px-4 flex items-center justify-center relative overflow-hidden">
        {/* Confetti animation */}
        {showConfetti && (
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

        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.1 }}
            transition={{ duration: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-md w-full relative z-10">
          {/* Success Icon */}
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
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mb-6 text-muted-foreground"
              >
                Pesanan Anda telah diterima dan sedang diproses. Simpan ID pesanan di bawah untuk melacak status.
              </motion.p>

              {orderId && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mb-8 rounded-2xl bg-gradient-to-r from-muted to-muted/50 p-6 border border-border/50"
                >
                  <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-medium">
                    ID Pesanan Anda
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <code className="text-xl font-mono font-bold bg-background px-4 py-2 rounded-xl break-all">
                      {orderId}
                    </code>
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
                  </div>
                </motion.div>
              )}

              <StaggerContainer className="space-y-3">
                <StaggerItem>
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
        </div>
      </div>
    </PageTransition>
  );
}
