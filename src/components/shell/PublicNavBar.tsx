'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HouseDuotone,
  FileTextDuotone,
  MagnifyingGlassDuotone,
  ClockDuotone,
} from '@/components/icons';
import { COPY_UI } from '@/lib/copy';

const DESTINATIONS = [
  { href: '/', label: COPY_UI.navHome, icon: HouseDuotone },
  { href: '/order', label: COPY_UI.navOrder, icon: FileTextDuotone },
  { href: '/track', label: COPY_UI.navTrack, icon: MagnifyingGlassDuotone },
  { href: '/queue', label: COPY_UI.navQueue, icon: ClockDuotone },
] as const;

export function PublicNavBar() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  return (
    <nav
      aria-label="Navigasi bawah"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 h-[calc(80px+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] bg-[var(--md-sys-color-surface-container)] border-t border-[var(--md-sys-color-outline-variant)]/40 flex items-center justify-around px-2"
    >
      {DESTINATIONS.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className="flex-1 min-w-[80px] min-h-[48px] flex flex-col items-center justify-center gap-1"
          >
            <span
              className={`w-16 h-8 rounded-full flex items-center justify-center transition-colors ${
                active
                  ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
                  : 'text-[var(--md-sys-color-on-surface-variant)]'
              }`}
            >
              <Icon className="w-6 h-6" aria-hidden="true" />
            </span>
            <span
              className={
                active
                  ? 'text-labelMedium-emphasized text-[var(--md-sys-color-on-surface)]'
                  : 'text-labelMedium text-[var(--md-sys-color-on-surface-variant)]'
              }
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
