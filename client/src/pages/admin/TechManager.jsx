import { useEffect, useState } from 'react';
import { api } from '../../api.js';

const EMPTY_CAT = { id: null, name: '', sort_order: 0 };
const EMPTY_ITEM = { id: null, category_tech_id: '', name: '', sort_order: 0, logo: null };

export default function TechManager() {
  const [cats, setCats] = useState([]);
  const [catForm, setCatForm] = useState(EMPTY_CAT);
  const [itemForm, setItemForm] = useState(EMPTY_ITEM);
  const [logoFile, setLogoFile] = useState(null);
  const [error, setError] = useState('');

  const load = () => api('/admin/tech-categories').then(setCats).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const run = async (fn) => {
    setError('');
    try { await fn(); await load(); } catch (e) { setError(e.message); }
  };

  const saveCat = (e) => {
    e.preventDefault();
    run(async () => {
      const body = { name: catForm.name, sort_order: catForm.sort_order };
      if (catForm.id) await api(`/admin/tech-categories/${catForm.id}`, { method: 'PUT', body });
      else await api('/admin/tech-categories', { method: 'POST', body });
      setCatForm(EMPTY_CAT);
    });
  };

  const deleteCat = (c) => {
    if (!confirm(`Hapus kategori "${c.name}" beserta itemnya?`)) return;
    run(() => api(`/admin/tech-categories/${c.id}`, { method: 'DELETE' }));
  };

  const saveItem = (e) => {
    e.preventDefault();
    run(async () => {
      const fd = new FormData();
      fd.append('category_tech_id', itemForm.category_tech_id);
      fd.append('name', itemForm.name);
      fd.append('sort_order', itemForm.sort_order);
      if (logoFile) fd.append('logo', logoFile);
      if (itemForm.id) await api(`/admin/tech-items/${itemForm.id}`, { method: 'PUT', body: fd });
      else await api('/admin/tech-items', { method: 'POST', body: fd });
      setItemForm(EMPTY_ITEM);
      setLogoFile(null);
      e.target.reset();
    });
  };

  const deleteItem = (item) => {
    if (!confirm(`Hapus "${item.name}"?`)) return;
    run(() => api(`/admin/tech-items/${item.id}`, { method: 'DELETE' }));
  };

  return (
    <div>
      <h1>Tech Stack</h1>
      {error && <div className="alert-error">{error}</div>}

      <h2>Kategori</h2>
      <form className="form inline-form" onSubmit={saveCat}>
        <input placeholder="Nama kategori" value={catForm.name} required
          onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} />
        <input type="number" placeholder="Urutan" value={catForm.sort_order}
          onChange={(e) => setCatForm({ ...catForm, sort_order: e.target.value })} />
        <button className="btn">{catForm.id ? 'Perbarui' : 'Tambah'}</button>
        {catForm.id && <button type="button" className="btn ghost" onClick={() => setCatForm(EMPTY_CAT)}>Batal</button>}
      </form>

      <table className="table">
        <thead><tr><th>Nama</th><th>Urutan</th><th>Jumlah item</th><th></th></tr></thead>
        <tbody>
          {cats.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.sort_order}</td>
              <td>{c.items.length}</td>
              <td className="row-actions">
                <button className="btn ghost" onClick={() => setCatForm({ id: c.id, name: c.name, sort_order: c.sort_order })}>Edit</button>
                <button className="btn ghost" onClick={() => deleteCat(c)}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Item teknologi</h2>
      <form className="form inline-form" onSubmit={saveItem}>
        <select value={itemForm.category_tech_id} required
          onChange={(e) => setItemForm({ ...itemForm, category_tech_id: e.target.value })}>
          <option value="">Pilih kategori</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input placeholder="Nama teknologi" value={itemForm.name} required
          onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} />
        <input type="number" placeholder="Urutan" value={itemForm.sort_order}
          onChange={(e) => setItemForm({ ...itemForm, sort_order: e.target.value })} />
        <input type="file" accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setLogoFile(e.target.files[0] ?? null)} />
        <button className="btn">{itemForm.id ? 'Perbarui' : 'Tambah'}</button>
        {itemForm.id && <button type="button" className="btn ghost" onClick={() => setItemForm(EMPTY_ITEM)}>Batal</button>}
      </form>

      {cats.map((c) => (
        <div key={c.id}>
          <h3>{c.name}</h3>
          <table className="table">
            <tbody>
              {c.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.logo && <img className="logo-sm" src={`/uploads/${item.logo}`} alt="" />}</td>
                  <td>{item.name}</td>
                  <td>{item.sort_order}</td>
                  <td className="row-actions">
                    <button className="btn ghost" onClick={() => setItemForm({
                      id: item.id, category_tech_id: item.category_tech_id,
                      name: item.name, sort_order: item.sort_order, logo: item.logo,
                    })}>Edit</button>
                    <button className="btn ghost" onClick={() => deleteItem(item)}>Hapus</button>
                  </td>
                </tr>
              ))}
              {c.items.length === 0 && <tr><td>Belum ada item.</td></tr>}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
