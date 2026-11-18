/** Reviewed M3_SPEC §5–7 registry. Reference: docs/COPY_MANIFEST.json.
 * Order, payment and device job states are different domains. Never expose job
 * states through the customer formatter or infer them from an approved order. */
import type { Order, OrderStatus } from '@/types/order';
import type { JobStatus } from '@/types/print-job';
export type PaymentStatus = Order['payment_status'];
type StatusCopy = { readonly label: string; readonly sentence: string };

export const COPY_ORDER_STATUS = {
  "pending_verification": {
    "label": "Menunggu pemeriksaan",
    "sentence": "Petugas akan memeriksa pembayaran dan berkasmu."
  },
  "approved": {
    "label": "Masuk antrean cetak",
    "sentence": "Pesanan sudah disetujui dan menunggu diproses."
  },
  "delivered": {
    "label": "Sudah diserahkan",
    "sentence": "Penyerahan pesanan sudah dicatat oleh petugas."
  },
  "cancelled": {
    "label": "Dibatalkan",
    "sentence": "Pesanan ini tidak akan dilanjutkan. Jika sudah membayar, hubungi petugas."
  }
} as const satisfies Record<OrderStatus, StatusCopy>;

export const COPY_PAYMENT_STATUS = {
  "pending": {
    "label": "Menunggu pemeriksaan",
    "sentence": "Petugas akan memeriksa pembayaran dan berkasmu."
  },
  "verified": {
    "label": "Pembayaran terverifikasi",
    "sentence": "Pembayaran sudah diverifikasi."
  },
  "rejected": {
    "label": "Pembayaran perlu diperiksa",
    "sentence": "Bukti pembayaran belum dapat diverifikasi. Hubungi petugas ARSC untuk melanjutkan."
  }
} as const satisfies Record<PaymentStatus, StatusCopy>;

export const COPY_JOB_STATUS = {
  "ready": {
    "label": "Masuk antrean cetak",
    "sentence": "Pesanan sudah disetujui dan menunggu diproses."
  },
  "claimed": {
    "label": "Sedang disiapkan",
    "sentence": "Perangkat sedang menyiapkan pesanan."
  },
  "submitted": {
    "label": "Sedang diproses",
    "sentence": "Proses cetak sedang berjalan. Tunggu pemeriksaan petugas."
  },
  "backend_completed": {
    "label": "Menunggu pemeriksaan hasil",
    "sentence": "Proses pada perangkat selesai. Petugas masih perlu memeriksa hasil cetak."
  },
  "needs_reconciliation": {
    "label": "Perlu pemeriksaan petugas",
    "sentence": "Ada proses yang perlu diperiksa. Jangan mengirim ulang pesanan yang sama."
  },
  "failed": {
    "label": "Proses terhenti",
    "sentence": "Petugas perlu memeriksa pesanan sebelum melanjutkan."
  }
} as const satisfies Record<JobStatus, StatusCopy>;

export const COPY_TIMELINE_STEPS = [
  "Terkirim",
  "Pembayaran diperiksa",
  "Diproses",
  "Hasil diperiksa",
  "Diserahkan"
] as const;

export const COPY_SIMULATION = {
  "disclosure": "Mode simulasi: alur ini memakai printer uji. Tidak ada dokumen fisik yang dicetak."
} as const;

export const COPY_TOASTS = {
  "orderSent": "Pesanan terkirim. Simpan kode ambilmu.",
  "copyPickup": "Kode ambil disalin.",
  "copyId": "ID pesanan disalin.",
  "clipboardFailed": "Belum bisa menyalin. Pilih teks lalu salin secara manual.",
  "cancelSuccess": "Pesanan dibatalkan.",
  "verifyPayment": "Pembayaran sudah diverifikasi.",
  "rejectPayment": "Pembayaran ditandai perlu diperiksa.",
  approve: 'Pesanan disetujui dan masuk antrean cetak.',
  "adminCancel": "Pesanan dibatalkan.",
  "deliver": "Penyerahan pesanan sudah dicatat.",
  "simulatedDeliver": "Penyerahan simulasi sudah dicatat.",
  "reconcileSuccess": "Hasil pemeriksaan sudah dicatat.",
  "reprint": "Pesanan cetak ulang masuk antrean.",
  "explicitRefresh": "Data pesanan sudah diperbarui.",
  "signedDocumentFailed": "Berkas belum bisa dibuka. Coba lagi.",
  "workerListFailed": "Daftar perangkat belum bisa dimuat.",
  "staleVersion": "Pesanan sudah berubah. Muat ulang data sebelum melanjutkan.",
  "notAllowed": "Tindakan ini tidak tersedia untuk status pesanan saat ini.",
  "capabilityCsrfForbidden": "Akses pesanan berakhir. Buka dari browser yang dipakai saat memesan, lalu muat ulang.",
  "sessionExpired": "Sesi masuk berakhir. Silakan masuk kembali.",
  "backendUnavailable": "Layanan belum bisa dihubungi. Coba lagi sebentar.",
  "genericActionFailed": "Perubahan belum tersimpan. Periksa koneksi lalu coba lagi.",
  "logoutSuccess": "Kamu sudah keluar."
} as const;

