import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../../api.js';
import { AdminTop } from '../../components/AdminLayout.jsx';
import { ErrorSummary, FieldError, invalidClass } from '../../components/FormBits.jsx';

export default function TechCategoryForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', sort_order: 0 });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!editing) return;
    api(`/admin/tech-categories/${id}`)
      .then((c) => setForm({ name: c.name, sort_order: c.sort_order }))
      .catch((e) => setMessage(e.message));
  }, [id, editing]);

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage('');
    setBusy(true);
    try {
      if (editing) await api(`/admin/tech-categories/${id}`, { method: 'PUT', body: form });
      else await api('/admin/tech-categories', { method: 'POST', body: form });
      navigate('/admin/tech-categories', { state: { flash: 'Kategori berhasil disimpan.' } });
    } catch (err) {
      setErrors(err.errors || {});
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <AdminTop title={editing ? 'Edit Kategori' : 'Tambah Kategori'} />
      <form className="admin-card" style={{ maxWidth: 640 }} onSubmit={submit}>
        <ErrorSummary message={message} errors={errors} />

        <div className="mb-3">
          <label htmlFor="name" className="form-label">Nama kategori</label>
          <input id="name" className={`form-control${invalidClass(errors, 'name')}`} placeholder="Contoh: Backend"
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required autoFocus />
          <FieldError errors={errors} name="name" />
        </div>

        <div className="mb-4">
          <label htmlFor="sort_order" className="form-label">Urutan tampil</label>
          <input id="sort_order" type="number" min="0" className={`form-control${invalidClass(errors, 'sort_order')}`}
            value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
          <FieldError errors={errors} name="sort_order" />
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-accent" disabled={busy}>Simpan</button>
          <Link to="/admin/tech-categories" className="btn btn-soft">Batal</Link>
        </div>
      </form>
    </>
  );
}
