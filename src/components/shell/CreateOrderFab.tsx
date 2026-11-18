'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileTextDuotone } from '@/components/icons';
import { COPY_UI } from '@/lib/copy';
import { getM3LayerVars, M3StateLayer } from '@/components/m3';

export function CreateOrderFab() {
  const pathname = usePathname();
  if (pathname === '/order' || pathname?.startsWith('/admin')) return null;

  return (
    <Link
      href="/order"
      style={getM3LayerVars('primaryContainer')}
      className="m3-control fixed z-[45] !left-auto !right-4 md:!right-8 bottom-[calc(96px+env(safe-area-inset-bottom))] md:bottom-6 h-14 w-fit px-5 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] shadow-elevation-3 hover:shadow-elevation-4 inline-flex items-center gap-space3 text-labelLarge-emphasized"
    >
      <M3StateLayer />
      <FileTextDuotone className="w-6 h-6" aria-hidden="true" />
      <span>{COPY_UI.orderCta}</span>
    </Link>
  );
}
