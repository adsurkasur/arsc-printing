"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { AlertCircle, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Create a basic clsx/tailwind merge utility if not imported
function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}

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
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(400);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

    // Prevent body scroll when in fullscreen
    useEffect(() => {
        if (isFullscreen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isFullscreen]);

    // Simple ResizeObserver to fit PDF to container
    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerWidth(entry.contentRect.width);
            }
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, [isFullscreen]);

    const filterStyle = colorMode === "bw" ? "grayscale(100%)" : "none";

    // Determine grid columns based on layout
    let gridClass = "grid-cols-1";
    let columns = 1;
    if (layout === "2-up" || layout === "4-up") {
        gridClass = "grid-cols-2";
        columns = 2;
    }

    // Calculate maximum width of each page considering grid gap and padding
    const padding = 32; // px 
    const gap = 16; // px
    const pageDisplayWidth = columns > 1
        ? (containerWidth - padding - gap) / 2
        : containerWidth - padding;

    const showWarning = !!(actualPages && claimedPages && actualPages !== claimedPages);

    const content = (
        <div className={cn(
            "flex flex-col bg-card w-full h-full",
            isFullscreen
                ? "fixed inset-0 z-50 rounded-none border-none"
                : "relative border border-border/50 rounded-xl overflow-hidden shadow-inner bg-muted/10 h-full"
        )}>
            {/* Header Toolbar */}
            <div className="flex items-center justify-between p-3 border-b bg-muted/40">
                <span className="text-sm font-semibold flex items-center gap-2">
                    Pratinjau Dokumen
                </span>
                <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="h-8 w-8 p-0">
                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
            </div>

            <div className="flex-1 overflow-auto bg-muted/20 p-2 sm:p-4" ref={containerRef}>
                {showWarning && (
                    <div className="bg-destructive/10 text-destructive text-sm font-medium p-3 rounded-lg flex items-center gap-2 mb-4 mx-auto max-w-2xl">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>Peringatan: Jumlah halaman dokumen asli ({actualPages}) tidak sama dengan input ({claimedPages}).</span>
                    </div>
                )}

                <div style={{ filter: filterStyle }} className="w-full h-full flex justify-center">
                    <Document
                        file={fileUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        className={cn("grid gap-4 max-w-3xl items-start pb-8", gridClass)}
                        loading={
                            <div className="col-span-full h-[300px] flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        }
                    >
                        {Array.from(new Array(numPages || 0), (el, index) => (
                            <div key={`page_${index + 1}`} className="bg-white mx-auto overflow-hidden shadow-md ring-1 ring-border/50">
                                <Page
                                    pageNumber={index + 1}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    width={pageDisplayWidth > 50 ? pageDisplayWidth : 300} // Fallback width if display width calculation fails
                                />
                            </div>
                        ))}
                    </Document>
                </div>
            </div>

            {/* Footer Status Bar */}
            <div className="px-3 py-2 text-center text-[11px] sm:text-xs text-muted-foreground bg-muted/40 border-t flex flex-wrap items-center justify-center gap-1.5 shrink-0">
                <span className="font-semibold">{numPages || '?'} Hal</span>
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

    if (isFullscreen) {
        return (
            <>
                <div className="w-full h-full border border-border/50 rounded-xl relative overflow-hidden flex flex-col items-center justify-center bg-muted/10">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground mb-4">Pratinjau dalam mode layar penuh.</p>
                    <Button variant="outline" onClick={toggleFullscreen}>
                        <Minimize className="mr-2 h-4 w-4" /> Keluar Layar Penuh
                    </Button>
                </div>
                {content}
            </>
        );
    }

    return content;
}