export const COPY_LOADING = {
  "create": "Menyiapkan pesanan…",
  "documentUpload": "Mengunggah PDF…",
  "proofUpload": "Mengunggah bukti…",
  "parse": "Memeriksa PDF…",
  "submit": "Mengirim pesanan…",
  "verify": "Memverifikasi…",
  "approve": "Memasukkan ke antrean…",
  "cancel": "Membatalkan…",
  "deliver": "Mencatat penyerahan…",
  "receipt": "Memuat rincian…",
  "list": "Memuat pesanan…",
  "genericRefresh": "Memperbarui…",
  "screenReaderCompletion": "Pembaruan selesai."
} as const;

export const COPY_VALIDATION = {
  "name": "Isi nama lengkapmu.",
  "contact": "Isi nomor atau akun yang dapat dihubungi.",
  "pdfMissing": "Pilih dokumen PDF terlebih dahulu.",
  "invalidPdf": "Berkas belum bisa dibaca sebagai PDF. Simpan ulang sebagai PDF lalu coba lagi.",
  "pdfSize": "Ukuran PDF melebihi 10 MiB. Perkecil berkas lalu unggah kembali.",
  "proofMissing": "Unggah bukti pembayaran sebelum mengirim pesanan.",
  "proofType": "Bukti pembayaran harus PNG atau JPEG.",
  "proofSize": "Ukuran bukti melebihi 5 MiB. Perkecil gambar lalu coba lagi.",
  "copies": "Jumlah salinan harus antara 1 dan 100.",
  "limits": "Jumlah halaman atau salinan melebihi batas layanan. Kurangi jumlahnya lalu coba lagi.",
  "agreement": "Periksa ringkasan dan centang konfirmasi sebelum mengirim.",
  "workerRequired": "Pilih perangkat cetak terlebih dahulu.",
  "reasonRequired": "Tuliskan alasan pemeriksaan.",
  "dateInvalid": "Periksa rentang tanggal. Tanggal awal tidak boleh setelah tanggal akhir.",
  "forbidden": "Pesanan ini tidak dapat dibuka dari browser ini.",
  "notFound": "Pesanan tidak ditemukan. Periksa ID pesananmu.",
  "errorSummaryHeading": "Periksa bagian berikut"
} as const;

export const COPY_EMPTY = {
  "noOrders": "Belum ada pesanan.",
  "noOrdersSub": "Pesanan baru akan muncul di sini setelah dikirim pelanggan."
} as const;

export const COPY_UI = {
  "brandName": "ARSC Printing",
  "appMarkTitle": "ARSC Printing",
  "faculty": "Fakultas Teknologi Agroindustri dan Biosistem (FTAB)",
  "orderCta": "Buat pesanan",
  "navHome": "Beranda",
  "navOrder": "Pesan",
  "navTrack": "Lacak",
  "navQueue": "Antrean",
  "dropzonePdf": "Dokumen PDF",
  "dropzonePdfHelper": "PDF saja, maksimal 10 MiB.",
  "dropzonePdfDrag": "Lepaskan berkas di sini",
  "dropzoneProof": "Bukti pembayaran",
  "dropzoneProofHelper": "PNG atau JPEG, maksimal 5 MiB.",
  "dropzoneProofDrag": "Lepaskan berkas di sini",
  "dropzoneChangeFile": "Ganti berkas",
  "step1Action": "Lanjut ke pembayaran",
  "step2Action": "Periksa pesanan",
  "stepBack": "Kembali",
  "stepSubmit": "Kirim pesanan",
  "qrisTitle": "Kode QRIS pembayaran ARSC",
  "qrisOpen": "Buka QRIS",
  "qrisEstimate": "Estimasi; tagihan akhir dihitung dari berkas oleh server.",
  "orderAgreement": "Saya sudah memeriksa berkas, pengaturan cetak, dan bukti pembayaran.",
  "orderWarning": "Berkas dan pengaturan tidak dapat diubah setelah pesanan dikirim.",
  "close": "Tutup",
  "cancel": "Batal",
  "searchOrders": "Cari nama atau kode ambil",
  "pickupLabel": "Kode ambil",
  "pickupMissing": "Kode ambil belum tersedia",
  "copyPickup": "Salin kode ambil",
  "copyId": "Salin ID pesanan",
  "pickupHelper": "Simpan kode ini untuk mengambil pesanan. Untuk melacak, gunakan browser yang dipakai saat memesan.",
  "privacyHelper": "Jangan bagikan tautan pesanan kepada orang lain.",
  "retry": "Coba lagi",
  "skip": "Lewati ke isi utama",
  "cancelTitle": "Batalkan pesanan?",
  "cancelBody": "Pesanan ini belum disetujui untuk dicetak. Pembatalan tidak mengembalikan pembayaran secara otomatis. Hubungi petugas jika kamu sudah membayar.",
  "keepOrder": "Tetap pesan",
  "cancelOrder": "Batalkan pesanan"
} as const;

