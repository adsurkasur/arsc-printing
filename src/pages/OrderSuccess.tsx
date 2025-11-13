import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Home, FileText } from "lucide-react";

export default function OrderSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background py-16 px-4 flex items-center justify-center">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
          <CheckCircle className="h-12 w-12 text-success" />
        </div>
        
        <h1 className="mb-3 text-3xl font-bold text-foreground">
          Pesanan Berhasil!
        </h1>
        
        <p className="mb-6 text-muted-foreground">
          Pesanan Anda telah diterima dan sedang diproses. Anda akan dihubungi
          melalui WhatsApp/Email ketika dokumen sudah siap diambil.
        </p>

        <div className="mb-8 rounded-lg bg-muted/30 p-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>Cek status antrian untuk melihat estimasi waktu</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => navigate("/")}
            className="w-full h-12"
            size="lg"
          >
            <Home className="mr-2 h-5 w-5" />
            Kembali ke Beranda
          </Button>
          
          <Button
            onClick={() => navigate("/order")}
            variant="outline"
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
