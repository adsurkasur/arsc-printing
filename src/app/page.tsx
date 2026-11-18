import Link from 'next/link';
import { FileTextDuotone } from '@/components/icons';
import { COPY_PAGES, COPY_UI } from '@/lib/copy';
import { getM3LayerVars, M3StateLayer } from '@/components/m3';
import { HomeQueueStrip } from '@/components/HomeQueueStrip';

export default function HomePage() {
  const processSteps = [
    { title: COPY_PAGES.home.text012, desc: COPY_PAGES.home.text013 },
    { title: COPY_PAGES.home.text014, desc: COPY_PAGES.home.text015 },
    { title: COPY_PAGES.home.text016, desc: COPY_PAGES.home.text017 },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-6 md:pt-12 pb-12">
      {/* §6.1 Two-column hero at >=840 (7/5, gap 48px), stacked at 375 */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-7 min-w-0">
          <h1 className="text-displaySmall-emphasized lg:text-displayLarge-emphasized font-display text-[var(--md-sys-color-on-surface)] whitespace-pre-line max-w-[620px]">
            {COPY_PAGES.home.text001.replace('\\n', '\n')}
          </h1>
          <p className="text-bodyLarge text-[var(--md-sys-color-on-surface-variant)] mt-space4 max-w-[520px]">
            {COPY_PAGES.home.text002}
          </p>

          <div className="mt-space6 flex flex-col sm:flex-row sm:items-center gap-space2 sm:gap-space4">
            <Link
              href="/order"
              style={getM3LayerVars('primary')}
              className="m3-control h-12 px-6 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-labelLarge-emphasized flex items-center justify-center gap-space2 w-full sm:w-auto"
            >
              <M3StateLayer />
              <FileTextDuotone className="w-5 h-5" aria-hidden="true" />
              <span>{COPY_UI.orderCta}</span>
            </Link>

            <Link
              href="/track"
              style={getM3LayerVars('surface')}
              className="m3-control h-12 px-4 rounded-full text-[var(--md-sys-color-primary)] text-labelLarge-emphasized flex items-center justify-center w-full sm:w-auto"
            >
              <M3StateLayer />
              <span>{COPY_PAGES.home.text004}</span>
            </Link>
          </div>
        </div>

        {/* Asymmetric tariff panel: 48/16/48/16 clockwise */}
        <div className="lg:col-span-5 min-w-0">
          <div className="p-6 rounded-tl-[48px] rounded-tr-[16px] rounded-br-[48px] rounded-bl-[16px] bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] lg:min-h-[260px] flex flex-col justify-between">
            <h2 className="text-headlineSmall-emphasized font-display">
              {COPY_PAGES.home.text005}
            </h2>
            <div className="mt-space6 space-y-space4">
              <div className="flex items-baseline justify-between gap-space4 border-b border-[var(--md-sys-color-outline-variant)] pb-space3">
                <span className="text-titleMedium text-[var(--md-sys-color-on-surface)]">{COPY_PAGES.home.text006}</span>
                <span className="text-amount-emphasized font-code text-[var(--md-sys-color-primary)]">
                  {COPY_PAGES.home.text007}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-space4">
                <span className="text-titleMedium text-[var(--md-sys-color-on-surface)]">{COPY_PAGES.home.text008}</span>
                <span className="text-amount-emphasized font-code text-[var(--md-sys-color-primary)]">
                  {COPY_PAGES.home.text009}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Queue strip */}
      <HomeQueueStrip />

      {/* Process section: 384/768 split on desktop, 3 stacked rows */}
      <section className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
        <div className="lg:col-span-4 min-w-0">
          <h2 className="text-headlineSmall-emphasized font-display text-[var(--md-sys-color-on-surface)]">
            {COPY_PAGES.home.text011}
          </h2>
          <p className="text-bodyMedium text-[var(--md-sys-color-on-surface-variant)] mt-space2">
            {COPY_PAGES.home.text018}
          </p>
        </div>

        <ol className="lg:col-span-8 min-w-0 divide-y divide-[var(--md-sys-color-outline-variant)] border-y border-[var(--md-sys-color-outline-variant)]">
          {processSteps.map((step, idx) => (
            <li key={step.title} className="py-space4 flex items-start gap-space4">
              <span className="w-8 h-8 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] text-labelLarge-emphasized flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <div className="min-w-0">
                <h3 className="text-titleMedium-emphasized text-[var(--md-sys-color-on-surface)]">
                  {step.title}
                </h3>
                <p className="text-bodyMedium text-[var(--md-sys-color-on-surface-variant)] mt-space1">
                  {step.desc}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
