/**
 * Copy Registry (M3_SPEC.md §7)
 * Strictly Indonesian language, polite, concise, informative.
 * Verbatim text dictionary for customer-facing ARSC flows.
 */

export const COPY_STATUS_MAP: Record<string, string> = {
  SUBMITTED: 'Pesanan Diterima',
  CONFIRMED: 'Pembayaran Terverifikasi',
  PRINTING: 'Sedang Dicetak',
  COMPLETED: 'Selesai — Siap Diambil',
  CANCELLED: 'Pesanan Dibatalkan',
  REFUNDED: 'Dana Dikembalikan',
} as const;

export const COPY_TOASTS = {
  // Order submission
  orderCreated: 'Pesanan berhasil dibuat. Simpan ID pesanan untuk memantau status.',
  orderSubmitFailed: 'Gagal membuat pesanan. Silakan periksa kembali formulir atau coba beberapa saat lagi.',

  // Payment upload
  proofUploaded: 'Bukti pembayaran terkirim. Menunggu verifikasi admin (maksimal 15 menit saat jam operasional).',
  proofUploadFailed: 'Unggah bukti pembayaran gagal. Pastikan format file PNG atau JPG dan ukuran maksimal 5 MB.',

  // Verification & Copy
  idCopied: 'ID pesanan disalin ke papan klip.',
  linkCopied: 'Tautan disalin ke papan klip.',

  // Network / Error states
  networkError: 'Koneksi terputus. Memeriksa kembali...',
  serverError: 'Terjadi kendala pada server. Tim kami sedang menanganinya.',
} as const;

export const COPY_UI = {
  // Brand
  brandName: 'ARSC Printing',
  brandSubtitle: 'Layanan Cetak Mandiri Mahasiswa',
  operationalHours: 'Senin – Jumat, 08.00 – 16.00 WIB',
  location: 'Gedung F FTP Universitas Brawijaya, Lantai 1',

  // Order Flow
  fileUploadDropzone: 'Tarik file PDF ke sini, atau klik untuk memilih',
  fileUploadHint: 'Hanya file PDF, maksimal 50 MB, maksimal 500 halaman.',
  pagesCount: (pages: number) => `${pages} halaman`,
  copiesCount: (copies: number) => `${copies} eksemplar`,
  totalPrice: (formattedPrice: string) => `Total: ${formattedPrice}`,

  // Simulation Mode Disclosure (Mandatory if mock backend active)
  simulationDisclosure: 'Layanan ini berjalan dalam mode simulasi antrean. Berkas tidak benar-benar dicetak ke mesin fisik.',
} as const;

export const COPY_EMPTY = {
  noOrders: 'Belum ada pesanan.',
  noOrdersSub: 'Unggah dokumen PDF untuk membuat pesanan cetak baru.',
  orderNotFound: 'Pesanan tidak ditemukan.',
  orderNotFoundSub: 'Periksa kembali ID pesanan yang Anda masukkan atau hubungi narahubung jika ada kendala.',
} as const;

export const COPY_VALIDATION = {
  requiredField: 'Bidang ini wajib diisi.',
  invalidEmail: 'Masukkan alamat email yang valid.',
  invalidPhone: 'Masukkan nomor WhatsApp yang valid (contoh: 08123456789).',
  invalidPdf: 'File harus berformat PDF.',
  fileTooLarge: 'Ukuran file melebihi batas maksimal 50 MB.',
  pagesExceeded: 'Jumlah halaman melebihi batas maksimal 500 halaman.',
  invalidProofImage: 'Bukti pembayaran harus berupa gambar PNG atau JPG maksimal 5 MB.',
} as const;

export const COPY_LOADING = {
  analyzingPdf: 'Menganalisis dokumen PDF...',
  uploadingFile: 'Mengunggah dokumen...',
  creatingOrder: 'Membuat pesanan...',
  verifyingPayment: 'Memverifikasi pembayaran...',
} as const;
