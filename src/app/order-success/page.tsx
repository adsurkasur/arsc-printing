"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Home, Search, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function OrderSuccess() {
  const router = useRouter();
  const { toast } = useToast();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = sessionStorage.getItem('lastOrderId');
    if (id) {
      setOrderId(id);
    }
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

  return (
    <div className="min-h-screen bg-background py-16 px-4 flex items-center justify-center">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        
        <h1 className="mb-3 text-3xl font-bold text-foreground">
          Pesanan Berhasil!
        </h1>
        
        <p className="mb-6 text-muted-foreground">
          Pesanan Anda telah diterima dan sedang diproses. Simpan ID pesanan di bawah untuk melacak status.
        </p>

        {orderId && (
          <div className="mb-6 rounded-lg bg-muted p-4">
            <p className="text-xs text-muted-foreground mb-2">ID Pesanan Anda</p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-lg font-mono font-medium break-all">{orderId}</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyOrderId}
                className="h-8 w-8 p-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={() => router.push("/track")}
            className="w-full h-12"
            size="lg"
          >
            <Search className="mr-2 h-5 w-5" />
            Lacak Pesanan
          </Button>
          
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="w-full h-12"
            size="lg"
          >
            <Home className="mr-2 h-5 w-5" />
            Kembali ke Beranda
          </Button>
          
          <Button
            onClick={() => router.push("/order")}
            variant="ghost"
            className="w-full h-12"
            size="lg"
          >
            Buat Pesanan Baru
          </Button>
        </div>
      </Card>
    </div>
  );
}
