"use client";

import { useState } from 'react';
import OrderSuccessClient from '@/components/OrderSuccessClient';
import { Button } from '@/components/ui/button';
import { Search, ShieldAlert, FileText } from 'lucide-react';

export default function Track() {
  const [value, setValue] = useState('');
  const [id, setId] = useState('');

  return (
    <div className="container mx-auto px-4 py-8 sm:py-16 max-w-2xl">
      <div className="rounded-lg border border-border bg-card p-6 sm:p-8 shadow-card space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Lacak Status Pesanan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Masukkan ID pesanan yang Anda terima saat mengirim berkas cetak.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setId(value.trim());
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="tracking-id" className="block text-xs font-medium text-foreground mb-1.5">
              ID Pesanan (UUID)
            </label>
            <div className="relative">
              <input
                id="tracking-id"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Contoh: 434ece91-f248-4f43-bd31-baa64c6c44c5"
                className="w-full h-11 pl-10 pr-3 text-sm font-mono rounded-md border border-input bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <Button type="submit" className="w-full sm:w-auto h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            Cari Pesanan
          </Button>
        </form>

        <div className="p-3.5 rounded-md bg-secondary/40 border border-border text-xs text-muted-foreground flex items-start gap-2.5">
          <ShieldAlert className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Keamanan & Privasi:</strong> Untuk menjaga kerahasiaan berkas kampus, hanya perangkat pemesan asli (dengan token otorisasi tersimpan) yang dapat melihat rincian penuh pesanan.
          </p>
        </div>

        {id && (
          <div className="pt-4 border-t border-border">
            <OrderSuccessClient key={id} initialOrderId={id} />
          </div>
        )}
      </div>
    </div>
  );
}
