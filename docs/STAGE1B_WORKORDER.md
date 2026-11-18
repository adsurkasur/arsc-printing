# Stage 1b Assembly Work Order (For Kiro)

Scope: Wire the precision foundations created in Stage 1b into `src/app/dev/tokens/TokensClient.tsx` and `src/app/layout.tsx`. Do **not** modify `scripts/check-copy.mjs`, `scripts/check-tokens.mjs`, `src/lib/copy.ts`, `src/lib/motion.ts`, `src/app/globals.css`, `src/components/ui/sonner.tsx`, or `src/components/m3/*`.

---

## 1. Copy Registry Wiring (Fix Item 3)

- **Target**: `src/app/dev/tokens/TokensClient.tsx`
- **Actions**:
  1. Replace all hard-coded Indonesian strings in `TokensClient.tsx` with keys from `src/lib/copy.ts` (`COPY_UI`, `COPY_TOASTS`, `COPY_LOADING`, `COPY_VALIDATION`, `COPY_TIMELINE_STEPS`, `COPY_STATUS_MAP`).
  2. In **Section 17 (Status Timeline)**: replace the 3-step example (including `"Siap Diambil"`) with the 5 steps from `COPY_TIMELINE_STEPS` (`Terkirim`, `Pembayaran diperiksa`, `Diproses`, `Hasil diperiksa`, `Diserahkan`).
  3. In **Section 13 (Toast / Snackbar)**:
     - Success trigger: `m3Toast.success(COPY_TOASTS.copyPickup)`
     - Info trigger: `m3Toast.info(COPY_TOASTS.approve)`
     - Error trigger: `m3Toast.error(COPY_TOASTS.genericActionFailed)`
     - Cancel success example: use `m3Toast.success(COPY_TOASTS.cancelSuccess)` (never `toast.error`).
  4. In **Section 18 (Pickup-Code Display)**:
     - Use `COPY_UI` / §6.3 helper copy (`Simpan kode ini untuk mengambil cetakan di meja sekretariat.` or exact registry key).
     - Copy button: `await navigator.clipboard.writeText('ARSC-4821')` inside `try/catch`; call `m3Toast.success(COPY_TOASTS.copyPickup)` only after `writeText` resolves, and `m3Toast.error(COPY_TOASTS.clipboardFailed)` in `catch`.
     - Use `M3Pressable` with `pair="primaryContainer"` and `disabledLayer={true}` (0% state-layer override on pickup container, interactive copy button uses `M3Pressable`).
- **Acceptance Check**:
  - Zero hard-coded status/toast/timeline strings in `TokensClient.tsx`.
  - `node scripts/check-copy.mjs` exits `0`.

---

## 2. 18-Component Matrix with Real Controls & States (Fix Item 6)

- **Target**: `src/app/dev/tokens/TokensClient.tsx`
- **Actions**:
  1. Replace static `div`/`span` mockups with real interactive HTML controls (`<button>`, `<input>`, `<a href>`, `<label>`, `<ol>`) and `M3Pressable` / `M3StateLayer` from `@/components/m3`.
  2. **Primary Button State Matrix**: use `M3Pressable` for `enabled`, `simulatedState="hover"`, `simulatedState="focus"`, `simulatedState="pressed"`, `disabled`, `aria-busy="true"` loading, error, and success.
  3. **Dropzone (Component 12)**: include a real `<input type="file" accept="application/pdf" />` and `<input type="file" accept="image/png,image/jpeg" />` inside `<label>` so keyboard/screen-reader users can browse files.
  4. **Mobile Nav (Component 3) & Admin Rail (Component 4)**: use real `<button type="button">` or `<a href="#...">` elements with `aria-current="page"` on the active item.
  5. **All 18 Components**: render or explicitly label `N/A` per §5 Global State Contract G (`enabled`, `hover`, `focus`, `pressed`, `disabled`, `loading`, `error`, `success`) without inventing fake states for non-interactive elements.
- **Acceptance Check**:
  - Every interactive element in the 18-component matrix is keyboard-focusable (`Tab`), shows `.m3-focus-ring` / `:focus-visible`, and uses `M3Pressable` or `.m3-control` + `M3StateLayer`.

---

## 3. Dialog & Bottom Sheet Wiring (Fix Item 7)

- **Target**: `src/app/dev/tokens/TokensClient.tsx` (Components 14 & 15)
- **Actions**:
  1. Replace the inline `DialogPrimitive` blocks in Components 14 and 15 with `M3ResponsiveDialog` from `@/components/m3`.
  2. Component 14 (Modal Dialog): set `sheetOnMobile={false}` (or default responsive) and ensure action buttons have `min-h-[48px]` (`h-12`).
  3. Component 15 (Bottom Sheet): set `sheetOnMobile={true}` so `<600px` renders as a bottom sheet with `.m3-sheet-handle` and `>=600px` renders as a centered dialog (`<=560px`).
- **Acceptance Check**:
  - Scrim computes to `rgba(0, 0, 0, 0.32)` via `.m3-scrim`.
  - At `1280px` viewport, Component 15 renders as a centered dialog (`<=560px`), not a full-width bottom sheet.
  - All dialog/sheet action buttons have height `>=48px`.

---

## 4. Swatch Backing, Display Font, & Hydration Guard (Fix Item 10)

- **Target**: `src/app/dev/tokens/TokensClient.tsx` & `src/app/layout.tsx`
- **Actions**:
  1. **Swatch Labels (`TokensClient.tsx`)**: move swatch text labels onto a consistent `bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)]` footer strip below the color block so light-on-light (e.g. `onPrimary` in light mode) is always readable.
  2. **Display/Headline Fonts (`TokensClient.tsx`)**: add `font-display` to the `<h1>` (`M3 Design System Tokens`) and all `<h2>` section headings (`text-headlineSmall-emphasized font-display`).
  3. **Hydration Guard (`src/app/layout.tsx`)**: add `suppressHydrationWarning` to the `<html>` element so `next-themes` class mutation does not trigger React hydration warnings.
- **Acceptance Check**:
  - Computed `font-family` on `<h1>` and `<h2>` resolves to `Bricolage Grotesque`.
  - Zero React hydration mismatch warnings in browser console.
  - All swatch labels have `>=4.5:1` contrast against their surface backing.