export const COPY_HOME = {
  heroTitle: "Cetak tugas,\nlanjutkan harimu.",
  heroSubtitle: "Kirim PDF, bayar sesuai tagihan, lalu ambil pesanan di sekretariat ARSC.",
  tariffHeading: "Tarif yang jelas",
  tariffBwLabel: "Hitam putih",
  tariffBwValue: "Rp 500 per halaman",
  tariffColorLabel: "Warna",
  tariffColorValue: "Rp 750 per halaman",
  queueCountSuffix: "pesanan dalam antrean",
  queueLink: "Lihat antrean",
} as const;

export const COPY_PAGES = {
  "home": {
    "text001": "Cetak tugas,\\nlanjutkan harimu.",
    "text002": "Kirim PDF, bayar sesuai tagihan, lalu ambil pesanan di sekretariat ARSC.",
    "text003": "Buat pesanan",
    "text004": "Lacak pesanan",
    "text005": "Tarif yang jelas",
    "text006": "Hitam putih",
    "text007": "Rp 500 per halaman",
    "text008": "Warna",
    "text009": "Rp 750 per halaman",
    "text010": "Lihat antrean",
    "text011": "Dari PDF ke meja ambil",
    "text012": "Unggah PDF",
    "text013": "Pilih jumlah salinan dan pengaturan cetak.",
    "text014": "Bayar dan kirim bukti",
    "text015": "Periksa tagihan, lalu unggah bukti pembayaran.",
    "text016": "Tunggu pemeriksaan",
    "text017": "Petugas memeriksa pembayaran dan menyiapkan pesanan untuk diambil.",
    "text018": "Layanan mengikuti jadwal piket sekretariat. Pesanan di luar jadwal akan diperiksa pada sesi berikutnya."
  },
  "order": {
    "text001": "Buat pesanan",
    "text002": "Siapkan PDF dan bukti pembayaran. Kami akan memeriksa pesanan sebelum mencetak.",
    "text003": "Ringkasan pesanan",
    "text004": "Nama lengkap",
    "text005": "Nomor WhatsApp atau Telegram",
    "text006": "Dokumen PDF",
    "text007": "PDF saja, maksimal 10 MiB.",
    "text008": "Jumlah halaman sedang diperiksa",
    "text009": "Jumlah salinan",
    "text010": "Warna cetak",
    "text011": "Hitam putih",
    "text012": "Warna",
    "text013": "Ukuran kertas",
    "text014": "A4",
    "text015": "F4",
    "text016": "Halaman per lembar",
    "text017": "1",
    "text018": "2",
    "text019": "4",
    "text020": "Tegak",
    "text021": "Mendatar",
    "text022": "Catatan untuk petugas (opsional)",
    "text023": "Ketersediaan ukuran F4 diperiksa petugas.",
    "text024": "Estimasi biaya",
    "text025": "Estimasi; tagihan akhir dihitung dari berkas oleh server.",
    "text026": "Kode QRIS pembayaran ARSC",
    "text027": "Buka QRIS",
    "text028": "Bukti pembayaran",
    "text029": "PNG atau JPEG, maksimal 5 MiB.",
    "text030": "Saya sudah memeriksa berkas, pengaturan cetak, dan bukti pembayaran.",
    "text031": "Berkas dan pengaturan tidak dapat diubah setelah pesanan dikirim.",
    "text032": "Kirim pesanan",
    "text033": "Kembali",
    "text034": "Lanjut ke pembayaran",
    "text035": "Periksa pesanan",
    "text036": "Bukti pembayaran belum terunggah. Coba kirim lagi.",
    "text037": "Tagihan dihitung dari PDF yang diterima. Periksa kembali jumlahnya."
  },
  "success": {
    "text001": "Pesanan terkirim",
    "text002": "Pembayaran dan berkasmu akan diperiksa petugas.",
    "text003": "Lacak pesanan",
    "text004": "Buat pesanan lain",
    "text005": "Simpan kode ini untuk mengambil pesanan. Untuk melacak, gunakan browser yang dipakai saat memesan.",
    "text006": "Jangan bagikan tautan pesanan kepada orang lain.",
    "text007": "Salin kode ambil",
    "text008": "Salin ID pesanan",
    "text009": "Pesanan belum bisa dibuka",
    "text010": "Buka halaman ini dari browser yang dipakai saat memesan. Kode ambil saja tidak dapat membuka pesanan.",
    "text011": "Kembali ke beranda",
    "text012": "Pilih pesanan yang ingin dibuka.",
    "text013": "Coba lagi"
  },
  "track": {
    "text001": "Lacak pesanan",
    "text002": "Gunakan ID pesanan dari browser yang dipakai saat memesan.",
    "text003": "ID pesanan",
    "text004": "Tempel ID pesanan",
    "text005": "Lihat status",
    "text006": "Batalkan pesanan?",
    "text007": "Pesanan ini belum disetujui untuk dicetak. Pembatalan tidak mengembalikan pembayaran secara otomatis. Hubungi petugas jika kamu sudah membayar.",
    "text008": "Tetap pesan",
    "text009": "Batalkan pesanan",
    "text010": "Pesanan sudah diperbarui. Muat ulang status sebelum melanjutkan."
  },
  "queue": {
    "text001": "Antrean cetak",
    "text002": "Pesanan dalam antrean",
    "text003": "Perkiraan waktu",
    "text004": "Perkiraan dapat berubah setelah petugas memeriksa pesanan.",
    "text005": "Perbarui antrean",
    "text006": "Lacak pesanan saya",
    "text007": "Antrean ini tidak menampilkan nama atau berkas pelanggan.",
    "text008": "Antrean sedang kosong",
    "text009": "Belum ada pesanan yang menunggu.",
    "text010": "Antrean belum bisa dimuat.",
    "text011": "Coba lagi",
    "text012": "Data terakhir; belum berhasil diperbarui."
  },
  "login": {
    "text001": "Masuk petugas",
    "text002": "Kelola pesanan dan serah-terima ARSC.",
    "text003": "Email petugas",
    "text004": "Kata sandi",
    "text005": "Tampilkan kata sandi",
    "text006": "Sembunyikan kata sandi",
    "text007": "Masuk",
    "text008": "Kembali ke beranda",
    "text009": "Sedang masuk…",
    "text010": "Email atau kata sandi tidak cocok. Periksa kembali lalu coba lagi.",
    "text011": "Layanan masuk belum tersedia. Coba lagi sebentar."
  },
  "admin": {
    "text001": "Pesanan",
    "text002": "Meja layanan",
    "text003": "Tanggal rekap",
    "text004": "Waktu Indonesia Barat",
    "text005": "Pesanan dibuat",
    "text006": "Halaman dipesan",
    "text007": "Pembayaran terverifikasi",
    "text008": "Cari nama atau kode ambil",
    "text009": "Semua",
    "text010": "Menunggu",
    "text011": "Disetujui",
    "text012": "Diserahkan",
    "text013": "Dibatalkan",
    "text014": "Terapkan tanggal",
    "text015": "Hapus filter",
    "text016": "Perangkat cetak",
    "text017": "{total} pesanan",
    "text018": "Halaman {page} dari {pages}",
    "text019": "Tidak ada pesanan yang cocok.",
    "text020": "Ubah kata pencarian atau hapus filter.",
    "text021": "Rekap belum tersedia",
    "text022": "Pembayaran yang diverifikasi hari ini, di luar pesanan yang dibatalkan.",
    "text023": "Pembayaran yang diverifikasi pada tanggal ini, di luar pesanan yang dibatalkan.",
    "text024": "Halaman dokumen × salinan; bukan jumlah lembar yang sudah dicetak.",
    "text025": "Pilih perangkat",
    "text026": "Simulasi cetak · {last4ofId}",
    "text027": "Perangkat cetak · {printerKey}",
    "text028": "Tidak aktif · {last4ofId}",
    "text029": "Belum ada perangkat aktif. Hubungi pengelola layanan.",
    "text031": "Mode simulasi: tidak ada dokumen yang dicetak secara fisik.",
    "text032": "{pages} halaman · {copies} salinan · {color} · {paper}",
    "text033": "Lihat dokumen",
    "text034": "Lihat bukti",
    "text035": "Lihat rincian",
    "text036": "Batalkan pesanan",
    "text037": "Cetak ulang",
    "text038": "Verifikasi pembayaran",
    "text039": "Setujui cetak",
    "text040": "Pesanan lama perlu diperiksa sebelum disetujui.",
    "text041": "Tandai pembayaran untuk diperiksa?",
    "text042": "Alasan penolakan",
    "text043": "Jelaskan apa yang perlu diperbaiki pelanggan.",
    "text044": "Kembali",
    "text045": "Tandai perlu diperiksa",
    "text046": "Verifikasi pembayaran?",
    "text047": "Pastikan bukti pembayaran sesuai dengan tagihan {amount}. Tindakan ini mencatat pemeriksaan petugas, bukan konfirmasi otomatis dari QRIS.",
    "text048": "Masukkan ke antrean cetak?",
    "text049": "Periksa berkas dan perangkat yang dipilih. Setelah disetujui, pelanggan tidak dapat membatalkan pesanan.",
    "text050": "Perangkat yang dipilih adalah simulasi. Tidak ada cetak fisik.",
    "text051": "Konfirmasi penyerahan",
    "text052": "Dokumen sudah diserahkan?",
    "text053": "Periksa hasil cetak dan pastikan dokumen sudah diterima pelanggan sebelum mengonfirmasi.",
    "text054": "Saya sudah memeriksa hasil dan menyerahkannya kepada pelanggan.",
    "text055": "Belum diserahkan",
    "text056": "Sudah diserahkan",
    "text057": "Ini simulasi penyerahan. Tidak ada dokumen fisik yang dicetak atau diserahkan.",
    "text058": "Saya mengonfirmasi penyerahan simulasi.",
    "text059": "Rincian pesanan",
    "text060": "Riwayat proses",
    "text061": "Informasi perangkat",
    "text062": "Nomor proses",
    "text063": "Status proses belum membuktikan hasil cetak fisik. Petugas tetap perlu memeriksa dokumen.",
    "text064": "Tutup",
    "text065": "Perlu pemeriksaan petugas",
    "text066": "Periksa perangkat dan hasil cetak sebelum melanjutkan. Jangan mencetak ulang jika hasil sebelumnya belum dipastikan.",
    "text067": "Catat hasil pemeriksaan",
    "text068": "Belum ada catatan perangkat yang bisa dipakai. Hubungi pengelola layanan.",
    "text069": "Cetak ulang pesanan?",
    "text070": "Hasil sebelumnya mungkin sudah tercetak. Cetak ulang dapat menghasilkan dokumen ganda.",
    "text071": "Saya memahami risiko dokumen ganda.",
    "text072": "Cari pesanan"
  }
} as const;

