"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { AlertCircle, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface LivePDFPreviewProps {
    fileUrl: string;
    colorMode: "bw" | "color";
    layout: "1-up" | "2-up" | "4-up";
    scaleMode: "fit" | "fill" | "100";
    orientation: "portrait" | "landscape";
    paperSize: "A4" | "F4";
    actualPages?: number | null;
    claimedPages?: number | null;
}

export default function LivePDFPreview({
    fileUrl,
    colorMode,
    layout,
    scaleMode,
    orientation,
    paperSize,
    actualPages,
    claimedPages
}: LivePDFPreviewProps) {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [pageWidth, setPageWidth] = useState(350);

    const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    }, []);

    const toggleFullscreen = () => setIsFullscreen(prev => !prev);

    // Lock body scroll in fullscreen
    useEffect(() => {
        if (isFullscreen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isFullscreen]);

    // Measure scrollable area to compute page width
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const measure = () => {
            const w = el.clientWidth;
            const pad = 32; // total horizontal padding (p-4 = 16px each side)
            const gap = 16;
            const cols = (layout === '2-up' || layout === '4-up') ? 2 : 1;
            const available = cols > 1 ? (w - pad - gap) / cols : w - pad;
            setPageWidth(Math.max(available, 150));
        };

        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => ro.disconnect();
    }, [isFullscreen, layout]);

    const filterStyle = colorMode === "bw" ? "grayscale(100%)" : "none";
    const showWarning = !!(actualPages && claimedPages && actualPages !== claimedPages);

    // Grid class for multi-up layouts
    const gridCols = (layout === '2-up' || layout === '4-up') ? 'grid-cols-2' : 'grid-cols-1';

    const previewUI = (
        <div
            className={[
                "flex flex-col w-full",
                isFullscreen
                    ? "fixed inset-0 z-50 bg-background"
                    : "relative border border-border/50 rounded-xl shadow-inner bg-muted/10 h-full"
            ].join(' ')}
        >
            {/* Toolbar */}
            <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30 shrink-0">
                <span className="text-sm font-semibold">Pratinjau Dokumen</span>
                <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="h-8 w-8 p-0">
                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
            </div>

            {/* Scrollable document area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto overflow-x-hidden p-4"
                style={{ minHeight: 0 /* ensures flex child can shrink and scroll */ }}
            >
                {showWarning && (
                    <div className="bg-destructive/10 text-destructive text-sm font-medium p-3 rounded-lg flex items-center gap-2 mb-4">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>Peringatan: Halaman asli ({actualPages}) ≠ input ({claimedPages}).</span>
                    </div>
                )}

                <div style={{ filter: filterStyle }}>
                    <Document
                        file={fileUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                            </div>
                        }
                        error={
                            <div className="flex flex-col items-center justify-center py-20 text-destructive gap-2">
                                <AlertCircle className="h-6 w-6" />
                                <span className="text-sm">Gagal memuat PDF.</span>
                            </div>
                        }
                    >
                        <div className={`grid ${gridCols} gap-3 justify-items-center`}>
                            {Array.from({ length: numPages || 0 }, (_, i) => (
                                <div
                                    key={`page_${i + 1}`}
                                    className="bg-white shadow-md ring-1 ring-black/5 rounded overflow-hidden"
                                >
                                    <Page
                                        pageNumber={i + 1}
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                        width={pageWidth}
                                    />
                                </div>
                            ))}
                        </div>
                    </Document>
                </div>
            </div>

            {/* Status bar */}
            <div className="px-3 py-1.5 text-center text-[11px] text-muted-foreground bg-muted/30 border-t flex flex-wrap items-center justify-center gap-1.5 shrink-0">
                <span className="font-semibold">{numPages ?? '?'} Hal</span>
                <span>•</span>
                <span className="font-mono">{paperSize}</span>
                <span>•</span>
                <span>{orientation === 'portrait' ? 'Potret' : 'Lansekap'}</span>
                <span>•</span>
                <span>{layout}</span>
                <span>•</span>
                <span>Skala {scaleMode}</span>
            </div>
        </div>
    );

    // When fullscreen, render the overlay + a placeholder in the original spot
    if (isFullscreen) {
        return (
            <>
                {/* Placeholder where the preview used to be */}
                <div className="w-full h-full border border-border/50 rounded-xl flex flex-col items-center justify-center bg-muted/10 gap-3">
                    <p className="text-sm text-muted-foreground">Pratinjau dalam mode layar penuh.</p>
                    <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                        <Minimize className="mr-2 h-4 w-4" /> Keluar Layar Penuh
                    </Button>
                </div>
                {/* Full-screen overlay content */}
                {previewUI}
            </>
        );
    }

    return previewUI;
}
