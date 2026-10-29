# Deploy ke Vercel (gratis, tanpa kartu kredit)

Perubahan yang sudah dibuat di project ini: `api/index.js`, `vercel.json`, upload foto ke Supabase Storage,
dan `server/index.js` diekspor sebagai fungsi serverless.

## 1. Buat bucket penyimpanan foto di Supabase (gratis)
1. Buka dashboard Supabase → project Anda → **Storage** → **New bucket**.
2. Nama: `uploads`, aktifkan **Public bucket**, lalu Create.
3. Buka **Project Settings → API**, salin:
   - **Project URL** (contoh `https://abcdxyz.supabase.co`) → untuk `SUPABASE_URL`
   - **service_role key** (rahasia, jangan dibagikan) → untuk `SUPABASE_SERVICE_KEY`

## 2. Pastikan tabel sesi sudah ada
Jalankan sekali di komputer Anda (memakai `.env` yang berisi DATABASE_URL Supabase):
```bash
npm install
npm run db:migrate
npm run db:seed
npm start      # buka sebentar agar tabel "session" dibuat, lalu hentikan (Ctrl+C)
```

## 3. Push ke GitHub
```bash
git init
git add .
git commit -m "portfolio"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git push -u origin main
```
`.env` sudah di `.gitignore`. Pastikan tidak muncul di GitHub.

## 4. Import ke Vercel
1. vercel.com → daftar dengan GitHub, pilih **Hobby** (gratis).
2. **Add New → Project** → pilih repo.
3. Framework Preset: **Other**. Biarkan Build Command / Output Directory (sudah diatur di `vercel.json`).
4. Isi **Environment Variables**:

| Key | Value |
|---|---|
| `DATABASE_URL` | connection string Supabase (Session pooler) |
| `DB_SSL` | `true` |
| `SESSION_SECRET` | string acak panjang |
| `ALLOW_REGISTER` | `false` (atau `true` bila admin belum ada) |
| `ALLOW_MULTI_ADMIN` | `false` |
| `SUPABASE_URL` | Project URL Supabase |
| `SUPABASE_SERVICE_KEY` | service_role key |
| `SUPABASE_BUCKET` | `uploads` |

5. Klik **Deploy**. Selesai: `https://nama-project.vercel.app`.

## Catatan
- Batas body request Vercel Hobby ±4,5 MB. Upload banyak foto sekaligus yang totalnya lebih besar akan gagal; unggah bertahap.
- Foto lama di `public/uploads` lokal perlu diunggah manual ke bucket `uploads` dengan struktur folder sama (`projects/`, `tech/`, `certifications/`).
- Ganti password database dan admin bila pernah terlihat di tempat lain.
