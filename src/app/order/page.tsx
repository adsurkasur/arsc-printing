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
import { Upload, FileText, CheckCircle } from "lucide-react";

export default function Order() {
  const router = useRouter();
  const { toast } = useToast();
  const { addOrder } = useOrders();

  const [step, setStep] = useState(1);
  const [fileName, setFileName] = useState("");
  const [formData, setFormData] = useState({
    customerName: "",
    contact: "",
    colorMode: "bw" as "bw" | "color",
    copies: 1,
    paperSize: "A4" as "A4" | "A3",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setStep(2);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fileName) {
      toast({
        title: "Error",
        description: "Silakan upload file terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    addOrder({
      customerName: formData.customerName,
      contact: formData.contact,
      fileName: fileName,
      colorMode: formData.colorMode,
      copies: formData.copies,
      paperSize: formData.paperSize,
      status: "pending",
    });

    toast({
      title: "Pesanan Berhasil!",
      description: "Pesanan Anda telah diterima dan akan segera diproses",
    });

    setTimeout(() => {
      router.push("/order-success");
    }, 1000);
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
              />
              <label
                htmlFor="file-upload"
                className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 transition-colors hover:bg-muted/50"
              >
                {fileName ? (
                  <div className="text-center">
                    <FileText className="mx-auto mb-4 h-12 w-12 text-success" />
                    <p className="text-lg font-medium text-foreground">
                      {fileName}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Klik untuk mengganti file
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
              className="fixed bottom-0 left-0 right-0 z-50 h-16 w-full rounded-none text-lg font-semibold shadow-2xl md:relative md:rounded-lg"
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              Selesaikan Pesanan
            </Button>
          )}
        </form>

        {/* Spacer for mobile sticky button */}
        {step >= 3 && <div className="h-20 md:hidden" />}
      </div>
    </div>
  );
}
