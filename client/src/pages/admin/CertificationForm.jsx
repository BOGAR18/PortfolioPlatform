import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api.js';
import { AdminTop } from '../../components/AdminLayout.jsx';
import { ErrorSummary, FieldError, invalidClass } from '../../components/FormBits.jsx';
import { uploadUrl } from '../../lib/format.js';

const EMPTY = {
  name: '', issuer: '', issued_at: '', expires_at: '', credential_id: '', credential_url: '', sort_order: 0,
};

export default function CertificationForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [current, setCurrent] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!editing) return;
    api(`/admin/certifications/${id}`)
      .then((c) => {
        setForm({
          name: c.name,
          issuer: c.issuer,
          issued_at: c.issued_at ? String(c.issued_at).slice(0, 10) : '',
          expires_at: c.expires_at ? String(c.expires_at).slice(0, 10) : '',
          credential_id: c.credential_id ?? '',
          credential_url: c.credential_url ?? '',
          sort_order: c.sort_order,
        });
        setCurrent(c.image);
      })
      .catch((e) => setMessage(e.message));
  }, [id, editing]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage('');
    setBusy(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ''));
    if (removeImage) fd.append('remove_image', '1');
    if (file) fd.append('image', file);
    try {
      if (editing) await api(`/admin/certifications/${id}`, { method: 'PUT', body: fd });
      else await api('/admin/certifications', { method: 'POST', body: fd });
      navigate('/admin/certifications', { state: { flash: 'Sertifikasi berhasil disimpan.' } });
    } catch (err) {
      setErrors(err.errors || {});
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <AdminTop title={editing ? 'Edit Sertifikasi' : 'Tambah Sertifikasi'} />
      <form className="admin-card" style={{ maxWidth: 640 }} onSubmit={submit}>
        <ErrorSummary message={message} errors={errors} />

        <div className="mb-3">
          <label htmlFor="name" className="form-label">Nama sertifikasi</label>
          <input id="name" className={`form-control${invalidClass(errors, 'name')}`} placeholder="Contoh: Certified Laravel Developer"
            value={form.name} onChange={set('name')} required autoFocus />
          <FieldError errors={errors} name="name" />
        </div>

        <div className="mb-3">
          <label htmlFor="issuer" className="form-label">Penerbit</label>
          <input id="issuer" className={`form-control${invalidClass(errors, 'issuer')}`} placeholder="Contoh: Dicoding"
            value={form.issuer} onChange={set('issuer')} required />
          <FieldError errors={errors} name="issuer" />
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label htmlFor="issued_at" className="form-label">Tanggal terbit</label>
            <input id="issued_at" type="date" className={`form-control${invalidClass(errors, 'issued_at')}`}
              value={form.issued_at} onChange={set('issued_at')} />
            <FieldError errors={errors} name="issued_at" />
          </div>
          <div className="col-md-6">
            <label htmlFor="expires_at" className="form-label">Berlaku hingga (opsional)</label>
            <input id="expires_at" type="date" className={`form-control${invalidClass(errors, 'expires_at')}`}
              value={form.expires_at} onChange={set('expires_at')} />
            <FieldError errors={errors} name="expires_at" />
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="credential_id" className="form-label">ID kredensial (opsional)</label>
          <input id="credential_id" className={`form-control${invalidClass(errors, 'credential_id')}`}
            value={form.credential_id} onChange={set('credential_id')} />
          <FieldError errors={errors} name="credential_id" />
        </div>

        <div className="mb-3">
          <label htmlFor="credential_url" className="form-label">Tautan verifikasi (opsional)</label>
          <input id="credential_url" type="url" placeholder="https://" className={`form-control${invalidClass(errors, 'credential_url')}`}
            value={form.credential_url} onChange={set('credential_url')} />
          <FieldError errors={errors} name="credential_url" />
        </div>

        <div className="mb-3">
          <label htmlFor="image" className="form-label">Gambar sertifikat (opsional)</label>
          {current && !removeImage && (
            <div className="d-flex align-items-center gap-3 mb-2">
              <img src={uploadUrl(current)} alt="" className="cover-thumb-lg" />
              <div className="form-check">
                <input type="checkbox" className="form-check-input" id="remove_image" checked={removeImage}
                  onChange={(e) => setRemoveImage(e.target.checked)} />
                <label htmlFor="remove_image" className="form-check-label small">Hapus gambar saat ini</label>
              </div>
            </div>
          )}
          <input type="file" id="image" accept=".png,.jpg,.jpeg,.webp" className={`form-control${invalidClass(errors, 'image')}`}
            onChange={(e) => setFile(e.target.files[0] ?? null)} />
          <div className="form-text">PNG, JPG, atau WEBP, maksimal 2 MB. Gunakan gambar sertifikat dengan rasio landscape agar rapi.</div>
          <FieldError errors={errors} name="image" />
        </div>

        <div className="mb-4">
          <label htmlFor="sort_order" className="form-label">Urutan tampil</label>
          <input id="sort_order" type="number" min="0" className={`form-control${invalidClass(errors, 'sort_order')}`}
            value={form.sort_order} onChange={set('sort_order')} />
          <FieldError errors={errors} name="sort_order" />
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-accent" disabled={busy}>Simpan</button>
          <Link to="/admin/certifications" className="btn btn-soft">Batal</Link>
        </div>
      </form>
    </>
  );
}
