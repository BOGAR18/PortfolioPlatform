import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { AdminTop } from '../../components/AdminLayout.jsx';
import Alert from '../../components/Alert.jsx';
import { ErrorSummary, FieldError, invalidClass } from '../../components/FormBits.jsx';

const BILINGUAL_HERO = [
  ['hero_badge', 'Badge status', 1],
  ['hero_title', 'Judul utama', 2],
  ['hero_subtitle', 'Subjudul', 3],
  ['card_role', 'Peran di kartu profil', 1],
];
const BILINGUAL_ABOUT = [
  ['about_title', 'Judul bagian', 2],
  ['about_text_1', 'Paragraf 1', 3],
  ['about_text_2', 'Paragraf 2', 3],
];
const BILINGUAL_CONTACT = [
  ['contact_location', 'Lokasi', 1],
  ['contact_response', 'Waktu respons', 1],
];
const COLOR_FIELDS = [
  ['color_light_bg', 'Latar terang', 'Latar utama saat mode terang'],
  ['color_light_bg_alt', 'Latar section terang', 'Latar section selang-seling saat mode terang'],
  ['color_light_accent', 'Aksen terang', 'Warna tombol, judul kecil, dan tautan saat mode terang'],
  ['color_dark_bg', 'Latar gelap', 'Latar utama saat mode gelap'],
  ['color_dark_accent', 'Aksen gelap', 'Warna tombol, judul kecil, dan tautan saat mode gelap'],
];

/** Satu baris teks dua bahasa: kiri Indonesia, kanan English */
function Bilingual({ name, label, rows = 2, value, onChange, errors }) {
  const err = errors[`texts.${name}`];
  return (
    <div className="row g-3 mb-3">
      <div className="col-md-6">
        <label htmlFor={`id_${name}`} className="form-label">{label}</label>
        <textarea id={`id_${name}`} rows={rows} className={`form-control${err ? ' is-invalid' : ''}`}
          value={value.id} onChange={(e) => onChange(name, 'id', e.target.value)} />
      </div>
      <div className="col-md-6">
        <label htmlFor={`en_${name}`} className="form-label">{label} (English)</label>
        <textarea id={`en_${name}`} rows={rows} className={`form-control${err ? ' is-invalid' : ''}`}
          value={value.en} onChange={(e) => onChange(name, 'en', e.target.value)} />
        <FieldError errors={errors} name={`texts.${name}`} />
      </div>
    </div>
  );
}

