import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api.js';
import { AdminTop } from '../../components/AdminLayout.jsx';
import { ErrorSummary, FieldError, invalidClass } from '../../components/FormBits.jsx';
import { uploadUrl } from '../../lib/format.js';

const EMPTY = {
  title: '', slug: '', summary: '', description: '', project_url: '', repo_url: '',
  year: '', sort_order: 0, is_featured: false,
};

export default function ProjectForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState([]);
  const [photos, setPhotos] = useState([]);       // foto yang sudah ada
  const [deleteIds, setDeleteIds] = useState([]);
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('/admin/tech-categories').then((cats) => {
      setCategories(cats);
    }).catch((e) => setMessage(e.message));

    // Daftar item tech untuk pilihan (dikelompokkan per kategori)
    api('/admin/tech-items').then(setTechItems).catch(() => {});

    if (editing) {
      api(`/admin/projects/${id}`)
        .then((p) => {
          setForm({
            title: p.title,
            slug: p.slug,
            summary: p.summary,
            description: p.description ?? '',
            project_url: p.project_url ?? '',
            repo_url: p.repo_url ?? '',
            year: p.year ?? '',
            sort_order: p.sort_order,
            is_featured: p.is_featured,
          });
          setSelected(p.techs.map((t) => t.id));
          setPhotos(p.images.map((img) => ({ ...img })));
        })
        .catch((e) => setMessage(e.message));
    }
  }, [id, editing]);

  const [techItems, setTechItems] = useState([]);

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const toggleTech = (techId) => {
    setSelected((s) => (s.includes(techId) ? s.filter((x) => x !== techId) : [...s, techId]));
  };

  const updatePhoto = (imgId, key, value) => {
    setPhotos((list) => list.map((p) => (p.id === imgId ? { ...p, [key]: value } : p)));
  };

  const toggleDelete = (imgId) => {
    setDeleteIds((ids) => (ids.includes(imgId) ? ids.filter((x) => x !== imgId) : [...ids, imgId]));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage('');
    setBusy(true);

    const fd = new FormData();
    for (const key of ['title', 'slug', 'summary', 'description', 'project_url', 'repo_url', 'year', 'sort_order']) {
      fd.append(key, form[key] ?? '');
    }
    fd.append('is_featured', form.is_featured ? '1' : '0');
    selected.forEach((tid) => fd.append('techs', tid));
    if (editing) {
      fd.append('image_meta', JSON.stringify(
        photos.map((p) => ({ id: p.id, caption: p.caption ?? '', sort_order: Number(p.sort_order) || 0 })),
      ));
      deleteIds.forEach((imgId) => fd.append('delete_images', imgId));
    }
    files.forEach((f) => fd.append('images', f));

    try {
      if (editing) await api(`/admin/projects/${id}`, { method: 'PUT', body: fd });
      else await api('/admin/projects', { method: 'POST', body: fd });
      navigate('/admin/projects', { state: { flash: 'Proyek berhasil disimpan.' } });
    } catch (err) {
      setErrors(err.errors || {});
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  const grouped = categories.map((c) => ({
    ...c,
    items: techItems.filter((i) => i.category_tech_id === c.id),
  })).filter((c) => c.items.length > 0);

  return (
    <>
      <AdminTop title={editing ? 'Edit Proyek' : 'Tambah Proyek'} />

      <form className="admin-card" style={{ maxWidth: 880 }} onSubmit={submit}>
        <ErrorSummary message={message} errors={errors} />

        <h2 className="h6 mb-3">Informasi utama</h2>
        <div className="row g-3 mb-4">
          <div className="col-md-8">
            <label htmlFor="title" className="form-label">Judul proyek</label>
            <input id="title" className={`form-control${invalidClass(errors, 'title')}`} placeholder="Contoh: Sistem Informasi Sekolah"
              value={form.title} onChange={set('title')} required />
            <FieldError errors={errors} name="title" />
          </div>
          <div className="col-md-4">
            <label htmlFor="year" className="form-label">Tahun</label>
            <input id="year" type="number" min="1990" max="2100" className={`form-control${invalidClass(errors, 'year')}`}
              value={form.year} onChange={set('year')} />
            <FieldError errors={errors} name="year" />
          </div>
          <div className="col-12">
            <label htmlFor="summary" className="form-label">Ringkasan</label>
            <textarea id="summary" rows="2" maxLength="300" className={`form-control${invalidClass(errors, 'summary')}`}
              value={form.summary} onChange={set('summary')} required />
            <div className="form-text">Tampil di kartu proyek. Maksimal 300 karakter.</div>
            <FieldError errors={errors} name="summary" />
          </div>
          <div className="col-12">
            <label htmlFor="description" className="form-label">Deskripsi lengkap (opsional)</label>
            <textarea id="description" rows="6" className={`form-control${invalidClass(errors, 'description')}`}
              value={form.description} onChange={set('description')} />
            <div className="form-text">Baris kosong akan menjadi paragraf baru di halaman detail.</div>
            <FieldError errors={errors} name="description" />
          </div>
          <div className="col-md-6">
            <label htmlFor="project_url" className="form-label">Tautan proyek (opsional)</label>
            <input id="project_url" type="url" placeholder="https://" className={`form-control${invalidClass(errors, 'project_url')}`}
              value={form.project_url} onChange={set('project_url')} />
            <FieldError errors={errors} name="project_url" />
          </div>
          <div className="col-md-6">
            <label htmlFor="repo_url" className="form-label">Tautan source code (opsional)</label>
            <input id="repo_url" type="url" placeholder="https://github.com/" className={`form-control${invalidClass(errors, 'repo_url')}`}
              value={form.repo_url} onChange={set('repo_url')} />
            <FieldError errors={errors} name="repo_url" />
          </div>
          <div className="col-md-8">
            <label htmlFor="slug" className="form-label">Slug (alamat halaman)</label>
            <input id="slug" className={`form-control${invalidClass(errors, 'slug')}`} placeholder="otomatis dari judul"
              value={form.slug} onChange={set('slug')} />
            <div className="form-text">Contoh hasil: /projects/sistem-informasi-sekolah. Kosongkan untuk tetap memakai slug yang ada.</div>
            <FieldError errors={errors} name="slug" />
          </div>
          <div className="col-md-2">
            <label htmlFor="sort_order" className="form-label">Urutan</label>
            <input id="sort_order" type="number" min="0" className={`form-control${invalidClass(errors, 'sort_order')}`}
              value={form.sort_order} onChange={set('sort_order')} />
            <FieldError errors={errors} name="sort_order" />
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <div className="form-check mb-2">
              <input className="form-check-input" type="checkbox" id="is_featured" checked={form.is_featured} onChange={set('is_featured')} />
              <label className="form-check-label" htmlFor="is_featured">Unggulan</label>
            </div>
          </div>
        </div>

        <h2 className="h6 mb-2">Teknologi yang dipakai</h2>
        {categories.length === 0 ? (
          <p className="text-muted-2 small">Belum ada item tech. <Link to="/admin/tech-items/new">Tambah item tech</Link> dulu.</p>
        ) : (
          <div className="tech-picker mb-4">
            {grouped.map((c) => (
              <div key={c.id}>
                <div className="tech-pick-head">{c.name}</div>
                {c.items.map((item) => (
                  <div key={item.id} className="form-check">
                    <input className="form-check-input" type="checkbox" id={`tech-${item.id}`}
                      checked={selected.includes(item.id)} onChange={() => toggleTech(item.id)} />
                    <label className="form-check-label" htmlFor={`tech-${item.id}`}>{item.name}</label>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {editing && photos.length > 0 && (
          <>
            <h2 className="h6 mb-2">Foto dokumentasi</h2>
            <div className="mb-3">
              {photos.map((img) => (
                <div key={img.id} className="photo-row">
                  <img src={uploadUrl(img.path)} alt="" className="cover-thumb-lg" />
                  <div className="flex-grow-1">
                    <input type="text" className="form-control form-control-sm mb-2" placeholder="Keterangan foto (opsional)"
                      value={img.caption ?? ''} onChange={(e) => updatePhoto(img.id, 'caption', e.target.value)} />
                    <div className="d-flex flex-wrap align-items-center gap-3">
                      <label className="small text-muted-2 d-flex align-items-center gap-2 mb-0">
                        Urutan
                        <input type="number" min="0" className="form-control form-control-sm" style={{ width: 80 }}
                          value={img.sort_order} onChange={(e) => updatePhoto(img.id, 'sort_order', e.target.value)} />
                      </label>
                      <div className="form-check mb-0">
                        <input className="form-check-input" type="checkbox" id={`del-${img.id}`}
                          checked={deleteIds.includes(img.id)} onChange={() => toggleDelete(img.id)} />
                        <label className="form-check-label small" htmlFor={`del-${img.id}`}>Hapus foto ini</label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="mb-4">
          <label htmlFor="images" className="form-label">Tambah foto (bisa pilih banyak sekaligus)</label>
          <input type="file" id="images" multiple accept=".png,.jpg,.jpeg,.webp"
            className={`form-control${invalidClass(errors, 'images')}`}
            onChange={(e) => setFiles(Array.from(e.target.files))} />
          <div className="form-text">PNG, JPG, atau WEBP, maksimal 3 MB per foto, dan 10 foto per unggahan. Foto dengan urutan terkecil jadi sampul.</div>
          <FieldError errors={errors} name="images" />
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-accent" disabled={busy}>Simpan</button>
          <Link to="/admin/projects" className="btn btn-soft">Batal</Link>
        </div>
      </form>
    </>
  );
}
