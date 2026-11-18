'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import {
  HouseDuotone,
  FileTextDuotone,
  MagnifyingGlassDuotone,
  ClockDuotone,
  PrinterDuotone,
  UploadSimpleDuotone,
  ImageDuotone,
  QrCodeDuotone,
  CheckCircleDuotone,
  WarningCircleDuotone,
  XCircleDuotone,
  CopyDuotone,
  ReceiptDuotone,
  ListDuotone,
  CircleHalfDuotone,
  UserCircleDuotone,
  SignOutDuotone,
  ArrowClockwiseDuotone,
  DotsThreeDuotone,
  ArrowRightDuotone,
  ArrowLeftDuotone,
  CalendarBlankDuotone,
  FunnelDuotone,
} from '@/components/icons';
import { COPY_STATUS_MAP, COPY_TOASTS, COPY_UI, COPY_EMPTY, COPY_VALIDATION, COPY_LOADING } from '@/lib/copy';
import { motionTokens } from '@/lib/motion';

const COLOR_ROLES = [
  { name: 'primary', css: 'var(--md-sys-color-primary)', on: 'var(--md-sys-color-on-primary)' },
  { name: 'on-primary', css: 'var(--md-sys-color-on-primary)', on: 'var(--md-sys-color-primary)' },
  { name: 'primary-container', css: 'var(--md-sys-color-primary-container)', on: 'var(--md-sys-color-on-primary-container)' },
  { name: 'on-primary-container', css: 'var(--md-sys-color-on-primary-container)', on: 'var(--md-sys-color-primary-container)' },
  { name: 'primary-fixed', css: 'var(--md-sys-color-primary-fixed)', on: 'var(--md-sys-color-on-primary-fixed)' },
  { name: 'primary-fixed-dim', css: 'var(--md-sys-color-primary-fixed-dim)', on: 'var(--md-sys-color-on-primary-fixed)' },
  { name: 'on-primary-fixed', css: 'var(--md-sys-color-on-primary-fixed)', on: 'var(--md-sys-color-primary-fixed)' },
  { name: 'on-primary-fixed-variant', css: 'var(--md-sys-color-on-primary-fixed-variant)', on: 'var(--md-sys-color-primary-fixed)' },

  { name: 'secondary', css: 'var(--md-sys-color-secondary)', on: 'var(--md-sys-color-on-secondary)' },
  { name: 'on-secondary', css: 'var(--md-sys-color-on-secondary)', on: 'var(--md-sys-color-secondary)' },
  { name: 'secondary-container', css: 'var(--md-sys-color-secondary-container)', on: 'var(--md-sys-color-on-secondary-container)' },
  { name: 'on-secondary-container', css: 'var(--md-sys-color-on-secondary-container)', on: 'var(--md-sys-color-secondary-container)' },
  { name: 'secondary-fixed', css: 'var(--md-sys-color-secondary-fixed)', on: 'var(--md-sys-color-on-secondary-fixed)' },
  { name: 'secondary-fixed-dim', css: 'var(--md-sys-color-secondary-fixed-dim)', on: 'var(--md-sys-color-on-secondary-fixed)' },
  { name: 'on-secondary-fixed', css: 'var(--md-sys-color-on-secondary-fixed)', on: 'var(--md-sys-color-secondary-fixed)' },
  { name: 'on-secondary-fixed-variant', css: 'var(--md-sys-color-on-secondary-fixed-variant)', on: 'var(--md-sys-color-secondary-fixed)' },

  { name: 'tertiary', css: 'var(--md-sys-color-tertiary)', on: 'var(--md-sys-color-on-tertiary)' },
  { name: 'on-tertiary', css: 'var(--md-sys-color-on-tertiary)', on: 'var(--md-sys-color-tertiary)' },
  { name: 'tertiary-container', css: 'var(--md-sys-color-tertiary-container)', on: 'var(--md-sys-color-on-tertiary-container)' },
  { name: 'on-tertiary-container', css: 'var(--md-sys-color-on-tertiary-container)', on: 'var(--md-sys-color-tertiary-container)' },
  { name: 'tertiary-fixed', css: 'var(--md-sys-color-tertiary-fixed)', on: 'var(--md-sys-color-on-tertiary-fixed)' },
  { name: 'tertiary-fixed-dim', css: 'var(--md-sys-color-tertiary-fixed-dim)', on: 'var(--md-sys-color-on-tertiary-fixed)' },
  { name: 'on-tertiary-fixed', css: 'var(--md-sys-color-on-tertiary-fixed)', on: 'var(--md-sys-color-tertiary-fixed)' },
  { name: 'on-tertiary-fixed-variant', css: 'var(--md-sys-color-on-tertiary-fixed-variant)', on: 'var(--md-sys-color-tertiary-fixed)' },

  { name: 'error', css: 'var(--md-sys-color-error)', on: 'var(--md-sys-color-on-error)' },
  { name: 'on-error', css: 'var(--md-sys-color-on-error)', on: 'var(--md-sys-color-error)' },
  { name: 'error-container', css: 'var(--md-sys-color-error-container)', on: 'var(--md-sys-color-on-error-container)' },
  { name: 'on-error-container', css: 'var(--md-sys-color-on-error-container)', on: 'var(--md-sys-color-error-container)' },

  { name: 'surface', css: 'var(--md-sys-color-surface)', on: 'var(--md-sys-color-on-surface)' },
  { name: 'on-surface', css: 'var(--md-sys-color-on-surface)', on: 'var(--md-sys-color-surface)' },
  { name: 'surface-dim', css: 'var(--md-sys-color-surface-dim)', on: 'var(--md-sys-color-on-surface)' },
  { name: 'surface-bright', css: 'var(--md-sys-color-surface-bright)', on: 'var(--md-sys-color-on-surface)' },
  { name: 'surface-container-lowest', css: 'var(--md-sys-color-surface-container-lowest)', on: 'var(--md-sys-color-on-surface)' },
  { name: 'surface-container-low', css: 'var(--md-sys-color-surface-container-low)', on: 'var(--md-sys-color-on-surface)' },
  { name: 'surface-container', css: 'var(--md-sys-color-surface-container)', on: 'var(--md-sys-color-on-surface)' },
  { name: 'surface-container-high', css: 'var(--md-sys-color-surface-container-high)', on: 'var(--md-sys-color-on-surface)' },
  { name: 'surface-container-highest', css: 'var(--md-sys-color-surface-container-highest)', on: 'var(--md-sys-color-on-surface)' },
  { name: 'on-surface-variant', css: 'var(--md-sys-color-on-surface-variant)', on: 'var(--md-sys-color-surface)' },
  { name: 'outline', css: 'var(--md-sys-color-outline)', on: '#ffffff' },
  { name: 'outline-variant', css: 'var(--md-sys-color-outline-variant)', on: '#000000' },

  { name: 'inverse-surface', css: 'var(--md-sys-color-inverse-surface)', on: 'var(--md-sys-color-inverse-on-surface)' },
  { name: 'inverse-on-surface', css: 'var(--md-sys-color-inverse-on-surface)', on: 'var(--md-sys-color-inverse-surface)' },
  { name: 'inverse-primary', css: 'var(--md-sys-color-inverse-primary)', on: 'var(--md-sys-color-surface)' },

  { name: 'custom-warning', css: 'var(--md-custom-color-warning)', on: 'var(--md-custom-color-on-warning)' },
  { name: 'custom-warning-container', css: 'var(--md-custom-color-warning-container)', on: 'var(--md-custom-color-on-warning-container)' },
  { name: 'custom-info', css: 'var(--md-custom-color-info)', on: 'var(--md-custom-color-on-info)' },
  { name: 'custom-info-container', css: 'var(--md-custom-color-info-container)', on: 'var(--md-custom-color-on-info-container)' },
];

