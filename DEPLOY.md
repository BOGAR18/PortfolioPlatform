# Panduan Deploy (dari nol sampai online)

## Kenapa bukan Vercel untuk aplikasi ini?
Vercel menjalankan kode sebagai fungsi serverless yang berhenti setelah setiap permintaan.
Aplikasi ini berjalan sebagai server Express yang terus hidup dan menyimpan:
- sesi login (sudah di PostgreSQL, aman di Vercel), dan
- foto upload di folder `public/uploads` (ini **hilang** di Vercel, karena penyimpanannya sementara).

Karena itu rekomendasi: **Render** (backend + frontend dalam satu layanan) dan **Supabase** tetap sebagai database.
Render juga mendukung upload disk permanen (berbayar). Jika tetap ingin Vercel, server harus diubah menjadi
fungsi serverless dan foto harus dipindah ke Supabase Storage — itu pekerjaan terpisah.

---

## Langkah 1: Siapkan kode di GitHub
1. Buat akun di https://github.com (jika belum punya).
2. Buat repository baru, misalnya `portfolio-satrio-tegar`, set **Private**.
3. Di folder proyek (bukan di dalam `dist/`), jalankan:
   ```bash
   git init
   git add .
   git commit -m "initial portfolio"
   git branch -M main
   git remote add origin https://github.com/USERNAME/portfolio-satrio-tegar.git
   git push -u origin main
   ```
   `.env`, `node_modules`, dan `dist` sudah masuk `.gitignore`, jadi tidak ikut ter-upload.
4. Pastikan `.env` **tidak** muncul di GitHub.

## Langkah 2: Siapkan database (Supabase, sudah ada)
Gunakan connection string **Session pooler** yang sama seperti sebelumnya.
**Ganti password database** sebelum deploy, karena password lama sudah pernah tampil di chat.

## Langkah 3: Buat layanan di Render
1. Buka https://render.com, daftar dengan akun GitHub.
2. Klik **New +** → **Web Service**.
3. Pilih repository `portfolio-satrio-tegar`.
4. Isi formulir:
   - **Name:** `satrio-tegar`
   - **Region:** Singapore (paling dekat dengan Supabase Singapore)
   - **Branch:** `main`
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance type:** Free (cukup untuk portofolio; layanan gratis tertidur setelah tidak ada akses ±15 menit dan bangun saat dibuka, sekitar 30 detik)

## Langkah 4: Isi environment variables di Render
Di halaman layanan → **Environment** → tambahkan:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `NODE_VERSION` | `20` |
| `DATABASE_URL` | connection string Supabase (password baru) |
| `DB_SSL` | `true` |
| `SESSION_SECRET` | string acak 64 karakter (buat dengan `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) |
| `ALLOW_REGISTER` | `true` untuk sekarang |
| `ALLOW_MULTI_ADMIN` | `false` |
| `APP_NAME` | `satrio.tegar` |
| `ADMIN_NAME` | nama admin |
| `ADMIN_EMAIL` | email admin |
| `ADMIN_PASSWORD` | password admin baru yang kuat |

Render otomatis mengisi `PORT`, jadi tidak perlu ditambahkan.

## Langkah 5: Deploy pertama
Klik **Create Web Service**. Render akan menjalankan build dan menampilkan log.
Setelah status **Live**, buka URL `https://satrio-tegar.onrender.com`.

## Langkah 6: Isi database produksi
Database sudah berisi data dari seed sebelumnya. Untuk memastikan data contoh dan admin ada, jalankan seed
dari komputer Anda dengan `DATABASE_URL` produksi (seed aman dijalankan ulang):
```bash
npm run db:seed
```
Lalu buka `https://satrio-tegar.onrender.com/login` dan masuk sebagai admin.

## Langkah 7: Kunci registrasi
Setelah admin berhasil login, ubah di Render:
`ALLOW_REGISTER` = `false`, lalu **Manual Deploy → Clear build cache & deploy**.

## Langkah 8: Domain sendiri (opsional)
1. Beli domain, misalnya `satriotegar.dev`.
2. Di Render → **Settings → Custom Domains** → tambahkan domain.
3. Render menampilkan record DNS (CNAME). Tambahkan record itu di penyedia domain Anda.
4. Tunggu verifikasi dan SSL otomatis aktif.

## Langkah 9: Update setelah perubahan kode
Cukup `git add . && git commit -m "..." && git push`. Render otomatis deploy ulang.

## Catatan penting
- **Foto upload hilang saat redeploy** di paket gratis karena disk bersifat sementara. Solusi: tambahkan
  *Persistent Disk* di Render (berbayar, mount ke `public/uploads`), atau pindahkan upload ke Supabase Storage.
- **Chatbot** membaca data langsung dari database, jadi setiap proyek, teknologi, atau sertifikat yang Anda
  tambahkan di admin langsung bisa dijawab tanpa deploy ulang.
- Jika login gagal di produksi, pastikan `NODE_ENV=production` dan proxy sudah dikenali (`trust proxy` sudah diatur).
