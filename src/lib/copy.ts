/**
 * Copy Registry (M3_SPEC.md §5, §6, §7)
 * Strictly Indonesian language, polite, concise, informative.
 * VERBATIM text dictionary for customer and operator ARSC flows.
 */

export const COPY_STATUS_MAP: Record<
  | 'pending_verification'
  | 'payment_pending'
  | 'payment_rejected'
  | 'approved'
  | 'ready'
  | 'claimed'
  | 'submitted'
  | 'backend_completed'
  | 'needs_reconciliation'
  | 'failed'
  | 'delivered'
  | 'cancelled',
  { label: string; sentence: string }
> = {
  pending_verification: {
    label: 'Menunggu pemeriksaan',
    sentence: 'Petugas akan memeriksa pembayaran dan berkasmu.',
  },
  payment_pending: {
    label: 'Menunggu pemeriksaan',
    sentence: 'Petugas akan memeriksa pembayaran dan berkasmu.',
  },
  payment_rejected: {
    label: 'Pembayaran perlu diperiksa',
    sentence: 'Bukti pembayaran belum dapat diverifikasi. Hubungi petugas ARSC untuk melanjutkan.',
  },
  approved: {
    label: 'Masuk antrean cetak',
    sentence: 'Pesanan sudah disetujui dan menunggu diproses.',
  },
  ready: {
    label: 'Masuk antrean cetak',
    sentence: 'Pesanan sudah disetujui dan menunggu diproses.',
  },
  claimed: {
    label: 'Sedang disiapkan',
    sentence: 'Perangkat sedang menyiapkan pesanan.',
  },
  submitted: {
    label: 'Sedang diproses',
    sentence: 'Proses cetak sedang berjalan. Tunggu pemeriksaan petugas.',
  },
  backend_completed: {
    label: 'Menunggu pemeriksaan hasil',
    sentence: 'Proses pada perangkat selesai. Petugas masih perlu memeriksa hasil cetak.',
  },
  needs_reconciliation: {
    label: 'Perlu pemeriksaan petugas',
    sentence: 'Ada proses yang perlu diperiksa. Jangan mengirim ulang pesanan yang sama.',
  },
  failed: {
    label: 'Proses terhenti',
    sentence: 'Petugas perlu memeriksa pesanan sebelum melanjutkan.',
  },
  delivered: {
    label: 'Sudah diserahkan',
    sentence: 'Penyerahan pesanan sudah dicatat oleh petugas.',
  },
  cancelled: {
    label: 'Dibatalkan',
    sentence: 'Pesanan ini tidak akan dilanjutkan. Jika sudah membayar, hubungi petugas.',
  },
} as const;

export const COPY_TIMELINE_STEPS = [
  'Terkirim',
  'Pembayaran diperiksa',
  'Diproses',
  'Hasil diperiksa',
  'Diserahkan',
] as const;

export const COPY_SIMULATION = {
  disclosure: 'Mode simulasi: alur ini memakai printer uji. Tidak ada dokumen fisik yang dicetak.',
} as const;

export const COPY_TOASTS = {
  orderSent: 'Pesanan terkirim. Simpan kode ambilmu.',
  copyPickup: 'Kode ambil disalin.',
  copyId: 'ID pesanan disalin.',
  clipboardFailed: 'Belum bisa menyalin. Pilih teks lalu salin secara manual.',
  cancelSuccess: 'Pesanan dibatalkan.',
  verifyPayment: 'Pembayaran sudah diverifikasi.',
  rejectPayment: 'Pembayaran ditandai perlu diperiksa.',
  approve: 'Pesanan disetujui dan masuk antrean cetak.',
  adminCancel: 'Pesanan dibatalkan.',
  deliver: 'Penyerahan pesanan sudah dicatat.',
  simulatedDeliver: 'Penyerahan simulasi sudah dicatat.',
  reconcileSuccess: 'Hasil pemeriksaan sudah dicatat.',
  reprint: 'Pesanan cetak ulang masuk antrean.',
  explicitRefresh: 'Data pesanan sudah diperbarui.',
  signedDocumentFailed: 'Berkas belum bisa dibuka. Coba lagi.',
  workerListFailed: 'Daftar perangkat belum bisa dimuat.',
  staleVersion: 'Pesanan sudah berubah. Muat ulang data sebelum melanjutkan.',
  notAllowed: 'Tindakan ini tidak tersedia untuk status pesanan saat ini.',
  capabilityCsrfForbidden: 'Akses pesanan berakhir. Buka dari browser yang dipakai saat memesan, lalu muat ulang.',
  sessionExpired: 'Sesi masuk berakhir. Silakan masuk kembali.',
  backendUnavailable: 'Layanan belum bisa dihubungi. Coba lagi sebentar.',
  genericActionFailed: 'Perubahan belum tersimpan. Periksa koneksi lalu coba lagi.',
  logoutSuccess: 'Kamu sudah keluar.',
} as const;

