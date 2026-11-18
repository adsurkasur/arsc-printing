'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import * as DialogPrimitive from '@radix-ui/react-dialog';
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
import { COPY_STATUS_MAP, COPY_TOASTS, COPY_UI, COPY_VALIDATION, COPY_LOADING } from '@/lib/copy';
import { motionTokens } from '@/lib/motion';

// All 49 M3 roles per §2
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

// 8 Semantic product tokens per §2.1
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

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--md-sys-color-background)] text-[var(--md-sys-color-on-background)] p-space4 md:p-space8">
      {/* Test Data Badge */}
      <div className="mb-space6 p-space3 bg-[var(--md-custom-color-warning-container)] text-[var(--md-custom-color-on-warning-container)] rounded-m text-sm font-medium flex items-center justify-between border border-[var(--md-custom-color-warning)]">
        <span>FIXTURE TEST DATA: /dev/tokens is for development inspection only (404 in production).</span>
        <span className="text-xs font-mono">ARSC M3 STAGE 1 VERIFICATION</span>
      </div>

      {/* Header & Theme Persistence Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space4 border-b border-[var(--md-sys-color-outline-variant)] pb-space6 mb-space8">
        <div>
          <h1 className="text-headlineLarge-emphasized text-[var(--md-sys-color-primary)]">M3 Design System Tokens</h1>
          <p className="text-bodyMedium text-[var(--md-sys-color-on-surface-variant)] mt-space1">
            M3_SPEC.md §2–§5 tokens, full type scale, 18-component matrix with 8 states, and verified theme switcher.
          </p>
        </div>
        <div className="flex items-center gap-space3">
          <span className="text-bodySmall text-[var(--md-sys-color-on-surface-variant)]">Theme ({mounted ? theme : 'loading'}):</span>
          <button
            type="button"
            data-testid="theme-toggle-light"
            onClick={() => setTheme('light')}
            className={`px-space3 py-space2 rounded-full text-labelMedium border ${theme === 'light' ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] border-transparent' : 'border-[var(--md-sys-color-outline)]'}`}
          >
            Light
          </button>
          <button
            type="button"
            data-testid="theme-toggle-dark"
            onClick={() => setTheme('dark')}
            className={`px-space3 py-space2 rounded-full text-labelMedium border ${theme === 'dark' ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] border-transparent' : 'border-[var(--md-sys-color-outline)]'}`}
          >
            Dark
          </button>
          <button
            type="button"
            data-testid="theme-toggle-system"
            onClick={() => setTheme('system')}
            className={`px-space3 py-space2 rounded-full text-labelMedium border ${theme === 'system' ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] border-transparent' : 'border-[var(--md-sys-color-outline)]'}`}
          >
            System
          </button>
        </div>
      </div>

      {/* 1. PALETTE SWATCHES: All 49 M3 roles + 8 Semantic roles */}
      <section className="mb-space12">
        <h2 className="text-headlineSmall-emphasized mb-space2">1. Color Tokens (§2 & §2.1)</h2>
        <p className="text-bodyMedium text-[var(--md-sys-color-on-surface-variant)] mb-space4">
          49 frozen M3 SchemeFidelity color roles and 8 semantic roles.
        </p>

        <h3 className="text-titleMedium-emphasized mb-space3">49 M3 Roles</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-space2 mb-space6">
          {M3_ROLES.map((role) => {
            const kebab = toKebab(role);
            return (
              <div
                key={role}
                className="p-space2 rounded-s border border-[var(--md-sys-color-outline-variant)] text-xs flex flex-col justify-between h-20 shadow-elevation-0"
                style={{
                  backgroundColor: `var(--md-sys-color-${kebab})`,
                  color: kebab.startsWith('on-') || kebab === 'scrim' || kebab === 'shadow'
                    ? '#ffffff'
                    : 'var(--md-sys-color-on-surface)',
                }}
              >
                <span className="font-mono text-[10px] truncate">{role}</span>
                <span className="text-[9px] opacity-75 truncate">--md-sys-color-{kebab}</span>
              </div>
            );
          })}
        </div>

        <h3 className="text-titleMedium-emphasized mb-space3">8 Semantic Product Roles</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-space2">
          {SEMANTIC_ROLES.map((role) => {
            const kebab = toKebab(role);
            return (
              <div
                key={role}
                className="p-space3 rounded-s border border-[var(--md-sys-color-outline-variant)] text-xs flex flex-col justify-between h-20 shadow-elevation-0"
                style={{
                  backgroundColor: `var(--md-custom-color-${kebab})`,
                  color: kebab.startsWith('on-') ? '#ffffff' : 'var(--md-sys-color-on-surface)',
                }}
              >
                <span className="font-mono text-[11px] font-bold">{role}</span>
                <span className="text-[10px] opacity-80">--md-custom-color-{kebab}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. TYPOGRAPHY SCALE: All 15 baseline + 15 emphasized + pickup/amount */}
      <section className="mb-space12">
        <h2 className="text-headlineSmall-emphasized mb-space2">2. Typography Scale (§3)</h2>
        <p className="text-bodyMedium text-[var(--md-sys-color-on-surface-variant)] mb-space4">
          Bricolage Grotesque (display), Plus Jakarta Sans (body), JetBrains Mono (code).
        </p>

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
            <span className="text-titleSmall font-body">Title Small 14/20 500</span>
            <span className="text-titleSmall-emphasized font-body">Emphasized 700</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-[var(--md-sys-color-outline-variant)] pb-space2">
            <span className="text-bodyLarge font-body">Body Large 16/24 400</span>
            <span className="text-bodyLarge-emphasized font-body">Emphasized 600</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-[var(--md-sys-color-outline-variant)] pb-space2">
            <span className="text-bodyMedium font-body">Body Medium 14/20 400</span>
            <span className="text-bodyMedium-emphasized font-body">Emphasized 600</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-[var(--md-sys-color-outline-variant)] pb-space2">
            <span className="text-bodySmall font-body">Body Small 12/16 400</span>
            <span className="text-bodySmall-emphasized font-body">Emphasized 600</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-[var(--md-sys-color-outline-variant)] pb-space2">
            <span className="text-labelLarge font-body">Label Large 14/20 500</span>
            <span className="text-labelLarge-emphasized font-body">Emphasized 700</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-[var(--md-sys-color-outline-variant)] pb-space2">
            <span className="text-labelMedium font-body">Label Medium 12/16 500</span>
            <span className="text-labelMedium-emphasized font-body">Emphasized 700</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-[var(--md-sys-color-outline-variant)] pb-space2">
            <span className="text-labelSmall font-body">Label Small 11/16 500</span>
            <span className="text-labelSmall-emphasized font-body">Emphasized 700</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-baseline justify-between pt-space2">
            <span className="text-pickup font-code text-[var(--md-sys-color-primary)]">Pickup Code: ARSC-4821 (28/36 600)</span>
            <span className="text-amount font-code text-[var(--md-sys-color-on-surface)]">Amount: Rp 15.000 (24/32 500/600)</span>
          </div>
        </div>
      </section>

      {/* 3. ELEVATION AND SHAPE TOKENS */}
      <section className="mb-space12">
        <h2 className="text-headlineSmall-emphasized mb-space2">3. Tonal Elevation & Shape Tokens (§3)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-space4">
          <div className="p-space4 rounded-lPlus bg-[var(--md-sys-color-surface)] shadow-elevation-0 border border-[var(--md-sys-color-outline-variant)]">
            <span className="text-labelMedium font-bold">Elevation 0</span>
            <p className="text-bodySmall text-[var(--md-sys-color-on-surface-variant)]">Surface / No shadow</p>
          </div>
          <div className="p-space4 rounded-lPlus bg-[var(--md-sys-color-surface-container-low)] shadow-elevation-1">
            <span className="text-labelMedium font-bold">Elevation 1</span>
            <p className="text-bodySmall text-[var(--md-sys-color-on-surface-variant)]">Low / 12% shadow</p>
          </div>
          <div className="p-space4 rounded-lPlus bg-[var(--md-sys-color-surface-container)] shadow-elevation-2">
            <span className="text-labelMedium font-bold">Elevation 2</span>
            <p className="text-bodySmall text-[var(--md-sys-color-on-surface-variant)]">Container / 14%</p>
          </div>
          <div className="p-space4 rounded-lPlus bg-[var(--md-sys-color-surface-container-high)] shadow-elevation-3">
            <span className="text-labelMedium font-bold">Elevation 3</span>
            <p className="text-bodySmall text-[var(--md-sys-color-on-surface-variant)]">High / 16%</p>
          </div>
          <div className="p-space4 rounded-lPlus bg-[var(--md-sys-color-surface-container-highest)] shadow-elevation-4">
            <span className="text-labelMedium font-bold">Elevation 4</span>
            <p className="text-bodySmall text-[var(--md-sys-color-on-surface-variant)]">Highest / 18%</p>
          </div>
          <div className="p-space4 rounded-lPlus bg-[var(--md-sys-color-surface-container-highest)] shadow-elevation-5">
            <span className="text-labelMedium font-bold">Elevation 5</span>
            <p className="text-bodySmall text-[var(--md-sys-color-on-surface-variant)]">Highest / 20%</p>
          </div>
        </div>
      </section>

      {/* 4. MOTION TOKENS */}
      <section className="mb-space12">
        <h2 className="text-headlineSmall-emphasized mb-space2">4. Motion Tokens (§4 Framer Motion)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space4">
          <div className="p-space4 rounded-l border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)]">
            <span className="text-labelLarge font-bold">Spatial Springs</span>
            <p className="text-bodySmall font-mono mt-space2">spatialFast: stiff 800, damp 32</p>
            <p className="text-bodySmall font-mono">spatialDefault: stiff 380, damp 31</p>
            <p className="text-bodySmall font-mono">spatialSlow: stiff 200, damp 24</p>
            <p className="text-bodySmall text-[var(--md-sys-color-on-surface-variant)] mt-space1">mass: 1, velocity: 0, restDelta: 0.01, restSpeed: 0.1</p>
          </div>
          <div className="p-space4 rounded-l border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)]">
            <span className="text-labelLarge font-bold">Effects Tweens</span>
            <p className="text-bodySmall font-mono mt-space2">effectsFast: 0.15s [0.31, 0.94, 0.34, 1.0]</p>
            <p className="text-bodySmall font-mono">effectsDefault: 0.20s [0.34, 0.80, 0.34, 1.0]</p>
            <p className="text-bodySmall font-mono">effectsSlow: 0.30s [0.34, 0.88, 0.34, 1.0]</p>
            <p className="text-bodySmall text-[var(--md-sys-color-on-surface-variant)] mt-space1">Colors and opacities (no overshoot)</p>
          </div>
          <div className="p-space4 rounded-l border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)]">
            <span className="text-labelLarge font-bold">Press & Reduced Motion</span>
            <p className="text-bodySmall font-mono mt-space2">press: scale 0.98, radius 16</p>
            <p className="text-bodySmall font-mono">reduced: transform 0s, opacity 0.10s linear</p>
            <p className="text-bodySmall text-[var(--md-sys-color-on-surface-variant)] mt-space1">Honors prefers-reduced-motion media</p>
          </div>
        </div>
      </section>

      {/* 5. PHOSPHOR DUOTONE ICONS MANIFEST (§3.1) */}
      <section className="mb-space12">
        <h2 className="text-headlineSmall-emphasized mb-space2">5. Phosphor Duotone Manifest (§3.1)</h2>
        <p className="text-bodyMedium text-[var(--md-sys-color-on-surface-variant)] mb-space4">
          All 23 static duotone SVG assets vendored with MIT LICENSE.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-space3">
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

      {/* 6. THE 18 §5 COMPONENTS ACROSS THE 8-STATE MATRIX */}
      <section className="mb-space12">
        <h2 className="text-headlineSmall-emphasized mb-space2">6. The 18 Components & State Matrix (§5)</h2>
        <p className="text-bodyMedium text-[var(--md-sys-color-on-surface-variant)] mb-space6">
          Global state contract G: enabled, hover (8% state layer), focus (10% + 3px ring/3px gap), pressed (scale 0.98, radius 16),
          disabled (38% fg/12% fill), loading (spinner + aria-busy), error, success.
        </p>

        {/* State Layers & Interactive Button Demo */}
        <div className="border border-[var(--md-sys-color-outline-variant)] rounded-lPlus p-space6 bg-[var(--md-sys-color-surface-container-low)] mb-space8">
          <h3 className="text-titleMedium-emphasized mb-space2">Primary Button Global State Matrix (G)</h3>
          <p className="text-bodySmall text-[var(--md-sys-color-on-surface-variant)] mb-space4">
            Test buttons across all states. Focus shows 3px primary ring with 3px surface offset; press applies spatialFast scale 0.98.
          </p>
          <div className="flex flex-wrap gap-space4 items-center">
            {/* Enabled */}
            <div className="flex flex-col items-center gap-space1">
              <button
                type="button"
                className="h-12 px-6 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-labelLarge-emphasized transition-transform duration-150 active:scale-[0.98] active:rounded-l hover:bg-[var(--md-sys-color-primary)]/90"
              >
                Enabled
              </button>
              <span className="text-[11px] font-mono text-[var(--md-sys-color-on-surface-variant)]">enabled</span>
            </div>

            {/* Hover simulated */}
            <div className="flex flex-col items-center gap-space1">
              <button
                type="button"
                className="h-12 px-6 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-labelLarge-emphasized relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/10 pointer-events-none" />
                Hover State
              </button>
              <span className="text-[11px] font-mono text-[var(--md-sys-color-on-surface-variant)]">hover (8%)</span>
            </div>

            {/* Focus simulated */}
            <div className="flex flex-col items-center gap-space1">
              <button
                type="button"
                className="h-12 px-6 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-labelLarge-emphasized ring-3 ring-[var(--md-sys-color-primary)] ring-offset-3 ring-offset-[var(--md-sys-color-surface)]"
              >
                Focus State
              </button>
              <span className="text-[11px] font-mono text-[var(--md-sys-color-on-surface-variant)]">focus ring</span>
            </div>

            {/* Pressed simulated */}
            <div className="flex flex-col items-center gap-space1">
              <button
                type="button"
                className="h-12 px-6 rounded-l scale-[0.98] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-labelLarge-emphasized relative"
              >
                <span className="absolute inset-0 bg-black/10 rounded-l pointer-events-none" />
                Pressed State
              </button>
              <span className="text-[11px] font-mono text-[var(--md-sys-color-on-surface-variant)]">pressed</span>
            </div>

            {/* Disabled */}
            <div className="flex flex-col items-center gap-space1">
              <button
                type="button"
                disabled
                className="h-12 px-6 rounded-full bg-[var(--md-sys-color-on-surface)]/12 text-[var(--md-sys-color-on-surface)]/38 text-labelLarge-emphasized cursor-not-allowed"
              >
                Disabled
              </button>
              <span className="text-[11px] font-mono text-[var(--md-sys-color-on-surface-variant)]">disabled</span>
            </div>

            {/* Loading */}
            <div className="flex flex-col items-center gap-space1">
              <button
                type="button"
                disabled
                aria-busy="true"
                className="h-12 px-6 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-labelLarge-emphasized flex items-center gap-space2 cursor-wait"
              >
                <ArrowClockwiseDuotone className="w-4 h-4 animate-spin" />
                {COPY_LOADING.submit}
              </button>
              <span className="text-[11px] font-mono text-[var(--md-sys-color-on-surface-variant)]">loading</span>
            </div>

            {/* Error */}
            <div className="flex flex-col items-center gap-space1">
              <button
                type="button"
                className="h-12 px-6 rounded-full bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] text-labelLarge-emphasized flex items-center gap-space2"
              >
                <XCircleDuotone className="w-4 h-4" />
                Error State
              </button>
              <span className="text-[11px] font-mono text-[var(--md-sys-color-on-surface-variant)]">error</span>
            </div>

            {/* Success */}
            <div className="flex flex-col items-center gap-space1">
              <button
                type="button"
                className="h-12 px-6 rounded-full bg-[var(--md-custom-color-success)] text-[var(--md-custom-color-on-success)] text-labelLarge-emphasized flex items-center gap-space2"
              >
                <CheckCircleDuotone className="w-4 h-4" />
                Success State
              </button>
              <span className="text-[11px] font-mono text-[var(--md-sys-color-on-surface-variant)]">success</span>
            </div>
          </div>
        </div>

        {/* The 18 Components Showcase */}
        <div className="space-y-space8">
          {/* 1. Top app bar */}
          <div className="border border-[var(--md-sys-color-outline-variant)] rounded-lPlus p-space4 bg-[var(--md-sys-color-surface-container-low)]">
            <span className="text-labelMedium font-bold text-[var(--md-sys-color-primary)]">1. Top App Bar (§5)</span>
            <div className="mt-space2 h-16 w-full rounded-m bg-[var(--md-sys-color-surface-container)] shadow-elevation-2 px-space4 flex items-center justify-between">
              <div className="flex items-center gap-space3">
                <PrinterDuotone className="w-8 h-8 text-[var(--md-sys-color-primary)]" />
                <span className="text-titleMedium-emphasized">ARSC Printing</span>
              </div>
              <div className="hidden sm:flex items-center gap-space6 text-labelLarge">
                <span className="text-[var(--md-sys-color-primary)] border-b-2 border-[var(--md-sys-color-primary)] py-1 font-bold">Beranda</span>
                <span className="text-[var(--md-sys-color-on-surface-variant)]">Lacak pesanan</span>
                <span className="text-[var(--md-sys-color-on-surface-variant)]">Antrean</span>
              </div>
              <div className="flex items-center gap-space2">
                <button type="button" className="w-12 h-12 flex items-center justify-center rounded-full text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-on-surface)]/8">
                  <CircleHalfDuotone className="w-6 h-6" />
                </button>
              </div>
            </div>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-space2">States: static surface at top → surfaceContainer elevation 2 on scroll.</p>
          </div>

          {/* 2. FAB */}
          <div className="border border-[var(--md-sys-color-outline-variant)] rounded-lPlus p-space4 bg-[var(--md-sys-color-surface-container-low)]">
            <span className="text-labelMedium font-bold text-[var(--md-sys-color-primary)]">2. Extended FAB (§5)</span>
            <div className="mt-space2 flex flex-wrap gap-space4 items-center">
              <button
                type="button"
                className="h-14 px-5 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] shadow-elevation-3 flex items-center gap-space3 text-labelLarge-emphasized transition-all duration-150 hover:shadow-elevation-4 active:scale-[0.98] active:rounded-l"
              >
                <FileTextDuotone className="w-6 h-6" />
                <span>Buat pesanan</span>
              </button>
              <button
                type="button"
                disabled
                aria-busy="true"
                className="h-14 px-5 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] shadow-elevation-3 flex items-center gap-space3 text-labelLarge-emphasized cursor-wait opacity-80"
              >
                <ArrowClockwiseDuotone className="w-6 h-6 animate-spin" />
                <span>Buat pesanan</span>
              </button>
            </div>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-space2">States: enabled, hover (elevation 4), pressed (radius 16, scale 0.98), loading (spinner).</p>
          </div>

          {/* 3. Mobile Navigation Bar */}
          <div className="border border-[var(--md-sys-color-outline-variant)] rounded-lPlus p-space4 bg-[var(--md-sys-color-surface-container-low)]">
            <span className="text-labelMedium font-bold text-[var(--md-sys-color-primary)]">3. Mobile Navigation Bar (§5)</span>
            <div className="mt-space2 h-20 max-w-sm rounded-m bg-[var(--md-sys-color-surface-container)] flex items-center justify-around px-space2">
              <div className="flex flex-col items-center gap-1">
                <div className="w-16 h-8 rounded-full bg-[var(--md-sys-color-secondary-container)] flex items-center justify-center text-[var(--md-sys-color-on-secondary-container)]">
                  <HouseDuotone className="w-6 h-6" />
                </div>
                <span className="text-labelSmall-emphasized text-[var(--md-sys-color-on-surface)]">Beranda</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-16 h-8 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)]">
                  <FileTextDuotone className="w-6 h-6" />
                </div>
                <span className="text-labelSmall text-[var(--md-sys-color-on-surface-variant)]">Pesan</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-16 h-8 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)]">
                  <MagnifyingGlassDuotone className="w-6 h-6" />
                </div>
                <span className="text-labelSmall text-[var(--md-sys-color-on-surface-variant)]">Lacak</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-16 h-8 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)]">
                  <ClockDuotone className="w-6 h-6" />
                </div>
                <span className="text-labelSmall text-[var(--md-sys-color-on-surface-variant)]">Antrean</span>
              </div>
            </div>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-space2">States: 4 equal destinations, active indicator 64×32 secondaryContainer spatialFast.</p>
          </div>

          {/* 4. Admin Rail / Drawer */}
          <div className="border border-[var(--md-sys-color-outline-variant)] rounded-lPlus p-space4 bg-[var(--md-sys-color-surface-container-low)]">
            <span className="text-labelMedium font-bold text-[var(--md-sys-color-primary)]">4. Admin Rail / Drawer (§5)</span>
            <div className="mt-space2 w-22 rounded-m bg-[var(--md-sys-color-surface-container)] p-space2 flex flex-col items-center gap-space3">
              <div className="w-16 h-14 rounded-m bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] flex flex-col items-center justify-center">
                <FileTextDuotone className="w-6 h-6" />
                <span className="text-[10px] font-bold">Pesanan</span>
              </div>
              <div className="w-16 h-14 rounded-m text-[var(--md-sys-color-on-surface-variant)] flex flex-col items-center justify-center hover:bg-[var(--md-sys-color-on-surface)]/8">
                <ReceiptDuotone className="w-6 h-6" />
                <span className="text-[10px]">Rekap</span>
              </div>
              <div className="w-16 h-14 rounded-m text-[var(--md-sys-color-on-surface-variant)] flex flex-col items-center justify-center hover:bg-[var(--md-sys-color-on-surface)]/8">
                <PrinterDuotone className="w-6 h-6" />
                <span className="text-[10px]">Perangkat</span>
              </div>
            </div>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-space2">States: rail 88 left under bar on desktop; drawer on mobile; Keluar at bottom.</p>
          </div>

          {/* 5. Segmented Button */}
          <div className="border border-[var(--md-sys-color-outline-variant)] rounded-lPlus p-space4 bg-[var(--md-sys-color-surface-container-low)]">
            <span className="text-labelMedium font-bold text-[var(--md-sys-color-primary)]">5. Segmented Button (§5)</span>
            <div className="mt-space2 flex items-center h-12 rounded-full border border-[var(--md-sys-color-outline)] overflow-hidden max-w-sm">
              {['A4', 'F4'].map((size) => {
                const selected = activeSegment === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setActiveSegment(size)}
                    className={`flex-1 h-full flex items-center justify-center gap-space2 text-labelLarge transition-colors duration-150 ${
                      selected
                        ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-bold'
                        : 'text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-on-surface)]/8'
                    }`}
                  >
                    {selected && <CheckCircleDuotone className="w-5 h-5" />}
                    <span>{size}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-space2">States: enabled, hover, pressed, selected (secondaryContainer + check), disabled locked.</p>
          </div>

          {/* 6. Filter Chip */}
          <div className="border border-[var(--md-sys-color-outline-variant)] rounded-lPlus p-space4 bg-[var(--md-sys-color-surface-container-low)]">
            <span className="text-labelMedium font-bold text-[var(--md-sys-color-primary)]">6. Filter Chip (§5)</span>
            <div className="mt-space2 flex flex-wrap gap-space3 items-center">
              <button
                type="button"
                onClick={() => setChipSelected(!chipSelected)}
                className={`h-8 px-space3 rounded-s border flex items-center gap-space2 text-labelMedium transition-colors ${
                  chipSelected
                    ? 'border-transparent bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-bold'
                    : 'border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-on-surface)]/8'
                }`}
              >
                {chipSelected && <CheckCircleDuotone className="w-4 h-4" />}
                <span>Semua Status</span>
              </button>
              <button
                type="button"
                disabled
                className="h-8 px-space3 rounded-s border border-[var(--md-sys-color-outline-variant)]/50 text-[var(--md-sys-color-on-surface)]/38 cursor-not-allowed text-labelMedium"
              >
                Dinonaktifkan
              </button>
            </div>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-space2">States: visual h32, hit 48, s8 radius, outlineVariant → secondaryContainer + check on select.</p>
          </div>

          {/* 7. Stepper */}
          <div className="border border-[var(--md-sys-color-outline-variant)] rounded-lPlus p-space4 bg-[var(--md-sys-color-surface-container-low)]">
            <span className="text-labelMedium font-bold text-[var(--md-sys-color-primary)]">7. Stepper (§5)</span>
            <ol className="mt-space2 flex items-center justify-between max-w-md min-h-[72px]">
              <li className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] flex items-center justify-center font-bold">
                  <CheckCircleDuotone className="w-5 h-5" />
                </div>
                <span className="text-labelSmall-emphasized text-[var(--md-sys-color-on-surface)]">Berkas</span>
              </li>
              <div className="flex-1 h-0.5 bg-[var(--md-sys-color-primary)] mx-2 -mt-4" />
              <li className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] flex items-center justify-center text-labelMedium-emphasized">
                  2
                </div>
                <span className="text-labelSmall-emphasized text-[var(--md-sys-color-primary)]">Pembayaran</span>
              </li>
              <div className="flex-1 h-0.5 bg-[var(--md-sys-color-outline-variant)] mx-2 -mt-4" />
              <li className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-outline)] flex items-center justify-center text-labelMedium">
                  3
                </div>
                <span className="text-labelSmall text-[var(--md-sys-color-outline)]">Kirim</span>
              </li>
            </ol>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-space2">States: completed (secondaryContainer + check), current (primary), future (neutral outline).</p>
          </div>

          {/* 8. Filled Card */}
          <div className="border border-[var(--md-sys-color-outline-variant)] rounded-lPlus p-space4 bg-[var(--md-sys-color-surface-container-low)]">
            <span className="text-labelMedium font-bold text-[var(--md-sys-color-primary)]">8. Filled Card (§5)</span>
            <div className="mt-space2 p-space5 rounded-lPlus bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] max-w-md">
              <span className="text-titleMedium-emphasized">Tarif yang jelas</span>
              <p className="text-bodyMedium mt-space2">Hitam putih: Rp 500 per halaman<br />Warna: Rp 750 per halaman</p>
            </div>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-space2">States: surfaceContainerHighest, no border/shadow, radius lPlus (20px).</p>
          </div>

          {/* 9. Elevated Card */}
          <div className="border border-[var(--md-sys-color-outline-variant)] rounded-lPlus p-space4 bg-[var(--md-sys-color-surface-container-low)]">
            <span className="text-labelMedium font-bold text-[var(--md-sys-color-primary)]">9. Elevated Card (§5)</span>
            <div className="mt-space2 p-space5 rounded-lPlus bg-[var(--md-sys-color-surface-container-low)] shadow-elevation-1 hover:shadow-elevation-2 transition-shadow duration-200 text-[var(--md-sys-color-on-surface)] max-w-md">
              <span className="text-titleMedium-emphasized">Pesanan Aktif: ARSC-4821</span>
              <p className="text-bodySmall text-[var(--md-sys-color-on-surface-variant)] mt-space1">Sedang dicetak petugas di sekretariat.</p>
            </div>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-space2">States: surfaceContainerLow, shadow elevation-1 (12%) → elevation-2 (14%) on hover.</p>
          </div>

          {/* 10. Outlined Card */}
          <div className="border border-[var(--md-sys-color-outline-variant)] rounded-lPlus p-space4 bg-[var(--md-sys-color-surface-container-low)]">
            <span className="text-labelMedium font-bold text-[var(--md-sys-color-primary)]">10. Outlined Card (§5)</span>
            <div className="mt-space2 p-space5 rounded-l border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] max-w-md">
              <span className="text-titleMedium-emphasized">Riwayat Pesanan</span>
              <p className="text-bodySmall text-[var(--md-sys-color-on-surface-variant)] mt-space1">2 pesanan selesai sebelumnya.</p>
            </div>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-space2">States: surface, border outlineVariant, radius l (16px), selected border 2 primary.</p>
          </div>

          {/* 11. Text Field */}
          <div className="border border-[var(--md-sys-color-outline-variant)] rounded-lPlus p-space4 bg-[var(--md-sys-color-surface-container-low)]">
            <span className="text-labelMedium font-bold text-[var(--md-sys-color-primary)]">11. Text Field (§5)</span>
            <div className="mt-space2 grid grid-cols-1 md:grid-cols-3 gap-space4 max-w-3xl">
              <div>
                <label className="block text-labelSmall-emphasized text-[var(--md-sys-color-on-surface-variant)] mb-1">
                  Nama lengkap
                </label>
                <input
                  type="text"
                  placeholder="Nama pemesan"
                  defaultValue="Budi Santoso"
                  className="w-full h-14 px-space4 rounded-t-xs bg-[var(--md-sys-color-surface-container-highest)] border-b border-[var(--md-sys-color-outline)] text-bodyLarge focus:border-b-2 focus:border-[var(--md-sys-color-primary)] focus:outline-none"
                />
                <span className="text-bodySmall text-[var(--md-sys-color-on-surface-variant)] mt-1 block">Nama untuk tanda terima</span>
              </div>
              <div>
                <label className="block text-labelSmall-emphasized text-[var(--md-sys-color-error)] mb-1">
                  Nomor WhatsApp (Error)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    defaultValue="0812abc"
                    aria-invalid="true"
                    className="w-full h-14 px-space4 rounded-t-xs bg-[var(--md-sys-color-surface-container-highest)] border-b-2 border-[var(--md-sys-color-error)] text-bodyLarge pr-10 focus:outline-none"
                  />
                  <XCircleDuotone className="w-5 h-5 text-[var(--md-sys-color-error)] absolute right-3 top-4.5" />
                </div>
                <span className="text-bodySmall text-[var(--md-sys-color-error)] mt-1 block">{COPY_VALIDATION.contact}</span>
              </div>
              <div>
                <label className="block text-labelSmall-emphasized text-[var(--md-sys-color-on-surface-variant)]/38 mb-1">
                  Catatan (Disabled)
                </label>
                <input
                  type="text"
                  disabled
                  defaultValue="Terkunci"
                  className="w-full h-14 px-space4 rounded-t-xs bg-[var(--md-sys-color-surface-container-highest)]/40 border-b border-[var(--md-sys-color-outline)]/20 text-bodyLarge text-[var(--md-sys-color-on-surface)]/38 cursor-not-allowed"
                />
              </div>
            </div>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-space2">States: persistent label, 56min high, filled surfaceContainerHighest, xs4 top radius, border bottom outline.</p>
          </div>

          {/* 12. File Dropzone */}
          <div className="border border-[var(--md-sys-color-outline-variant)] rounded-lPlus p-space4 bg-[var(--md-sys-color-surface-container-low)]">
            <span className="text-labelMedium font-bold text-[var(--md-sys-color-primary)]">12. File Dropzone (§5)</span>
            <div className="mt-space2 grid grid-cols-1 md:grid-cols-2 gap-space4 max-w-2xl">
              {/* Document Dropzone */}
              <div className="min-h-[144px] md:min-h-[160px] p-space4 rounded-lPlus border-2 border-dashed border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface-container-low)] flex flex-col items-center justify-center text-center">
                <UploadSimpleDuotone className="w-8 h-8 text-[var(--md-sys-color-primary)] mb-space2" />
                <span className="text-titleMedium-emphasized">Dokumen PDF</span>
                <span className="text-bodySmall text-[var(--md-sys-color-on-surface-variant)] mt-1">PDF saja, maksimal 10 MiB.</span>
              </div>
              {/* Proof Dropzone */}
              <div className="min-h-[144px] md:min-h-[160px] p-space4 rounded-lPlus border-2 border-dashed border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface-container-low)] flex flex-col items-center justify-center text-center">
                <ImageDuotone className="w-8 h-8 text-[var(--md-sys-color-primary)] mb-space2" />
                <span className="text-titleMedium-emphasized">Bukti pembayaran</span>
                <span className="text-bodySmall text-[var(--md-sys-color-on-surface-variant)] mt-1">PNG atau JPEG, maksimal 5 MiB.</span>
              </div>
            </div>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-space2">States: enabled, drag-over (primaryContainer/border primary), error inline, success solid outline.</p>
          </div>

          {/* 13. Toast / Snackbar Trigger */}
          <div className="border border-[var(--md-sys-color-outline-variant)] rounded-lPlus p-space4 bg-[var(--md-sys-color-surface-container-low)]">
            <span className="text-labelMedium font-bold text-[var(--md-sys-color-primary)]">13. Toast / Snackbar (§5 Sonner Provider)</span>
            <div className="mt-space2 flex flex-wrap gap-space3 items-center">
              <button
                type="button"
                onClick={() => toast.success(COPY_TOASTS.copyPickup)}
                className="h-10 px-4 rounded-full bg-[var(--md-custom-color-success)] text-[var(--md-custom-color-on-success)] text-labelMedium"
              >
                Trigger Success (4s)
              </button>
              <button
                type="button"
                onClick={() => toast.info('Pesanan telah disetujui petugas.', { duration: 6000 })}
                className="h-10 px-4 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] text-labelMedium"
              >
                Trigger Info (6s)
              </button>
              <button
                type="button"
                onClick={() => toast.error(COPY_TOASTS.genericActionFailed, { duration: Infinity })}
                className="h-10 px-4 rounded-full bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] text-labelMedium"
              >
                Trigger Error (Persistent)
              </button>
            </div>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-space2">States: inverseSurface container, inverseOnSurface text, close hit target 48px, max-w 400px.</p>
          </div>

          {/* 14. Dialog (Radix Primitive) */}
          <div className="border border-[var(--md-sys-color-outline-variant)] rounded-lPlus p-space4 bg-[var(--md-sys-color-surface-container-low)]">
            <span className="text-labelMedium font-bold text-[var(--md-sys-color-primary)]">14. Modal Dialog (§5 Radix Primitive)</span>
            <div className="mt-space2">
              <DialogPrimitive.Root open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogPrimitive.Trigger asChild>
                  <button
                    type="button"
                    className="h-12 px-6 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-labelLarge-emphasized"
                  >
                    Buka Konfirmasi Dialog
                  </button>
                </DialogPrimitive.Trigger>
                <DialogPrimitive.Portal>
                  <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/32 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                  <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 grid w-[calc(100vw-32px)] max-w-[560px] max-h-[calc(100dvh-48px)] translate-x-[-50%] translate-y-[-50%] gap-space4 rounded-xl bg-[var(--md-sys-color-surface-container-high)] p-space6 shadow-elevation-3 overflow-y-auto">
                    <DialogPrimitive.Title className="text-headlineSmall-emphasized text-[var(--md-sys-color-on-surface)]">
                      Konfirmasi Pembatalan Pesanan
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Description className="text-bodyLarge text-[var(--md-sys-color-on-surface-variant)]">
                      Pesanan yang dibatalkan tidak dapat dipulihkan. Apakah Anda yakin ingin membatalkan pesanan ini?
                    </DialogPrimitive.Description>
                    <div className="flex justify-end gap-space2 mt-space4">
                      <DialogPrimitive.Close asChild>
                        <button
                          type="button"
                          className="h-10 px-4 rounded-full text-labelLarge text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-on-surface)]/8"
                        >
                          Kembali
                        </button>
                      </DialogPrimitive.Close>
                      <button
                        type="button"
                        onClick={() => {
                          setDialogOpen(false);
                          toast.error('Pesanan dibatalkan.');
                        }}
                        className="h-10 px-4 rounded-full bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] text-labelLarge font-bold"
                      >
                        Batalkan Pesanan
                      </button>
                    </div>
                  </DialogPrimitive.Content>
                </DialogPrimitive.Portal>
              </DialogPrimitive.Root>
            </div>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-space2">States: Radix portal, scrim 32%, surfaceContainerHigh, radius xl (28px), width min(560, 100vw-32), Escape closes, focus trap.</p>
          </div>

          {/* 15. Bottom Sheet (Radix Primitive) */}
          <div className="border border-[var(--md-sys-color-outline-variant)] rounded-lPlus p-space4 bg-[var(--md-sys-color-surface-container-low)]">
            <span className="text-labelMedium font-bold text-[var(--md-sys-color-primary)]">15. Bottom Sheet (§5 Mobile Radix Sheet)</span>
            <div className="mt-space2">
              <DialogPrimitive.Root open={sheetOpen} onOpenChange={setSheetOpen}>
                <DialogPrimitive.Trigger asChild>
                  <button
                    type="button"
                    className="h-12 px-6 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] text-labelLarge-emphasized"
                  >
                    Buka Rincian Bottom Sheet
                  </button>
                </DialogPrimitive.Trigger>
                <DialogPrimitive.Portal>
                  <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/32" />
                  <DialogPrimitive.Content className="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] rounded-t-xl bg-[var(--md-sys-color-surface-container-high)] shadow-elevation-3 p-space6 overflow-y-auto">
                    {/* Drag Handle */}
                    <div className="w-8 h-1 rounded-full bg-[var(--md-sys-color-outline-variant)] mx-auto mb-space4" />
                    <DialogPrimitive.Title className="text-headlineSmall-emphasized text-[var(--md-sys-color-on-surface)]">
                      Rincian Biaya Cetak
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Description className="text-bodyMedium text-[var(--md-sys-color-on-surface-variant)] mt-space2">
                      Estimasi; tagihan akhir dihitung dari berkas oleh server.
                    </DialogPrimitive.Description>
                    <div className="mt-space4 p-space4 rounded-l bg-[var(--md-sys-color-surface-container)] font-mono text-sm">
                      10 halaman × 1 salinan × Rp 500 = Rp 5.000
                    </div>
                    <div className="mt-space6 flex justify-end">
                      <DialogPrimitive.Close asChild>
                        <button
                          type="button"
                          className="h-12 px-6 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-labelLarge-emphasized"
                        >
                          Tutup
                        </button>
                      </DialogPrimitive.Close>
                    </div>
                  </DialogPrimitive.Content>
                </DialogPrimitive.Portal>
              </DialogPrimitive.Root>
            </div>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-space2">States: mobile &lt;600, top radius 28px, handle 32×4 outlineVariant, max-h 85dvh, internal scroll.</p>
          </div>

          {/* 16. Progress Indicator */}
          <div className="border border-[var(--md-sys-color-outline-variant)] rounded-lPlus p-space4 bg-[var(--md-sys-color-surface-container-low)]">
            <span className="text-labelMedium font-bold text-[var(--md-sys-color-primary)]">16. Progress Indicator (§5)</span>
            <div className="mt-space2 space-y-space4 max-w-md">
              <div>
                <div className="flex justify-between text-labelSmall mb-1">
                  <span>Determinate (Byte upload: 65%)</span>
                  <span>65%</span>
                </div>
                <div className="h-1 w-full bg-[var(--md-sys-color-secondary-container)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--md-sys-color-primary)] rounded-full" style={{ width: '65%' }} />
                </div>
              </div>
              <div>
                <div className="text-labelSmall mb-1">Indeterminate (Memeriksa PDF...)</div>
                <div className="h-1 w-full bg-[var(--md-sys-color-secondary-container)] rounded-full overflow-hidden relative">
                  <div className="h-full w-12 bg-[var(--md-sys-color-primary)] rounded-full animate-[pulse_1.2s_linear_infinite]" />
                </div>
              </div>
            </div>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-space2">States: determinate linear h4 track secondaryContainer / active primary; indeterminate wavy/pulse loop.</p>
          </div>

          {/* 17. Status Timeline */}
          <div className="border border-[var(--md-sys-color-outline-variant)] rounded-lPlus p-space4 bg-[var(--md-sys-color-surface-container-low)]">
            <span className="text-labelMedium font-bold text-[var(--md-sys-color-primary)]">17. Status Timeline (§5)</span>
            <ol className="mt-space2 space-y-space4 max-w-md">
              <li className="flex gap-space3 items-start">
                <CheckCircleDuotone className="w-5 h-5 text-[var(--md-custom-color-success)] mt-0.5" />
                <div>
                  <span className="text-titleSmall-emphasized">Pesanan Dibuat</span>
                  <p className="text-bodySmall text-[var(--md-sys-color-on-surface-variant)]">10:15 WIB</p>
                </div>
              </li>
              <li className="flex gap-space3 items-start">
                <div className="w-5 h-5 rounded-full ring-2 ring-[var(--md-sys-color-primary)] flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-[var(--md-sys-color-primary)]" />
                </div>
                <div>
                  <span className="text-titleSmall-emphasized text-[var(--md-sys-color-primary)]">Menunggu Verifikasi Pembayaran</span>
                  <p className="text-bodySmall text-[var(--md-sys-color-on-surface-variant)]">Sedang diperiksa petugas</p>
                </div>
              </li>
              <li className="flex gap-space3 items-start opacity-50">
                <div className="w-5 h-5 rounded-full border border-[var(--md-sys-color-outline)] mt-0.5" />
                <div>
                  <span className="text-titleSmall">Siap Diambil</span>
                  <p className="text-bodySmall text-[var(--md-sys-color-on-surface-variant)]">Belum selesai</p>
                </div>
              </li>
            </ol>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-space2">States: done (check success), current (ring primary), future (outline).</p>
          </div>

          {/* 18. Pickup-Code Display */}
          <div className="border border-[var(--md-sys-color-outline-variant)] rounded-lPlus p-space4 bg-[var(--md-sys-color-surface-container-low)]">
            <span className="text-labelMedium font-bold text-[var(--md-sys-color-primary)]">18. Pickup-Code Display (§5)</span>
            <div className="mt-space2 p-space5 rounded-lPlus bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] max-w-md flex items-center justify-between">
              <div>
                <span className="text-labelLarge font-bold">Kode ambil</span>
                <div className="text-pickup font-code mt-1 select-all">ARSC-4821</div>
                <p className="text-bodySmall opacity-80 mt-1">Simpan kode ini untuk mengambil cetakan di meja sekretariat.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText('ARSC-4821');
                  setCopied(true);
                  toast.success(COPY_TOASTS.copyPickup);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--md-sys-color-on-primary-container)]/10 hover:bg-[var(--md-sys-color-on-primary-container)]/20 active:scale-95"
                title="Salin kode ambil"
              >
                {copied ? <CheckCircleDuotone className="w-6 h-6" /> : <CopyDuotone className="w-6 h-6" />}
              </button>
            </div>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-space2">States: primaryContainer/onPrimaryContainer, radius 20, selectable code font-code 28/36, copy 48hit target.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
