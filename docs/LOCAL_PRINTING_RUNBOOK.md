# Local Printing Runbook (Local-First Simulation)

Panduan operasional dan pengujian local-first ARSC Printing untuk pengembang dan operator.
Protokol ini menjalankan seluruh alur pemesanan, persetujuan admin, antrean pekerjaan cetak (print job), serta worker lokal secara deterministik tanpa memerlukan koneksi ke database produksi, server HP t530, atau printer fisik.

---

## 1. Prasyarat Lingkungan

- **Runtime**: Node.js `>= 22.0.0` (terverifikasi `v24.13.0` pada mesin pengembang) atau Bun `>= 1.3.0` (terverifikasi `v1.3.10`).
- **Package Manager**: Bun (sesuai `bun.lockb`).
- **Sistem Operasi**: Windows 11 / WSL2 / Linux.
- **Port Jaringan Lokal**: Port `3000` (Next.js web app) dan port loopback `54321` (jika menggunakan Supabase lokal).

---

## 2. Menjalankan Aplikasi dalam Mode Lokal (`ARSC_LOCAL_*`)

Sistem keamanan backend menerapkan **fail-closed**: backend API menolak melayani permintaan cetak jika mendeteksi konfigurasi remote atau tidak lengkap.

Untuk menjalankan Next.js dalam mode simulasi lokal, sediakan variabel lingkungan berikut:

```bash
# Backend local boundary configuration (Loopback only)
ARSC_LOCAL_MODE=true
ARSC_LOCAL_SUPABASE_URL=http://127.0.0.1:54321
ARSC_LOCAL_SUPABASE_SERVICE_ROLE_KEY=synthetic-local-service-role-key-only
ARSC_LOCAL_SUPABASE_ANON_KEY=synthetic-local-anon-key-only
ARSC_LOCAL_CAPABILITY_SECRET=synthetic-local-capability-secret-min-32-chars-long
ARSC_LOCAL_CRON_SECRET=synthetic-local-cron-secret-only

# Browser client credentials (pointing to local instance, never production)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=synthetic-local-anon-key-only
```

> **CATATAN**: Gunakan hanya placeholder sintetis untuk pengujian simulasi lokal. Jangan pernah memasukkan URL produksi atau kredensial Supabase remote ke dalam konfigurasi lokal.

Jalankan server pengembangan Next.js:
```powershell
bun run dev
```

Atau gunakan helper script yang secara otomatis memvalidasi loopback:
```powershell
node scripts/local-dev.mjs
```

> **PERINGATAN**: Script `local-dev.mjs` akan segera membatalkan proses (`FATAL`) jika `ARSC_LOCAL_SUPABASE_URL` bukan berupa loopback (`127.0.0.1`, `localhost`, atau `::1`).

---

## 3. Menjalankan Print Worker Lokal (Fake Worker)

Worker cetak Unit C diimplementasikan menggunakan Node.js ESM murni tanpa dependensi eksternal, beroperasi dengan `FakePrinterAdapter`:

```powershell
# Jalankan seluruh test suite resmi (18 test Unit A/B di Bun + 8 test Unit C di Node)
bun run test

# Menjalankan worker simulasi lokal
bun run worker:fake
```

### Parameter Konfigurasi Worker (Environment Variables)
- `WORKER_ID`: UUID worker (default: random UUID v4).
- `WORKER_SECRET`: Secret acak (default: 32 hex chars). Format token: `<workerId>.<workerSecret>`.
- `PRINTER_KEY`: Identifier printer yang dilayani (default: `fake`).
- `API_BASE_URL`: URL API backend ARSC Printing (default: `http://127.0.0.1:3000`).

---

## 4. Model Status & Siklus Hidup Pesanan

Alur memisahkan status pesanan pelanggan (`orders`) dari status antrean teknis (`print_jobs`):

