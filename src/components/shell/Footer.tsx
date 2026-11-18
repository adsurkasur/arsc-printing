import { COPY_UI } from '@/lib/copy';

export function Footer() {
  return (
    <footer className="w-full bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] border-t border-[var(--md-sys-color-outline-variant)]/40 py-space8">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-space6 text-bodyMedium">
        <div>
          <p className="text-titleMedium-emphasized text-[var(--md-sys-color-on-surface)]">
            {COPY_UI.brandName}
          </p>
          <p className="text-bodySmall mt-space1">
            Agritech Research and Study Club · Fakultas Teknologi Agroindustri dan Biosistem (FTAB), Universitas Brawijaya
          </p>
        </div>

        <div>
          <p className="text-labelLarge-emphasized text-[var(--md-sys-color-on-surface)]">Lokasi</p>
          <p className="text-bodySmall mt-space1">Sekretariat ARSC Gedung F FTAB UB</p>
        </div>

        <div>
          <p className="text-labelLarge-emphasized text-[var(--md-sys-color-on-surface)]">Tarif cetak</p>
          <p className="text-bodySmall font-code mt-space1">Hitam putih Rp 500/hal · Warna Rp 750/hal</p>
        </div>
      </div>
    </footer>
  );
}