export default function Settings() {
  const [data, setData] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [resetColors, setResetColors] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('/admin/settings').then(setData).catch((e) => setMessage(e.message));
  }, []);

  if (!data) return (<><AdminTop title="Pengaturan Konten" />{message && <div className="alert alert-danger">{message}</div>}</>);

  const setText = (name, lang, value) => setData((d) => ({
    ...d, texts: { ...d.texts, [name]: { ...d.texts[name], [lang]: value } },
  }));
  const setSingle = (key, value) => setData((d) => ({ ...d, single: { ...d.single, [key]: value } }));
  const setValue = (i, key, value) => setData((d) => ({
    ...d, values: d.values.map((row, idx) => (idx === i ? { ...row, [key]: value } : row)),
  }));
  const setColor = (key, value) => setData((d) => ({ ...d, colors: { ...d.colors, [key]: value } }));

  const save = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage('');
    setNotice('');
    setBusy(true);
    try {
      await api('/admin/settings', {
        method: 'PUT',
        body: { texts: data.texts, single: data.single, values: data.values, colors: data.colors, reset_colors: resetColors },
      });
      setNotice('Pengaturan konten berhasil disimpan.');
      setResetColors(false);
      const fresh = await api('/admin/settings');
      setData(fresh);
    } catch (err) {
      setErrors(err.errors || {});
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  const bilingual = (list) => list.map(([name, label, rows]) => (
    <Bilingual key={name} name={name} label={label} rows={rows} value={data.texts[name]}
      onChange={setText} errors={errors} />
  ));

  return (
    <>
      <AdminTop title="Pengaturan Konten" />
      {notice && <Alert key={notice} type="success">{notice}</Alert>}
      <ErrorSummary message={message} errors={errors} />

      <form onSubmit={save}>
        {/* HERO */}
        <div className="admin-card mb-4">
          <h2 className="h6 mb-1">Hero (bagian paling atas beranda)</h2>
          <p className="text-muted-2 small mb-3">Versi Indonesia di kiri, versi English di kanan. Jika kolom English dikosongkan, pengunjung berbahasa Inggris melihat teks Indonesia.</p>
          <div className="bilingual-head"><span>Bahasa Indonesia</span><span>English</span></div>
          {bilingual(BILINGUAL_HERO)}
        </div>

        {/* TENTANG */}
        <div className="admin-card mb-4">
          <h2 className="h6 mb-3">Tentang</h2>
          <div className="bilingual-head"><span>Bahasa Indonesia</span><span>English</span></div>
          {bilingual(BILINGUAL_ABOUT)}

          <h3 className="h6 mt-4 mb-1">Nilai kami (4 kartu)</h3>
          <p className="text-muted-2 small mb-3">
            Ikon memakai nama Bootstrap Icons, misalnya <code>bi-star</code> atau <code>bi-shield-check</code>.
            Ikon yang sama dipakai untuk kedua bahasa. Kartu yang judul dan isinya dikosongkan tidak akan tampil.
          </p>

          {data.values.map((v, i) => (
            <div key={i} className="value-edit">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="fw-medium small">Nilai #{i + 1}</span>
                <span className="small text-muted-2"><i className={`bi ${v.icon}`} /></span>
              </div>
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label small" htmlFor={`icon_${i}`}>Ikon</label>
                  <input type="text" id={`icon_${i}`} className="form-control form-control-sm" placeholder="bi-star"
                    value={v.icon} onChange={(e) => setValue(i, 'icon', e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label small" htmlFor={`id_title_${i}`}>Judul (Indonesia)</label>
                  <input type="text" id={`id_title_${i}`} className="form-control form-control-sm"
                    value={v.id_title} onChange={(e) => setValue(i, 'id_title', e.target.value)} />
                </div>
                <div className="col-md-5">
                  <label className="form-label small" htmlFor={`en_title_${i}`}>Title (English)</label>
                  <input type="text" id={`en_title_${i}`} className="form-control form-control-sm"
                    value={v.en_title} onChange={(e) => setValue(i, 'en_title', e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small" htmlFor={`id_text_${i}`}>Isi (Indonesia)</label>
                  <textarea id={`id_text_${i}`} rows="2" className="form-control form-control-sm"
                    value={v.id_text} onChange={(e) => setValue(i, 'id_text', e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small" htmlFor={`en_text_${i}`}>Text (English)</label>
                  <textarea id={`en_text_${i}`} rows="2" className="form-control form-control-sm"
                    value={v.en_text} onChange={(e) => setValue(i, 'en_text', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* WARNA TEMA */}
        <div className="admin-card mb-4">
          <h2 className="h6 mb-1">Warna tema</h2>
          <p className="text-muted-2 small mb-3">
            Warna ini menimpa palet bawaan di <code>public/css/app.css</code> tanpa mengubah file.
            Warna bawaan: putih dan ungu pastel. Centang "Kembalikan ke bawaan" lalu simpan untuk mengosongkan semua warna.
          </p>
          <div className="row g-3">
            {COLOR_FIELDS.map(([key, label, help]) => (
              <div key={key} className="col-md-6">
                <label htmlFor={key} className="form-label">{label}</label>
                <div className="d-flex align-items-center gap-3">
                  <input type="color" id={key} className="form-control form-control-color" value={data.colors[key]}
                    onChange={(e) => setColor(key, e.target.value.toUpperCase())} />
                  <span className="small text-muted-2">{help}</span>
                </div>
              </div>
            ))}
            <div className="col-12">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="reset_colors" checked={resetColors}
                  onChange={(e) => setResetColors(e.target.checked)} />
                <label className="form-check-label" htmlFor="reset_colors">Kembalikan ke bawaan (hapus semua warna kustom)</label>
              </div>
            </div>
          </div>
        </div>

        {/* KONTAK */}
        <div className="admin-card mb-4">
          <h2 className="h6 mb-3">Kontak &amp; media sosial</h2>
          <div className="bilingual-head"><span>Bahasa Indonesia</span><span>English</span></div>
          {bilingual(BILINGUAL_CONTACT)}

          <div className="row g-3 mt-2">
            <div className="col-md-6">
              <label htmlFor="contact_email" className="form-label">Email</label>
              <input type="email" id="contact_email" className={`form-control${invalidClass(errors, 'contact_email')}`}
                value={data.single.contact_email} onChange={(e) => setSingle('contact_email', e.target.value)} />
              <FieldError errors={errors} name="contact_email" />
            </div>
            <div className="col-md-6">
              <label htmlFor="contact_phone" className="form-label">Telepon (opsional)</label>
              <input type="text" id="contact_phone" className="form-control"
                value={data.single.contact_phone} onChange={(e) => setSingle('contact_phone', e.target.value)} />
            </div>
            <div className="col-md-6">
              <label htmlFor="contact_whatsapp" className="form-label">Nomor WhatsApp</label>
              <input type="text" id="contact_whatsapp" placeholder="6281200000000" className={`form-control${invalidClass(errors, 'contact_whatsapp')}`}
                value={data.single.contact_whatsapp} onChange={(e) => setSingle('contact_whatsapp', e.target.value)} />
              <div className="form-text">Format internasional tanpa tanda plus, contoh 6281200000000.</div>
              <FieldError errors={errors} name="contact_whatsapp" />
            </div>
          </div>

          <h3 className="h6 mt-4 mb-3">Tautan media sosial</h3>
          <div className="row g-3">
            {[
              ['social_github', 'GitHub', 'https://github.com/...'],
              ['social_linkedin', 'LinkedIn', 'https://www.linkedin.com/...'],
              ['social_instagram', 'Instagram', 'https://www.instagram.com/...'],
            ].map(([key, label, ph]) => (
              <div key={key} className="col-md-4">
                <label htmlFor={key} className="form-label">{label}</label>
                <input type="url" id={key} placeholder={ph} className={`form-control${invalidClass(errors, key)}`}
                  value={data.single[key]} onChange={(e) => setSingle(key, e.target.value)} />
                <FieldError errors={errors} name={key} />
              </div>
            ))}
          </div>
        </div>

        <div className="d-flex gap-2 mb-5">
          <button type="submit" className="btn btn-accent" disabled={busy}>Simpan semua pengaturan</button>
        </div>
      </form>
    </>
  );
}