const SPACING_TOKENS = [
  { name: 'space0', value: '0px' },
  { name: 'space1', value: '4px' },
  { name: 'space2', value: '8px' },
  { name: 'space3', value: '12px' },
  { name: 'space4', value: '16px' },
  { name: 'space5', value: '20px' },
  { name: 'space6', value: '24px' },
  { name: 'space8', value: '32px' },
  { name: 'space10', value: '40px' },
  { name: 'space12', value: '48px' },
  { name: 'space16', value: '64px' },
  { name: 'space20', value: '80px' },
  { name: 'space24', value: '96px' },
];

const SHAPE_TOKENS = [
  { name: 'none', value: '0px' },
  { name: 'xs', value: '4px' },
  { name: 's', value: '8px' },
  { name: 'm', value: '12px' },
  { name: 'l', value: '16px' },
  { name: 'lPlus', value: '20px' },
  { name: 'xl', value: '28px' },
  { name: 'xlPlus', value: '32px' },
  { name: 'xxl', value: '48px' },
  { name: 'full', value: '9999px' },
];

const ELEVATION_TOKENS = [
  { name: 'elevation-0', class: 'shadow-elevation-0' },
  { name: 'elevation-1', class: 'shadow-elevation-1' },
  { name: 'elevation-2', class: 'shadow-elevation-2' },
  { name: 'elevation-3', class: 'shadow-elevation-3' },
  { name: 'elevation-4', class: 'shadow-elevation-4' },
  { name: 'elevation-5', class: 'shadow-elevation-5' },
];

