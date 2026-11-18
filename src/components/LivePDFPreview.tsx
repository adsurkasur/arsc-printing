"use client";
// Use the browser's local PDF viewer; do not load executable PDF workers from a CDN.
interface Props {
 fileUrl:string; colorMode:'bw'|'color';layout:'1-up'|'2-up'|'4-up';scaleMode:'fit'|'fill'|'100';
 orientation:'portrait'|'landscape';paperSize:'A4'|'F4';actualPages?:number|null;claimedPages?:number|null;
}
export default function LivePDFPreview({fileUrl,paperSize,layout,orientation,actualPages}:Props) {
 let safe=false;
 try {const url=new URL(fileUrl);safe=url.protocol==='blob:'||(['localhost','127.0.0.1','[::1]'].includes(url.hostname)&&url.protocol==='http:');}catch{/* do not embed arbitrary URLs */}
 if(!safe)return <p>Pratinjau hanya tersedia untuk berkas lokal yang diizinkan.</p>;
 return <section className="space-y-2"><p>Pratinjau dokumen; bukan bukti layout hasil printer. {paperSize}, {layout}, {orientation}; {actualPages??'?'} halaman.</p>
 <iframe title="Pratinjau PDF lokal" sandbox="" src={fileUrl} className="w-full min-h-96 border"/></section>;
}
