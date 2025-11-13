import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { QueueWidget } from "@/components/QueueWidget";
import { CheckCircle, Clock, Shield, Zap } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-secondary pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGg4djJoLTh6bTAtOGg4djJoLTh6bTAgMTZoOHYyaC04em0xNiAwaDh2MmgtOHptLTE2IDhoOHYyaC04em0xNiAwaDh2MmgtOHptLTE2LTI0aDh2MmgtOHptMTYgMGg4djJoLTh6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-extrabold leading-tight text-white md:text-5xl lg:text-6xl">
              Cetak Dokumen Tanpa Antre.
              <br />
              <span className="text-secondary">Efisien. Cepat.</span>
            </h1>
            <p className="mb-8 text-lg text-white/90 md:text-xl">
              Layanan cetak resmi organisasi kampus Anda. Upload dokumen dari mana saja,
              pantau status real-time, dan ambil hasil cetak kapan siap.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/order")}
              className="h-14 w-full max-w-md text-lg font-semibold shadow-2xl hover:shadow-xl transition-all duration-300 bg-white text-primary hover:bg-white/90 sm:w-auto"
            >
              Pesan Sekarang
            </Button>
          </div>
        </div>
      </section>

      {/* Queue Status Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-md">
            <QueueWidget />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground md:text-4xl">
            Kenapa Pilih ARSC Printing?
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Proses Cepat
              </h3>
              <p className="text-sm text-muted-foreground">
                Upload dan pesan dalam hitungan detik
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
                <Clock className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Real-Time Status
              </h3>
              <p className="text-sm text-muted-foreground">
                Pantau antrian dan estimasi waktu secara langsung
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Aman & Terpercaya
              </h3>
              <p className="text-sm text-muted-foreground">
                Layanan resmi organisasi kampus
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
                <CheckCircle className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Kualitas Terjamin
              </h3>
              <p className="text-sm text-muted-foreground">
                Hasil cetak berkualitas tinggi
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Siap Untuk Mencetak?
          </h2>
          <p className="mb-8 text-lg text-white/90">
            Mulai pesan dokumen Anda sekarang dan hemat waktu berharga Anda
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/order")}
            className="h-14 w-full max-w-md text-lg font-semibold bg-white text-primary hover:bg-white/90 sm:w-auto"
          >
            Mulai Pesan
          </Button>
        </div>
      </section>
    </div>
  );
}
