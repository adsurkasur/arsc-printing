'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
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
import {
  COPY_ORDER_STATUS,
  COPY_TOASTS,
  COPY_UI,
  COPY_VALIDATION,
  COPY_LOADING,
  COPY_TIMELINE_STEPS,
  COPY_PAGES,
} from '@/lib/copy';
import {
  M3Pressable,
  M3StateLayer,
  getM3LayerVars,
  M3ResponsiveDialog,
  m3Toast,
} from '@/components/m3';

const M3_ROLES = [
  'primary', 'onPrimary', 'primaryContainer', 'onPrimaryContainer', 'inversePrimary',
  'primaryFixed', 'primaryFixedDim', 'onPrimaryFixed', 'onPrimaryFixedVariant',
  'secondary', 'onSecondary', 'secondaryContainer', 'onSecondaryContainer',
  'secondaryFixed', 'secondaryFixedDim', 'onSecondaryFixed', 'onSecondaryFixedVariant',
  'tertiary', 'onTertiary', 'tertiaryContainer', 'onTertiaryContainer',
  'tertiaryFixed', 'tertiaryFixedDim', 'onTertiaryFixed', 'onTertiaryFixedVariant',
  'error', 'onError', 'errorContainer', 'onErrorContainer',
  'surface', 'onSurface', 'surfaceDim', 'surfaceBright',
  'surfaceContainerLowest', 'surfaceContainerLow', 'surfaceContainer',
  'surfaceContainerHigh', 'surfaceContainerHighest', 'onSurfaceVariant',
  'outline', 'outlineVariant', 'inverseSurface', 'inverseOnSurface',
  'surfaceTint', 'scrim', 'shadow', 'background', 'onBackground', 'surfaceVariant',
];

const SEMANTIC_ROLES = [
  'success', 'onSuccess', 'successContainer', 'onSuccessContainer',
  'warning', 'onWarning', 'warningContainer', 'onWarningContainer',
];

