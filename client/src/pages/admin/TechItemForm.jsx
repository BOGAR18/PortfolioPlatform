import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api.js';
import { AdminTop } from '../../components/AdminLayout.jsx';
import { ErrorSummary, FieldError, invalidClass } from '../../components/FormBits.jsx';
import { uploadUrl } from '../../lib/format.js';

export default function TechItemForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [categories, setCategories] = useState(null);
  const [form, setForm] = useState({ category_tech_id: '', name: '', sort_order: 0, logo: null, current_logo: null });
  const [removeLogo, setRemoveLogo] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('/admin/tech-categories').then(setCategories).catch((e) => setMessage(e.message));
    if (editing) {
      api(`/admin/tech-items/${id}`)
        .then((item) => setForm((f) => ({
          ...f,
          category_tech_id: String(item.category_tech_id),
          name: item.name,
          sort_order: item.sort_order,
          current_logo: item.logo,
        })))
        .catch((e) => setMessage(e.message));
    }
  }, [id, editing]);

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage('');
    setBusy(true);
    const fd = new FormData();
    fd.append('category_tech_id', form.category_tech_id);
    fd.append('name', form.name);
    fd.append('sort_order', form.sort_order);
    if (removeLogo) fd.append('remove_logo', '1');
    if (form.logo) fd.append('logo', form.logo);
    try {
      if (editing) await api(`/admin/tech-items/${id}`, { method: 'PUT', body: fd });
      else await api('/admin/tech-items', { method: 'POST', body: fd });
      navigate('/admin/tech-items', { state: { flash: 'Item tech berhasil disimpan.' } });
    } catch (err) {
      setErrors(err.errors || {});
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <AdminTop title={editing ? 'Edit Item Tech' : 'Tambah Item Tech'} />

      {categories && categories.length === 0 ? (
        <div className="alert alert-warning">
          Belum ada kategori. <Link to="/admin/tech-categories/new">Buat kategori dulu</Link> sebelum menambah item.
        </div>
      ) : (
        <form className="admin-card" style={{ maxWidth: 560 }} onSubmit={submit}>
          <ErrorSummary message={message} errors={errors} />

          <div className="mb-3">
            <label htmlFor="category_tech_id" className="form-label">Kategori</label>
            <select id="category_tech_id" className={`form-select${invalidClass(errors, 'category_tech_id')}`}
              value={form.category_tech_id} onChange={(e) => setForm({ ...form, category_tech_id: e.target.value })} required>
              <option value="">Pilih kategori</option>
              {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <FieldError errors={errors} name="category_tech_id" />
          </div>

          <div className="mb-3">
            <label htmlFor="name" className="form-label">Nama tech</label>
            <input id="name" className={`form-control${invalidClass(errors, 'name')}`} placeholder="Contoh: Laravel"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <FieldError errors={errors} name="name" />
          </div>

          <div className="mb-3">
            <label htmlFor="logo" className="form-label">Logo (opsional)</label>
            {form.current_logo && !removeLogo && (
              <div className="d-flex align-items-center gap-3 mb-2">
                <img src={uploadUrl(form.current_logo)} alt="" className="logo-preview" />
                <div className="form-check">
                  <input type="checkbox" className="form-check-input" id="remove_logo" checked={removeLogo}
                    onChange={(e) => setRemoveLogo(e.target.checked)} />
                  <label htmlFor="remove_logo" className="form-check-label small">Hapus logo saat ini</label>
                </div>
              </div>
            )}
            <input type="file" id="logo" accept=".png,.jpg,.jpeg,.webp,.svg"
              className={`form-control${invalidClass(errors, 'logo')}`}
              onChange={(e) => setForm({ ...form, logo: e.target.files[0] ?? null })} />
            <div className="form-text">PNG, JPG, WEBP, atau SVG. Maksimal 1 MB. Logo persegi dengan latar transparan paling rapi.</div>
            <FieldError errors={errors} name="logo" />
          </div>

          <div className="mb-4">
            <label htmlFor="sort_order" className="form-label">Urutan tampil</label>
            <input id="sort_order" type="number" min="0" className={`form-control${invalidClass(errors, 'sort_order')}`}
              value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
            <FieldError errors={errors} name="sort_order" />
          </div>

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-accent" disabled={busy}>Simpan</button>
            <Link to="/admin/tech-items" className="btn btn-soft">Batal</Link>
          </div>
        </form>
      )}
    </>
  );
}
