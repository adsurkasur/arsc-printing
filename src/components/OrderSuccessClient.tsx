"use client";

import { useEffect, useState } from "react";
import type { Order } from "@/types/order";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Home, Search, Copy, Check, Sparkles, PartyPopper, Download, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, PageTransition, FadeInUp, ScaleIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { formatCurrency } from "@/lib/utils";

// Dynamic imports use libraries that may not be installed in the dev environment.
// We attempt a dynamic import and fall back to loading via CDN; silence TS where necessary.

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

  // Pricing defaults for receipt calculations
  const priceBw = Number(process.env.NEXT_PUBLIC_PRICE_BW ?? '') || 500;
  const priceColor = Number(process.env.NEXT_PUBLIC_PRICE_COLOR ?? '') || 750;

  // Small helpers for generating safe HTML
  const escapeHtml = (str: string) => {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };
  const escapeAttr = (str: string) => {
    return String(str || '').replace(/"/g, '%22');
  };
  const capitalize = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

  // Load external script by URL and wait for global var to appear
  const loadScript = (src: string, globalName?: string) => {
    return new Promise<void>((resolve, reject) => {
      // If global already available, resolve
      if (globalName && (window as unknown as Record<string, unknown>)[globalName]) return resolve();
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('Failed to load script')));
        return;
      }
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load script'));
      document.head.appendChild(s);
    });
  };

  const downloadReceiptPdf = async () => {
    if (!orderId) return;
    setDownloading(true);
    let wrapper: HTMLDivElement | null = null;
    try {
      // Ensure we have the order data
      let data = orderData;
      if (!data) {
        const res = await fetch(`/api/orders?id=${orderId}`);
        if (!res.ok) throw new Error('Gagal mengambil data pesanan');
        data = await res.json();
      }

      // Build the same HTML as the html receipt but in a hidden wrapper
      const createdAt = new Date(data.created_at).toLocaleString();
      const totalPages = (data.pages ?? 1) * data.copies;
      const pricePer = data.color_mode === 'color' ? priceColor : priceBw;
      const totalPrice = pricePer * totalPages;

      const receiptHtml = `
        <div style="box-sizing:border-box;background:#fff;padding:24px;font-family:Inter,Arial,sans-serif;color:#0f172a;width:210mm;height:297mm;display:flex;flex-direction:column;">
          <div style="display:flex;gap:16px;align-items:center;border-bottom:1px solid #f1f5f9;padding-bottom:16px;margin-bottom:16px;">
            <div style="width:48px;height:48px;border-radius:6px;background:#10b981;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700">AR</div>
            <div>
              <div style="font-weight:700;font-size:18px">ARSC Printing — Bukti Pesanan</div>
              <div style="color:#64748b;font-size:13px">ID: ${escapeHtml(data.id)} • ${createdAt}</div>
            </div>
          </div>

          <div style="display:flex;gap:24px;flex-wrap:wrap;margin-bottom:16px">
            <div style="min-width:160px">
              <div style="font-size:12px;color:#64748b;margin-bottom:4px">Nama</div>
              <div style="font-weight:600">${escapeHtml(data.customer_name || '')}</div>
            </div>
            <div style="min-width:160px">
              <div style="font-size:12px;color:#64748b;margin-bottom:4px">Kontak</div>
              <div>${escapeHtml(data.contact || '')}</div>
            </div>
          </div>

          <div style="margin-bottom:12px">
            <table style="width:100%;border-collapse:collapse">
              <thead>
                <tr style="text-align:left;color:#64748b;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:0.02em">
                  <th style="padding:8px">Item</th>
                  <th style="padding:8px">Keterangan</th>
                  <th style="padding:8px">Halaman</th>
                  <th style="padding:8px">Salinan</th>
                  <th style="padding:8px">Harga</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding:8px">Cetak Dokumen</td>
                  <td style="padding:8px">${escapeHtml(data.file_name || '—')}</td>
                  <td style="padding:8px">${data.pages ?? 1}</td>
                  <td style="padding:8px">${data.copies}</td>
                  <td style="padding:8px">${formatCurrency(totalPrice)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" style="text-align:right;padding:12px 8px;font-weight:700">Total</td>
                  <td style="padding:12px 8px;font-weight:700">${formatCurrency(totalPrice)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div style="padding:0 0 12px 0">
            <div style="font-size:13px;color:#64748b;margin-bottom:6px">Catatan</div>
            <div style="margin-bottom:8px">${escapeHtml(data.notes || '')}</div>
          </div>
          <div style="flex:1;display:flex;align-items:center;justify-content:center;padding-top:8px;overflow:hidden;box-sizing:border-box">
            ${data.payment_proof_url ? `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;padding:12px;box-sizing:border-box;overflow:hidden"><div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center"><img src="${escapeAttr(data.payment_proof_url)}" crossorigin="anonymous" style="max-width:100%;max-height:calc(100% - 28px);object-fit:contain;border:1px solid #e6eef6;border-radius:8px;display:block" alt="Bukti Pembayaran"/><div style="font-size:14px;color:#64748b;margin-top:8px">Bukti Pembayaran</div></div></div>` : ''}
          </div>
        </div>
      `;

      // Create offscreen wrapper
      wrapper = document.createElement('div');
      wrapper.style.position = 'fixed';
      wrapper.style.left = '-9999px';
      wrapper.style.top = '0';
      wrapper.style.width = '210mm';
      wrapper.style.height = '297mm';
      wrapper.style.background = '#fff';
      wrapper.innerHTML = receiptHtml;
      document.body.appendChild(wrapper);

      // Try dynamic imports first
      let html2canvas: unknown = null;
      let jsPDF: unknown = null;
      try {
        // @ts-expect-error - optional dependency, may not exist in dev environment
        const html2canvasImp = await import('html2canvas');
        html2canvas = html2canvasImp.default || html2canvasImp;
        // @ts-expect-error - optional dependency
        const jsPDFImp = await import('jspdf');
        jsPDF = jsPDFImp.jsPDF || jsPDFImp.default || jsPDFImp;
      } catch (e) {
        // Try loading from CDN as fallback
        try {
          await loadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js', 'html2canvas');
          await loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js', 'jspdf');
          const win = window as unknown as Record<string, unknown>;
          html2canvas = (win.html2canvas as unknown) as unknown;
          // jspdf UMD exposes window.jspdf.jsPDF
          jsPDF = ((win.jspdf as unknown) && ((win.jspdf as unknown) as Record<string, unknown>)['jsPDF']) as unknown;
        } catch (err) {
          // Unable to load libs; fallback to HTML receipt
          toast({ title: 'PDF tidak tersedia', description: 'Ekspor PDF memerlukan dependensi. Mengunduh HTML sebagai gantinya.' });
          // reuse existing HTML download flow
          const blob = new Blob([`ARSC Printing - Bukti Pesanan\n\nID: ${data.id}\nNama: ${data.customer_name}`], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `arsc-receipt-${data.id}.txt`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
          return;
        }
      }

      // Render wrapper to canvas
      const options = { scale: 2, useCORS: true, backgroundColor: '#ffffff' };
      const html2canvasFn = html2canvas as unknown as (el: HTMLElement, opts?: Record<string, unknown>) => Promise<HTMLCanvasElement>;
      const canvas = await html2canvasFn(wrapper, options);

      // Generate PDF (A4 size, 210 x 297 mm, with 10mm margin)
      const JsPDFCtor = jsPDF as unknown as { new (opts?: Record<string, unknown>): { addImage: (img: string, format: string, x: number, y: number, w: number, h: number) => void; save: (filename?: string) => void } };
      const pdf = new JsPDFCtor({ unit: 'mm', format: 'a4' });
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      // Convert canvas to image
      const imgData = (canvas as HTMLCanvasElement).toDataURL('image/jpeg', 0.95);
      // Calculate dimensions in mm preserving aspect ratio
      const imgWidthPx = (canvas as HTMLCanvasElement).width;
      const imgHeightPx = (canvas as HTMLCanvasElement).height;
      const pxToMm = (px: number) => px * 25.4 / 96; // assuming 96 DPI
      const imgWidthMm = pageWidth - margin * 2;
      const imgHeightMm = (imgHeightPx * imgWidthMm) / imgWidthPx;

      const y = margin;
      pdf.addImage(imgData, 'JPEG', margin, y, imgWidthMm, imgHeightMm);

      // Save PDF
      pdf.save(`arsc-receipt-${data.id}.pdf`);

      toast({ title: 'Unduhan PDF dimulai', description: 'Bukti pesanan berhasil diunduh (PDF).' });
    } catch (err) {
      console.error('Download receipt PDF error:', err);
      toast({ title: 'Gagal', description: 'Tidak dapat mengunduh bukti pesanan sebagai PDF', variant: 'destructive' });
    } finally {
      setDownloading(false);
      if (wrapper && wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
    }
  };

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







  return (
    <PageTransition>
      <div className="min-h-full py-8 sm:py-16 px-4 flex items-center justify-center relative overflow-hidden">
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
              <FadeInUp className="text-center mb-6 sm:mb-8">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
                  className="relative inline-block"
                >
                  <div className="mx-auto flex h-16 w-16 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg">
                    <CheckCircle className="h-10 w-10 sm:h-14 sm:w-14 text-white" />
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
                <Card className="p-5 sm:p-8 text-center shadow-smooth border-border/50 bg-card/80 backdrop-blur-sm">
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-3 text-2xl sm:text-3xl font-bold text-foreground tracking-tight"
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
                    Cek status pesanan Anda di Status Antrean.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mb-6 sm:mb-8 rounded-xl sm:rounded-2xl bg-gradient-to-r from-muted to-muted/50 p-4 sm:p-6 border border-border/50"
                  >
                    <p className="text-xs text-muted-foreground mb-2 sm:mb-3 uppercase tracking-wider font-medium">
                      ID Pesanan Anda
                    </p>

                    {loadingOrder ? (
                      <p className="text-sm text-muted-foreground">Memuat data pesanan…</p>
                    ) : lookupError ? (
                      <p className="text-sm text-destructive">{lookupError}</p>
                    ) : (
                      <div className="flex items-center justify-center gap-2 sm:gap-3">
                        <code className="text-sm sm:text-xl font-mono font-bold bg-background px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl break-all max-w-full overflow-hidden">
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
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={downloadReceiptPdf}
                          className="w-full h-10 sm:h-12 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                          size="lg"
                          disabled={!orderId || downloading}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          {downloading ? 'Mengunduh...' : 'Unduh Bukti Pesanan'}
                        </Button>
                      </motion.div>
                    </StaggerItem>

                    <StaggerItem>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={() => router.push("/queue")}
                          className="w-full h-10 sm:h-12 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                          size="lg"
                        >
                          <Search className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                          Cek Status Antrean
                        </Button>
                      </motion.div>
                    </StaggerItem>

                    <StaggerItem>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={() => router.push("/")}
                          variant="outline"
                          className="w-full h-10 sm:h-12 rounded-xl border-border/50"
                          size="lg"
                        >
                          <Home className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                          Kembali ke Beranda
                        </Button>
                      </motion.div>
                    </StaggerItem>

                    <StaggerItem>
                      <Button
                        onClick={() => router.push("/order")}
                        variant="outline"
                        className="w-full h-10 sm:h-12 rounded-xl border-border/50"
                        size="lg"
                      >
                        <Plus className="mr-2 h-4 w-4" />
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
