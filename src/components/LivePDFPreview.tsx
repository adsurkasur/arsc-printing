"use client";

import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { AlertCircle } from 'lucide-react';

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

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    // Visual classes based on props
    // A4 aspect ratio approx 1:1.414. F4 approx 1:1.523.
    const isLandscape = orientation === "landscape";
    const aspectClass = isLandscape
        ? (paperSize === "A4" ? "aspect-[1.414/1]" : "aspect-[1.523/1]")
        : (paperSize === "A4" ? "aspect-[1/1.414]" : "aspect-[1/1.523]");

    const filterStyle = colorMode === "bw" ? "grayscale(100%)" : "none";

    // Determine grid columns
    let gridClass = "grid-cols-1";
    let pagesToShow = 1;
    if (layout === "2-up") { gridClass = "grid-cols-2"; pagesToShow = 2; }
    else if (layout === "4-up") { gridClass = "grid-cols-2 grid-rows-2"; pagesToShow = 4; }

    const showWarning = actualPages && claimedPages && actualPages !== claimedPages;

    return (
        <div className="flex flex-col gap-4 w-full h-full max-h-[80vh]">
            {showWarning && (
                <div className="bg-destructive/10 text-destructive text-sm font-medium p-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>Peringatan: Jumlah halaman dokumen asli ({actualPages}) tidak sama dengan input ({claimedPages}).</span>
                </div>
            )}

            <div className="flex-1 overflow-auto bg-muted/20 p-4 rounded-xl flex items-center justify-center min-h-[400px]">
                <div
                    className={cn(
                        "relative bg-white shadow-lg transition-all duration-500 overflow-hidden",
                        aspectClass,
                        "w-full max-w-[600px]"
                    )}
                    style={{ filter: filterStyle }}
                >
                    <Document
                        file={fileUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        className={cn(
                            "w-full h-full p-4 grid gap-4 transition-all",
                            gridClass
                        )}
                        loading={
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        }
                    >
                        {Array.from(new Array(Math.min(pagesToShow, numPages || 1)), (el, index) => (
                            <div key={`page_${index + 1}`} className="relative w-full h-full border border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden bg-white">
                                <Page
                                    pageNumber={index + 1}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    className={cn(
                                        "transition-all duration-300 w-full h-full flex items-center justify-center overflow-hidden",
                                        scaleMode === 'fit' ? '[&>canvas]:!w-full [&>canvas]:!h-full [&>canvas]:!object-contain' : '',
                                        scaleMode === 'fill' ? '[&>canvas]:!w-full [&>canvas]:!h-full [&>canvas]:!object-cover' : '',
                                        scaleMode === '100' ? '[&>canvas]:!w-auto [&>canvas]:!h-auto [&>canvas]:!object-none' : ''
                                    )}
                                    width={isLandscape ? (pagesToShow > 1 ? 300 : 500) : (pagesToShow > 1 ? 200 : 400)}
                                />
                            </div>
                        ))}
                    </Document>
                </div>
            </div>

            <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-2 flex-wrap">
                <span>Pratinjau visual ini mungkin tidak 100% akurat.</span>
                <span className="font-mono bg-muted px-2 py-0.5 rounded">
                    {paperSize} • {orientation === 'portrait' ? 'Potret' : 'Lansekap'} • {layout} • Skala {scaleMode}
                </span>
            </div>
        </div>
    );
}