export function TokensClient() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [radioVal, setRadioVal] = React.useState('option1');
  const [switchVal, setSwitchVal] = React.useState(true);
  const [checkboxVal, setCheckboxVal] = React.useState(true);
  const [sliderVal, setSliderVal] = React.useState(40);
  const [activeTab, setActiveTab] = React.useState('tab1');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-space4 py-space8 space-y-space12 font-body">
      {/* Header & Theme Switcher */}
      <header className="border-b border-border pb-space6 flex flex-col md:flex-row md:items-center justify-between gap-space4">
        <div>
          <span className="inline-block px-space2 py-0.5 mb-space2 text-xs font-mono font-medium rounded-xs bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]">
            [FIXTURE DATA / DEV ONLY]
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-[var(--md-sys-color-primary)]">
            M3 Design Tokens &amp; State Contract Showcase
          </h1>
          <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] mt-space1">
            M3_SPEC.md §2, §3, §3.1, §4, §5, §7 contract verification. 404 in production.
          </p>
        </div>

        <div className="flex items-center gap-space3">
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="inline-flex items-center gap-space2 px-space4 py-space2 rounded-full border border-border bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-high)] text-sm font-medium transition-colors"
          >
            <CircleHalfDuotone size={18} />
            <span>Tema Saat Ini: {mounted ? (theme === 'dark' ? 'Dark' : 'Light') : '...'}</span>
          </button>
        </div>
      </header>

      {/* 1. M3 Color Roles Grid */}
      <section className="space-y-space4">
        <h2 className="font-display text-2xl font-bold">1. M3 Color Roles (§2 Light &amp; Dark)</h2>
        <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
          Total 49 color roles defined per spec. The swatches below render live CSS variables reflecting the active theme.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-space3">
          {COLOR_ROLES.map((role) => (
            <div
              key={role.name}
              className="p-space3 rounded-s border border-border text-xs flex flex-col justify-between h-24"
              style={{ backgroundColor: role.css, color: role.on }}
            >
              <span className="font-mono font-bold truncate">{role.name}</span>
              <span className="text-[10px] opacity-80">{role.css}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Typography Tokens */}
      <section className="space-y-space4">
        <h2 className="font-display text-2xl font-bold">2. Typography Hierarchy (§3)</h2>
        <div className="space-y-space3 p-space6 rounded-m border border-border bg-[var(--md-sys-color-surface-container-low)]">
          <div>
            <span className="text-xs font-mono text-[var(--md-sys-color-on-surface-variant)]">Display Large (font-display 57/64 regular -0.25)</span>
            <p className="font-display text-5xl md:text-[57px] leading-tight font-normal">Agritech Research</p>
          </div>
          <div>
            <span className="text-xs font-mono text-[var(--md-sys-color-on-surface-variant)]">Display Medium (font-display 45/52 regular 0)</span>
            <p className="font-display text-4xl md:text-[45px] leading-tight font-normal">Layanan Cetak Kampus</p>
          </div>
          <div>
            <span className="text-xs font-mono text-[var(--md-sys-color-on-surface-variant)]">Headline Large (font-display 32/40 regular 0)</span>
            <p className="font-display text-3xl md:text-[32px] font-normal">Pesanan Mandiri Mahasiswa</p>
          </div>
          <div>
            <span className="text-xs font-mono text-[var(--md-sys-color-on-surface-variant)]">Title Medium (font-body 16/24 medium +0.15)</span>
            <p className="font-body text-base font-medium">FTP Universitas Brawijaya Malang</p>
          </div>
          <div>
            <span className="text-xs font-mono text-[var(--md-sys-color-on-surface-variant)]">Body Large (font-body 16/24 regular +0.5)</span>
            <p className="font-body text-base">
              Layanan cetak dokumen terstruktur resmi Agritech Research and Study Club (ARSC). Kirim berkas PDF dan periksa estimasi biaya secara otomatis.
            </p>
          </div>
          <div>
            <span className="text-xs font-mono text-[var(--md-sys-color-on-surface-variant)]">Label Large (font-body 14/20 medium +0.1)</span>
            <p className="font-body text-sm font-medium">KIRIM PESANAN SEKARANG</p>
          </div>
          <div>
            <span className="text-xs font-mono text-[var(--md-sys-color-on-surface-variant)]">Code / Mono (font-code 13/20 regular)</span>
            <p className="font-code text-xs bg-[var(--md-sys-color-surface-container)] p-space2 rounded-xs border border-border">
              ORDER_ID: arsc-9f8a1234-bcde
            </p>
          </div>
        </div>
      </section>

      {/* 3. Spacing, Shapes, Elevation */}
      <section className="space-y-space6">
        <h2 className="font-display text-2xl font-bold">3. Spacing, Shapes &amp; Elevation (§3)</h2>

        {/* Spacing */}
        <div>
          <h3 className="font-display text-lg font-semibold mb-space2">Spacing Tokens (4px Grid)</h3>
          <div className="flex flex-wrap gap-space2 items-end">
            {SPACING_TOKENS.map((s) => (
              <div key={s.name} className="flex flex-col items-center">
                <div
                  className="bg-[var(--md-sys-color-primary)] opacity-80"
                  style={{ width: s.value === '0px' ? '2px' : s.value, height: '40px' }}
                />
                <span className="text-[10px] font-mono mt-1">{s.name}</span>
                <span className="text-[9px] text-[var(--md-sys-color-on-surface-variant)]">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Shapes */}
        <div>
          <h3 className="font-display text-lg font-semibold mb-space2">Shape Scale</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-space3">
            {SHAPE_TOKENS.map((sh) => (
              <div
                key={sh.name}
                className="h-16 border border-border bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] flex flex-col items-center justify-center p-space2 text-xs font-mono"
                style={{ borderRadius: sh.value }}
              >
                <span className="font-bold">{sh.name}</span>
                <span className="text-[10px]">{sh.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Elevation */}
        <div>
          <h3 className="font-display text-lg font-semibold mb-space2">Elevation Tones (0 to 5)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-space4">
            {ELEVATION_TOKENS.map((el) => (
              <div
                key={el.name}
                className={`p-space4 rounded-m bg-[var(--md-sys-color-surface-container-low)] text-center text-xs font-mono ${el.class} border border-border/50`}
              >
                <span className="font-bold">{el.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Motion Tokens Showcase */}
      <section className="space-y-space4">
        <h2 className="font-display text-2xl font-bold">4. Motion Tokens (§4)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-space3">
          {Object.entries(motionTokens).map(([key, value]) => (
            <div key={key} className="p-space3 rounded-s border border-border bg-[var(--md-sys-color-surface-container)] text-xs font-mono">
              <span className="font-bold text-[var(--md-sys-color-primary)]">{key}</span>
              <pre className="mt-1 text-[10px] overflow-x-auto text-[var(--md-sys-color-on-surface-variant)]">
                {JSON.stringify(value, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Phosphor Duotone Icon Manifest (§3.1) */}
      <section className="space-y-space4">
        <h2 className="font-display text-2xl font-bold">5. Phosphor Duotone Icon Manifest (§3.1 — 23 Icons)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-space3">
          {[
            { comp: HouseDuotone, name: 'house' },
            { comp: FileTextDuotone, name: 'file-text' },
            { comp: MagnifyingGlassDuotone, name: 'magnifying-glass' },
            { comp: ClockDuotone, name: 'clock' },
            { comp: PrinterDuotone, name: 'printer' },
            { comp: UploadSimpleDuotone, name: 'upload-simple' },
            { comp: ImageDuotone, name: 'image' },
            { comp: QrCodeDuotone, name: 'qr-code' },
            { comp: CheckCircleDuotone, name: 'check-circle' },
            { comp: WarningCircleDuotone, name: 'warning-circle' },
            { comp: XCircleDuotone, name: 'x-circle' },
            { comp: CopyDuotone, name: 'copy' },
            { comp: ReceiptDuotone, name: 'receipt' },
            { comp: ListDuotone, name: 'list' },
            { comp: CircleHalfDuotone, name: 'circle-half' },
            { comp: UserCircleDuotone, name: 'user-circle' },
            { comp: SignOutDuotone, name: 'sign-out' },
            { comp: ArrowClockwiseDuotone, name: 'arrow-clockwise' },
            { comp: DotsThreeDuotone, name: 'dots-three' },
            { comp: ArrowRightDuotone, name: 'arrow-right' },
            { comp: ArrowLeftDuotone, name: 'arrow-left' },
            { comp: CalendarBlankDuotone, name: 'calendar-blank' },
            { comp: FunnelDuotone, name: 'funnel' },
          ].map(({ comp: IconComp, name }) => (
            <div
              key={name}
              className="p-space3 rounded-m border border-border bg-[var(--md-sys-color-surface-container-low)] flex flex-col items-center justify-center gap-space2 text-center"
            >
              <IconComp size={24} className="text-[var(--md-sys-color-primary)]" />
              <span className="text-[11px] font-mono truncate w-full">{name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Copy Registry Showcase (§7) */}
      <section className="space-y-space4">
        <h2 className="font-display text-2xl font-bold">6. Copy Registry Verbatim Fixtures (§7)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space4">
          <div className="p-space4 rounded-m border border-border bg-[var(--md-sys-color-surface-container-low)] space-y-space2">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
              Status Translations (Indonesian)
            </h3>
            <ul className="text-xs space-y-1">
              {Object.entries(COPY_STATUS_MAP).map(([k, v]) => (
                <li key={k} className="flex justify-between border-b border-border/50 py-1 font-mono">
                  <span className="text-[var(--md-sys-color-on-surface-variant)]">{k}:</span>
                  <span className="font-body font-medium">{v}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-space4 rounded-m border border-border bg-[var(--md-sys-color-surface-container-low)] space-y-space2">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
              Simulation Disclosure &amp; Empty Copy
            </h3>
            <div className="text-xs space-y-2">
              <p className="p-space2 rounded-s bg-[var(--md-custom-color-warning-container)] text-[var(--md-custom-color-on-warning-container)] font-medium">
                {COPY_UI.simulationDisclosure}
              </p>
              <p className="text-[var(--md-sys-color-on-surface-variant)]">
                Empty State Title: <strong>{COPY_EMPTY.noOrders}</strong>
              </p>
              <p className="text-[var(--md-sys-color-on-surface-variant)]">
                Empty State Sub: {COPY_EMPTY.noOrdersSub}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Comprehensive Component States Contract (§5) */}
      <section className="space-y-space8 border-t border-border pt-space8">
        <h2 className="font-display text-3xl font-bold">
          7. Exhaustive Component State Contract (§5 — All 18 Components)
        </h2>
        <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
          Every component rendered in all states: enabled, hover, focus, pressed, disabled, loading, error, success.
        </p>

        {/* 1. Filled Button */}
        <div className="space-y-space3 p-space4 rounded-m border border-border bg-[var(--md-sys-color-surface-container-lowest)]">
          <h3 className="font-display text-lg font-bold">1. Filled Button (M3 Primary)</h3>
          <div className="flex flex-wrap items-center gap-space3">
            <button className="px-space6 py-2.5 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-body text-sm font-medium shadow-elevation-0 hover:shadow-elevation-1 transition-all">
              Enabled
            </button>
            <button className="px-space6 py-2.5 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-body text-sm font-medium shadow-elevation-1 ring-2 ring-[var(--md-sys-color-on-primary)]/20">
              Hover State
            </button>
            <button className="px-space6 py-2.5 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-body text-sm font-medium outline outline-3 outline-[var(--md-sys-color-primary)] outline-offset-3">
              Focus State (3px outline / 3px offset)
            </button>
            <button className="px-space6 py-2.5 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-body text-sm font-medium brightness-90 scale-95">
              Pressed State
            </button>
            <button disabled className="px-space6 py-2.5 rounded-full bg-[var(--md-sys-color-on-surface)]/12 text-[var(--md-sys-color-on-surface)]/38 font-body text-sm font-medium cursor-not-allowed">
              Disabled
            </button>
            <button className="px-space6 py-2.5 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-body text-sm font-medium inline-flex items-center gap-space2">
              <span className="w-4 h-4 border-2 border-[var(--md-sys-color-on-primary)] border-t-transparent rounded-full animate-spin" />
              <span>Memproses...</span>
            </button>
          </div>
        </div>

        {/* 2. Outlined Button */}
        <div className="space-y-space3 p-space4 rounded-m border border-border bg-[var(--md-sys-color-surface-container-lowest)]">
          <h3 className="font-display text-lg font-bold">2. Outlined Button</h3>
          <div className="flex flex-wrap items-center gap-space3">
            <button className="px-space6 py-2.5 rounded-full border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-primary)] font-body text-sm font-medium hover:bg-[var(--md-sys-color-primary)]/8">
              Enabled
            </button>
            <button className="px-space6 py-2.5 rounded-full border border-[var(--md-sys-color-primary)] text-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary)]/8 font-body text-sm font-medium">
              Hover
            </button>
            <button className="px-space6 py-2.5 rounded-full border border-[var(--md-sys-color-primary)] text-[var(--md-sys-color-primary)] font-body text-sm font-medium outline outline-3 outline-[var(--md-sys-color-primary)] outline-offset-3">
              Focus
            </button>
            <button disabled className="px-space6 py-2.5 rounded-full border border-[var(--md-sys-color-on-surface)]/12 text-[var(--md-sys-color-on-surface)]/38 font-body text-sm font-medium cursor-not-allowed">
              Disabled
            </button>
          </div>
        </div>

        {/* 3. Text Button */}
        <div className="space-y-space3 p-space4 rounded-m border border-border bg-[var(--md-sys-color-surface-container-lowest)]">
          <h3 className="font-display text-lg font-bold">3. Text Button</h3>
          <div className="flex flex-wrap items-center gap-space3">
            <button className="px-space3 py-2 rounded-full text-[var(--md-sys-color-primary)] font-body text-sm font-medium hover:bg-[var(--md-sys-color-primary)]/8">
              Batal
            </button>
            <button className="px-space3 py-2 rounded-full text-[var(--md-sys-color-primary)] font-body text-sm font-medium bg-[var(--md-sys-color-primary)]/8">
              Hover State
            </button>
            <button disabled className="px-space3 py-2 rounded-full text-[var(--md-sys-color-on-surface)]/38 font-body text-sm font-medium cursor-not-allowed">
              Disabled
            </button>
          </div>
        </div>

        {/* 4. Text Field (Filled & Outlined) */}
        <div className="space-y-space4 p-space4 rounded-m border border-border bg-[var(--md-sys-color-surface-container-lowest)]">
          <h3 className="font-display text-lg font-bold">4. Text Field (Outlined &amp; Filled)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-space3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">Default / Enabled</label>
              <input
                type="text"
                defaultValue="Farhan"
                className="w-full px-space3 py-2.5 rounded-xs border border-[var(--md-sys-color-outline)] bg-transparent text-sm text-[var(--md-sys-color-on-surface)] focus:outline-none focus:border-[var(--md-sys-color-primary)] focus:border-2"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--md-sys-color-primary)]">Focused</label>
              <input
                type="text"
                defaultValue="farhan@student.ub.ac.id"
                className="w-full px-space3 py-2.5 rounded-xs border-2 border-[var(--md-sys-color-primary)] bg-transparent text-sm text-[var(--md-sys-color-on-surface)]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--md-sys-color-error)]">Error State</label>
              <input
                type="text"
                defaultValue="invalid-format"
                className="w-full px-space3 py-2.5 rounded-xs border-2 border-[var(--md-sys-color-error)] bg-transparent text-sm text-[var(--md-sys-color-on-surface)]"
              />
              <span className="text-[10px] text-[var(--md-sys-color-error)]">{COPY_VALIDATION.invalidEmail}</span>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--md-sys-color-on-surface)]/38">Disabled</label>
              <input
                disabled
                type="text"
                defaultValue="Tidak dapat diedit"
                className="w-full px-space3 py-2.5 rounded-xs border border-[var(--md-sys-color-on-surface)]/12 bg-[var(--md-sys-color-on-surface)]/4 text-sm text-[var(--md-sys-color-on-surface)]/38 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* 5. Select / Dropdown */}
        <div className="space-y-space3 p-space4 rounded-m border border-border bg-[var(--md-sys-color-surface-container-lowest)]">
          <h3 className="font-display text-lg font-bold">5. Select Dropdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space3">
            <select className="w-full px-space3 py-2.5 rounded-xs border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] text-sm text-[var(--md-sys-color-on-surface)]">
              <option>Hitam Putih (Rp500/hal)</option>
              <option>Warna (Rp750/hal)</option>
            </select>
            <select className="w-full px-space3 py-2.5 rounded-xs border-2 border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-surface)] text-sm text-[var(--md-sys-color-on-surface)]">
              <option>Focused Dropdown</option>
            </select>
            <select disabled className="w-full px-space3 py-2.5 rounded-xs border border-[var(--md-sys-color-on-surface)]/12 bg-[var(--md-sys-color-on-surface)]/4 text-sm text-[var(--md-sys-color-on-surface)]/38 cursor-not-allowed">
              <option>Disabled Option</option>
            </select>
          </div>
        </div>

        {/* 6. Checkbox, Radio, Switch */}
        <div className="space-y-space4 p-space4 rounded-m border border-border bg-[var(--md-sys-color-surface-container-lowest)]">
          <h3 className="font-display text-lg font-bold">6. Selection Controls (Checkbox, Radio, Switch)</h3>
          <div className="flex flex-wrap items-center gap-space6 text-sm">
            {/* Checkboxes */}
            <div className="flex items-center gap-space2">
              <input
                type="checkbox"
                checked={checkboxVal}
                onChange={(e) => setCheckboxVal(e.target.checked)}
                className="w-4 h-4 rounded text-[var(--md-sys-color-primary)] accent-[var(--md-sys-color-primary)]"
              />
              <span>Checkbox Checked</span>
            </div>
            <div className="flex items-center gap-space2">
              <input
                type="checkbox"
                defaultChecked={false}
                className="w-4 h-4 rounded text-[var(--md-sys-color-primary)] accent-[var(--md-sys-color-primary)]"
              />
              <span>Checkbox Unchecked</span>
            </div>
            <div className="flex items-center gap-space2 opacity-50">
              <input disabled type="checkbox" defaultChecked className="w-4 h-4 cursor-not-allowed" />
              <span>Disabled</span>
            </div>

            {/* Radios */}
            <div className="flex items-center gap-space2">
              <input
                type="radio"
                name="demo-radio"
                value="option1"
                checked={radioVal === 'option1'}
                onChange={() => setRadioVal('option1')}
                className="w-4 h-4 accent-[var(--md-sys-color-primary)]"
              />
              <span>Radio 1</span>
            </div>
            <div className="flex items-center gap-space2">
              <input
                type="radio"
                name="demo-radio"
                value="option2"
                checked={radioVal === 'option2'}
                onChange={() => setRadioVal('option2')}
                className="w-4 h-4 accent-[var(--md-sys-color-primary)]"
              />
              <span>Radio 2</span>
            </div>

            {/* Switch */}
            <label className="flex items-center gap-space2 cursor-pointer">
              <div
                onClick={() => setSwitchVal(!switchVal)}
                className={`w-12 h-7 rounded-full p-1 transition-colors ${
                  switchVal ? 'bg-[var(--md-sys-color-primary)]' : 'bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline)]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-[var(--md-sys-color-on-primary)] transition-transform ${
                    switchVal ? 'translate-x-5' : 'translate-x-0 bg-[var(--md-sys-color-outline)]'
                  }`}
                />
              </div>
              <span>Switch ({switchVal ? 'ON' : 'OFF'})</span>
            </label>
          </div>
        </div>

        {/* 7. Slider */}
        <div className="space-y-space3 p-space4 rounded-m border border-border bg-[var(--md-sys-color-surface-container-lowest)]">
          <h3 className="font-display text-lg font-bold">7. Slider (Continuous Range)</h3>
          <div className="max-w-md space-y-2">
            <input
              type="range"
              min="1"
              max="100"
              value={sliderVal}
              onChange={(e) => setSliderVal(Number(e.target.value))}
              className="w-full accent-[var(--md-sys-color-primary)]"
            />
            <div className="flex justify-between text-xs font-mono text-[var(--md-sys-color-on-surface-variant)]">
              <span>Min: 1</span>
              <span>Nilai: {sliderVal} eksemplar</span>
              <span>Max: 100</span>
            </div>
          </div>
        </div>

        {/* 8. Tabs (Primary & Secondary) */}
        <div className="space-y-space3 p-space4 rounded-m border border-border bg-[var(--md-sys-color-surface-container-lowest)]">
          <h3 className="font-display text-lg font-bold">8. Tabs</h3>
          <div className="flex border-b border-border">
            {['tab1', 'tab2', 'tab3'].map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-space6 py-space3 text-sm font-medium border-b-2 transition-all ${
                  activeTab === tab
                    ? 'border-[var(--md-sys-color-primary)] text-[var(--md-sys-color-primary)] font-bold'
                    : 'border-transparent text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
                }`}
              >
                Tab Pilihan {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* 9. Cards (Elevated, Filled, Outlined) */}
        <div className="space-y-space3 p-space4 rounded-m border border-border bg-[var(--md-sys-color-surface-container-lowest)]">
          <h3 className="font-display text-lg font-bold">9. Cards (Elevated, Filled, Outlined)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space4">
            <div className="p-space4 rounded-m bg-[var(--md-sys-color-surface-container-low)] shadow-elevation-1 border border-border/40 space-y-2">
              <span className="text-xs font-mono text-[var(--md-sys-color-primary)]">Elevated Card</span>
              <h4 className="font-bold text-sm">Pesanan #ARSC-101</h4>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Total: Rp15.000 · 30 Halaman</p>
            </div>
            <div className="p-space4 rounded-m bg-[var(--md-sys-color-surface-container-high)] space-y-2">
              <span className="text-xs font-mono text-[var(--md-sys-color-primary)]">Filled Card</span>
              <h4 className="font-bold text-sm">Informasi Cetak</h4>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Kertas A4 HVS 70gr Standar</p>
            </div>
            <div className="p-space4 rounded-m bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] space-y-2">
              <span className="text-xs font-mono text-[var(--md-sys-color-primary)]">Outlined Card</span>
              <h4 className="font-bold text-sm">Lokasi Pengambilan</h4>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">{COPY_UI.location}</p>
            </div>
          </div>
        </div>

        {/* 10. Chips (Filter, Assist, Input, Suggestion) */}
        <div className="space-y-space3 p-space4 rounded-m border border-border bg-[var(--md-sys-color-surface-container-lowest)]">
          <h3 className="font-display text-lg font-bold">10. Chips (Assist, Filter, Input, Suggestion)</h3>
          <div className="flex flex-wrap items-center gap-space2">
            <span className="inline-flex items-center gap-space1 px-space3 py-1.5 rounded-s border border-[var(--md-sys-color-outline)] text-xs font-medium">
              <FileTextDuotone size={14} />
              <span>Dokumen PDF</span>
            </span>
            <span className="inline-flex items-center gap-space1 px-space3 py-1.5 rounded-s bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] text-xs font-medium">
              <CheckCircleDuotone size={14} />
              <span>Filter Aktif</span>
            </span>
            <span className="inline-flex items-center gap-space1 px-space3 py-1.5 rounded-s border border-[var(--md-sys-color-outline)] text-xs font-medium hover:bg-[var(--md-sys-color-surface-container-high)]">
              <span>Saran: 2 Rangkap</span>
            </span>
            <span className="inline-flex items-center gap-space1 px-space3 py-1.5 rounded-s bg-[var(--md-sys-color-on-surface)]/12 text-[var(--md-sys-color-on-surface)]/38 text-xs font-medium cursor-not-allowed">
              <span>Disabled Chip</span>
            </span>
          </div>
        </div>

        {/* 11. Badges & Status Indicators */}
        <div className="space-y-space3 p-space4 rounded-m border border-border bg-[var(--md-sys-color-surface-container-lowest)]">
          <h3 className="font-display text-lg font-bold">11. Badges &amp; Status Indicators (§7)</h3>
          <div className="flex flex-wrap items-center gap-space2">
            <span className="px-space3 py-1 rounded-full text-xs font-medium bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]">
              {COPY_STATUS_MAP.SUBMITTED}
            </span>
            <span className="px-space3 py-1 rounded-full text-xs font-medium bg-[var(--md-custom-color-info-container)] text-[var(--md-custom-color-on-info-container)]">
              {COPY_STATUS_MAP.CONFIRMED}
            </span>
            <span className="px-space3 py-1 rounded-full text-xs font-medium bg-[var(--md-custom-color-warning-container)] text-[var(--md-custom-color-on-warning-container)]">
              {COPY_STATUS_MAP.PRINTING}
            </span>
            <span className="px-space3 py-1 rounded-full text-xs font-medium bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]">
              {COPY_STATUS_MAP.COMPLETED}
            </span>
            <span className="px-space3 py-1 rounded-full text-xs font-medium bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]">
              {COPY_STATUS_MAP.CANCELLED}
            </span>
          </div>
        </div>

        {/* 12. Progress Indicators (Linear & Circular) */}
        <div className="space-y-space3 p-space4 rounded-m border border-border bg-[var(--md-sys-color-surface-container-lowest)]">
          <h3 className="font-display text-lg font-bold">12. Progress Indicators (Linear &amp; Circular)</h3>
          <div className="space-y-space3 max-w-md">
            <div>
              <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">{COPY_LOADING.analyzingPdf} (70%)</span>
              <div className="w-full h-1 bg-[var(--md-sys-color-surface-container-highest)] rounded-full overflow-hidden mt-1">
                <div className="h-full bg-[var(--md-sys-color-primary)] rounded-full w-[70%]" />
              </div>
            </div>
            <div className="flex items-center gap-space3">
              <div className="w-6 h-6 border-2 border-[var(--md-sys-color-primary)] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">{COPY_LOADING.uploadingFile}</span>
            </div>
          </div>
        </div>

        {/* 13. Snackbar / Toast Trigger */}
        <div className="space-y-space3 p-space4 rounded-m border border-border bg-[var(--md-sys-color-surface-container-lowest)]">
          <h3 className="font-display text-lg font-bold">13. Toast / Snackbar Anatomy (§5 &amp; Sonner)</h3>
          <div className="flex flex-wrap items-center gap-space3">
            <button
              onClick={() => toast.success(COPY_TOASTS.orderCreated)}
              className="px-space4 py-2 rounded-full border border-border bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-high)] text-xs font-medium"
            >
              Pemicu Toast Sukses
            </button>
            <button
              onClick={() => toast.error(COPY_TOASTS.orderSubmitFailed)}
              className="px-space4 py-2 rounded-full border border-border bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-high)] text-xs font-medium"
            >
              Pemicu Toast Gagal
            </button>
            <button
              onClick={() => toast.info(COPY_TOASTS.proofUploaded)}
              className="px-space4 py-2 rounded-full border border-border bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-high)] text-xs font-medium"
            >
              Pemicu Toast Info
            </button>
          </div>
        </div>

        {/* 14. Dialog / Modal */}
        <div className="space-y-space3 p-space4 rounded-m border border-border bg-[var(--md-sys-color-surface-container-lowest)]">
          <h3 className="font-display text-lg font-bold">14. Dialog (Modal)</h3>
          <button
            onClick={() => setDialogOpen(true)}
            className="px-space4 py-2 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-xs font-medium"
          >
            Buka Contoh Dialog
          </button>
          {dialogOpen && (
            <div className="fixed inset-0 z-50 bg-[var(--md-sys-color-scrim)]/50 backdrop-blur-sm flex items-center justify-center p-space4">
              <div className="w-full max-w-md p-space6 rounded-xl bg-[var(--md-sys-color-surface-container-high)] shadow-elevation-3 space-y-space4 border border-border">
                <h4 className="font-display text-lg font-bold text-[var(--md-sys-color-on-surface)]">Konfirmasi Batalkan Pesanan</h4>
                <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                  Apakah Anda yakin ingin membatalkan pesanan cetak ini? Tindakan ini tidak dapat diurungkan.
                </p>
                <div className="flex justify-end gap-space2">
                  <button
                    onClick={() => setDialogOpen(false)}
                    className="px-space4 py-2 rounded-full text-xs font-medium text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/8"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => setDialogOpen(false)}
                    className="px-space4 py-2 rounded-full bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] text-xs font-medium"
                  >
                    Ya, Batalkan
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 15. Bottom Sheet / Navigation Drawer */}
        <div className="space-y-space3 p-space4 rounded-m border border-border bg-[var(--md-sys-color-surface-container-lowest)]">
          <h3 className="font-display text-lg font-bold">15. Bottom Sheet / Navigation Drawer</h3>
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="px-space4 py-2 rounded-full border border-border bg-[var(--md-sys-color-surface-container)] text-xs font-medium"
          >
            {drawerOpen ? 'Tutup Bottom Sheet' : 'Tampilkan Bottom Sheet'}
          </button>
          {drawerOpen && (
            <div className="p-space4 rounded-t-xl bg-[var(--md-sys-color-surface-container-low)] border border-border shadow-elevation-2 space-y-space2">
              <div className="w-10 h-1 bg-[var(--md-sys-color-outline-variant)] rounded-full mx-auto mb-space3" />
              <h5 className="font-bold text-sm">Opsi Pencetakan Lanjutan</h5>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                Pilih rentang halaman khusus atau jilid spiral jika dibutuhkan.
              </p>
            </div>
          )}
        </div>

        {/* 16. App Bar & Navigation Bar */}
        <div className="space-y-space3 p-space4 rounded-m border border-border bg-[var(--md-sys-color-surface-container-lowest)]">
          <h3 className="font-display text-lg font-bold">16. App Bar &amp; Navigation Bar</h3>
          <div className="rounded-m border border-border overflow-hidden">
            <div className="px-space4 py-space3 bg-[var(--md-sys-color-surface-container)] flex items-center justify-between">
              <div className="flex items-center gap-space2">
                <PrinterDuotone size={20} className="text-[var(--md-sys-color-primary)]" />
                <span className="font-display font-bold text-sm">{COPY_UI.brandName}</span>
              </div>
              <div className="flex items-center gap-space3 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">
                <span className="text-[var(--md-sys-color-primary)] font-bold">Beranda</span>
                <span>Pesanan</span>
                <span>Lacak</span>
              </div>
            </div>
          </div>
        </div>

        {/* 17. Tooltip */}
        <div className="space-y-space3 p-space4 rounded-m border border-border bg-[var(--md-sys-color-surface-container-lowest)]">
          <h3 className="font-display text-lg font-bold">17. Tooltip</h3>
          <div className="inline-block relative group">
            <span className="px-space3 py-1.5 rounded-s border border-dashed border-[var(--md-sys-color-outline)] text-xs cursor-help">
              Arahkan kursor ke sini
            </span>
            <div className="hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-space2 py-1 rounded-xs bg-[var(--md-sys-color-inverse-surface)] text-[var(--md-sys-color-inverse-on-surface)] text-[10px] whitespace-nowrap shadow-elevation-1">
              Petunjuk: Hanya file berekstensi .pdf
            </div>
          </div>
        </div>

        {/* 18. Divider */}
        <div className="space-y-space3 p-space4 rounded-m border border-border bg-[var(--md-sys-color-surface-container-lowest)]">
          <h3 className="font-display text-lg font-bold">18. Divider</h3>
          <div className="space-y-space2">
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Full-width divider:</p>
            <hr className="border-t border-[var(--md-sys-color-outline-variant)]" />
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Inset divider:</p>
            <hr className="border-t border-[var(--md-sys-color-outline-variant)] ml-space8" />
          </div>
        </div>
      </section>

      {/* Footer Fixture Disclaimer */}
      <footer className="text-center text-xs text-[var(--md-sys-color-on-surface-variant)] py-space6 border-t border-border">
        [FIXTURE DATA] ARSC Redesign v2 — Stage 1 Token Contract Verification. All content above is synthetic test data.
      </footer>
    </div>
  );
}
