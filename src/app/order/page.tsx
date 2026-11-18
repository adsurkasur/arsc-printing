'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { PDFDocument } from 'pdf-lib';
import {
  UploadSimpleDuotone,
  ImageDuotone,
  CheckCircleDuotone,
  WarningCircleDuotone,
  ArrowClockwiseDuotone,
} from '@/components/icons';
import { COPY_PAGES, COPY_UI, COPY_LOADING, COPY_VALIDATION } from '@/lib/copy';
import { m3Transitions } from '@/lib/motion';
import { M3Pressable, getM3LayerVars, M3StateLayer } from '@/components/m3';

async function countPdfPagesSafe(file: File): Promise<number> {
  if (file.size > 10 * 1024 * 1024) {
    throw new Error(COPY_VALIDATION.pdfSize);
  }
  const buffer = await file.arrayBuffer();
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(COPY_VALIDATION.invalidPdf)), 5000),
  );
  const parsePromise = (async () => {
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: false });
    return doc.getPageCount();
  })();
  const count = await Promise.race([parsePromise, timeoutPromise]);
  if (!Number.isFinite(count) || count < 1) {
    throw new Error(COPY_VALIDATION.invalidPdf);
  }
  return count;
}

export default function OrderPage() {
  const router = useRouter();
  const prefersReduced = useReducedMotion() === true;

  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [direction, setDirection] = React.useState<1 | -1>(1);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const [draft, setDraft] = React.useState<{ id: string; csrfToken?: string } | null>(null);
  const [docAcked, setDocAcked] = React.useState(false);
  const [idempotencyKey] = React.useState(() => crypto.randomUUID());

  // Step 1 fields
  const [customerName, setCustomerName] = React.useState('');
  const [contact, setContact] = React.useState('');
  const [copies, setCopies] = React.useState<number>(1);
  const [colorMode, setColorMode] = React.useState<'bw' | 'color'>('bw');
  const [paperSize, setPaperSize] = React.useState<'A4' | 'F4'>('A4');
  const [pagesPerSheet, setPagesPerSheet] = React.useState<1 | 2 | 4>(1);
  const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>('portrait');
  const [notes, setNotes] = React.useState('');

  const [pdfFile, setPdfFile] = React.useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);
  const [pageCount, setPageCount] = React.useState<number | null>(null);
  const [parsingPdf, setParsingPdf] = React.useState(false);

  // Step 2 fields
  const [proofFile, setProofFile] = React.useState<File | null>(null);

  // Step 3 fields
  const [agreed, setAgreed] = React.useState(false);

  const nameRef = React.useRef<HTMLInputElement>(null);
  const contactRef = React.useRef<HTMLInputElement>(null);
  const pdfInputRef = React.useRef<HTMLInputElement>(null);
  const proofInputRef = React.useRef<HTMLInputElement>(null);
  const agreementRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const unitRate = colorMode === 'color' ? 750 : 500;
  const estimatedTotal =
    pageCount !== null ? pageCount * unitRate * Math.max(1, copies) : null;

  const handlePdfChange = async (file: File | null) => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
    setPdfFile(file);
    setPageCount(null);
    setError('');
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPdfUrl(url);
    setParsingPdf(true);
    try {
      const count = await countPdfPagesSafe(file);
      setPageCount(count);
    } catch (err) {
      setPageCount(null);
      setError(err instanceof Error ? err.message : COPY_VALIDATION.invalidPdf);
    } finally {
      setParsingPdf(false);
    }
  };

  const handleProofChange = (file: File | null) => {
    setError('');
    if (!file) {
      setProofFile(null);
      return;
    }
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      setError(COPY_VALIDATION.proofType);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(COPY_VALIDATION.proofSize);
      return;
    }
    setProofFile(file);
  };

  const goStep1To2 = () => {
    setError('');
    if (!customerName.trim()) {
      setError(COPY_VALIDATION.name);
      nameRef.current?.focus();
      return;
    }
    if (!contact.trim()) {
      setError(COPY_VALIDATION.contact);
      contactRef.current?.focus();
      return;
    }
    if (!pdfFile) {
      setError(COPY_VALIDATION.pdfMissing);
      pdfInputRef.current?.focus();
      return;
    }
    if (parsingPdf || pageCount === null) {
      setError(COPY_VALIDATION.invalidPdf);
      return;
    }
    if (!Number.isFinite(copies) || copies < 1 || copies > 100) {
      setError(COPY_VALIDATION.copies);
      return;
    }
    setDirection(1);
    setStep(2);
  };

  const goStep2To3 = () => {
    setError('');
    if (!proofFile) {
      setError(COPY_VALIDATION.proofMissing);
      proofInputRef.current?.focus();
      return;
    }
    setDirection(1);
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!agreed) {
      setError(COPY_VALIDATION.agreement);
      agreementRef.current?.focus();
      return;
    }
    if (!pdfFile || !proofFile || pageCount === null) {
      setError(COPY_VALIDATION.pdfMissing);
      return;
    }

    setBusy(true);
    try {
      let currentDraft = draft;
      if (!currentDraft) {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': idempotencyKey,
          },
          body: JSON.stringify({
            customer_name: customerName.trim(),
            contact: contact.trim(),
            copies,
            color_mode: colorMode,
            paper_size: paperSize,
            layout: `${pagesPerSheet}-up`,
            scale_mode: 'fit',
            orientation,
            user_note: notes.trim() || '',
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error?.message || 'Gagal menyiapkan pesanan.');
        }
        currentDraft = { id: data.id, csrfToken: data.csrfToken };
        setDraft(currentDraft);
      }
      if (!currentDraft.csrfToken) {
        throw new Error('Gagal menyiapkan pesanan.');
      }
      const uploadHeaders = { 'X-CSRF-Token': currentDraft.csrfToken };

      if (!docAcked) {
        const docForm = new FormData();
        docForm.append('orderId', currentDraft.id);
        docForm.append('kind', 'document');
        docForm.append('file', pdfFile);
        const docRes = await fetch('/api/upload', {
          method: 'POST',
          headers: uploadHeaders,
          body: docForm,
        });
        if (!docRes.ok) {
          const d = await docRes.json().catch(() => null);
          throw new Error(d?.error?.message || COPY_VALIDATION.invalidPdf);
        }
        setDocAcked(true);
      }

      const proofForm = new FormData();
      proofForm.append('orderId', currentDraft.id);
      proofForm.append('kind', 'proof');
      proofForm.append('file', proofFile);
      const proofRes = await fetch('/api/upload', {
        method: 'POST',
        headers: uploadHeaders,
        body: proofForm,
      });
      if (!proofRes.ok) {
        throw new Error('Bukti pembayaran belum terunggah. Coba kirim lagi.');
      }

      router.push(`/order-success?orderId=${encodeURIComponent(currentDraft.id)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim pesanan.');
    } finally {
      setBusy(false);
    }
  };

  const stepLabels = ['Berkas', 'Pembayaran', 'Kirim'] as const;

  return (
    <div className="max-w-[960px] mx-auto page-padding pt-6 md:pt-10 page-bottom">
      <div className="mb-space6">
        <h1 className="text-headlineMedium-emphasized md:text-headlineLarge-emphasized font-display text-[var(--md-sys-color-on-surface)]">
          {COPY_PAGES.order.text001}
        </h1>
        <p className="text-bodyLarge text-[var(--md-sys-color-on-surface-variant)] mt-space2">
          {COPY_PAGES.order.text002}
        </p>

        {/* §5 3-step Stepper */}
        <ol className="mt-space6 grid grid-cols-3 gap-space2 min-h-[72px] items-center">
          {stepLabels.map((label, idx) => {
            const num = (idx + 1) as 1 | 2 | 3;
            const done = step > num;
            const current = step === num;
            return (
              <li
                key={label}
                aria-current={current ? 'step' : undefined}
                className="flex flex-col items-center gap-1 text-center"
              >
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-labelMedium-emphasized ${
                    done
                      ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
                      : current
                        ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]'
                        : 'border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-outline)]'
                  }`}
                >
                  {done ? <CheckCircleDuotone className="w-5 h-5" aria-hidden="true" /> : num}
                </span>
                <span className={current ? 'text-labelSmall-emphasized text-[var(--md-sys-color-primary)]' : 'text-labelSmall text-[var(--md-sys-color-on-surface-variant)]'}>
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-[592px_344px] gap-space6 items-start"
      >
        {/* Active Step Elevated Card */}
        <div className="p-space5 md:p-space6 rounded-lPlus bg-[var(--md-sys-color-surface-container-low)] shadow-elevation-1 min-w-0">
          {error && (
            <div
              role="alert"
              className="mb-space4 p-space3 rounded-m bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] flex items-start gap-space2 text-bodyMedium"
            >
              <WarningCircleDuotone className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <AnimatePresence mode="wait" initial={false}>
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={prefersReduced ? false : { x: direction * 24, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={prefersReduced ? undefined : { x: direction * -24, opacity: 0 }}
                transition={m3Transitions(prefersReduced)}
                className="space-y-space5"
              >
                <div>
                  <label htmlFor="customer_name" className="block text-labelLarge-emphasized mb-space2">
                    {COPY_PAGES.order.text004}
                  </label>
                  <input
                    ref={nameRef}
                    id="customer_name"
                    name="customer_name"
                    autoComplete="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    disabled={!!draft || busy}
                    className="w-full h-14 px-space4 rounded-t-xs bg-[var(--md-sys-color-surface-container-highest)] border-b border-[var(--md-sys-color-outline)] text-bodyLarge focus:border-b-2 focus:border-[var(--md-sys-color-primary)] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="contact" className="block text-labelLarge-emphasized mb-space2">
                    {COPY_PAGES.order.text005}
                  </label>
                  <input
                    ref={contactRef}
                    id="contact"
                    name="contact"
                    type="tel"
                    autoComplete="tel"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    disabled={!!draft || busy}
                    className="w-full h-14 px-space4 rounded-t-xs bg-[var(--md-sys-color-surface-container-highest)] border-b border-[var(--md-sys-color-outline)] text-bodyLarge focus:border-b-2 focus:border-[var(--md-sys-color-primary)] focus:outline-none"
                  />
                </div>

                {/* PDF Dropzone */}
                <div>
                  <label className="block min-h-[144px] p-space4 rounded-lPlus border-2 border-dashed border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface-container-low)] flex flex-col items-center justify-center text-center cursor-pointer">
                    <input
                      ref={pdfInputRef}
                      id="document_file"
                      type="file"
                      accept="application/pdf"
                      disabled={!!draft || busy}
                      onChange={(e) => void handlePdfChange(e.target.files?.[0] ?? null)}
                      className="sr-only"
                    />
                    {parsingPdf ? (
                      <ArrowClockwiseDuotone className="w-8 h-8 text-[var(--md-sys-color-primary)] animate-spin mb-space2" aria-hidden="true" />
                    ) : pageCount !== null ? (
                      <CheckCircleDuotone className="w-8 h-8 text-[var(--md-custom-color-success)] mb-space2" aria-hidden="true" />
                    ) : (
                      <UploadSimpleDuotone className="w-8 h-8 text-[var(--md-sys-color-primary)] mb-space2" aria-hidden="true" />
                    )}
                    <span className="text-titleMedium-emphasized">{COPY_UI.dropzonePdf}</span>
                    <span className="text-bodySmall text-[var(--md-sys-color-on-surface-variant)] mt-1">
                      {parsingPdf
                        ? 'Jumlah halaman sedang diperiksa'
                        : pdfFile && pageCount !== null
                          ? `${pdfFile.name} (${pageCount} halaman)`
                          : COPY_UI.dropzonePdfHelper}
                    </span>
                  </label>
                </div>

                {/* Copies */}
                <div>
                  <label htmlFor="copies" className="block text-labelLarge-emphasized mb-space2">
                    Jumlah salinan
                  </label>
                  <input
                    id="copies"
                    type="number"
                    min={1}
                    max={100}
                    value={copies}
                    onChange={(e) => setCopies(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                    disabled={!!draft || busy}
                    className="w-32 h-14 px-space4 rounded-t-xs bg-[var(--md-sys-color-surface-container-highest)] border-b border-[var(--md-sys-color-outline)] text-bodyLarge font-code"
                  />
                </div>

                {/* Segmented: Warna cetak */}
                <div>
                  <span className="block text-labelLarge-emphasized mb-space2">Warna cetak</span>
                  <div role="radiogroup" aria-label="Warna cetak" className="flex h-12 rounded-full border border-[var(--md-sys-color-outline)] overflow-hidden">
                    {([
                      { id: 'bw', label: 'Hitam putih' },
                      { id: 'color', label: 'Warna' },
                    ] as const).map((opt) => {
                      const active = colorMode === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          disabled={!!draft || busy}
                          onClick={() => setColorMode(opt.id)}
                          style={getM3LayerVars('secondaryContainer')}
                          className={`m3-control flex-1 h-full flex items-center justify-center gap-space2 text-labelLarge ${
                            active
                              ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-bold'
                              : 'text-[var(--md-sys-color-on-surface)]'
                          }`}
                        >
                          <M3StateLayer />
                          {active && <CheckCircleDuotone className="w-4 h-4" aria-hidden="true" />}
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Segmented: Ukuran kertas */}
                <div>
                  <span className="block text-labelLarge-emphasized mb-space2">Ukuran kertas</span>
                  <div role="radiogroup" aria-label="Ukuran kertas" className="flex h-12 rounded-full border border-[var(--md-sys-color-outline)] overflow-hidden">
                    {(['A4', 'F4'] as const).map((sz) => {
                      const active = paperSize === sz;
                      return (
                        <button
                          key={sz}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          disabled={!!draft || busy}
                          onClick={() => setPaperSize(sz)}
                          style={getM3LayerVars('secondaryContainer')}
                          className={`m3-control flex-1 h-full flex items-center justify-center gap-space2 text-labelLarge ${
                            active
                              ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-bold'
                              : 'text-[var(--md-sys-color-on-surface)]'
                          }`}
                        >
                          <M3StateLayer />
                          {active && <CheckCircleDuotone className="w-4 h-4" aria-hidden="true" />}
                          <span>{sz}</span>
                        </button>
                      );
                    })}
                  </div>
                  {paperSize === 'F4' && (
                    <p className="text-bodySmall text-[var(--md-sys-color-on-surface-variant)] mt-1">
                      Ketersediaan ukuran F4 diperiksa petugas.
                    </p>
                  )}
                </div>

                {/* Segmented: Halaman per lembar */}
                <div>
                  <span className="block text-labelLarge-emphasized mb-space2">Halaman per lembar</span>
                  <div role="radiogroup" aria-label="Halaman per lembar" className="flex h-12 rounded-full border border-[var(--md-sys-color-outline)] overflow-hidden">
                    {([1, 2, 4] as const).map((n) => {
                      const active = pagesPerSheet === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          disabled={!!draft || busy}
                          onClick={() => setPagesPerSheet(n)}
                          style={getM3LayerVars('secondaryContainer')}
                          className={`m3-control flex-1 h-full flex items-center justify-center gap-space2 text-labelLarge ${
                            active
                              ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-bold'
                              : 'text-[var(--md-sys-color-on-surface)]'
                          }`}
                        >
                          <M3StateLayer />
                          {active && <CheckCircleDuotone className="w-4 h-4" aria-hidden="true" />}
                          <span>{n}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Segmented: Orientasi */}
                <div>
                  <span className="block text-labelLarge-emphasized mb-space2">Orientasi</span>
                  <div role="radiogroup" aria-label="Orientasi" className="flex h-12 rounded-full border border-[var(--md-sys-color-outline)] overflow-hidden">
                    {([
                      { id: 'portrait', label: 'Tegak' },
                      { id: 'landscape', label: 'Mendatar' },
                    ] as const).map((o) => {
                      const active = orientation === o.id;
                      return (
                        <button
                          key={o.id}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          disabled={!!draft || busy}
                          onClick={() => setOrientation(o.id)}
                          style={getM3LayerVars('secondaryContainer')}
                          className={`m3-control flex-1 h-full flex items-center justify-center gap-space2 text-labelLarge ${
                            active
                              ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-bold'
                              : 'text-[var(--md-sys-color-on-surface)]'
                          }`}
                        >
                          <M3StateLayer />
                          {active && <CheckCircleDuotone className="w-4 h-4" aria-hidden="true" />}
                          <span>{o.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-labelLarge-emphasized mb-space2">
                    Catatan untuk petugas (opsional)
                  </label>
                  <input
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={!!draft || busy}
                    className="w-full h-14 px-space4 rounded-t-xs bg-[var(--md-sys-color-surface-container-highest)] border-b border-[var(--md-sys-color-outline)] text-bodyLarge"
                  />
                </div>

                <div className="pt-space2 flex justify-end">
                  <M3Pressable
                    type="button"
                    pair="primary"
                    onClick={goStep1To2}
                    className="h-12 px-6 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-labelLarge-emphasized w-full sm:w-auto"
                  >
                    {COPY_UI.step1Action}
                  </M3Pressable>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={prefersReduced ? false : { x: direction * 24, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={prefersReduced ? undefined : { x: direction * -24, opacity: 0 }}
                transition={m3Transitions(prefersReduced)}
                className="space-y-space5"
              >
                <div className="p-space4 rounded-m bg-[var(--md-sys-color-surface-container)] space-y-1">
                  <p className="text-bodyMedium font-code">
                    {pageCount} halaman × {copies} salinan × Rp {unitRate.toLocaleString('id-ID')}
                  </p>
                  <p className="text-titleMedium-emphasized">
                    Estimasi biaya: <span className="font-code text-[var(--md-sys-color-primary)]">Rp {estimatedTotal?.toLocaleString('id-ID')}</span>
                  </p>
                  <p className="text-bodySmall text-[var(--md-sys-color-on-surface-variant)]">
                    {COPY_UI.qrisEstimate}
                  </p>
                </div>

                <div className="flex flex-col items-center gap-space3">
                  <div className="p-4 bg-white rounded-m inline-block">
                    <Image
                      src="/qris-arsc.jpeg"
                      alt={COPY_UI.qrisTitle}
                      width={256}
                      height={256}
                      className="w-[min(256px,100%)] h-auto"
                    />
                  </div>
                  <a
                    href="/qris-arsc.jpeg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-labelLarge text-[var(--md-sys-color-primary)] underline min-h-[48px] inline-flex items-center"
                  >
                    {COPY_UI.qrisOpen}
                  </a>
                </div>

                {/* Proof Dropzone */}
                <div>
                  <label className="block min-h-[144px] p-space4 rounded-lPlus border-2 border-dashed border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface-container-low)] flex flex-col items-center justify-center text-center cursor-pointer">
                    <input
                      ref={proofInputRef}
                      id="proof_file"
                      type="file"
                      accept="image/png,image/jpeg"
                      disabled={busy}
                      onChange={(e) => handleProofChange(e.target.files?.[0] ?? null)}
                      className="sr-only"
                    />
                    {proofFile ? (
                      <CheckCircleDuotone className="w-8 h-8 text-[var(--md-custom-color-success)] mb-space2" aria-hidden="true" />
                    ) : (
                      <ImageDuotone className="w-8 h-8 text-[var(--md-sys-color-primary)] mb-space2" aria-hidden="true" />
                    )}
                    <span className="text-titleMedium-emphasized">{COPY_UI.dropzoneProof}</span>
                    <span className="text-bodySmall text-[var(--md-sys-color-on-surface-variant)] mt-1">
                      {proofFile ? proofFile.name : COPY_UI.dropzoneProofHelper}
                    </span>
                  </label>
                </div>

                <div className="pt-space2 flex flex-col-reverse sm:flex-row justify-between gap-space3">
                  <M3Pressable
                    type="button"
                    pair="surface"
                    onClick={() => {
                      setDirection(-1);
                      setStep(1);
                    }}
                    className="h-12 px-6 rounded-full border border-[var(--md-sys-color-outline)] text-labelLarge-emphasized"
                  >
                    {COPY_UI.stepBack}
                  </M3Pressable>
                  <M3Pressable
                    type="button"
                    pair="primary"
                    onClick={goStep2To3}
                    className="h-12 px-6 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-labelLarge-emphasized"
                  >
                    {COPY_UI.step2Action}
                  </M3Pressable>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                initial={prefersReduced ? false : { x: direction * 24, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={prefersReduced ? undefined : { x: direction * -24, opacity: 0 }}
                transition={m3Transitions(prefersReduced)}
                className="space-y-space5"
              >
                <div className="p-space4 rounded-m bg-[var(--md-sys-color-surface-container)] space-y-space2 text-bodyMedium">
                  <div><strong>{COPY_PAGES.order.text004}:</strong> {customerName}</div>
                  <div><strong>{COPY_PAGES.order.text005}:</strong> {contact}</div>
                  <div><strong>{COPY_UI.dropzonePdf}:</strong> {pdfFile?.name} ({pageCount} hal)</div>
                  <div><strong>Pengaturan:</strong> {copies}×, {colorMode === 'color' ? 'Warna' : 'Hitam putih'}, {paperSize}, {pagesPerSheet}-up, {orientation === 'portrait' ? 'Tegak' : 'Mendatar'}</div>
                  <div><strong>Estimasi biaya:</strong> <span className="font-code">Rp {estimatedTotal?.toLocaleString('id-ID')}</span></div>
                </div>

                <label className="flex items-start gap-space3 cursor-pointer min-h-[48px]">
                  <input
                    ref={agreementRef}
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    disabled={busy}
                    className="w-6 h-6 mt-1 accent-[var(--md-sys-color-primary)]"
                  />
                  <span className="text-bodyMedium">{COPY_UI.orderAgreement}</span>
                </label>

                <p className="text-bodySmall text-[var(--md-sys-color-on-surface-variant)]">
                  {COPY_UI.orderWarning}
                </p>

                <div className="pt-space2 flex flex-col-reverse sm:flex-row justify-between gap-space3">
                  <M3Pressable
                    type="button"
                    pair="surface"
                    disabled={busy || !!draft}
                    onClick={() => {
                      setDirection(-1);
                      setStep(2);
                    }}
                    className="h-12 px-6 rounded-full border border-[var(--md-sys-color-outline)] text-labelLarge-emphasized"
                  >
                    {COPY_UI.stepBack}
                  </M3Pressable>
                  <M3Pressable
                    type="submit"
                    pair="primary"
                    disabled={busy}
                    aria-busy={busy}
                    className="h-12 px-6 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-labelLarge-emphasized"
                  >
                    {busy ? COPY_LOADING.submit : COPY_UI.stepSubmit}
                  </M3Pressable>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* §6.2 Sticky Summary Filled Card */}
        <aside className="lg:sticky lg:top-24 p-space5 md:p-space6 rounded-lPlus bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] space-y-space4">
          <h2 className="text-titleMedium-emphasized">{COPY_PAGES.order.text003}</h2>
          <div className="space-y-space2 text-bodyMedium">
            <div className="flex justify-between">
              <span className="text-[var(--md-sys-color-on-surface-variant)]">Halaman PDF</span>
              <span className="font-code">{pageCount !== null ? `${pageCount} hal` : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--md-sys-color-on-surface-variant)]">Salinan</span>
              <span className="font-code">{copies}×</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--md-sys-color-on-surface-variant)]">Tarif</span>
              <span className="font-code">Rp {unitRate.toLocaleString('id-ID')}</span>
            </div>
            <div className="pt-space3 border-t border-[var(--md-sys-color-outline-variant)] flex justify-between items-baseline">
              <span className="text-titleSmall-emphasized">{COPY_PAGES.order.text024}</span>
              <span className="text-amount-emphasized font-code text-[var(--md-sys-color-primary)]">
                {estimatedTotal !== null ? `Rp ${estimatedTotal.toLocaleString('id-ID')}` : '—'}
              </span>
            </div>
          </div>
          <p className="text-bodySmall text-[var(--md-sys-color-on-surface-variant)]">
            {COPY_PAGES.order.text025}
          </p>
        </aside>
      </form>
    </div>
  );
}
