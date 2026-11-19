# ARSC Printing — Material 3 Expressive implementation specification

Version 1.2 · 18 November 2026 · Stage 0 · Author: Atlas · Review gate: Soren.
Status: specification ready for review; no redesigned UI has been implemented or visually accepted.
Hallmark pre-emit self-review (document, not rendered UI): Philosophy 4 / Hierarchy 4 / Execution 4 / Specificity 5 / Restraint 4 / Variety 4.

## 0. Authority, product truth and implementation boundary

This is the implementation authority for the redesign. Kiro implements these decisions; do not choose a different palette, typeface, layout, icon family, interaction, or copy. If an existing API cannot supply something specified here, report the mismatch; do not fabricate it or change the API. Soren reviews this document before Stage 1. Each later stage requires screenshots opened by a reviewer before the next stage.

Product: campus document printing by Agritech Research and Study Club (ARSC), Universitas Brawijaya. Students send a PDF and payment proof; an operator verifies payment, approves a job, checks the result, and records handover. A short pickup code identifies an order at the desk; it is NOT an access credential. The capability cookie remains required for customer detail/cancellation. Public queue exposes aggregates only. Payment verification is manual, not QRIS settlement. Printer-service completion alone does not prove physical output. Current worker uses a fake printer: preserve a visible simulation disclosure wherever that environment is shown.

Confirmed brand expansion: **Fakultas Teknologi Agroindustri dan Biosistem (FTAB)**. Footer full text: “Agritech Research and Study Club · Fakultas Teknologi Agroindustri dan Biosistem (FTAB), Universitas Brawijaya”. Location copied from incumbent content with faculty renamed: “Sekretariat ARSC, Gedung A, FTAB UB”. This does not independently verify the building location. No numerical opening hours, contact number, speed promise, testimonials, printer readiness or institutional endorsement may be invented. Service-hours text is “Jam layanan fleksibel. Pesanan akan diperiksa pada sesi berikutnya.”

Scope now: this document and mandatory activity/decision logs only. Later UI implementation may edit page/layout/components/styles/assets and add `src/lib/copy.ts` (presentation strings only). Keep Next 16, React 19, Tailwind 3, shadcn/Radix and sonner. Do not migrate Tailwind. Use installed `framer-motion` 12 only; no GSAP, scroll-smoothing library, or new runtime color dependency. API, DB, worker and frozen contracts in `PRINT_JOB_CONTRACT.md` and `ADMIN_API.md` remain untouched.

Direction: **a friendly campus service desk, with an expressive academic-blue invitation and a precise work surface**. Home is Persuade; order/status/queue/login/admin are Operate. Signature: the high-contrast pickup-code panel changes from a rounded rectangle to a compact receipt-like panel when the order is accepted, without drawing fake browser chrome. The only asymmetric expressive container is the home tariff panel. Every other component has predictable geometry.

The supplied brief already settles audience, task, fonts, icon family and visual language; it substitutes for reopening the skill interviews. Impeccable context was run: no PRODUCT.md exists, incumbent code is evidence. Product facts are captured here for Stage 0 rather than expanding this assignment into another interview or a second visual authority. Its update notice is informational; no skill update was run. Taste-skill's random direction draw, image quota, minimum animation count, two-font cap, monospace ban and border ban do not override this explicit M3 brief. We use its composition, truthful content and screenshot-review principles only. No render score is claimed at Stage 0.

## 1. Sources actually read and how they constrain this design