| Entitas | Status | Makna Operasional |
| :--- | :--- | :--- |
| **Order** | `pending_verification` | Pesanan dibuat oleh pelanggan, menunggu upload bukti bayar & verifikasi admin. |
| **Order** | `approved` | Admin memverifikasi pembayaran & menyetujui cetak. Job dibuat secara transaksional. |
| **Order** | `delivered` | Pesanan fisik telah diserahkan langsung kepada pelanggan di kasir. |
| **Order** | `cancelled` | Pesanan dibatalkan (hanya sebelum job diclaim worker). |
| **Job** | `ready` | Pekerjaan siap diklaim oleh worker yang memiliki target `printerKey` sesuai. |
| **Job** | `claimed` | Worker mengambil lease pekerjaan (durasi 60 detik, heartbeat tiap 20 detik). |
| **Job** | `submitted` | Worker telah menulis submit-intent journal dan berhasil mengirim job ke adapter printer. |
| **Job** | `backend_completed` | Adapter printer melaporkan job selesai diproses (menurut backend printer). |
| **Job** | `failed` | Terjadi kegagalan pasti (file korup, printer error permanen). Tidak auto-reprint. |
| **Job** | `needs_reconciliation` | Terjadi kondisi ambigu (koneksi terputus pasca-submit, crash saat submit, atau ACK hilang). |

---

## 5. Prosedur Pemulihan Crash & Rekonsiliasi Operator

### Boundary Submit-Intent
Worker wajib melakukan `fsync` pada jurnal disk lokal sebelum menyentuh adapter printer:
1. **Crash sebelum `submit_intent`**: Pada startup berikutnya, worker melihat job belum menyentuh printer, jurnal dibersihkan dengan aman, dan klaim dilepaskan.
2. **Crash pada / setelah `submit_intent`**: Worker memeriksa apakah ada receipt tersimpan. Status **TIDAK PERNAH** disubmit ulang secara otomatis untuk mencegah duplikasi cetak fisik. Job otomatis dialihkan ke `needs_reconciliation`.

### Tindakan Rekonsiliasi Admin
Pada dashboard admin `/admin`, pesanan berstatus `needs_reconciliation` menampilkan tombol rekonsiliasi eksplisit:
- **Tandai Selesai**: Jika operator memeriksa printer dan mendapati fisik dokumen telah tercetak (`resolution: backend_completed`, `reasonCode: OPERATOR_VERIFIED`).
- **Reprint Baru**: Jika dokumen terbukti belum tercetak dan perlu dicetak ulang. Wajib menyertakan parameter `acknowledgeDuplicateRisk: true` yang akan menerbitkan revisi baru (`revision: 2`).

---

## 6. Retensi Data & Kebijakan Cleanup

- **Dokumen Pelanggan**: Disimpan dalam private storage bucket `documents`. Signed URL diterbitkan hanya dengan masa berlaku 60 detik (`expiresIn: 60`).
- **Bukti Pembayaran**: Disimpan pada direktori terpisah dengan otorisasi admin-only.
- **Worker Local Temp**: File PDF yang didownload worker disimpan di `.worker-tmp/` dan **selalu dihapus** (`fs.unlinkSync`) pada blok `finally` setelah proses selesai atau gagal.

---

## 7. Batasan & Item yang BELUM Diverifikasi (`[U]`)

Laporan audit teknis menegaskan bahwa item berikut **belum diverifikasi pada database nyata**:
1. **Eksekusi SQL & RLS**: Belum diuji terhadap instance PostgreSQL lokal aktif (karena Docker & Supabase CLI belum diaktifkan).
2. **Konkurensi SKIP LOCKED**: Uji konkurensi saat ini dijalankan terhadap mock HTTP in-memory.
3. **Driver CUPS & Perangkat Keras**: Tidak ada pengujian fisik ke printer nyata atau driver CUPS pada fase ini.

---

## 8. Persiapan Fase Berikutnya: Integrasi HP t530

Setelah aplikasi dan worker lokal stabil serta disetujui:
1. Verifikasi server HP t530 via SSH `t530-ai` (terbukti sukses dengan user `openbot`).
2. Instalasi dan konfigurasi driver CUPS pada HP t530 secara terisolasi.
3. Menjalankan worker sebagai service `systemd` pada HP t530 yang terhubung ke backend ARSC Printing.
