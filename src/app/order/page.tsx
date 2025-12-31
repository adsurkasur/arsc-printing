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
import { Upload, FileText, CheckCircle, Loader2 } from "lucide-react";

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
  const [formData, setFormData] = useState({
    customerName: "",
    contact: "",
    colorMode: "bw" as "bw" | "color",
    copies: 1,
    paperSize: "A4" as "A4" | "A3",
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
        color_mode: formData.colorMode,
        copies: formData.copies,
        paper_size: formData.paperSize,
      }, fileUrl || undefined);

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

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            Buat Pesanan Baru
          </h1>
          <p className="mt-2 text-muted-foreground">
            Ikuti langkah-langkah di bawah untuk memesan cetak dokumen
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex justify-center gap-2">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`h-2 w-16 rounded-full transition-colors ${
                step >= num ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: File Upload */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                1
              </div>
              <h2 className="text-xl font-semibold">Upload Dokumen</h2>
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
              <label
                htmlFor="file-upload"
                className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 transition-colors hover:bg-muted/50 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {uploading ? (
                  <div className="text-center">
                    <Loader2 className="mx-auto mb-4 h-12 w-12 text-primary animate-spin" />
                    <p className="text-lg font-medium text-foreground">
                      Mengupload file...
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Mohon tunggu sebentar
                    </p>
                  </div>
                ) : fileName ? (
                  <div className="text-center">
                    <FileText className="mx-auto mb-4 h-12 w-12 text-green-500" />
                    <p className="text-lg font-medium text-foreground">
                      {fileName}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {fileUrl ? '✓ Upload berhasil - Klik untuk mengganti' : 'Klik untuk mengganti file'}
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-lg font-medium text-foreground">
                      Pilih File
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      atau seret dan lepas file di sini
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      PDF, DOC, DOCX (Max 10MB)
                    </p>
                  </div>
                )}
              </label>
            </div>
          </Card>

          {/* Step 2: Print Settings */}
          {step >= 2 && (
            <Card className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                  2
                </div>
                <h2 className="text-xl font-semibold">Pengaturan Cetak</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Mode Warna</Label>
                  <RadioGroup
                    value={formData.colorMode}
                    onValueChange={(value: "bw" | "color") =>
                      setFormData({ ...formData, colorMode: value })
                    }
                    className="mt-3 grid grid-cols-2 gap-4"
                  >
                    <label
                      className={`flex cursor-pointer items-center justify-center rounded-lg border-2 p-4 transition-all ${
                        formData.colorMode === "bw"
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <RadioGroupItem value="bw" id="bw" className="sr-only" />
                      <span className="font-medium">Hitam Putih</span>
                    </label>
                    <label
                      className={`flex cursor-pointer items-center justify-center rounded-lg border-2 p-4 transition-all ${
                        formData.colorMode === "color"
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <RadioGroupItem value="color" id="color" className="sr-only" />
                      <span className="font-medium">Berwarna</span>
                    </label>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="copies" className="text-base font-medium">
                    Jumlah Salinan
                  </Label>
                  <Input
                    id="copies"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.copies}
                    onChange={(e) =>
                      setFormData({ ...formData, copies: parseInt(e.target.value) })
                    }
                    className="mt-2 h-12"
                  />
                </div>

                <div>
                  <Label className="text-base font-medium">Ukuran Kertas</Label>
                  <RadioGroup
                    value={formData.paperSize}
                    onValueChange={(value: "A4" | "A3") =>
                      setFormData({ ...formData, paperSize: value })
                    }
                    className="mt-3 grid grid-cols-2 gap-4"
                  >
                    <label
                      className={`flex cursor-pointer items-center justify-center rounded-lg border-2 p-4 transition-all ${
                        formData.paperSize === "A4"
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <RadioGroupItem value="A4" id="A4" className="sr-only" />
                      <span className="font-medium">A4</span>
                    </label>
                    <label
                      className={`flex cursor-pointer items-center justify-center rounded-lg border-2 p-4 transition-all ${
                        formData.paperSize === "A3"
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <RadioGroupItem value="A3" id="A3" className="sr-only" />
                      <span className="font-medium">A3</span>
                    </label>
                  </RadioGroup>
                </div>

                <Button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-full h-12 text-base"
                >
                  Lanjut ke Informasi Kontak
                </Button>
              </div>
            </Card>
          )}

          {/* Step 3: User Info */}
          {step >= 3 && (
            <Card className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                  3
                </div>
                <h2 className="text-xl font-semibold">Informasi Kontak</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-base font-medium">
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
                    className="mt-2 h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="contact" className="text-base font-medium">
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
                    className="mt-2 h-12"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Submit Button */}
          {step >= 3 && (
            <Button
              type="submit"
              size="lg"
              disabled={submitting || !fileName}
              className="fixed bottom-0 left-0 right-0 z-50 h-16 w-full rounded-none text-lg font-semibold shadow-2xl md:relative md:rounded-lg"
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
          )}
        </form>

        {/* Spacer for mobile sticky button */}
        {step >= 3 && <div className="h-20 md:hidden" />}
      </div>
    </div>
  );
}