/** @deprecated Use COPY_ORDER_STATUS for customer order state only. */
export const COPY_STATUS_MAP = COPY_ORDER_STATUS;
export function customerStatus(order: { readonly status: OrderStatus }): StatusCopy {
  return COPY_ORDER_STATUS[order.status];
}
export function operatorStatus(order: { status: OrderStatus; payment_status: PaymentStatus }, job?: { status: JobStatus }): StatusCopy {
  if (order.status === 'cancelled' || order.status === 'delivered') return COPY_ORDER_STATUS[order.status];
  if (order.payment_status === 'rejected') return COPY_PAYMENT_STATUS.rejected;
  return job ? COPY_JOB_STATUS[job.status] : COPY_ORDER_STATUS[order.status];
}

export const COPY_RECEIPT_EVENTS = {
  approve: 'Disetujui petugas',
  claim: 'Diambil perangkat cetak',
  submission_started: 'Mulai dikirim ke printer',
  submitted: 'Terkirim ke printer',
  backend_completed: 'Selesai di printer (simulasi)',
  deliver: 'Diserahkan',
  failed: 'Gagal dicetak',
  needs_reconciliation: 'Perlu diperiksa petugas',
  unknown: 'Pembaruan status',
} as const;

export function formatReceiptEvent(type: string): string {
  if (type in COPY_RECEIPT_EVENTS && type !== 'unknown') {
    return COPY_RECEIPT_EVENTS[type as keyof typeof COPY_RECEIPT_EVENTS];
  }
  return COPY_RECEIPT_EVENTS.unknown;
}
