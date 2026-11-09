# Perbaikan tampilan

1. Arrow ganda "View details → →": hapus panah teks di `client/src/components/ProjectCard.jsx` (panah dari CSS `.link-more::after` dipertahankan).
2. Halaman detail proyek di HP: tombol kembali, judul, deskripsi rata kiri (`hero-fix.css`, kelas baru `page-head-detail` di `ProjectShow.jsx`).
3. Jarak judul-deskripsi `.page-head` ditambah; padding atas header halaman disamakan agar tidak menempel navbar.
4. HP: tombol chat diperkecil & dinaikkan sedikit; ikon perbesar gambar galeri dipindah ke kanan atas.
5. Duplikasi `.link-more` di `theme.css` dibersihkan.
6. File tidak terpakai dihapus: `client/src/pages/ProjectDetail.jsx`, `client/src/i18n.jsx`, `client/styles.css`.
7. `.env` dan `node_modules` tidak disertakan. Salin `.env.example` ke `.env`, lalu jalankan `npm install` dan `npm run build`.
8. `dist/` sudah dipatch agar sesuai, tetapi sebaiknya tetap jalankan `npm run build` di komputer Anda.
