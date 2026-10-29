import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api.js';
import { AdminTop } from '../../components/AdminLayout.jsx';
import { ErrorSummary, FieldError, invalidClass } from '../../components/FormBits.jsx';

const EMPTY = { role: '', company: '', start_year: '', end_year: '', description: '', sort_order: 0, is_current: false };

export default function ExperienceForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!editing) return;
    api(`/admin/experiences/${id}`)
      .then((x) => setForm({
        role: x.role,
        company: x.company,
        start_year: x.start_year,
        end_year: x.end_year ?? '',
        description: x.description ?? '',
        sort_order: x.sort_order,
        is_current: x.end_year === null,
      }))
      .catch((e) => setMessage(e.message));
  }, [id, editing]);

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [key]: value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage('');
    setBusy(true);
    const body = { ...form, end_year: form.is_current ? '' : form.end_year };
    try {
      if (editing) await api(`/admin/experiences/${id}`, { method: 'PUT', body });
      else await api('/admin/experiences', { method: 'POST', body });
      navigate('/admin/experiences', { state: { flash: 'Perjalanan berhasil disimpan.' } });
    } catch (err) {
      setErrors(err.errors || {});
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <AdminTop title={editing ? 'Edit Perjalanan' : 'Tambah Perjalanan'} />
      <form className="admin-card" style={{ maxWidth: 640 }} onSubmit={submit}>
        <ErrorSummary message={message} errors={errors} />

        <div className="mb-3">
          <label htmlFor="role" className="form-label">Peran / jabatan</label>
          <input id="role" className={`form-control${invalidClass(errors, 'role')}`} placeholder="Contoh: Pengembang Web"
            value={form.role} onChange={set('role')} required autoFocus />
          <FieldError errors={errors} name="role" />
        </div>

        <div className="mb-3">
          <label htmlFor="company" className="form-label">Perusahaan / tempat</label>
          <input id="company" className={`form-control${invalidClass(errors, 'company')}`} placeholder="Contoh: Nama perusahaan"
            value={form.company} onChange={set('company')} required />
          <FieldError errors={errors} name="company" />
        </div>

        <div className="row g-3 mb-2">
          <div className="col-md-6">
            <label htmlFor="start_year" className="form-label">Tahun mulai</label>
            <input id="start_year" type="number" min="1950" max="2100" className={`form-control${invalidClass(errors, 'start_year')}`}
              value={form.start_year} onChange={set('start_year')} required />
            <FieldError errors={errors} name="start_year" />
          </div>
          <div className="col-md-6">
            <label htmlFor="end_year" className="form-label">Tahun selesai</label>
            <input id="end_year" type="number" min="1950" max="2100" className={`form-control${invalidClass(errors, 'end_year')}`}
              value={form.end_year} onChange={set('end_year')} disabled={form.is_current} />
            <FieldError errors={errors} name="end_year" />
          </div>
        </div>

        <div className="form-check mb-3">
          <input className="form-check-input" type="checkbox" id="is_current" checked={form.is_current} onChange={set('is_current')} />
          <label className="form-check-label" htmlFor="is_current">Masih berlangsung (tampil "Sekarang")</label>
        </div>

        <div className="mb-3">
          <label htmlFor="description" className="form-label">Deskripsi (opsional)</label>
          <textarea id="description" rows="4" className={`form-control${invalidClass(errors, 'description')}`}
            value={form.description} onChange={set('description')} />
          <FieldError errors={errors} name="description" />
        </div>

        <div className="mb-4">
          <label htmlFor="sort_order" className="form-label">Urutan tampil</label>
          <input id="sort_order" type="number" min="0" className={`form-control${invalidClass(errors, 'sort_order')}`}
            value={form.sort_order} onChange={set('sort_order')} />
          <div className="form-text">Jika tahun mulai sama, angka kecil tampil lebih dulu.</div>
          <FieldError errors={errors} name="sort_order" />
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-accent" disabled={busy}>Simpan</button>
          <Link to="/admin/experiences" className="btn btn-soft">Batal</Link>
        </div>
      </form>
    </>
  );
}
