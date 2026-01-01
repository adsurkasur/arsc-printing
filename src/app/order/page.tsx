"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useOrders } from "@/contexts/OrderContext";
import { Upload, FileText, CheckCircle, Loader2, ArrowRight, ArrowLeft, Palette, Copy, User } from "lucide-react";
import { motion, PageTransition, FadeInUp } from "@/components/animations";
import { AnimatePresence } from "framer-motion";

export default function Order() {
  const router = useRouter();
  const { toast } = useToast();
  const { addOrder } = useOrders();

  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    customerName: "",
    contact: "",
    colorMode: "bw" as "bw" | "color",
    copies: 1,
    paperSize: "A4" as const,
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    
    if (!allowedTypes.includes(selectedFile.type)) {
      toast({
        title: "Format tidak didukung",
        description: "Hanya file PDF, DOC, dan DOCX yang diizinkan",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB max)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "File terlalu besar",
        description: "Ukuran maksimum file adalah 10MB",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
    setUploading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('file', selectedFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataObj,
      });

      if (!response.ok) {
        // Demo mode - just proceed without actual upload
        console.log('Upload API not available, using demo mode');
        setFileUrl(null);
        setStep(2);
        toast({
          title: "File dipilih (Demo Mode)",
          description: "Upload file akan berfungsi setelah Supabase dikonfigurasi",
        });
        return;
      }

      const data = await response.json();
      setFileUrl(data.fileUrl);
      setFilePath(data.filePath || null);
      setStep(2);
      
      toast({
        title: "File berhasil diupload",
        description: "Lanjutkan ke pengaturan cetak",
      });
    } catch (error) {
      console.error('Upload error:', error);
      // Demo mode fallback
      setFileUrl(null);
      setStep(2);
      toast({
        title: "File dipilih (Demo Mode)",
        description: "Upload file akan berfungsi setelah Supabase dikonfigurasi",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fileName) {
      toast({
        title: "Error",
        description: "Silakan upload file terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    if (!formData.customerName || !formData.contact) {
      toast({
        title: "Error",
        description: "Silakan lengkapi informasi kontak",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const order = await addOrder({
        customer_name: formData.customerName,
        contact: formData.contact,
        file_name: fileName,
        file_url: fileUrl,
        file_path: filePath || undefined,
        color_mode: formData.colorMode,
        copies: formData.copies,
        paper_size: formData.paperSize,
      }, fileUrl || undefined, filePath || undefined);

      if (order) {
        toast({
          title: "Pesanan Berhasil!",
          description: "Pesanan Anda telah diterima dan akan segera diproses",
        });

        // Store order ID for success page
        sessionStorage.setItem('lastOrderId', order.id);

        router.push("/order-success");
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal membuat pesanan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const stepInfo = [
    { num: 1, title: "Upload", icon: Upload },
    { num: 2, title: "Pengaturan", icon: Palette },
    { num: 3, title: "Kontak", icon: User },
  ];

  return (
    <PageTransition>
      <div className="min-h-full py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Header */}
          <FadeInUp className="mb-10 text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Pesan Cetak
            </span>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl tracking-tight">
              Buat Pesanan Baru
            </h1>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">
              Ikuti langkah-langkah di bawah untuk memesan cetak dokumen
            </p>
          </FadeInUp>

          {/* Progress Steps */}
          <FadeInUp delay={0.1} className="mb-10">
            <div className="flex justify-center items-center gap-2">
              {stepInfo.map((s, i) => (
                <div key={s.num} className="flex items-center">
                  <motion.div
                    animate={{
                      scale: step === s.num ? 1.1 : 1,
                      backgroundColor: step >= s.num ? "hsl(var(--primary))" : "hsl(var(--muted))"
                    }}
                    className="relative flex items-center gap-2 px-4 py-2 rounded-full transition-colors"
                  >
                    <s.icon className={`h-4 w-4 ${step >= s.num ? "text-primary-foreground" : "text-muted-foreground"}`} />
                    <span className={`text-sm font-medium hidden sm:block ${step >= s.num ? "text-primary-foreground" : "text-muted-foreground"}`}>
                      {s.title}
                    </span>
                    {step > s.num && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-success flex items-center justify-center"
                      >
                        <CheckCircle className="h-3 w-3 text-white" />
                      </motion.div>
                    )}
                  </motion.div>
                  {i < stepInfo.length - 1 && (
                    <div className={`w-8 h-0.5 mx-1 rounded-full transition-colors ${step > s.num ? "bg-primary" : "bg-muted"}`} />
                  )}
                </div>
              ))}
            </div>
          </FadeInUp>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {/* Step 1: File Upload */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-8 shadow-smooth border-border/50">
                    <div className="mb-6 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg">
                        <Upload className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">Upload Dokumen</h2>
                        <p className="text-sm text-muted-foreground">Pilih file yang ingin dicetak</p>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <input
                        type="file"
                        id="file-upload"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={uploading}
                      />
                      <motion.label
                        htmlFor="file-upload"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`flex min-h-[250px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all ${
                          fileName 
                            ? "border-success bg-success/5" 
                            : "border-border hover:border-primary/50 bg-muted/30 hover:bg-muted/50"
                        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {uploading ? (
                          <div className="text-center">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Loader2 className="mx-auto mb-4 h-16 w-16 text-primary" />
                            </motion.div>
                            <p className="text-lg font-medium text-foreground">
                              Mengupload file...
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                              Mohon tunggu sebentar
                            </p>
                          </div>
                        ) : fileName ? (
                          <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center"
                          >
                            <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-success/10 flex items-center justify-center">
                              <FileText className="h-8 w-8 text-success" />
                            </div>
                            <p className="text-lg font-medium text-foreground">
                              {fileName}
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                              ✓ File siap - Klik untuk mengganti
                            </p>
                          </motion.div>
                        ) : (
                          <div className="text-center">
                            <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
                              <Upload className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <p className="text-lg font-medium text-foreground">
                              Pilih atau seret file
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                              PDF, DOCX, dan lain-lain... (Maks 10MB)
                            </p>
                          </div>
                        )}
                      </motion.label>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Step 2: Print Settings */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-8 shadow-smooth border-border/50">
                    <div className="mb-6 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg">
                        <Palette className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">Pengaturan Cetak</h2>
                        <p className="text-sm text-muted-foreground">Atur preferensi cetakan Anda</p>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div>
                        <Label className="text-base font-medium mb-4 block">Mode Warna</Label>
                        <RadioGroup
                          value={formData.colorMode}
                          onValueChange={(value: "bw" | "color") =>
                            setFormData({ ...formData, colorMode: value })
                          }
                          className="grid grid-cols-2 gap-4"
                        >
                          {[
                            { value: "bw", label: "Hitam Putih", desc: "Lebih ekonomis" },
                            { value: "color", label: "Berwarna", desc: "Full color" }
                          ].map((option) => (
                            <motion.label
                              key={option.value}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 p-6 transition-all ${
                                formData.colorMode === option.value
                                  ? "border-primary bg-primary/5 shadow-lg"
                                  : "border-border hover:border-primary/30"
                              }`}
                            >
                              <RadioGroupItem value={option.value} className="sr-only" />
                              <span className="font-semibold text-foreground">{option.label}</span>
                              <span className="text-xs text-muted-foreground mt-1">{option.desc}</span>
                              {formData.colorMode === option.value && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-lg"
                                >
                                  <CheckCircle className="h-4 w-4 text-white" />
                                </motion.div>
                              )}
                            </motion.label>
                          ))}
                        </RadioGroup>
                      </div>

                      <div>
                        <Label htmlFor="copies" className="text-base font-medium mb-4 block">
                          Jumlah Salinan
                        </Label>
                        <div className="flex items-center gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-12 w-12 rounded-xl"
                            onClick={() => setFormData({ ...formData, copies: Math.max(1, formData.copies - 1) })}
                          >
                            -
                          </Button>
                          <Input
                            id="copies"
                            type="number"
                            min="1"
                            max="20"
                            value={formData.copies}
                            onChange={(e) =>
                              setFormData({ ...formData, copies: Math.max(1, parseInt(e.target.value) || 1) })
                            }
                            className="h-12 text-center text-lg font-semibold flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-12 w-12 rounded-xl"
                            onClick={() => setFormData({ ...formData, copies: Math.min(20, formData.copies + 1) })}
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-base font-medium mb-4 block">Ukuran Kertas</Label>
                        <div className="flex items-center justify-center rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
                          <span className="font-semibold text-primary">A4</span>
                          <span className="ml-2 text-sm text-muted-foreground">(21 × 29.7 cm)</span>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStep(1)}
                          className="h-12 px-6"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Kembali
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setStep(3)}
                          className="flex-1 h-12"
                        >
                          Lanjut
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Step 3: User Info */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-8 shadow-smooth border-border/50">
                    <div className="mb-6 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg">
                        <User className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">Informasi Kontak</h2>
                        <p className="text-sm text-muted-foreground">Data untuk notifikasi pesanan</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="name" className="text-base font-medium mb-2 block">
                          Nama Lengkap
                        </Label>
                        <Input
                          id="name"
                          required
                          placeholder="Masukkan nama lengkap"
                          value={formData.customerName}
                          onChange={(e) =>
                            setFormData({ ...formData, customerName: e.target.value })
                          }
                          className="h-12 rounded-xl"
                        />
                      </div>

                      <div>
                        <Label htmlFor="contact" className="text-base font-medium mb-2 block">
                          WhatsApp / Email
                        </Label>
                        <Input
                          id="contact"
                          required
                          placeholder="081234567890 atau email@example.com"
                          value={formData.contact}
                          onChange={(e) =>
                            setFormData({ ...formData, contact: e.target.value })
                          }
                          className="h-12 rounded-xl"
                        />
                      </div>

                      {/* Order Summary */}
                      <div className="p-4 rounded-xl bg-muted/50 border border-border">
                        <h3 className="font-medium mb-3">Ringkasan Pesanan</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">File</span>
                            <span className="font-medium">{fileName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Mode</span>
                            <span className="font-medium">{formData.colorMode === "bw" ? "Hitam Putih" : "Berwarna"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Salinan</span>
                            <span className="font-medium">{formData.copies}x</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Ukuran</span>
                            <span className="font-medium">A4</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStep(2)}
                          className="h-12 px-6"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Kembali
                        </Button>
                        <Button
                          type="submit"
                          disabled={submitting || !fileName || !formData.customerName || !formData.contact}
                          className="flex-1 h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Memproses...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-5 w-5" />
                              Selesaikan Pesanan
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}
