'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  PrinterDuotone,
  CircleHalfDuotone,
  UserCircleDuotone,
} from '@/components/icons';
import { COPY_UI } from '@/lib/copy';
import { M3Pressable } from '@/components/m3';

export function TopAppBar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled((prev) => {
        if (!prev && y > 32) return true;
        if (prev && y < 24) return false;
        return prev;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const navLinks = [
    { href: '/', label: COPY_UI.navHome },
    { href: '/track', label: 'Lacak pesanan' },
    { href: '/queue', label: COPY_UI.navQueue },
  ];

  return (
    <header
      className={`sticky top-0 z-30 w-full transition-[height,background-color,box-shadow] duration-150 ${
        scrolled
          ? 'h-16 bg-[var(--md-sys-color-surface-container)] shadow-elevation-2'
          : 'h-16 md:h-20 bg-[var(--md-sys-color-surface)]'
      }`}
    >
      <div className="max-w-[1200px] mx-auto h-full px-4 md:px-8 flex items-center justify-between gap-space4">
        <Link
          href="/"
          className="flex items-center gap-space3 min-h-[48px] text-[var(--md-sys-color-on-surface)]"
        >
          <span className="w-8 h-8 rounded-s bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0">
            <PrinterDuotone className="w-5 h-5" aria-hidden="true" />
          </span>
          <span className="text-titleMedium-emphasized whitespace-nowrap">{COPY_UI.brandName}</span>
        </Link>

        <nav aria-label="Navigasi utama" className="hidden md:flex items-center gap-space6">
          {navLinks.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`min-h-[48px] flex items-center text-labelLarge border-b-2 transition-colors ${
                  active
                    ? 'text-[var(--md-sys-color-primary)] border-[var(--md-sys-color-primary)] font-bold'
                    : 'text-[var(--md-sys-color-on-surface-variant)] border-transparent hover:text-[var(--md-sys-color-on-surface)]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-space1">
          <M3Pressable
            type="button"
            pair="surface"
            onClick={cycleTheme}
            aria-label="Ubah tema"
            data-testid="shell-theme-toggle"
            className="w-12 h-12 rounded-full flex items-center justify-center"
          >
            <CircleHalfDuotone className="w-6 h-6" aria-hidden="true" />
          </M3Pressable>

          <Link
            href="/admin"
            aria-label="Menu petugas"
            className="w-12 h-12 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-on-surface)]/8"
          >
            <UserCircleDuotone className="w-6 h-6" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}