export const COPY_LOADING = {
  create: 'Menyiapkan pesanan…',
  documentUpload: 'Mengunggah PDF…',
  proofUpload: 'Mengunggah bukti…',
  parse: 'Memeriksa PDF…',
  submit: 'Mengirim pesanan…',
  verify: 'Memverifikasi…',
  approve: 'Memasukkan ke antrean…',
  cancel: 'Membatalkan…',
  deliver: 'Mencatat penyerahan…',
  receipt: 'Memuat rincian…',
  list: 'Memuat pesanan…',
  genericRefresh: 'Memperbarui…',
  screenReaderCompletion: 'Pembaruan selesai.',
} as const;

export const COPY_VALIDATION = {
  name: 'Isi nama lengkapmu.',
  contact: 'Isi nomor atau akun yang dapat dihubungi.',
  pdfMissing: 'Pilih dokumen PDF terlebih dahulu.',
  invalidPdf: 'Berkas belum bisa dibaca sebagai PDF. Simpan ulang sebagai PDF lalu coba lagi.',
  pdfSize: 'Ukuran PDF melebihi 10 MiB. Perkecil berkas lalu unggah kembali.',
  proofMissing: 'Unggah bukti pembayaran sebelum mengirim pesanan.',
  proofType: 'Bukti pembayaran harus PNG atau JPEG.',
  proofSize: 'Ukuran bukti melebihi 5 MiB. Perkecil gambar lalu coba lagi.',
  copies: 'Jumlah salinan harus antara 1 dan 100.',
  limits: 'Jumlah halaman atau salinan melebihi batas layanan. Kurangi jumlahnya lalu coba lagi.',
  agreement: 'Periksa ringkasan dan centang konfirmasi sebelum mengirim.',
  workerRequired: 'Pilih perangkat cetak terlebih dahulu.',
  reasonRequired: 'Tuliskan alasan pemeriksaan.',
  dateInvalid: 'Periksa rentang tanggal. Tanggal awal tidak boleh setelah tanggal akhir.',
  forbidden: 'Pesanan ini tidak dapat dibuka dari browser ini.',
  notFound: 'Pesanan tidak ditemukan. Periksa ID pesananmu.',
  errorSummaryHeading: 'Periksa bagian berikut',
} as const;

export const COPY_EMPTY = {
  noOrders: 'Belum ada pesanan.',
  noOrdersSub: 'Pesanan baru akan muncul di sini setelah dikirim pelanggan.',
} as const;

export const COPY_UI = {
  brandName: 'ARSC Printing',
  appMarkTitle: 'ARSC Printing',
  orderCta: 'Buat pesanan',
  orderNow: 'Kirim pesanan sekarang',
  navHome: 'Beranda',
  navOrder: 'Pesan',
  navTrack: 'Lacak',
  navQueue: 'Antrean',
  dropzonePdf: 'Dokumen PDF',
  dropzonePdfHelper: 'PDF saja, maksimal 10 MiB.',
  dropzonePdfDrag: 'Lepaskan berkas di sini',
  dropzoneProof: 'Bukti pembayaran',
  dropzoneProofHelper: 'PNG atau JPEG, maksimal 5 MiB.',
  dropzoneProofDrag: 'Lepaskan berkas di sini',
  dropzoneChangeFile: 'Ganti berkas',
  step1Action: 'Lanjut ke pembayaran',
  step2Action: 'Periksa pesanan',
  stepBack: 'Kembali',
  stepSubmit: 'Kirim pesanan',
  qrisTitle: 'Kode QRIS pembayaran ARSC',
  qrisOpen: 'Buka QRIS',
  qrisEstimate: 'Estimasi; tagihan akhir dihitung dari berkas oleh server.',
  orderAgreement: 'Saya sudah memeriksa berkas, pengaturan cetak, dan bukti pembayaran.',
  orderWarning: 'Berkas dan pengaturan tidak dapat diubah setelah pesanan dikirim.',
  close: 'Tutup',
  cancel: 'Batal',
  searchOrders: 'Cari pesanan...',
} as const;