function toKebab(str: string) {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

export function TokensClient() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [activeSegment, setActiveSegment] = React.useState('A4');
  const [chipSelected, setChipSelected] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [pdfFileName, setPdfFileName] = React.useState<string | null>(null);
  const [proofFileName, setProofFileName] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopyPickup = async () => {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable');
      }
      await navigator.clipboard.writeText('ARSC-4821');
      setCopied(true);
      m3Toast.success(COPY_TOASTS.copyPickup);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      m3Toast.error(COPY_TOASTS.clipboardFailed);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--md-sys-color-background)] text-[var(--md-sys-color-on-background)] p-space4 md:p-space8">
      {/* Test Data Badge */}
      <div className="mb-space6 p-space3 bg-[var(--md-custom-color-warning-container)] text-[var(--md-custom-color-on-warning-container)] rounded-m text-sm font-medium flex items-center justify-between border border-[var(--md-custom-color-warning)]">
        <span>FIXTURE TEST DATA: /dev/tokens (404 in production)</span>
        <span className="text-xs font-mono">ARSC M3 STAGE 1C</span>
      </div>

      {/* Header & Theme Persistence Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space4 border-b border-[var(--md-sys-color-outline-variant)] pb-space6 mb-space8">
        <div>
          <h1 className="text-headlineLarge-emphasized font-display text-[var(--md-sys-color-primary)]">
            M3 Design System Tokens
          </h1>
          <p className="text-bodyMedium text-[var(--md-sys-color-on-surface-variant)] mt-space1">
            M3_SPEC.md §2–§5 tokens, full type scale, 18-component matrix, and verified theme switcher.
          </p>
        </div>
        <div className="flex items-center gap-space2">
          <span className="text-bodySmall text-[var(--md-sys-color-on-surface-variant)]">
            Theme ({mounted ? theme : 'loading'}):
          </span>
          {(['light', 'dark', 'system'] as const).map((t) => (
            <M3Pressable
              key={t}
              type="button"
              pair={mounted && theme === t ? 'primary' : 'surface'}
              data-testid={`theme-toggle-${t}`}
              onClick={() => setTheme(t)}
              className={`min-h-[48px] px-space4 rounded-full text-labelMedium border ${
                mounted && theme === t
                  ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] border-transparent'
                  : 'border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface)]'
              }`}
            >
              {t}
            </M3Pressable>
          ))}
        </div>
      </div>

      {/* 1. PALETTE SWATCHES: All 49 M3 roles + 8 Semantic roles with consistent neutral backing */}
      <section className="mb-space12">
        <h2 className="text-headlineSmall-emphasized font-display mb-space2">1. Color Tokens (§2 & §2.1)</h2>
        <p className="text-bodyMedium text-[var(--md-sys-color-on-surface-variant)] mb-space4">
          49 frozen M3 SchemeFidelity color roles and 8 semantic roles. Labels sit on a neutral surface backing.
        </p>

        <h3 className="text-titleMedium-emphasized mb-space3">49 M3 Roles</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-space2 mb-space6">
          {M3_ROLES.map((role) => {
            const kebab = toKebab(role);
            return (
              <div
                key={role}
                className="rounded-s border border-[var(--md-sys-color-outline-variant)] overflow-hidden flex flex-col shadow-elevation-0"
              >
                <div
                  className="h-12 w-full"
                  style={{ backgroundColor: `var(--md-sys-color-${kebab})` }}
                />
                <div className="p-space2 bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] flex flex-col">
                  <span className="font-mono text-[10px] font-bold truncate">{role}</span>
                  <span className="text-[9px] text-[var(--md-sys-color-on-surface-variant)] truncate">
                    --md-sys-color-{kebab}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <h3 className="text-titleMedium-emphasized mb-space3">8 Semantic Product Roles</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-space2">
          {SEMANTIC_ROLES.map((role) => {
            const kebab = toKebab(role);
            return (
              <div
                key={role}
                className="rounded-s border border-[var(--md-sys-color-outline-variant)] overflow-hidden flex flex-col shadow-elevation-0"
              >
                <div
                  className="h-12 w-full"
                  style={{ backgroundColor: `var(--md-custom-color-${kebab})` }}
                />
                <div className="p-space2 bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] flex flex-col">
                  <span className="font-mono text-[11px] font-bold truncate">{role}</span>
                  <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] truncate">
                    --md-custom-color-{kebab}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. TYPOGRAPHY SCALE */}
      <section className="mb-space12">
        <h2 className="text-headlineSmall-emphasized font-display mb-space2">2. Typography Scale (§3)</h2>
        <div className="space-y-space4 border border-[var(--md-sys-color-outline-variant)] rounded-lPlus p-space6 bg-[var(--md-sys-color-surface-container-low)]">
          <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-[var(--md-sys-color-outline-variant)] pb-space2">
            <span className="text-displayLarge font-display">Display Large 57/64 400</span>
            <span className="text-displayLarge-emphasized font-display">Emphasized 600</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-[var(--md-sys-color-outline-variant)] pb-space2">
            <span className="text-displayMedium font-display">Display Medium 45/52 400</span>
            <span className="text-displayMedium-emphasized font-display">Emphasized 600</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-[var(--md-sys-color-outline-variant)] pb-space2">
            <span className="text-displaySmall font-display">Display Small 36/44 400</span>
            <span className="text-displaySmall-emphasized font-display">Emphasized 600</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-[var(--md-sys-color-outline-variant)] pb-space2">
            <span className="text-headlineLarge font-display">Headline Large 32/40 400</span>
            <span className="text-headlineLarge-emphasized font-display">Emphasized 600</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-[var(--md-sys-color-outline-variant)] pb-space2">
            <span className="text-headlineMedium font-display">Headline Medium 28/36 400</span>
            <span className="text-headlineMedium-emphasized font-display">Emphasized 600</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-[var(--md-sys-color-outline-variant)] pb-space2">
            <span className="text-headlineSmall font-display">Headline Small 24/32 400</span>
            <span className="text-headlineSmall-emphasized font-display">Emphasized 600</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-[var(--md-sys-color-outline-variant)] pb-space2">
            <span className="text-titleLarge font-body">Title Large 22/28 500</span>
            <span className="text-titleLarge-emphasized font-body">Emphasized 700</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-[var(--md-sys-color-outline-variant)] pb-space2">
            <span className="text-titleMedium font-body">Title Medium 16/24 500</span>
            <span className="text-titleMedium-emphasized font-body">Emphasized 700</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-[var(--md-sys-color-outline-variant)] pb-space2">
            <span className="text-bodyLarge font-body">Body Large 16/24 400</span>
            <span className="text-bodyLarge-emphasized font-body">Emphasized 600</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-[var(--md-sys-color-outline-variant)] pb-space2">
            <span className="text-labelLarge font-body">Label Large 14/20 500</span>
            <span className="text-labelLarge-emphasized font-body">Emphasized 700</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-baseline justify-between pt-space2">
            <span className="text-pickup font-code text-[var(--md-sys-color-primary)]">ARSC-4821 (28/36 600)</span>
            <span className="text-amount font-code text-[var(--md-sys-color-on-surface)]">Rp 15.000 (24/32 500/600)</span>
          </div>
        </div>
      </section>

      {/* 3. ELEVATION AND SHAPE TOKENS */}
      <section className="mb-space12">
        <h2 className="text-headlineSmall-emphasized font-display mb-space2">3. Tonal Elevation & Shape (§3)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-space4">
          {[
            { lvl: 0, tone: 'surface', shadow: 'shadow-elevation-0', desc: 'Surface / No shadow' },
            { lvl: 1, tone: 'surface-container-low', shadow: 'shadow-elevation-1', desc: 'Low / 12% shadow' },
            { lvl: 2, tone: 'surface-container', shadow: 'shadow-elevation-2', desc: 'Container / 14%' },
            { lvl: 3, tone: 'surface-container-high', shadow: 'shadow-elevation-3', desc: 'High / 16%' },
            { lvl: 4, tone: 'surface-container-highest', shadow: 'shadow-elevation-4', desc: 'Highest / 18%' },
            { lvl: 5, tone: 'surface-container-highest', shadow: 'shadow-elevation-5', desc: 'Highest / 20%' },
          ].map((e) => (
            <div
              key={e.lvl}
              className={`p-space4 rounded-lPlus ${e.shadow} border border-[var(--md-sys-color-outline-variant)]`}
              style={{ backgroundColor: `var(--md-sys-color-${e.tone})` }}
            >
              <span className="text-labelMedium font-bold">Elevation {e.lvl}</span>
              <p className="text-bodySmall text-[var(--md-sys-color-on-surface-variant)]">{e.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. PHOSPHOR DUOTONE ICONS */}
      <section className="mb-space12">
        <h2 className="text-headlineSmall-emphasized font-display mb-space2">4. Phosphor Duotone Manifest (§3.1)</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-space3">
          {[
            { name: 'House', icon: <HouseDuotone className="w-6 h-6 text-[var(--md-sys-color-primary)]" /> },
            { name: 'FileText', icon: <FileTextDuotone className="w-6 h-6 text-[var(--md-sys-color-primary)]" /> },
            { name: 'Search', icon: <MagnifyingGlassDuotone className="w-6 h-6 text-[var(--md-sys-color-primary)]" /> },
            { name: 'Clock', icon: <ClockDuotone className="w-6 h-6 text-[var(--md-sys-color-primary)]" /> },
            { name: 'Printer', icon: <PrinterDuotone className="w-6 h-6 text-[var(--md-sys-color-primary)]" /> },
            { name: 'Upload', icon: <UploadSimpleDuotone className="w-6 h-6 text-[var(--md-sys-color-primary)]" /> },
            { name: 'Image', icon: <ImageDuotone className="w-6 h-6 text-[var(--md-sys-color-primary)]" /> },
            { name: 'QrCode', icon: <QrCodeDuotone className="w-6 h-6 text-[var(--md-sys-color-primary)]" /> },
            { name: 'Check', icon: <CheckCircleDuotone className="w-6 h-6 text-[var(--md-custom-color-success)]" /> },
            { name: 'Warning', icon: <WarningCircleDuotone className="w-6 h-6 text-[var(--md-custom-color-warning)]" /> },
            { name: 'XCircle', icon: <XCircleDuotone className="w-6 h-6 text-[var(--md-sys-color-error)]" /> },
            { name: 'Copy', icon: <CopyDuotone className="w-6 h-6 text-[var(--md-sys-color-primary)]" /> },
            { name: 'Receipt', icon: <ReceiptDuotone className="w-6 h-6 text-[var(--md-sys-color-primary)]" /> },
            { name: 'Menu', icon: <ListDuotone className="w-6 h-6 text-[var(--md-sys-color-primary)]" /> },
            { name: 'Theme', icon: <CircleHalfDuotone className="w-6 h-6 text-[var(--md-sys-color-primary)]" /> },
            { name: 'Operator', icon: <UserCircleDuotone className="w-6 h-6 text-[var(--md-sys-color-primary)]" /> },
            { name: 'Logout', icon: <SignOutDuotone className="w-6 h-6 text-[var(--md-sys-color-primary)]" /> },
            { name: 'Refresh', icon: <ArrowClockwiseDuotone className="w-6 h-6 text-[var(--md-sys-color-primary)]" /> },
            { name: 'More', icon: <DotsThreeDuotone className="w-6 h-6 text-[var(--md-sys-color-primary)]" /> },
            { name: 'Next', icon: <ArrowRightDuotone className="w-6 h-6 text-[var(--md-sys-color-primary)]" /> },
            { name: 'Back', icon: <ArrowLeftDuotone className="w-6 h-6 text-[var(--md-sys-color-primary)]" /> },
            { name: 'Calendar', icon: <CalendarBlankDuotone className="w-6 h-6 text-[var(--md-sys-color-primary)]" /> },
            { name: 'Filter', icon: <FunnelDuotone className="w-6 h-6 text-[var(--md-sys-color-primary)]" /> },
          ].map((item) => (
            <div key={item.name} className="flex flex-col items-center p-space3 border border-[var(--md-sys-color-outline-variant)] rounded-m bg-[var(--md-sys-color-surface-container-low)]">
              {item.icon}
              <span className="text-xs font-mono mt-space2 text-[var(--md-sys-color-on-surface-variant)]">{item.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. PRIMARY BUTTON GLOBAL STATE MATRIX (G) USING M3Pressable */}
      <section className="mb-space12">
        <h2 className="text-headlineSmall-emphasized font-display mb-space2">5. Global State Contract G (§2.2 & §5)</h2>
        <div className="border border-[var(--md-sys-color-outline-variant)] rounded-lPlus p-space6 bg-[var(--md-sys-color-surface-container-low)]">
          <div className="flex flex-wrap gap-space4 items-center">
            <div className="flex flex-col items-center gap-space1">
              <M3Pressable
                type="button"
                pair="primary"
                data-testid="state-btn-enabled"
                className="h-12 px-6 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-labelLarge-emphasized"
              >
                {COPY_UI.orderCta}
              </M3Pressable>
              <span className="text-[11px] font-mono">enabled</span>
            </div>

            <div className="flex flex-col items-center gap-space1">
              <M3Pressable
                type="button"
                pair="primary"
                simulatedState="hover"
                data-testid="state-btn-hover"
                className="h-12 px-6 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-labelLarge-emphasized"
              >
                {COPY_UI.orderCta}
              </M3Pressable>
              <span className="text-[11px] font-mono">hover (8%)</span>
            </div>

            <div className="flex flex-col items-center gap-space1">
              <M3Pressable
                type="button"
                pair="primary"
                simulatedState="focus"
                data-testid="state-btn-focus"
                className="h-12 px-6 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-labelLarge-emphasized"
              >
                {COPY_UI.orderCta}
              </M3Pressable>
              <span className="text-[11px] font-mono">focus (3px/3px)</span>
            </div>

            <div className="flex flex-col items-center gap-space1">
              <M3Pressable
                type="button"
                pair="primary"
                simulatedState="pressed"
                data-testid="state-btn-pressed"
                className="h-12 px-6 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-labelLarge-emphasized"
              >
                {COPY_UI.orderCta}
              </M3Pressable>
              <span className="text-[11px] font-mono">pressed (.98 / 16px)</span>
            </div>

            <div className="flex flex-col items-center gap-space1">
              <M3Pressable
                type="button"
                pair="primary"
                disabled
                data-testid="state-btn-disabled"
                className="h-12 px-6 rounded-full text-labelLarge-emphasized cursor-not-allowed"
              >
                {COPY_UI.orderCta}
              </M3Pressable>
              <span className="text-[11px] font-mono">disabled</span>
            </div>

            <div className="flex flex-col items-center gap-space1">
              <M3Pressable
                type="button"
                pair="primary"
                disabled
                aria-busy="true"
                data-testid="state-btn-loading"
                className="h-12 px-6 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-labelLarge-emphasized flex items-center gap-space2 cursor-wait"
              >
                <ArrowClockwiseDuotone className="w-4 h-4 animate-spin" />
                {COPY_LOADING.submit}
              </M3Pressable>
              <span className="text-[11px] font-mono">loading</span>
            </div>

            <div className="flex flex-col items-center gap-space1">
              <M3Pressable
                type="button"
                pair="error"
                className="h-12 px-6 rounded-full bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] text-labelLarge-emphasized flex items-center gap-space2"
              >
                <XCircleDuotone className="w-4 h-4" />
                {COPY_ORDER_STATUS.cancelled.label}
              </M3Pressable>
              <span className="text-[11px] font-mono">error</span>
            </div>

            <div className="flex flex-col items-center gap-space1">
              <M3Pressable
                type="button"
                pair="success"
                className="h-12 px-6 rounded-full bg-[var(--md-custom-color-success)] text-[var(--md-custom-color-on-success)] text-labelLarge-emphasized flex items-center gap-space2"
              >
                <CheckCircleDuotone className="w-4 h-4" />
                {COPY_ORDER_STATUS.delivered.label}
              </M3Pressable>
              <span className="text-[11px] font-mono">success</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. THE 18 §5 COMPONENTS */}
      <section className="mb-space12">
        <h2 className="text-headlineSmall-emphasized font-display mb-space4">6. The 18 §5 Components</h2>
        <div className="space-y-space6">
          {/* 1. Top app bar */}
          <div className="border border-[var(--md-sys-color-outline-variant)] rounded-lPlus p-space4 bg-[var(--md-sys-color-surface-container-low)]">
            <span className="text-labelMedium font-bold text-[var(--md-sys-color-primary)]">1. Top App Bar</span>
            <header className="mt-space2 h-16 w-full rounded-m bg-[var(--md-sys-color-surface-container)] shadow-elevation-2 px-space4 flex items-center justify-between">
              <a href="#top" className="flex items-center gap-space3 min-h-[48px]">
                <PrinterDuotone className="w-8 h-8 text-[var(--md-sys-color-primary)]" />
                <span className="text-titleMedium-emphasized">{COPY_UI.brandName}</span>
              </a>
              <nav className="hidden sm:flex items-center gap-space6 text-labelLarge">
                <a href="#beranda" aria-current="page" className="text-[var(--md-sys-color-primary)] border-b-2 border-[var(--md-sys-color-primary)] py-1 font-bold">
                  {COPY_UI.navHome}
                </a>
                <a href="#lacak" className="text-[var(--md-sys-color-on-surface-variant)]">{COPY_UI.navTrack}</a>
                <a href="#antrean" className="text-[var(--md-sys-color-on-surface-variant)]">{COPY_UI.navQueue}</a>
              </nav>
              <M3Pressable
                type="button"
                pair="surface"
                aria-label="Toggle theme"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-12 h-12 flex items-center justify-center rounded-full"
              >
                <CircleHalfDuotone className="w-6 h-6" />
              </M3Pressable>
            </header>
          </div>

          {/* 2. FAB */}
          <div className="border border-[var(--md-sys-color-outline-variant)] rounded-lPlus p-space4 bg-[var(--md-sys-color-surface-container-low)]">
            <span className="text-labelMedium font-bold text-[var(--md-sys-color-primary)]">2. Extended FAB</span>
            <div className="mt-space2 flex flex-wrap gap-space4 items-center">
              <M3Pressable
                type="button"
                pair="primaryContainer"
                className="h-14 px-5 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] shadow-elevation-3 flex items-center gap-space3 text-labelLarge-emphasized"
              >
                <FileTextDuotone className="w-6 h-6" />
                <span>{COPY_UI.orderCta}</span>
              </M3Pressable>
            </div>
          </div>

          {/* 3. Mobile Nav */}
          <div className="border border-[var(--md-sys-color-outline-variant)] rounded-lPlus p-space4 bg-[var(--md-sys-color-surface-container-low)]">
            <span className="text-labelMedium font-bold text-[var(--md-sys-color-primary)]">3. Mobile Navigation Bar</span>
            <nav className="mt-space2 h-20 max-w-sm rounded-m bg-[var(--md-sys-color-surface-container)] flex items-center justify-around px-space2">
              {[
                { label: COPY_UI.navHome, icon: <HouseDuotone className="w-6 h-6" />, active: true },
                { label: COPY_UI.navOrder, icon: <FileTextDuotone className="w-6 h-6" />, active: false },
                { label: COPY_UI.navTrack, icon: <MagnifyingGlassDuotone className="w-6 h-6" />, active: false },
                { label: COPY_UI.navQueue, icon: <ClockDuotone className="w-6 h-6" />, active: false },
              ].map((item) => (
                <a
                  key={item.label}
                  href={`#${item.label}`}
                  aria-current={item.active ? 'page' : undefined}
                  className="flex flex-col items-center gap-1 min-w-[80px] min-h-[48px] justify-center"
                >
                  <div
                    className={`w-16 h-8 rounded-full flex items-center justify-center ${
                      item.active
                        ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
                        : 'text-[var(--md-sys-color-on-surface-variant)]'
                    }`}
                  >
                    {item.icon}
                  </div>
                  <span className={item.active ? 'text-labelSmall-emphasized' : 'text-labelSmall'}>{item.label}</span>
                </a>
              ))}
            </nav>
          </div>

          {/* 4. Admin Rail */}
          <div className="border border-[var(--md-sys-color-outline-variant)] rounded-lPlus p-space4 bg-[var(--md-sys-color-surface-container-low)]">
            <span className="text-labelMedium font-bold text-[var(--md-sys-color-primary)]">4. Admin Rail / Drawer</span>
            <nav className="mt-space2 w-22 rounded-m bg-[var(--md-sys-color-surface-container)] p-space2 flex flex-col items-center gap-space3">
              {[
                { label: COPY_PAGES.admin.text001, icon: <FileTextDuotone className="w-6 h-6" />, active: true },
                { label: COPY_UI.navQueue, icon: <ReceiptDuotone className="w-6 h-6" />, active: false },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  aria-current={item.active ? 'page' : undefined}
                  style={getM3LayerVars('secondaryContainer')}
                  className={`m3-control w-16 min-h-[56px] rounded-m flex flex-col items-center justify-center ${
                    item.active
                      ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
                      : 'text-[var(--md-sys-color-on-surface-variant)]'
                  }`}
                >
                  <M3StateLayer />
                  {item.icon}
                  <span className="text-[10px] font-bold truncate max-w-[56px]">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* 5. Segmented Button */}
          <div className="border border-[var(--md-sys-color-outline-variant)] rounded-lPlus p-space4 bg-[var(--md-sys-color-surface-container-low)]">
            <span className="text-labelMedium font-bold text-[var(--md-sys-color-primary)]">5. Segmented Button</span>
            <div role="radiogroup" aria-label={COPY_PAGES.order.text013} className="mt-space2 flex items-center h-12 rounded-full border border-[var(--md-sys-color-outline)] overflow-hidden max-w-sm">
              {['A4', 'F4'].map((size) => {
                const selected = activeSegment === size;
                return (
                  <button
                    key={size}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setActiveSegment(size)}
                    style={getM3LayerVars('secondaryContainer')}
                    className={`m3-control flex-1 h-full flex items-center justify-center gap-space2 text-labelLarge ${
                      selected
                        ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-bold'
                        : 'text-[var(--md-sys-color-on-surface)]'
                    }`}
                  >
                    <M3StateLayer />
                    {selected && <CheckCircleDuotone className="w-5 h-5" />}
                    <span>{size}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Filter Chip */}
          <div className="border border-[var(--md-sys-color-outline-variant)] rounded-lPlus p-space4 bg-[var(--md-sys-color-surface-container-low)]">
            <span className="text-labelMedium font-bold text-[var(--md-sys-color-primary)]">6. Filter Chip</span>
            <div className="mt-space2 flex flex-wrap gap-space3 items-center">
              <M3Pressable
                type="button"
                pair="secondaryContainer"
                morphRadius={false}
                aria-pressed={chipSelected}
                onClick={() => setChipSelected(!chipSelected)}
                className={`min-h-[48px] px-space3 rounded-s border flex items-center gap-space2 text-labelMedium ${
                  chipSelected
                    ? 'border-transparent bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-bold'
                    : 'border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface-variant)]'
                }`}
              >
                {chipSelected && <CheckCircleDuotone className="w-4 h-4" />}
                <span>{COPY_ORDER_STATUS.pending_verification.label}</span>
              </M3Pressable>
            </div>
          </div>

          {/* 7. Stepper */}
          <div className="border border-[var(--md-sys-color-outline-variant)] rounded-lPlus p-space4 bg-[var(--md-sys-color-surface-container-low)]">
            <span className="text-labelMedium font-bold text-[var(--md-sys-color-primary)]">7. Stepper</span>
            <ol className="mt-space2 flex items-center justify-between max-w-md min-h-[72px]">
              {[COPY_UI.dropzonePdf, COPY_UI.dropzoneProof, COPY_UI.stepSubmit].map((step, i) => (
                <React.Fragment key={step}>
                  <li className="flex flex-col items-center gap-1" aria-current={i === 1 ? 'step' : undefined}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-labelMedium-emphasized ${
                        i === 0
                          ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
                          : i === 1
                            ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]'
                            : 'border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-outline)]'
                      }`}
                    >
                      {i === 0 ? <CheckCircleDuotone className="w-5 h-5" /> : i + 1}
                    </div>
                    <span className="text-labelSmall-emphasized">{step}</span>
                  </li>
                  {i < 3 - 1 && (
                    <div className="flex-1 h-0.5 bg-[var(--md-sys-color-outline-variant)] mx-2 -mt-4" />
                  )}
                </React.Fragment>
              ))}
            </ol>
          </div>

          {/* 8, 9, 10. Cards (N/A interactive container, interactive children only) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space4">
            <div className="p-space5 rounded-lPlus bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)]">
              <span className="text-labelMedium font-bold text-[var(--md-sys-color-primary)]">8. Filled Card (N/A state)</span>
              <p className="text-bodyMedium mt-space2">{COPY_PAGES.home.text005}</p>
            </div>
            <div className="p-space5 rounded-lPlus bg-[var(--md-sys-color-surface-container-low)] shadow-elevation-1 text-[var(--md-sys-color-on-surface)]">
              <span className="text-labelMedium font-bold text-[var(--md-sys-color-primary)]">9. Elevated Card (N/A state)</span>
              <p className="text-bodyMedium mt-space2">{COPY_ORDER_STATUS.approved.label}</p>
            </div>
            <div className="p-space5 rounded-l border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)]">
              <span className="text-labelMedium font-bold text-[var(--md-sys-color-primary)]">10. Outlined Card (N/A state)</span>
              <p className="text-bodyMedium mt-space2">{COPY_ORDER_STATUS.delivered.label}</p>
            </div>
          </div>

          {/* 11. Text Field */}
          <div className="border border-[var(--md-sys-color-outline-variant)] rounded-lPlus p-space4 bg-[var(--md-sys-color-surface-container-low)]">
            <span className="text-labelMedium font-bold text-[var(--md-sys-color-primary)]">11. Text Field</span>
            <div className="mt-space2 grid grid-cols-1 md:grid-cols-2 gap-space4 max-w-2xl">
              <div>
                <label htmlFor="demo-name" className="block text-labelSmall-emphasized mb-1">
                  {COPY_PAGES.order.text004}
                </label>
                <input
                  id="demo-name"
                  type="text"
                  defaultValue="Budi Santoso"
                  className="w-full h-14 px-space4 rounded-t-xs bg-[var(--md-sys-color-surface-container-highest)] border-b border-[var(--md-sys-color-outline)] text-bodyLarge"
                />
              </div>
              <div>
                <label htmlFor="demo-contact-err" className="block text-labelSmall-emphasized text-[var(--md-sys-color-error)] mb-1">
                  {COPY_PAGES.order.text005}
                </label>
                <input
                  id="demo-contact-err"
                  type="tel"
                  defaultValue="0812"
                  aria-invalid="true"
                  className="w-full h-14 px-space4 rounded-t-xs bg-[var(--md-sys-color-surface-container-highest)] border-b-2 border-[var(--md-sys-color-error)] text-bodyLarge"
                />
                <span className="text-bodySmall text-[var(--md-sys-color-error)] mt-1 block">{COPY_VALIDATION.contact}</span>
              </div>
            </div>
          </div>

          {/* 12. File Dropzone (Real <input type="file"> inside <label>) */}
          <div className="border border-[var(--md-sys-color-outline-variant)] rounded-lPlus p-space4 bg-[var(--md-sys-color-surface-container-low)]">
            <span className="text-labelMedium font-bold text-[var(--md-sys-color-primary)]">12. File Dropzone</span>
            <div className="mt-space2 grid grid-cols-1 md:grid-cols-2 gap-space4 max-w-2xl">
              <label className="min-h-[144px] p-space4 rounded-lPlus border-2 border-dashed border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface-container-low)] flex flex-col items-center justify-center text-center cursor-pointer">
                <input
                  type="file"
                  accept="application/pdf"
                  className="sr-only"
                  onChange={(e) => setPdfFileName(e.target.files?.[0]?.name ?? null)}
                />
                <UploadSimpleDuotone className="w-8 h-8 text-[var(--md-sys-color-primary)] mb-space2" />
                <span className="text-titleMedium-emphasized">{COPY_UI.dropzonePdf}</span>
                <span className="text-bodySmall text-[var(--md-sys-color-on-surface-variant)] mt-1">
                  {pdfFileName ?? COPY_UI.dropzonePdfHelper}
                </span>
              </label>
              <label className="min-h-[144px] p-space4 rounded-lPlus border-2 border-dashed border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface-container-low)] flex flex-col items-center justify-center text-center cursor-pointer">
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  className="sr-only"
                  onChange={(e) => setProofFileName(e.target.files?.[0]?.name ?? null)}
                />
                <ImageDuotone className="w-8 h-8 text-[var(--md-sys-color-primary)] mb-space2" />
                <span className="text-titleMedium-emphasized">{COPY_UI.dropzoneProof}</span>
                <span className="text-bodySmall text-[var(--md-sys-color-on-surface-variant)] mt-1">
                  {proofFileName ?? COPY_UI.dropzoneProofHelper}
                </span>
              </label>
            </div>
          </div>

          {/* 13. Toast / Snackbar */}
          <div className="border border-[var(--md-sys-color-outline-variant)] rounded-lPlus p-space4 bg-[var(--md-sys-color-surface-container-low)]">
            <span className="text-labelMedium font-bold text-[var(--md-sys-color-primary)]">13. Toast / Snackbar (m3Toast)</span>
            <div className="mt-space2 flex flex-wrap gap-space3 items-center">
              <M3Pressable
                type="button"
                pair="success"
                data-testid="toast-trigger-success"
                onClick={() => m3Toast.success(COPY_TOASTS.cancelSuccess)}
                className="min-h-[48px] px-4 rounded-full bg-[var(--md-custom-color-success)] text-[var(--md-custom-color-on-success)] text-labelMedium"
              >
                {COPY_TOASTS.cancelSuccess}
              </M3Pressable>
              <M3Pressable
                type="button"
                pair="secondaryContainer"
                data-testid="toast-trigger-info"
                onClick={() => m3Toast.info(COPY_TOASTS.approve)}
                className="min-h-[48px] px-4 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] text-labelMedium"
              >
                {COPY_TOASTS.approve}
              </M3Pressable>
              <M3Pressable
                type="button"
                pair="error"
                data-testid="toast-trigger-error"
                onClick={() => m3Toast.error(COPY_TOASTS.genericActionFailed)}
                className="min-h-[48px] px-4 rounded-full bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] text-labelMedium"
              >
                {COPY_TOASTS.genericActionFailed}
              </M3Pressable>
            </div>
          </div>

          {/* 14. Modal Dialog & 15. Bottom Sheet via M3ResponsiveDialog */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space4">
            <div className="border border-[var(--md-sys-color-outline-variant)] rounded-lPlus p-space4 bg-[var(--md-sys-color-surface-container-low)]">
              <span className="text-labelMedium font-bold text-[var(--md-sys-color-primary)]">14. Modal Dialog</span>
              <div className="mt-space2">
                <M3ResponsiveDialog
                  open={dialogOpen}
                  onOpenChange={setDialogOpen}
                  sheetOnMobile={false}
                  title={COPY_UI.cancelTitle}
                  description={COPY_UI.cancelBody}
                  trigger={
                    <M3Pressable
                      type="button"
                      pair="primary"
                      data-testid="open-dialog-btn"
                      className="min-h-[48px] px-6 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-labelLarge-emphasized"
                    >
                      {COPY_UI.cancelTitle}
                    </M3Pressable>
                  }
                  actions={
                    <>
                      <M3Pressable
                        type="button"
                        pair="surface"
                        onClick={() => setDialogOpen(false)}
                        className="min-h-[48px] px-6 rounded-full text-labelLarge text-[var(--md-sys-color-primary)]"
                      >
                        {COPY_UI.stepBack}
                      </M3Pressable>
                      <M3Pressable
                        type="button"
                        pair="error"
                        onClick={() => {
                          setDialogOpen(false);
                          m3Toast.success(COPY_TOASTS.cancelSuccess);
                        }}
                        className="min-h-[48px] px-6 rounded-full bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] text-labelLarge-emphasized"
                      >
                        {COPY_UI.cancel}
                      </M3Pressable>
                    </>
                  }
                >
                  <p className="text-bodyMedium text-[var(--md-sys-color-on-surface-variant)]">
                    {COPY_ORDER_STATUS.cancelled.sentence}
                  </p>
                </M3ResponsiveDialog>
              </div>
            </div>

            <div className="border border-[var(--md-sys-color-outline-variant)] rounded-lPlus p-space4 bg-[var(--md-sys-color-surface-container-low)]">
              <span className="text-labelMedium font-bold text-[var(--md-sys-color-primary)]">15. Responsive Sheet / Dialog</span>
              <div className="mt-space2">
                <M3ResponsiveDialog
                  open={sheetOpen}
                  onOpenChange={setSheetOpen}
                  sheetOnMobile={true}
                  title={COPY_PAGES.order.text003}
                  description={COPY_UI.qrisEstimate}
                  trigger={
                    <M3Pressable
                      type="button"
                      pair="secondaryContainer"
                      data-testid="open-sheet-btn"
                      className="min-h-[48px] px-6 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] text-labelLarge-emphasized"
                    >
                      {COPY_PAGES.order.text003}
                    </M3Pressable>
                  }
                  actions={
                    <M3Pressable
                      type="button"
                      pair="primary"
                      onClick={() => setSheetOpen(false)}
                      className="min-h-[48px] px-6 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-labelLarge-emphasized"
                    >
                      {COPY_UI.close}
                    </M3Pressable>
                  }
                >
                  <div className="p-space4 rounded-l bg-[var(--md-sys-color-surface-container)] font-code text-sm">
                    10 × 1 × Rp 500 = Rp 5.000
                  </div>
                </M3ResponsiveDialog>
              </div>
            </div>
          </div>

          {/* 16. Progress Indicator */}
          <div className="border border-[var(--md-sys-color-outline-variant)] rounded-lPlus p-space4 bg-[var(--md-sys-color-surface-container-low)]">
            <span className="text-labelMedium font-bold text-[var(--md-sys-color-primary)]">16. Progress Indicator (N/A state)</span>
            <div className="mt-space2 space-y-space4 max-w-md">
              <div role="progressbar" aria-valuenow={65} aria-valuemin={0} aria-valuemax={100} className="h-1 w-full bg-[var(--md-sys-color-secondary-container)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--md-sys-color-primary)] rounded-full" style={{ width: '65%' }} />
              </div>
              <div className="text-labelSmall">{COPY_LOADING.parse}</div>
              <div className="h-1 w-full bg-[var(--md-sys-color-secondary-container)] rounded-full overflow-hidden relative">
                <div data-testid="indeterminate-pulse" className="h-full w-12 bg-[var(--md-sys-color-primary)] rounded-full m3-pulse animate-pulse" />
              </div>
            </div>
          </div>

          {/* 17. Status Timeline (5 §7 steps) */}
          <div className="border border-[var(--md-sys-color-outline-variant)] rounded-lPlus p-space4 bg-[var(--md-sys-color-surface-container-low)]">
            <span className="text-labelMedium font-bold text-[var(--md-sys-color-primary)]">17. Status Timeline (N/A state)</span>
            <ol className="mt-space2 space-y-space3 max-w-md">
              {COPY_TIMELINE_STEPS.map((step, i) => (
                <li key={step} className="flex gap-space3 items-center" aria-current={i === 1 ? 'step' : undefined}>
                  {i === 0 ? (
                    <CheckCircleDuotone className="w-5 h-5 text-[var(--md-custom-color-success)]" />
                  ) : i === 1 ? (
                    <div className="w-5 h-5 rounded-full ring-2 ring-[var(--md-sys-color-primary)] flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[var(--md-sys-color-primary)]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-[var(--md-sys-color-outline)]" />
                  )}
                  <span className={i === 1 ? 'text-titleSmall-emphasized text-[var(--md-sys-color-primary)]' : 'text-titleSmall'}>
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* 18. Pickup-Code Display */}
          <div className="border border-[var(--md-sys-color-outline-variant)] rounded-lPlus p-space4 bg-[var(--md-sys-color-surface-container-low)]">
            <span className="text-labelMedium font-bold text-[var(--md-sys-color-primary)]">18. Pickup-Code Display</span>
            <div
              style={getM3LayerVars('primaryContainer', true)}
              className="mt-space2 p-space5 rounded-lPlus bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] max-w-md flex items-center justify-between"
            >
              <div>
                <span className="text-labelLarge font-bold">{COPY_UI.pickupLabel}</span>
                <div className="text-pickup font-code mt-1 select-all">ARSC-4821</div>
                <p className="text-bodySmall mt-1">{COPY_PAGES.success.text010}</p>
              </div>
              <M3Pressable
                type="button"
                pair="primaryContainer"
                aria-label={COPY_TOASTS.copyPickup}
                onClick={handleCopyPickup}
                className="w-12 h-12 rounded-full flex items-center justify-center"
              >
                {copied ? <CheckCircleDuotone className="w-6 h-6" /> : <CopyDuotone className="w-6 h-6" />}
              </M3Pressable>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
