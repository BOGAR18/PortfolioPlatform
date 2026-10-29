# portfolio-bogar

Website portofolio dengan React (tanpa Vite), Express, dan PostgreSQL.

## Menjalankan
1. `npm install`
2. Salin `.env.example` menjadi `.env`, lalu isi nilainya.
3. Buat database PostgreSQL sesuai `DATABASE_URL`.
4. `npm run db:migrate`
5. `npm run db:seed`
6. Terminal 1: `npm run dev:client`
7. Terminal 2: `npm run dev:server`
8. Buka http://localhost:8000 dan login di /login.

Produksi: `npm run build` lalu `npm start`.
