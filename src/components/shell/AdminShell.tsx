'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  FileTextDuotone,
  ReceiptDuotone,
  PrinterDuotone,
  ListDuotone,
  SignOutDuotone,
  XCircleDuotone,
} from '@/components/icons';
import { M3Pressable } from '@/components/m3';

const ADMIN_SECTIONS = [
  { href: '#pesanan', label: 'Pesanan', icon: FileTextDuotone },
  { href: '#rekap', label: 'Rekap', icon: ReceiptDuotone },
  { href: '#perangkat', label: 'Perangkat', icon: PrinterDuotone },
] as const;

export interface AdminShellProps {
  children: React.ReactNode;
  onLogout?: () => void;
}

export function AdminShell({ children, onLogout }: AdminShellProps) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col xl:flex-row">
      {/* Desktop Admin Rail >= 1200px */}
      <aside
        aria-label="Navigasi petugas"
        className="hidden xl:flex flex-col items-center justify-between w-[88px] shrink-0 bg-[var(--md-sys-color-surface-container)] border-r border-[var(--md-sys-color-outline-variant)]/40 py-space4"
      >
        <div className="flex flex-col items-center gap-space3 w-full px-2">
          {ADMIN_SECTIONS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                aria-current={idx === 0 ? 'page' : undefined}
                className={`w-16 min-h-[64px] rounded-m flex flex-col items-center justify-center gap-1 text-labelMedium ${
                  idx === 0
                    ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-bold'
                    : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-on-surface)]/8'
                }`}
              >
                <Icon className="w-6 h-6" aria-hidden="true" />
                <span className="text-[11px]">{item.label}</span>
              </a>
            );
          })}
        </div>

        <M3Pressable
          type="button"
          pair="surface"
          onClick={onLogout}
          aria-label="Keluar"
          className="w-16 min-h-[64px] rounded-m flex flex-col items-center justify-center gap-1 text-labelMedium"
        >
          <SignOutDuotone className="w-6 h-6" aria-hidden="true" />
          <span className="text-[11px]">Keluar</span>
        </M3Pressable>
      </aside>

      {/* Mobile / Tablet < 1200px Drawer Trigger */}
      <div className="xl:hidden flex items-center justify-between page-padding py-space2 bg-[var(--md-sys-color-surface-container-low)] border-b border-[var(--md-sys-color-outline-variant)]/40">
        {mounted ? (
          <DialogPrimitive.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DialogPrimitive.Trigger asChild>
            <M3Pressable
              type="button"
              pair="surface"
              data-testid="admin-drawer-trigger"
              aria-label="Buka menu petugas"
              className="min-h-[48px] px-space3 rounded-full flex items-center gap-space2 text-labelLarge"
            >
              <ListDuotone className="w-6 h-6" aria-hidden="true" />
              <span>Menu petugas</span>
            </M3Pressable>
          </DialogPrimitive.Trigger>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="m3-scrim" />
            <DialogPrimitive.Content
              aria-label="Menu petugas"
              className="fixed inset-y-0 left-0 z-[70] w-[min(320px,calc(100vw-32px))] bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)] p-space4 shadow-elevation-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-space4">
                  <DialogPrimitive.Title className="text-titleMedium-emphasized">
                    Menu petugas
                  </DialogPrimitive.Title>
                  <DialogPrimitive.Close asChild>
                    <M3Pressable
                      type="button"
                      pair="surface"
                      aria-label="Tutup menu"
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                    >
                      <XCircleDuotone className="w-6 h-6" aria-hidden="true" />
                    </M3Pressable>
                  </DialogPrimitive.Close>
                </div>
                <nav className="flex flex-col gap-space2">
                  {ADMIN_SECTIONS.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={() => setDrawerOpen(false)}
                        className={`min-h-[48px] px-space4 rounded-full flex items-center gap-space3 text-labelLarge ${
                          idx === 0
                            ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-bold'
                            : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-on-surface)]/8'
                        }`}
                      >
                        <Icon className="w-6 h-6" aria-hidden="true" />
                        <span>{item.label}</span>
                      </a>
                    );
                  })}
                </nav>
              </div>

              <M3Pressable
                type="button"
                pair="surface"
                onClick={() => {
                  setDrawerOpen(false);
                  onLogout?.();
                }}
                className="min-h-[48px] px-space4 rounded-full flex items-center gap-space3 text-labelLarge"
              >
                <SignOutDuotone className="w-6 h-6" aria-hidden="true" />
                <span>Keluar</span>
              </M3Pressable>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
        ) : (
          <M3Pressable
            type="button"
            pair="surface"
            data-testid="admin-drawer-trigger"
            aria-label="Buka menu petugas"
            className="min-h-[48px] px-space3 rounded-full flex items-center gap-space2 text-labelLarge"
          >
            <ListDuotone className="w-6 h-6" aria-hidden="true" />
            <span>Menu petugas</span>
          </M3Pressable>
        )}
      </div>

      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
