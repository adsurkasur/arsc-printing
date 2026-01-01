"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NoOrderFound() {
  const router = useRouter();
  return (
    <div className="rounded-lg border bg-card p-6 text-center">
      <h3 className="text-2xl font-semibold">Tidak ada ID Pesanan</h3>
      <p className="text-sm text-muted-foreground mt-2">Kami tidak menemukan ID pesanan di browser ini. Buat pesanan baru atau gunakan halaman Lacak Pesanan jika Anda memiliki ID.</p>
      <div className="mt-4 flex justify-center gap-3">
        <Button onClick={() => router.push('/order')} className="bg-primary text-white">Buat Pesanan</Button>
        <Button variant="outline" onClick={() => router.push('/track')}>Lacak Pesanan</Button>
      </div>
    </div>
  );
}