- Local `impeccable/SKILL.md` 4.7.0 plus `reference/new-work.md`, `operate.md`, `init.md`: preserve product truth, distinguish marketing from task UI, consistent fields, complete states, focus and restrained operator motion.
- Local `hallmark/SKILL.md` 1.1.0: locked tokens, honest copy, real responsive measurements, no fake chrome, explicit component states. Its catalog rotation is superseded by the user-pinned M3 language.
- Local `taste-skill/SKILL.md` v2: matched margins, first-screen clarity, non-repetitive home composition, inspect actual screenshots; not its incompatible house aesthetic.
- Local `better-icons/SKILL.md`: select one consistent Iconify family; fetch static Phosphor duotone SVGs at implementation time, retain attribution. No global install or MCP configuration change required by this spec.
- [M3 color roles](https://m3.material.io/styles/color/roles): intended on/container pairings, five surface containers and consistent region roles across breakpoints. Read rendered official content in browser because the text fetch returned a JS shell.
- [M3 shape principles](https://m3.material.io/styles/shape/overview-principles): interaction-driven shape morph, sparse abstract shapes; Expressive adds radii 20, 32 and 48.
- [M3 type scale](https://m3.material.io/styles/typography/type-scale-tokens): baseline + emphasized roles, brand face for large type/plain face for labels; this spec customizes weights for the requested families.
- [M3 motion physics](https://m3.material.io/styles/motion/overview/how-it-works) and [web conversion specs](https://m3.material.io/styles/motion/overview/specs): spatial springs may overshoot; effects must not; fast/default/slow assignments. Read rendered official pages, including the six expressive web fallback timings. Numerical Framer springs below are ARSC web tuning, not a claim to be Google's platform-native constants.
- [Official Material Color Utilities](https://github.com/material-foundation/material-color-utilities), npm `@material/material-color-utilities@0.4.0`: executed once outside the app to generate §2 with `SchemeFidelity(Hct.fromInt(argbFromHex('#1E5AA8')), dark, 0, '2025', 'phone')`. MCU0.4.0 returns actual specVersion `2021` for Fidelity/Content even when `2025` is requested; this is its built-in fallback, not a manual algorithm change. Fidelity preserves the exact academic-blue seed in primaryContainer in both themes; the **Expressive design/motion language is independent of choosing SchemeExpressive**, whose hue rotations would change brand emphasis. No runtime generation.

Official guidance is adapted for web, not a claim that shadcn becomes a certified Material component library. All measurements below are CSS px (use rem for type, dividing by 16). Colors are frozen sRGB hex.

## 2. Frozen color system

Seed `#1E5AA8`, **SchemeFidelity**, actual MCU color spec **2021** (2025 requested, unsupported for this variant in0.4.0). Light is default unless OS or saved theme says dark. Theme toggle cycles light/dark/system in its menu; no animated full-page color flash. Persist existing next-themes behavior. Regions keep the same role names at every width. No hand-picked page-specific hex.

| Role | Light | Dark |
|---|---|---|
| background | `#F9F9FF` | `#111318` |
| onBackground | `#191C21` | `#E1E2E9` |
| surface | `#F9F9FF` | `#111318` |
| surfaceDim | `#D9D9E1` | `#111318` |
| surfaceBright | `#F9F9FF` | `#37393F` |
| surfaceContainerLowest | `#FFFFFF` | `#0C0E13` |
| surfaceContainerLow | `#F3F3FA` | `#191C21` |
| surfaceContainer | `#EDEDF5` | `#1D2025` |
| surfaceContainerHigh | `#E7E8EF` | `#282A2F` |
| surfaceContainerHighest | `#E1E2E9` | `#33353A` |
| onSurface | `#191C21` | `#E1E2E9` |
| surfaceVariant | `#DEE2EF` | `#424751` |
| onSurfaceVariant | `#424751` | `#C2C6D3` |
| outline | `#737782` | `#8C919C` |
| outlineVariant | `#C2C6D3` | `#424751` |
| inverseSurface | `#2E3036` | `#E1E2E9` |
| inverseOnSurface | `#F0F0F7` | `#2E3036` |
| shadow | `#000000` | `#000000` |
| scrim | `#000000` | `#000000` |
| surfaceTint | `#235EAC` | `#AAC7FF` |
| primary | `#004287` | `#AAC7FF` |
| onPrimary | `#FFFFFF` | `#002F64` |
| primaryContainer | `#1E5AA8` | `#1E5AA8` |
| onPrimaryContainer | `#BED4FF` | `#BED4FF` |
| inversePrimary | `#AAC7FF` | `#235EAC` |
| primaryFixed | `#D6E3FF` | `#D6E3FF` |
| primaryFixedDim | `#AAC7FF` | `#AAC7FF` |
| onPrimaryFixed | `#001B3E` | `#001B3E` |
| onPrimaryFixedVariant | `#00458D` | `#00458D` |
| secondary | `#4E5F7F` | `#B5C7EC` |
| onSecondary | `#FFFFFF` | `#1F304E` |
| secondaryContainer | `#C9DAFF` | `#364766` |
| onSecondaryContainer | `#4E5F7F` | `#A4B6D9` |
| secondaryFixed | `#D6E3FF` | `#D6E3FF` |
| secondaryFixedDim | `#B5C7EC` | `#B5C7EC` |
| onSecondaryFixed | `#071B38` | `#071B38` |
| onSecondaryFixedVariant | `#364766` | `#364766` |
| tertiary | `#6E3300` | `#FFB688` |
| onTertiary | `#FFFFFF` | `#512400` |
| tertiaryContainer | `#924600` | `#924600` |
| onTertiaryContainer | `#FFC8A7` | `#FFC8A7` |
| tertiaryFixed | `#FFDBC7` | `#FFDBC7` |
| tertiaryFixedDim | `#FFB688` | `#FFB688` |
| onTertiaryFixed | `#311300` | `#311300` |
| onTertiaryFixedVariant | `#733600` | `#733600` |
| error | `#BA1A1A` | `#FFB4AB` |
| onError | `#FFFFFF` | `#690005` |
| errorContainer | `#FFDAD6` | `#93000A` |
| onErrorContainer | `#93000A` | `#FFDAD6` |

### 2.1 Semantic mapping and state layers

Brand roles use the generated Fidelity blue palette; this supersedes TonalSpot. Semantic tokens and their40 measured state combinations remain unchanged. Status colors are explicit, theme-specific product tokens independent of brand and tertiary; success stays green, warning amber/yellow and error the generated red. These eight additional roles are hand-selected semantic tokens, NOT claimed as MCU output. Do not regenerate them from the blue seed.

| Semantic role | Light | Dark |
|---|---|---|
| success | `#166534` | `#86EFAC` |
| onSuccess | `#FFFFFF` | `#052E16` |
| successContainer | `#DCFCE7` | `#14532D` |
| onSuccessContainer | `#14532D` | `#DCFCE7` |
| warning | `#854D0E` | `#FDE047` |
| onWarning | `#FFFFFF` | `#422006` |
| warningContainer | `#FEF3C7` | `#713F12` |
| onWarningContainer | `#713F12` | `#FEF3C7` |

Map aliases as follows:

| Alias | Background | Foreground | Usage |
|---|---|---|---|
| success status | successContainer | onSuccessContainer | delivered, accepted upload; check icon + text |
| attention | warningContainer | onWarningContainer | pending verification, needs operator check; warning icon + text |
| danger | errorContainer | onErrorContainer | failed/rejected, destructive confirmation |
| information | secondaryContainer | onSecondaryContainer | queue, approved, service information |
| neutral | surfaceContainerHighest | onSurfaceVariant | cancelled, unavailable historical values |
| snackbar | inverseSurface | inverseOnSurface | success/info notices; action inversePrimary |
| focusRing | primary | — | 3px outline with 3px surface-colored gap |

Shadcn aliases: background=surface, foreground=onSurface, card=surfaceContainerLow, card-foreground=onSurface, popover=surfaceContainerHigh, popover-foreground=onSurface, primary/onPrimary, secondary=secondaryContainer/onSecondaryContainer, muted=surfaceContainerHighest/onSurfaceVariant, accent=secondaryContainer/onSecondaryContainer, destructive=error/onError, border=outlineVariant, input=outline, ring=primary. Convert to existing HSL variable format at implementation; never pass hex into `hsl(var(...))`.

State overlay is a pseudo-element inside the component shape, foreground color at hover 8%, focus 10%, pressed 10%, dragged 16%; these are **ARSC fixed web values**, not asserted as every M3 component's native default. Focus additionally gets the outer ring. Do not reduce text opacity for secondary text: use onSurfaceVariant. Disabled foreground onSurface at 38%, disabled fill onSurface at 12%, no hover/press, native disabled semantics. Disabled contrast is exempt from WCAG text contrast; explanatory helper text remains full contrast. Error beats hover tint; focus ring remains visible. The per-pair state alpha overrides in §2.2 take precedence over the generic percentages: a 0% override preserves the base background and uses the outline/focus/press geometry for feedback. No color-only state.

Never stack a state layer and ripple: the listed alpha is the TOTAL foreground overlay budget. The ripple replaces the state overlay within its region, including all0% overrides. Loading retains enabled foreground/background.

Pressed ripple: one clipped radial foreground layer 10% opacity, scale 0→1 from pointer position, 200ms effect; exit opacity 120ms. Keyboard press originates center. Do not run ripple on navigation links moving to another page if it delays navigation. Reduced motion: static pressed layer only. Neither ripple nor icon animation intercepts pointer events.

### 2.2 Measured token-pair contrast

Computed from generated sRGB values using WCAG relative luminance. These are token checks, not a rendered accessibility certification; composites, hover/focus and actual page text must be measured again during implementation.

| Pair | Light ratio | Dark ratio |
|---|---:|---:|
| onSurface/surface | 16.29:1 | 14.38:1 |
| onSurfaceVariant/surfaceContainerHighest | 7.22:1 | 7.2:1 |
| onPrimary/primary | 9.86:1 | 7.75:1 |
| onPrimaryContainer/primaryContainer | 4.56:1 | 4.56:1 |
| onSecondaryContainer/secondaryContainer | 4.58:1 | 4.57:1 |
| onTertiaryContainer/tertiaryContainer | 4.54:1 | 4.54:1 |
| onError/error | 6.46:1 | 7.72:1 |
| onErrorContainer/errorContainer | 7.24:1 | 7.24:1 |
| inverseOnSurface/inverseSurface | 11.63:1 | 10.21:1 |
| outline/surface | 4.27:1 | 5.88:1 |
| primary/surface | 9.4:1 | 10.9:1 |

#### Interaction-state measurements and mandatory overrides

The following measures all 22 base pairs again in enabled, hover, focus, pressed and dragged states. A state layer is the row's foreground composited over its background in sRGB; text/icon color stays unchanged. Ratios are rounded only for display. Last column gives exact hover/focus/pressed/dragged alpha overrides. Where 0% is specified, do not apply a background tint: retain underline/border/focus ring/press shape feedback instead. These overrides prevent otherwise failing text contrast (especially light onErrorContainer and light muted labels). Never implement a runtime contrast search. Disabled colors are exempt, per §2.1, and do not use these ratios. Loading uses enabled colors. Error uses its own measured error pair. Noninteractive status surfaces retain enabled colors; their interactive children follow the applicable control row.

| Theme / pair | Enabled | Hover | Focus | Pressed | Dragged | Layer alpha H/F/P/D |
|---|---:|---:|---:|---:|---:|---|
| light onSurface/surface | 16.29 | 13.87 | 13.36 | 13.36 | 11.77 | 8%/10%/10%/16% |
| light onSurfaceVariant/surfaceContainerHighest | 7.22 | 6.42 | 6.19 | 6.19 | 5.65 | 8%/10%/10%/16% |
| light onPrimary/primary | 9.86 | 8.03 | 7.60 | 7.60 | 6.49 | 8%/10%/10%/16% |
| light onPrimaryContainer/primaryContainer | 4.56 | 4.56 | 4.56 | 4.56 | 4.56 | 0%/0%/0%/0% |
| light onSecondaryContainer/secondaryContainer | 4.58 | 4.58 | 4.58 | 4.58 | 4.58 | 0%/0%/0%/0% |
| light onTertiaryContainer/tertiaryContainer | 4.54 | 4.54 | 4.54 | 4.54 | 4.54 | 0%/0%/0%/0% |
| light onError/error | 6.46 | 5.77 | 5.60 | 5.60 | 5.05 | 8%/10%/10%/16% |
| light onErrorContainer/errorContainer | 7.24 | 6.28 | 6.02 | 6.02 | 5.38 | 8%/10%/10%/16% |
| light inverseOnSurface/inverseSurface | 11.63 | 9.25 | 8.72 | 8.72 | 7.22 | 8%/10%/10%/16% |
| light outline/surface | 4.27 | 3.90 | 3.81 | 3.81 | 3.54 | 8%/10%/10%/16% |
| light primary/surface | 9.40 | 8.18 | 7.93 | 7.93 | 7.12 | 8%/10%/10%/16% |
| dark onSurface/surface | 14.38 | 12.02 | 11.42 | 11.42 | 9.64 | 8%/10%/10%/16% |
| dark onSurfaceVariant/surfaceContainerHighest | 7.20 | 6.01 | 5.73 | 5.73 | 5.03 | 8%/10%/10%/16% |
| dark onPrimary/primary | 7.75 | 6.80 | 6.58 | 6.58 | 5.94 | 8%/10%/10%/16% |
| dark onPrimaryContainer/primaryContainer | 4.56 | 4.56 | 4.56 | 4.56 | 4.56 | 0%/0%/0%/0% |
| dark onSecondaryContainer/secondaryContainer | 4.57 | 4.57 | 4.57 | 4.57 | 4.57 | 0%/0%/0%/0% |
| dark onTertiaryContainer/tertiaryContainer | 4.54 | 4.54 | 4.54 | 4.54 | 4.54 | 0%/0%/0%/0% |
| dark onError/error | 7.72 | 6.71 | 6.45 | 6.45 | 5.76 | 8%/10%/10%/16% |
| dark onErrorContainer/errorContainer | 7.24 | 6.48 | 6.28 | 6.28 | 5.69 | 8%/10%/10%/16% |
| dark inverseOnSurface/inverseSurface | 10.21 | 8.92 | 8.58 | 8.58 | 7.72 | 8%/10%/10%/16% |
| dark outline/surface | 5.88 | 5.33 | 5.17 | 5.17 | 4.72 | 8%/10%/10%/16% |
| dark primary/surface | 10.90 | 9.46 | 9.01 | 9.01 | 7.78 | 8%/10%/10%/16% |

Explicit status-role measurements (same compositing model; layers8/10/10/16% all pass):

| Theme / semantic pair | Enabled | Hover | Focus | Pressed | Dragged |
|---|---:|---:|---:|---:|---:|
| light onSuccess/success | 7.13 | 5.93 | 5.67 | 5.67 | 4.89 |
| light onSuccessContainer/successContainer | 8.30 | 7.28 | 7.07 | 7.07 | 6.40 |
| light onWarning/warning | 6.85 | 5.70 | 5.43 | 5.43 | 4.74 |
| light onWarningContainer/warningContainer | 7.79 | 6.90 | 6.67 | 6.67 | 6.03 |
| dark onSuccess/success | 10.62 | 9.25 | 8.90 | 8.90 | 7.92 |
| dark onSuccessContainer/successContainer | 8.30 | 6.71 | 6.40 | 6.40 | 5.50 |
| dark onWarning/warning | 11.06 | 9.60 | 9.23 | 9.23 | 8.21 |
| dark onWarningContainer/warningContainer | 7.79 | 6.42 | 6.07 | 6.07 | 5.21 |

Across110 generated-pair state measurements plus40 semantic-state measurements, minimum text contrast is **4.54:1** (threshold4.5), and minimum control-boundary contrast is **3.54:1** (threshold3). External focus rings retain the3px surface-colored gap. Measurements cover specified composites, not rendered DOM; Stage1 must check computed CSS and screenshots.

Minimum: normal text 4.5:1, large text and meaningful controls 3:1, focus ring 3:1 against adjacent colors. `outlineVariant` is decorative only; fields use `outline`. Never place onSurfaceVariant on errorContainer. No low-opacity text over photos. The fixed palette roles are supplied for completeness but unused in Stage 1–4.

### 2.3 Scheme comparison and final choice

Distance is MCU's `Cam16.distance` (CAM16-UCS-derived perceptual distance) from seed #1E5AA8, rounded to2 decimals; zero means the same sRGB color. It includes tone differences, so a lighter accessible dark-theme primary naturally has a larger distance. A smaller scalar distance is not itself a saturation score. Fidelity's light primary is darker (not closer by this metric), while its container matches the seed exactly. Dark primary is intentionally light enough for contrast.

| Scheme (actual spec) | Light primary / container / tertiary | Dark primary / container / tertiary | Seed distance: primary L/D; container L/D | Min text / control after overrides |
|---|---|---|---|---|
| SchemeTonalSpot (2025) | #475F8A / #ABC4F5 / #675882 | #B4C7ED / #415373 / #EBDCFF | 5.45/15.06; 14.67/6.79 | 4.54:1 / 3.41:1 |
| SchemeFidelity (2021) | #004287 / #1E5AA8 / #6E3300 | #AAC7FF / #1E5AA8 / #FFB688 | 6.15/14.82; 0/0 | 4.54:1 / 3.54:1 |
| SchemeContent (2021) | #004287 / #1E5AA8 / #652977 | #AAC7FF / #1E5AA8 / #F0B0FF | 6.15/14.82; 0/0 | 4.54:1 / 3.54:1 |

**Choose Fidelity.** It retains the selected blue exactly in the prominent primaryContainer/app-mark tile, with a saturated darker primary for actions. Content has the same primary/container but a different purple tertiary; Fidelity's complementary warm tertiary is the chosen accent. Tertiary is not a warning status: warning remains the explicit amber tokens. All three schemes pass after fixed alpha overrides; no API/UI/runtime color generation changes. The complete comparison was generated in one execution, not repeated aesthetic tuning. Fidelity and Content deliberately use MCU's reported2021 fallback; never label them actual2025 output. TonalSpot2025 is retained here only as comparison, superseded for implementation.

## 3. Type, spacing, shape, elevation and icon tokens

`next/font/google`: `Bricolage_Grotesque` latin variable weight 400–700 (`--font-display`), `Plus_Jakarta_Sans` latin 400–700 (`--font-body`), `JetBrains_Mono` latin 500–600 (`--font-code`), all `display:'swap'`. Request only required subsets and weights. Fallbacks: display/body `system-ui,sans-serif`; code `ui-monospace,monospace`. No runtime fonts.googleapis.com stylesheet. Do not silently change faces if build download fails: report it. Normal/roman headings; body/labels never Bricolage. Code face only pickup codes, prices and numeric summary values, never explanatory prose or raw IDs.

| Token | Family | Size / line px | Baseline weight | Emphasized weight | Tracking px |
|---|---|---|---:|---:|---:|
| displayLarge | display | 57 / 64 | 400 | 600 | -0.25 |
| displayMedium | display | 45 / 52 | 400 | 600 | 0 |
| displaySmall | display | 36 / 44 | 400 | 600 | 0 |
| headlineLarge | display | 32 / 40 | 400 | 600 | 0 |
| headlineMedium | display | 28 / 36 | 400 | 600 | 0 |
| headlineSmall | display | 24 / 32 | 400 | 600 | 0 |
| titleLarge | body | 22 / 28 | 500 | 700 | 0 |
| titleMedium | body | 16 / 24 | 500 | 700 | 0.15 |
| titleSmall | body | 14 / 20 | 500 | 700 | 0.1 |
| bodyLarge | body | 16 / 24 | 400 | 600 | 0.5 |
| bodyMedium | body | 14 / 20 | 400 | 600 | 0.25 |
| bodySmall | body | 12 / 16 | 400 | 600 | 0.4 |
| labelLarge | body | 14 / 20 | 500 | 700 | 0.1 |
| labelMedium | body | 12 / 16 | 500 | 700 | 0.5 |
| labelSmall | body | 11 / 16 | 500 | 700 | 0.5 |
| pickup | code | 28 / 36 | 600 | 600 | 0 |
| amount | code | 24 / 32 | 500 | 600 | -0.25 |

UI copy uses bodyLarge by default and bodyMedium for helpers. labelSmall only timestamps/nonessential metadata, never control labels. H1: home displaySmall emphasized at <840, displayLarge emphasized ≥840; all task H1 headlineMedium emphasized <840, headlineLarge emphasized ≥840. No fluid font scaling. H2 headlineSmall emphasized, card title titleMedium emphasized. Maximum prose measure 65ch. At 200% text zoom fixed component heights become minimum heights; multiline copy must expand rather than clip. No all-caps tracking. Amount uses `Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0})`, visually `Rp 500`; dates `id-ID` with Asia/Jakarta and “WIB” where time matters.

Spacing tokens: `space0=0, space1=4, space2=8, space3=12, space4=16, space5=20, space6=24, space8=32, space10=40, space12=48, space16=64, space20=80, space24=96`. Gaps: label→field 8, field→helper 4, fields 20, card groups 24 mobile/32 desktop, sections 48 mobile/80 desktop. Main gutters 16 <600; 24 from600–839; 32 ≥840. Max content 1200, task forms 960, reading/status 720. 1280 home content is 1200 wide with40 outer margins. 375 content is343. Grid uses minmax(0,1fr); all flex/grid children min-width0. No fixed width child beyond container.

Shape tokens: none0, xs4, s8, m12, l16, lPlus20, xl28, xlPlus32, xxl48, full9999. Native M3 dp adapted one-to-one to CSS px. Buttons full→l16 on press; small filter chips s8; fields xs4 top corners; filled/elevated cards lPlus20; outlined cards l16; dialogs xl28; sheet top xl28 bottom0. Home tariff panel xxl48 top-left/bottom-right and l16 other corners (48/16/48/16 clockwise). Never repeat that shape on every card. No random blob decorations.

| Elevation | Tone | Shadow (shadow role RGB, light/dark same opacity) | Components |
|---|---|---|---|
| 0 | surface / designated filled tone | none | page, filled/outlined card |
| 1 | surfaceContainerLow | 0 1px 2px / 12% | elevated card |
| 2 | surfaceContainer | 0 2px 6px / 14% | scrolled bar, popup menu |
| 3 | surfaceContainerHigh | 0 4px 12px / 16% | FAB, dialog, sheet |
| 4 | surfaceContainerHighest | 0 6px 16px / 18% | dragged overlay only |
| 5 | surfaceContainerHighest | 0 8px 24px / 20% | reserved, unused |

Use tone first, not stacked shadows. Hovering an elevated card changes shadow to elevation2; no translating entire cards upward. Scrim = generated scrim at32%. Z layers: page0, sticky summary10, appbar30, nav40, FAB45, scrim60, sheet/dialog70, toast80. Mobile content bottom padding `104px + env(safe-area-inset-bottom)`; form action bar and toast never cover nav.

### 3.1 Exact icon manifest

Retrieve these through Better Icons' Iconify `ph` family as **static duotone SVG**, not a runtime remote icon request. Preserve Phosphor MIT attribution in the asset notice. ViewBox0 0 256 256, no custom path edits; secondary fill currentColor opacity0.2. Default24, control20, status20; do not animate individual duotone layers. Decorative icons aria-hidden, icon-only buttons have the listed human action label. Keep the actual ARSC logo asset unchanged; do not recolor licensed/logo artwork without separate approval. The application mark tile and OpenGraph backing use the NEW blue primaryContainer/onPrimaryContainer pair. Do not replace the logo with an invented monogram.

| Purpose | Iconify ID |
|---|---|
| Home | ph:house-duotone |
| Create/order/document | ph:file-text-duotone |
| Track/search | ph:magnifying-glass-duotone |
| Queue/history | ph:clock-duotone |
| Printer/device | ph:printer-duotone |
| Upload | ph:upload-simple-duotone |
| Proof | ph:image-duotone |
| Payment | ph:qr-code-duotone |
| Done/verified | ph:check-circle-duotone |
| Attention/reconcile | ph:warning-circle-duotone |
| Error/close/cancel | ph:x-circle-duotone |
| Copy | ph:copy-duotone |
| Receipt | ph:receipt-duotone |
| Menu | ph:list-duotone |
| Theme | ph:circle-half-duotone |
| Operator/login | ph:user-circle-duotone |
| Logout | ph:sign-out-duotone |
| Refresh | ph:arrow-clockwise-duotone |
| More | ph:dots-three-duotone |
| Next/back | ph:arrow-right-duotone / ph:arrow-left-duotone |
| Date/filter | ph:calendar-blank-duotone / ph:funnel-duotone |

If any exact ID is unavailable, report it for review rather than mixing a second icon family. No icon install happens at Stage0. Do not add a UI icon CDN dependency.

## 4. Motion specification (Framer Motion only)

All springs use mass1, velocity0 on entrance; interruptions inherit gesture velocity. Framer `damping` is a coefficient, not Compose dampingRatio. These web coefficients are locked product tuning; `restDelta:0.01, restSpeed:0.1`. Use springs for transforms/layout; color/opacity use effects tween to prevent overshoot.

| Token | Framer configuration | Reference/fallback duration |
|---|---|---|
| spatialFast | type spring, stiffness800, damping32 | 350ms, ease[0.42,1.67,0.21,0.90] |
| spatialDefault | type spring, stiffness380, damping31 | 500ms, ease[0.38,1.21,0.22,1] |
| spatialSlow | type spring, stiffness200, damping24 | 650ms, ease[0.39,1.29,0.35,0.98] |
| effectsFast | type tween, duration0.15, ease[0.31,0.94,0.34,1] | 150ms |
| effectsDefault | type tween, duration0.20, ease[0.34,0.80,0.34,1] | 200ms |
| effectsSlow | type tween, duration0.30, ease[0.34,0.88,0.34,1] | 300ms |
| press | scale1→0.98, radiusfull→16, spatialFast | immediate response, no action delay |
| reduced | transform/layout duration0; opacity duration0.10 linear | 100ms maximum |

Do not set both spring physics and duration on the same transition. Official web fallback durations above are useful approximate comparison, not mandatory spring timeouts. Opacity 0→1 only for overlays/home enhancement; all body content is visible SSR and when JS fails. Never set a whole task page `initial.opacity=0`.

Recipes: (A) control press token above; (B) selected pill layoutId indicator spatialFast, only inside its group; (C) sheet y32→0 spatialDefault plus scrim effectsDefault; (D) dialog scale0.98→1 spatialFast plus opacity effectsFast; (E) form step directional x24→0 spatialDefault + opacity effectsFast, old step leaves x-24, reverse mirrors, focus heading after transition; (F) status change check scales0.9→1 spatialFast, text crossfade effectsFast; (G) home tariff entrance y16→0 spatialDefault once, 80ms after heading, never parallax. No route-wide exit delay, no scroll hijack, no bouncing data tables, no count-up from fictional zero. Numeric price changes crossfade keyed value200ms, announce debounced value after500ms; price must be correct immediately, not after animation.

Reduced motion from `useReducedMotion` AND CSS media: no spring overshoot, layout/translate/scale/shape morph/ripple disabled; preserve selection/color/focus and static progress. No animation loop except indeterminate loading while a request is genuinely active; pause offscreen/hidden tab. Wavy progress is decorative framing of real progress, not a promise of percent. No confetti. Home may animate heading + tariff + process row (3 groups maximum); tasks have no staged entrance. No automatic repeated pulse on pickup codes or FAB.

## 5. Component anatomy and exhaustive state contract

The per-pair color overrides in §2.2 supersede the generic state layers in G.

**Global state contract G** applies to every interactive child in all components below: enabled=base role and correct HTML control; hover=8% state layer on pointer:fine only; focus=10% layer +3px ring/3px gap, `:focus-visible`; pressed=10% layer +press token where specified; disabled=native disabled +38% foreground/12% fill, no action; loading=stable width, spinner16 before label, aria-busy and disabled duplicate submission, preserve label replaced with action-progress copy; error=error icon+helper, aria-describedby/invalid where input, no raw error code; success=check+text from copy registry, no fireworks. Touch targets at least48×48 (visual chip32 inside48 hit area). Input and button text minimum14, editable text16 to avoid mobile zoom. Each row states how G maps; **N/A means no simulated interaction state may be invented**. Noninteractive regions have no hover/focus/press/disabled styling; only children do. Loading/error status never disables navigation away unless a destructive confirm is in flight.

| Component | Exact anatomy / geometry / roles | Enabled / hover / focus / pressed | Disabled / loading / error / success |
|---|---|---|---|
| Top app bar | Sticky full-width,64 high; desktop80 at page top→64 after scrollY32, threshold hysteresis8; mobile always64. Padding16/32. Logo32 + “ARSC Printing” titleMedium; right theme and operator menu48. Desktop links center. Surface at top, surfaceContainer on scroll, elevation2. | G children. Current nav link primary+underline2; bar itself static, no blur. Height transition spatialFast desktop only; no disappearing on scroll. | No whole-bar disabled. Route pending shows2px indeterminate line at bottom; failure toast, links remain. Logo always home. Success no bar animation. |
| FAB | Public pages except /order and admin: extended “Buat pesanan”, file-text24+labelLarge emphasized, h56 gap12 px20 radiusfull, primaryContainer/onPrimaryContainer elevation3. Mobile bottom`96+safe` right16; desktop bottom24 right32. | G, hover elevation4; press radius16. Hidden on home while hero CTA visible via IntersectionObserver, appears only after hero CTA exits. | Disabled only if unavoidable route action, not backend outage. Navigation loading keeps label, spinner. Route failure toast. No success color flip. Never two fixed create actions at once. |
| Mobile nav bar | Public only <840, fixed bottom h80+safe, surfaceContainer, four equal destinations “Beranda”, “Pesan”, “Lacak”, “Antrean”; icons24; labelMedium; indicator64×32 secondaryContainer. | G per link; active indicator spatialFast, aria-current page. Entire item hit width≥80. | No disabled routes. Route loading line in topbar only. Error toast. Active state visible without animation. Does not appear on admin/login. |
| Admin rail/drawer | ≥1200 rail88 left under bar, surfaceContainer, icons24+labelMedium, items64; “Pesanan”, “Rekap”, “Perangkat”; these are anchors to same dashboard sections, NOT invented routes. 840–1199 modal drawer via menu; <840 drawer widthmin(320,100vw-32), fullscreen scrim. “Keluar” bottom. | G links; selected secondaryContainer/onSecondaryContainer. Drawer focus trap, Escape, close on navigation, restore menu focus. | Menu/exit loading per G. No fake disabled sections. Fetch failure appears in section not rail. Label/tooltips available. |
| Segmented button | h48 outer full border1 outline;2–3 equal items,min-width0, labelLarge; selected secondaryContainer/onSecondaryContainer+check20. Body title outside. | G radio group, arrow keys, exactly one selected. Indicator spatialFast; selected check doesn't shift text. Press does not scale whole group. | Group disabled while locked draft; loading no choice changes; error helper below. Success selected state only. Mobile layout option3 labels fit; no horizontal scrolling. |
| Filter chip | Visual h32, hit48, s8 radius; border1 outlineVariant, text onSurfaceVariant; selected secondaryContainer+check18. | G checkbox/toggle aria-pressed. Wrap rows with8gap, no hidden horizontal overflow. | Disabled specific unsupported filter only with explanation; loading keeps selected; error toast retains previous selection; success results-count live region. |
| Stepper | `ol`3 equal columns:32 circle +label12 below,24 connecting line, total min-height72; “Berkas”, “Pembayaran”, “Kirim”; current primary/onPrimary, done secondaryContainer+check, future neutral. | Current aria-current step; completed steps are buttons G; future steps noninteractive until prior valid. Focus heading on change. Connector never relies on color alone. | Locked during submission; loading current circle progress; error current icon warning+field summary link; success final check. No fake “Ambil” step before order sent. |
| Filled card | surfaceContainerHighest/onSurface,lPlus20,p20 mobile/24 desktop, no border/shadow. Use tariff, price, pickup. | Static by default, no pointer cursor. Interactive child G; selectable entire card only with native radio semantics and explicit label. | Loading skeleton heights preserve content; error helper row; disabled only selectable variant per G; success status row, not whole-card status-color wash. |
| Elevated card | surfaceContainerLow/onSurface,lPlus20,p20/24,elevation1. Use active order and primary form section. | Static card no hover. If linked whole-card, G ring outside, hover elevation2, no lift; never nested links inside whole-card link. | Same card skeleton/error logic. Loading action local; never dim readable customer details. |
| Outlined card | surface/onSurface,l16,border1 outlineVariant,p20/24. Use history/secondary info. | Static no hover; linked variant follows elevated-card interaction without shadow. | Same skeleton/error as above; selected variant border2 primary and selected label. Disabled selectable only. |
| Text field | Persistent label14 above (not placeholder-only),56min high, px16, filled surfaceContainerHighest, top xs4, bottom border1 outline; body16; optional trailing48 icon; helper14 below. | G; hover border onSurface; focus border2 primary, preserve layout via inset border. Keyboard native type/autocomplete. | Disabled as G; loading trailing16 spinner, text retained; error border2 error+message+icon, aria-invalid; success optional check only for validated upload/contact, never implied payment verification. |
| File dropzone | Button/input label, min-height144 mobile/160 desktop, border2 dashed outline,radius20,surfaceContainerLow; upload24, titleMedium, helper14. Separate document/proof. Real file input keyboard usable. | G and drag-over primaryContainer/borderprimary+“Lepaskan berkas di sini”; pressed no scale container; all regions can browse. | Disabled during locked upload; progress row filename ellipsis+size+cancel only if abort truly supported (otherwise no cancel); error inline human message; success solid outline success+file row+“Ganti berkas”. No fake completed before server ACK. |
| Toast / snackbar | Sonner portal, inverseSurface/inverseOnSurface,radius12,minh56,p16, icon20, body14, close48; maxwidth400 desktop, calc(100vw-32) mobile. Desktop top-right24 below appbar; mobile top80+safe, not over bottom actions. | G close/action. role status polite for success/info; role alert for failures, no auto focus theft. | Success4s/info6s; error stays until dismiss; pause timer hover/focus. Loading toast only for long explicit action, replace same ID on result. No stack >3. Retry button only safe idempotent retries. Inline errors still persist. |
| Dialog | Radix portal, scrim32%,surfaceContainerHigh,radius28,widthmin(560,100vw-32),maxhcalc(100dvh-48),overflow-yauto,p24. TitleheadlineSmall,body16,actions right gap8. | G actions, focus initial cancel for destructive, trap/return focus, Escape closes before request. Enter only acts focused button. | Pending prevents duplicate confirm and accidental outside close; error inline+toast, dialog remains; success closes then toast and updates source. Never hand-built div modal. |
| Bottom sheet | Mobile <600 for receipt/details/filter panel, same portal,surfaceContainerHigh,topradius28,handle32×4 outlineVariant centered,headerp24,bodyp20,maxh85dvh,internal scroll; footer actions sticky. Desktop uses dialog. | G children; focus trap, Escape; explicit “Tutup”48. Drag-to-close optional only vaul already available; disable drag while forms dirty. | No whole-sheet disabled; pending local. Error section +retry. Success updates content. No nested sheets. Touch scrolling must not close accidentally. |
| Progress | Determinate linear h4,tracksecondaryContainer,activeprimary,roundedfull; indeterminate h4 with one wavy active segment (amplitude2,period16,length48) only while actual request, loop1200mslinear. Inline circle20 for buttons. | Noninteractive N/A hover/focus/pressed/disabled. role progressbar with value only real byte percent. Text label outside. | Parse unknown duration uses indeterminate label “Memeriksa PDF…”; reduced motion static bar +label; error stops and retains error helper; success100% then replacedcheck. Don't animate fake percentages. |
| Status timeline | Vertical ordered list,20 status icon,2px connector outlineVariant,content gap12,rowsmin56. Done check success;current ringprimary;future outline. TexttitleSmall+bodyMedium, timestamp if available. | Noninteractive N/A states; retry/open detail children G. Current aria-current step. | Loading skeleton4rows; error accessible retry card; cancelled branch neutral terminal, failed/reconcile attention/error branch; no animating into future physical completion. Status change recipeF only. |
| Pickup-code display | PrimaryContainer/onPrimaryContainer,radius20,p20, label14 “Kode ambil”, code28/36 centered or left on desktop, copy48 to right; body14 browser-access explanation below. | Code selectable text, copy G. No clickable code lookup. Long content wraps, ARSC-0000 fits343. | Loading skeletonwidth180; missingcode “Kode ambil belum tersedia”; copydisabled ifmissing; clipboard error toast with manual-select advice; success toast. No pulsing, no fake QR encoding secrets. |

Primary button: h48 px24 full, primary/onPrimary,labelLarge emphasized; secondary tonal secondaryContainer/onSecondaryContainer; text button primary on surface; destructive error/onError only in confirmation. Preserve min-height at text zoom. Button layout icon20 gap8, no trailing arrows on every action. Loading labels in §7. Tooltip appears after500ms hover/focus, bodySmall, inverse roles, never the only accessible label. Menus portal and use48high items. Native checkbox24 inside48hit, selectedprimary/onPrimary. No custom cursor or scrollbar.

## 6. Page wireframes and choreography

Breakpoints: compact <600; medium600–839; expanded≥840; wideadmin≥1200. Public mobile nav exists <840; ≥840 desktop links “Beranda”, “Lacak pesanan”, “Antrean” plus create action. Form/task footer shorter than home but same facts. Browser zoom may trigger compact layout. All pages have skip link “Lewati ke isi utama”, one H1, semantic landmarks, and visible errors independent of toast.

### 6.1 Home `/`

375: top bar64 → main x16,width343,top24 → H1 “Cetak tugas,\nlanjutkan harimu.” displaySmall emphasized (intentional two-line break) → body16 after16 “Kirim PDF, bayar sesuai tagihan, lalu ambil pesanan di sekretariat ARSC.” → primary “Buat pesanan” full width48 after24, text link “Lacak pesanan” after8 → asymmetric tariff panel after32,p24, heading “Tarif yang jelas”, rows “Hitam putih” / “Rp 500 per halaman”, “Warna” / “Rp 750 per halaman” → queue strip after24 with clock + `{count} pesanan dalam antrean`, link “Lihat antrean” → process `ol` after48,heading “Dari PDF ke meja ambil”, three stacked rows (not three icon cards) → footer after48 → bottom nav80. Floating FAB appears only after hero CTA exits.

1280: bar80 → main1200 x40 top64; two-column hero 7/5 with gap48 (left648/right504), heading displayLarge max620,copy max520; tariff panel504wide,minh300. Below hero section gap64: queue strip full width; process section split left title384/right ordered steps768; footer a full-width surfaceContainer region with inner1200, three columns brand/location/tariff, no fabricated social links.

Motion: SSR content visible. Enhance H1 y8→0 spatialDefault on hydrate; tariff recipe G80ms later; process rows y12→0 spatialDefault once viewport50%, stagger60ms across three rows only. Queue value crossfade effectsFast on real refresh, no live claim. Never animate footer. No photo quota, fake printer illustration or made-up live dashboard.

Process copy exactly: “Unggah PDF” / “Pilih jumlah salinan dan pengaturan cetak.”; “Bayar dan kirim bukti” / “Periksa tagihan, lalu unggah bukti pembayaran.”; “Tunggu pemeriksaan” / “Petugas memeriksa pembayaran dan menyiapkan pesanan untuk diambil.” Service note: “Layanan mengikuti jadwal piket sekretariat. Pesanan di luar jadwal akan diperiksa pada sesi berikutnya.”

### 6.2 Order `/order`

375: top bar64 → main343 x16 top24 → H1 “Buat pesanan” → body “Siapkan PDF dan bukti pembayaran. Kami akan memeriksa pesanan sebelum mencetak.” → stepper72 after24 → one active elevated form card after16 → inline error summary if any → bottom in-flow back/continue row48; fixed form action bar is NOT used (avoids overlapping mobile nav). Navbar remains; no FAB.

1280: centered960 x160 top40; H1+stepper; grid 592 form +24gap +344 summary, summary sticky top96. Step content in one elevated card; summary filled card “Ringkasan pesanan”, PDF page count/copies/rate/estimated total. On375 summary collapses in-flow after preferences, above continue, never hides total behind disclosure.

Three real client steps, using the existing final submit path and preserving draft idempotency:
1. **Berkas**: fields “Nama lengkap” autocomplete name, “Nomor WhatsApp atau Telegram” autocomplete tel, document dropzone label “Dokumen PDF”, helper “PDF saja, maksimal 10 MiB.” Preview the PDF locally. Count pages with the existing pdf-lib in a dedicated browser Web Worker, cap input at10 MiB, terminate after5 seconds, reject encrypted/unreadable files, and revoke stale object URLs. Show “Jumlah halaman sedang diperiksa” until a count exists; never use a default1. Server validation remains authoritative. Controls: “Jumlah salinan” (1–100), segmented “Warna cetak” [“Hitam putih”,“Warna”], “Ukuran kertas” [“A4”,“F4”], segmented “Halaman per lembar” [“1”,“2”,“4”] with visible group label, orientation [“Tegak”,“Mendatar”], notes “Catatan untuk petugas (opsional)”. Defaults: bw, A4,1-up, portrait, copies1, fit. F4 helper “Ketersediaan ukuran F4 diperiksa petugas.” Do not assert adapter support. Pricing always uses source PDF pages × copies × rate; 2-up/4-up does not silently reduce the server bill.
2. **Pembayaran**: show breakdown `{pages} halaman × {copies} salinan × {rate}`, “Estimasi biaya”, amount, note “Estimasi; tagihan akhir dihitung dari berkas oleh server.” QRIS inline256×256 desktop, width min(256, container) on mobile, white backing16, do not recolor/crop its actual code; alt “Kode QRIS pembayaran ARSC”. Secondary action “Buka QRIS” targets original image with warning label if new tab. Proof dropzone “Bukti pembayaran”, helper “PNG atau JPEG, maksimal 5 MiB.” No QRIS paid check until admin verified.
3. **Kirim**: read-only summary name/contact/filename/preferences/estimate, required checkbox “Saya sudah memeriksa berkas, pengaturan cetak, dan bukti pembayaran.” Warning “Berkas dan pengaturan tidak dapat diubah setelah pesanan dikirim.” Primary “Kirim pesanan”, back “Kembali”. Show final server amount on success rather than silently claiming client estimate final.

Step1 action: “Lanjut ke pembayaran”; step2 action: “Periksa pesanan”; back: “Kembali”. Validate the current step and focus the first invalid field before progressing.

Motion: recipe E only on user step change. Keep previous DOM state/Files; do not rerun creation when navigating steps. PDF upload/check indicator switches to a check using recipe F after actual parse; submit progress uses actual current stage labels. If document ACK succeeds but proof fails, remain on step3 with “Bukti pembayaran belum terunggah. Coba kirim lagi.” Keep draft/options locked and retry existing upload flow, no new order. Serveramount differing from estimate: success note “Tagihan dihitung dari PDF yang diterima. Periksa kembali jumlahnya.” No new quote API is implied; if accurate prepayment page-count cannot be obtained, stop with actionable parse error instead of requesting blind payment.

### 6.3 Order success `/order-success?orderId=…`

375: bar 64 → main width343, x16, top24 → check32 success beside H1 “Pesanan terkirim” → body “Pembayaran dan berkasmu akan diperiksa petugas.” → pickup panel after24 → final amount → timeline after24 → primary “Lacak pesanan” full width48 → text “Buat pesanan lain” → footer/nav. At1280: main720, x280, top48; pickup/amount columns440/256 with gap24; timeline below, actions left. No giant celebration.

Below code: “Simpan kode ini untuk mengambil pesanan. Untuk melacak, gunakan browser yang dipakai saat memesan.” Privacy helper: “Jangan bagikan tautan pesanan kepada orang lain.” Do not promise cross-device access. “Salin kode ambil” copies only the code; optional “Salin ID pesanan” in the more menu copies the UUID without displaying it as a heading. Missing capability: H1 “Pesanan belum bisa dibuka”; body “Buka halaman ini dari browser yang dipakai saat memesan. Kode ambil saja tidak dapat membuka pesanan.” Link “Kembali ke beranda”. Missing orderId: “Pilih pesanan yang ingin dibuka.”

Motion: check uses recipe F once after confirmed success; pickup panel radius20→16 uses spatialFast once. Main content is never opacity-hidden. Amount is static. Timeline reflects actual data only. Loading: four-row skeleton. Failure: inline explanation and “Coba lagi”.

### 6.4 Track `/track`

375: bar64 → main343, x16, top24 → H1 “Lacak pesanan” → “Gunakan ID pesanan dari browser yang dipakai saat memesan.” → field “ID pesanan”, placeholder “Tempel ID pesanan” → “Lihat status” full width48 → result pickup/status/amount/timeline after24 → pending cancellation action → footer/nav. At1280: centered720, x280, top48; field/button row536/168 with gap16; result full width. A URL orderId may prefill and fetch with the capability. No pickup-code-only lookup. The ID stays in its input, never a large title.

Cancel confirmation: title “Batalkan pesanan?”; body “Pesanan ini belum disetujui untuk dicetak. Pembatalan tidak mengembalikan pembayaran secara otomatis. Hubungi petugas jika kamu sudah membayar.” Actions “Tetap pesan” tonal / “Batalkan pesanan” destructive. Require current version and CSRF via existing contract. Show cancel only while pending; never authorize it with the code. Success closes the dialog, refreshes detail and sends the cancellation toast. Conflict: “Pesanan sudah diperbarui. Muat ulang status sebelum melanjutkan.”

Motion: result inserts with spatialDefault layout animation; focus its heading without scrolling the entire page unexpectedly. Dialog recipe D. State updates recipe F. Retain input on error. Cancellation produces a terminal cancelled branch, never completed printing steps.

### 6.5 Queue `/queue`

375: bar64 → main343, x16, top24 → H1 “Antrean cetak” → filled panel after24 with “Pesanan dalam antrean”, count displaySmall, “Perkiraan waktu”, `{estimatedTime} menit` if supplied → helper “Perkiraan dapat berubah setelah petugas memeriksa pesanan.” → “Perbarui antrean”48 → text link “Lacak pesanan saya” → information after32 “Antrean ini tidak menampilkan nama atau berkas pelanggan.” → footer/nav. At1280: main960, x160, top48; count/time equal columns, information below. Never display names, filenames, pickup codes or fabricated ETA.

Zero count: “Antrean sedang kosong” / “Belum ada pesanan yang menunggu.” Omit a misleading zero-minute promise. Outage: “Antrean belum bisa dimuat.” / “Coba lagi”.

Motion: values crossfade150ms only after real responses. Refresh icon rotates360 over800ms linear only while pending (static under reduced motion). Use current polling behavior; no invented realtime claim. Preserve previous successful data on refresh failure, labeled “Data terakhir; belum berhasil diperbarui.” Error must not become zero.

### 6.6 Admin login `/admin/login`

375: simplified bar64 with ARSC and theme, no public bottom nav/FAB → main343, x16, top40 → H1 “Masuk petugas” → “Kelola pesanan dan serah-terima ARSC.” → elevated card p24 with “Email petugas”, “Kata sandi”, trailing action “Tampilkan kata sandi” / “Sembunyikan kata sandi” → full-width “Masuk”48 → “Kembali ke beranda”. At1280: main440, x420, top80. No half-screen stock illustration. Footer brand only. No demo password, account creation or password-reset link without a working auth flow.

Motion: no staged entrance; password visibility changes immediately. Login progress “Sedang masuk…”. Redirect only after actual session validation. Inline auth error “Email atau kata sandi tidak cocok. Periksa kembali lalu coba lagi.” Network error “Layanan masuk belum tersedia. Coba lagi sebentar.” Never disclose whether an account exists.

### 6.7 Admin `/admin`

375: bar64 “Pesanan” with menu/theme → main343, x16, top24 → H1 “Meja layanan” → “Tanggal rekap” date field and helper “Waktu Indonesia Barat” → three stacked tonal summary rows labeled “Pesanan dibuat”, “Halaman dipesan”, “Pembayaran terverifikasi”, numbers amount token24 → search “Cari nama atau kode ambil”48 → wrapping status chips “Semua”, “Menunggu”, “Disetujui”, “Diserahkan”, “Dibatalkan” → stacked date-range fields → “Terapkan tanggal” / “Hapus filter” → “Perangkat cetak” selector48 → results count → stacked order cards gap16 → pagination48 → brief footer. Receipt opens in a bottom sheet. No public bottom navigation, FAB or raw UUID/JSON inputs.

1280: top bar64, rail88 atx0, main1128, x120, right32, top32. Header title left, date/refresh right. Summary three equal columns gap16. Search flexes, status filters wrap below, worker selector width320. Order list uses full-width elevated rows, p24: pickup code/name left and status right; contact/date/price/preferences next; document/actions wrap below. No dense seven-column table. Receipt dialog width560. Rail anchors `#orders`, `#summary`, `#workers` target dashboard sections, not invented routes.

Search calls `/api/admin/orders`, debounce350ms; reset page1 on query/status/date changes. Abort obsolete requests. Enter flushes debounce. `pageSize=20`; count “{total} pesanan”; pagination “Halaman {page} dari {pages}”. Empty: “Tidak ada pesanan yang cocok.” / “Ubah kata pencarian atau hapus filter.” From/to dates filter creation date per contract, separate from summary date. Both are Asia/Jakarta. Summary failure is not zero: “Rekap belum tersedia” plus retry. Revenue helper today: “Pembayaran yang diverifikasi hari ini, di luar pesanan yang dibatalkan.” Other date: “Pembayaran yang diverifikasi pada tanggal ini, di luar pesanan yang dibatalkan.” Pages helper: “Halaman dokumen × salinan; bukan jumlah lembar yang sudah dicetak.”

Worker selector: empty “Pilih perangkat”; fake option “Simulasi cetak · {last4ofId}”; other option “Perangkat cetak · {printerKey}”; disabled option “Tidak aktif · {last4ofId}”, not selectable. No active device: “Belum ada perangkat aktif. Hubungi pengelola layanan.” Do not label enabled as “Online”; connectivity is not supplied. Fake device panel: “Mode simulasi: tidak ada dokumen yang dicetak secara fisik.” Never auto-select a disabled worker. No credential fields.

Order row: pickup in code face22, name16/600, contact14 (admin only), timestamp14, amount24. Preferences: “{pages} halaman · {copies} salinan · {color} · {paper}”. Actions: “Lihat dokumen”, “Lihat bukti”, “Lihat rincian”. Downloads keep actual signed access; new tabs are labeled. More menu contains “Batalkan pesanan” / “Cetak ulang” only when backend eligibility permits. Pending primary “Verifikasi pembayaran”; then “Setujui cetak” only with verified payment, valid document, selected enabled worker and no legacy-review blocker. Legacy warning “Pesanan lama perlu diperiksa sebelum disetujui.” Disabled actions always have a visible reason.

Payment rejection: title “Tandai pembayaran untuk diperiksa?”; field “Alasan penolakan”; helper “Jelaskan apa yang perlu diperbaiki pelanggan.” Actions “Kembali” / “Tandai perlu diperiksa”. Preserve the existing reason payload, no new editing/refund promise.

Verification dialog: title “Verifikasi pembayaran?”; body “Pastikan bukti pembayaran sesuai dengan tagihan {amount}. Tindakan ini mencatat pemeriksaan petugas, bukan konfirmasi otomatis dari QRIS.” Actions “Kembali” / “Verifikasi pembayaran”. Approval dialog: title “Masukkan ke antrean cetak?”; body “Periksa berkas dan perangkat yang dipilih. Setelah disetujui, pelanggan tidak dapat membatalkan pesanan.” Actions “Kembali” / “Setujui cetak”. Fake-device addition: “Perangkat yang dipilih adalah simulasi. Tidak ada cetak fisik.”

Completion action “Konfirmasi penyerahan”; dialog “Dokumen sudah diserahkan?”; body “Periksa hasil cetak dan pastikan dokumen sudah diterima pelanggan sebelum mengonfirmasi.” Required checkbox “Saya sudah memeriksa hasil dan menyerahkannya kepada pelanggan.” Actions “Belum diserahkan” / “Sudah diserahkan”. In simulation replace body with “Ini simulasi penyerahan. Tidak ada dokumen fisik yang dicetak atau diserahkan.” Checkbox “Saya mengonfirmasi penyerahan simulasi.” Keep visible environment context on the resulting status.

Receipt title “Rincian pesanan”. First panel: code/name/price/payment/status. Second “Riwayat proses”: chronological human labels and times WIB. Third collapsible “Informasi perangkat”: friendly device and “Nomor proses” (backendJobId), wrapped and operator-only. No raw JSON. It is an operational record, not a fiscal invoice or physical proof. Persistent note “Status proses belum membuktikan hasil cetak fisik. Petugas tetap perlu memeriksa dokumen.” Simulation adds §7 disclosure. Close “Tutup”. No unimplemented download receipt button.

Reconciliation only for failed/needs_reconciliation: title “Perlu pemeriksaan petugas”; body “Periksa perangkat dan hasil cetak sebelum melanjutkan. Jangan mencetak ulang jika hasil sebelumnya belum dipastikan.” Actions “Lihat rincian” and existing eligible “Catat hasil pemeriksaan”. Populate the existing receipt payload only from valid evidence; never request pasted JSON/UUID. Insufficient evidence disables confirmation with “Belum ada catatan perangkat yang bisa dipakai. Hubungi pengelola layanan.” Reprint dialog “Cetak ulang pesanan?”; body “Hasil sebelumnya mungkin sudah tercetak. Cetak ulang dapat menghasilkan dokumen ganda.” Required checkbox “Saya memahami risiko dokumen ganda.” Actions “Kembali” / “Cetak ulang”. No relaxed checks or automatic retries of ambiguous jobs.

Motion: no dashboard entrance cascade. Filtering uses effectsFast crossfade, not spring reordering. Menu/selection spatialFast; receipt recipe D/C. A matched card-to-detail layoutId is allowed only with immediately available data; otherwise open the overlay with a skeleton. Keep action card height/focus stable. Poll refresh is a polite live announcement, not repeated toasts. Critical error stays inline. Rail anchors scroll immediately under reduced motion.

## 7. Final copy registry for `src/lib/copy.ts`

Implement a typed immutable object plus functions for interpolation. Page/component strings in §5–6 are final and also belong in this file; no raw API enum/code fallback in the DOM. Do not dynamically concatenate translated fragments for sentences. Inputs from API are escaped React text. Indonesian sentence case. “Kamu” on customer pages; concise neutral instructions to operators. Product naming `ARSC Printing`. All button/field/menu labels already listed above are exact. Add these reusable keys exactly (identifiers may be grouped, text must not drift).

### 7.1 Status mapping (customer / operator share labels)

| Internal condition (never rendered raw) | Label | Supporting customer sentence |
|---|---|---|
| pending_verification, payment pending | Menunggu pemeriksaan | Petugas akan memeriksa pembayaran dan berkasmu. |
| payment rejected | Pembayaran perlu diperiksa | Bukti pembayaran belum dapat diverifikasi. Hubungi petugas ARSC untuk melanjutkan. |
| approved / ready | Masuk antrean cetak | Pesanan sudah disetujui dan menunggu diproses. |
| claimed | Sedang disiapkan | Perangkat sedang menyiapkan pesanan. |
| submitted | Sedang diproses | Proses cetak sedang berjalan. Tunggu pemeriksaan petugas. |
| backend_completed | Menunggu pemeriksaan hasil | Proses pada perangkat selesai. Petugas masih perlu memeriksa hasil cetak. |
| needs_reconciliation | Perlu pemeriksaan petugas | Ada proses yang perlu diperiksa. Jangan mengirim ulang pesanan yang sama. |
| failed | Proses terhenti | Petugas perlu memeriksa pesanan sebelum melanjutkan. |
| delivered | Sudah diserahkan | Penyerahan pesanan sudah dicatat oleh petugas. |
| cancelled | Dibatalkan | Pesanan ini tidak akan dilanjutkan. Jika sudah membayar, hubungi petugas. |

Precedence: terminal cancelled/delivered order first; rejected payment next; latest revision job next; otherwise pending/approved. No “Selesai di printer”, “Siap diambil” or physical-print claim inferred from backend_completed. Timeline steps: “Terkirim” → “Pembayaran diperiksa” → “Diproses” → “Hasil diperiksa” → “Diserahkan”. Payment step completes only when verified. Result-check step never completes without a physical handover record; it stays current after device completion. Use timestamps only where supplied.

The current customer detail API exposes order status, not granular job status. Show only the supplied states: approved maps to “Masuk antrean cetak”; unavailable intermediate steps stay unfilled. Admin may use actual job state. Never invent progress to make the timeline look finished.

Simulation disclosure: “Mode simulasi: alur ini memakai printer uji. Tidak ada dokumen fisik yang dicetak.” Use the presentation-only build flag `NEXT_PUBLIC_ARSC_SIMULATION` defined in §9. When true, persist this information above admin actions, on receipt and on customer status/success pages. Never infer the flag from order status or expose credentials. Fake-printer recording requires a build with this flag true; the flag grants no permissions and changes no API.

### 7.2 Toasts (all action-result notifications)

| Event | Exact text | Type / timing |
|---|---|---|
| order sent | Pesanan terkirim. Simpan kode ambilmu. | success4s (after redirect, once) |
| copy pickup | Kode ambil disalin. | success4s |
| copy ID | ID pesanan disalin. | success4s |
| clipboard failed | Belum bisa menyalin. Pilih teks lalu salin secara manual. | errorpersistent |
| cancel success | Pesanan dibatalkan. | success4s |
| verify payment | Pembayaran sudah diverifikasi. | success4s |
| reject payment | Pembayaran ditandai perlu diperiksa. | info6s |
| approve | Pesanan disetujui dan masuk antrean cetak. | success4s |
| admin cancel | Pesanan dibatalkan. | success4s |
| deliver | Penyerahan pesanan sudah dicatat. | success4s |
| simulated deliver | Penyerahan simulasi sudah dicatat. | info6s |
| reconcile success | Hasil pemeriksaan sudah dicatat. | success4s |
| reprint | Pesanan cetak ulang masuk antrean. | info6s |
| explicit refresh | Data pesanan sudah diperbarui. | success4s, never on polling |
| signed document failed | Berkas belum bisa dibuka. Coba lagi. | errorpersistent |
| worker list failed | Daftar perangkat belum bisa dimuat. | errorpersistent |
| stale version | Pesanan sudah berubah. Muat ulang data sebelum melanjutkan. | errorpersistent +inline |
| not allowed | Tindakan ini tidak tersedia untuk status pesanan saat ini. | errorpersistent +inline |
| capability/CSRF forbidden | Akses pesanan berakhir. Buka dari browser yang dipakai saat memesan, lalu muat ulang. | errorpersistent +inline |
| session expired | Sesi masuk berakhir. Silakan masuk kembali. | errorpersistent, redirectlogin |
| backend unavailable | Layanan belum bisa dihubungi. Coba lagi sebentar. | errorpersistent +inline retry |
| generic action failed | Perubahan belum tersimpan. Periksa koneksi lalu coba lagi. | errorpersistent +inline |
| logout success | Kamu sudah keluar. | success4s |

No success toast on failed/non-2xx requests. Deduplicate by action toast ID. Field messages remain authoritative; toast supplements them. Never render “Aksi '…' berhasil diproses”, “draft”, “backend”, “CSRF”, “RPC”, “UUID”, “Rev” or raw enums in ordinary copy. Technical information is permitted only in the explicit operator receipt disclosure, never as automatic diagnostic fallback.

### 7.3 Loading, validation and empty copy

Loadinglabels: create “Menyiapkan pesanan…”; documentupload “Mengunggah PDF…”; proofupload “Mengunggah bukti…”; parse “Memeriksa PDF…”; submit “Mengirim pesanan…”; verify “Memverifikasi…”; approve “Memasukkan ke antrean…”; cancel “Membatalkan…”; deliver “Mencatat penyerahan…”; receipt “Memuat rincian…”; list “Memuat pesanan…”; genericrefresh “Memperbarui…”. Screenreadercompletion “Pembaruan selesai.”

Validation: name “Isi nama lengkapmu.”; contact “Isi nomor atau akun yang dapat dihubungi.”; PDFmissing “Pilih dokumen PDF terlebih dahulu.”; invalidPDF “Berkas belum bisa dibaca sebagai PDF. Simpan ulang sebagai PDF lalu coba lagi.”; PDF size “Ukuran PDF melebihi 10 MiB. Perkecil berkas lalu unggah kembali.”; proofmissing “Unggah bukti pembayaran sebelum mengirim pesanan.”; prooftype “Bukti pembayaran harus PNG atau JPEG.”; proofsize “Ukuran bukti melebihi 5 MiB. Perkecil gambar lalu coba lagi.”; copies “Jumlah salinan harus antara 1 dan 100.”; limits “Jumlah halaman atau salinan melebihi batas layanan. Kurangi jumlahnya lalu coba lagi.”; agreement “Periksa ringkasan dan centang konfirmasi sebelum mengirim.”; workerrequired “Pilih perangkat cetak terlebih dahulu.”; reasonrequired “Tuliskan alasan pemeriksaan.”; dateinvalid “Periksa rentang tanggal. Tanggal awal tidak boleh setelah tanggal akhir.”; forbidden “Pesanan ini tidak dapat dibuka dari browser ini.”; notfound “Pesanan tidak ditemukan. Periksa ID pesananmu.”; noorders “Belum ada pesanan.” / “Pesanan baru akan muncul di sini setelah dikirim pelanggan.”

Recheck exact backend bounds while wiring: preserve existing 1–500 pages and total page-copies ≤1000 where authoritative. Never widen server limits. Map errors by code/field; do not print arbitrary diagnostics. Error summary heading “Periksa bagian berikut”, with links focusing invalid fields. No silent dismissal, auto-submit or status-poll toasts.

## 8. Anti-slop and non-negotiable acceptance gates

No hard-coded legacy green brand fills (green is reserved for semantic success), gradients, glass/blur blobs, generic three-icon card grids, decorative browser frames, floating-pill desktop nav, fake charts/testimonials, endlessly bouncing cards, confetti, paragraph-sized headlines, uppercase eyebrows, huge empty gaps between work controls, mixed icons, lucide leftovers, fabricated ETA, random radii, technical success banners, blind prepayment, or destructive actions without confirmation. Expressive does not mean every element is asymmetric. No screenshot-only auth bypass, fake cookies, fake administrator data or queue counts. Overflow clipping is a safety net, not a repair for oversized children.

Stage1: development-only `/dev/tokens` (not publicly linked; unavailable in production) shows both themes, used type/shape/elevation tokens and each component's enabled/hover/focus/pressed/disabled/loading/error/success states. Clearly label fixtures as test data. Stage2: shell screenshots375/1280 and keyboard navigation. Stage3: customer normal/loading/empty/error/cancel states. Stage4: authenticated real admin search, summary, worker, receipt, verify, approve, reconcile and deliver. Stage5: real backend and real worker with fake printer, persistent simulation disclosure, then recording. Open and describe every screenshot; filenames do not prove a pass.

Measure widths320/375/414/768/1280: `document.documentElement.scrollWidth <= viewportWidth`. Include authenticated admin, open overlays, mobile keyboard, 200% text zoom, both themes and reduced motion. Check Tab/ShiftTab/Escape/Enter and radio arrow keys. Focus must not be obscured by nav, toast or sticky bars. Record actual computed text contrast ≥4.5 and controls/focus ≥3, including interaction states. PDF preview must fit. Revoke object URLs on file replacement/unmount. Verify focus return and browser Back. Include long names, long filenames, multiline errors, large prices, many results, missing server/capability/session/device, zero results and expired signed URLs.

Required gates: `bun run test`, `bun run lint`, `bun run typecheck`, `bun run build`, `git diff --check`, all exit0. Stage0 verifies documentation content, token contrast and whitespace, not implemented UI. Stage5 compares before/after LCP/CLS/INP under identical local throttling; investigate >10% regression, target CLS≤0.1. These are future acceptance criteria, not results already achieved.

## 9. Implementation sequence and review handoff

1. Soren approves this exact spec before UI work.
2. Kiro adds theme/font tokens, presentation copy registry, motion tokens, icon assets/license, sonner provider and dev token page. Tailwind3 remains.
3. Shell: app bar, public mobile navigation, admin rail/drawer, footer, FAB, and all FTP→FTAB references including metadata/alt text. Use the full faculty name at the first institutional reference and footer, FTAB thereafter. Never use QRIS as OpenGraph marketing art; use the existing ARSC mark on primaryContainer if needed.
4. Customer pages, then admin. Preserve payloads, capability/CSRF and worker fencing. Missing data is missing, not an invitation to invent it.
5. Atlas reviews visuals; Soren gates each stage. Fix findings before continuing. Commit approved stages with OpenBot co-author trailer; push feature branch only, never merge main or deploy.

### Open factual constraints (not creative decisions delegated to Kiro)

- Exact service hours/contact and building location still need operator confirmation before public launch; use the truthful generic copy above until then.
- Current public customer projection lacks granular job status; show only supported order states. Request a separately reviewed contract extension if granular live customer timeline becomes mandatory.
- Current device API identifies enabled workers, not live connectivity; never label a device online from that boolean.
- Add the presentation-only build flag `NEXT_PUBLIC_ARSC_SIMULATION=true` for the fake-printer simulation build. It contains no secret, grants no access, and changes no API. When true, show the simulation disclosure on all customer status/success pages and admin/receipt, and use simulated-delivery copy. Default false for ordinary builds. The simulation acceptance runner must explicitly set it at build time; never derive this flag from order status or claim physical proof when it is false.
- New fonts/icons must successfully load and license attribution be retained during implementation. No icon IDs/assets fetched or fontdownload/build asserted at Stage0.

These are functional truth constraints, not permission to improvise layouts. Report mismatches to Atlas/Soren, retaining the frozen design choices above.

## 10. Token provenance and reproducible verification

Fidelity comparison generation was a single Bun execution of a locally authored script importing the downloaded official npm tarball, outside this app. No lifecycle scripts, npm install, application package change or runtime generator. Temporary package/script/output are under `E:\OpenBot\tmp\arsc-m3-tokens`.

- Package tarball: `https://registry.npmjs.org/@material/material-color-utilities/-/material-color-utilities-0.4.0.tgz`
- Tarball SHA256: `2F0B759749846357DD2D9CE0E1D5E8071E5B51BDA24178B3D24BA75AFA7F723D`
- Generated JSON SHA256: `8F06419782B0E2C066DC8A813F08C6AA0C8D9D2FFCEA5E5E8E52FBF7F608D600`
- Requested spec:2025; **actual spec:2021** for SchemeFidelity (MCU0.4.0 fallback). SchemeContent also reports2021; comparison TonalSpot reports2025. contrastLevel:0; platform:phone; seed:#1E5AA8. There are49 frozen generated roles per theme in §2. Explicit semantic roles are additional product tokens, not generator output.
- Generator/comparison: `E:\OpenBot\tmp\arsc-m3-tokens\compare.mjs`; output `comparison.json`, chosen `tokens.json`; `fidelity-review.py` measures all three schemes without rerunning MCU. Each scheme has110 generated-pair state plus40 semantic-state measurements (150 each,450 total). All actual spec versions and distances are recorded in the JSON.


Minimal recipe (for provenance; do not rerun during application startup):

```js
import { Hct, argbFromHex, hexFromArgb, SchemeFidelity,
  MaterialDynamicColors } from '@material/material-color-utilities';
const dynamic = new MaterialDynamicColors();
for (const dark of [false, true]) {
  const scheme = new SchemeFidelity(
    Hct.fromInt(argbFromHex('#1E5AA8')), dark, 0, '2025', 'phone');
  // Use the exact role names from §2, excluding only semantic aliases.
  // Each output value is hexFromArgb(dynamic[role]().getArgb(scheme)).
}
```

Contrast formula: convert each sRGB channel c to linear (`c/12.92` if c≤0.04045, otherwise `((c+0.055)/1.055)^2.4`); luminance=0.2126R+0.7152G+0.0722B; ratio=(lighter+0.05)/(darker+0.05). §2.2 uses this calculation, rounded to2 decimal places. No generated brand-role values were manually retouched. Explicit semantic success/warning tokens in §2.1 are separate product choices. State measurements were computed after generation without rerunning MCU.

Fidelity revision verification: all49 generated roles in each theme match the generator JSON; all22 base pairs and150 total state/pair measurements pass their applicable thresholds. Success/warning/error remain distinct from the blue brand. No UI files were edited for this revision.
