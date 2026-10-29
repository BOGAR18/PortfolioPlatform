import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { techLogoUpload, certImageUpload, deleteFiles, deleteUpload } from '../lib/upload.js';
import { str, isInt, isUrl, isDate, isTrue, fail } from '../lib/validate.js';
import { resolveEn } from '../lib/translate.js';

const router = Router();
router.use(requireAuth);

const notFound = (res) => res.status(404).json({ message: 'Data tidak ditemukan.' });
const sortOrder = (raw, errors) => {
  const v = str(raw) ?? '0';
  if (!isInt(v) || Number(v) < 0) {
    errors.sort_order = 'Urutan harus angka 0 atau lebih.';
    return 0;
  }
  return Number(v);
};

/* ================= Kategori tech ================= */

router.get('/tech-categories', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.id, c.name, c.sort_order, COUNT(i.id)::int AS items_count
         FROM category_tech c LEFT JOIN item_tech i ON i.category_tech_id = c.id
        GROUP BY c.id ORDER BY c.sort_order, c.name`,
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/tech-categories/:id', async (req, res, next) => {
  try {
    const { rows: [row] } = await pool.query('SELECT id, name, sort_order FROM category_tech WHERE id = $1', [req.params.id]);
    if (!row) return notFound(res);
    res.json(row);
  } catch (err) {
    next(err);
  }
});

function categoryInput(body) {
  const errors = {};
  const name = str(body.name);
  if (!name) errors.name = 'Nama kategori wajib diisi.';
  else if (name.length > 255) errors.name = 'Nama maksimal 255 karakter.';
  const sort = sortOrder(body.sort_order, errors);
  return { errors, name, sort };
}

router.post('/tech-categories', async (req, res, next) => {
  try {
    const { errors, name, sort } = categoryInput(req.body ?? {});
    if (Object.keys(errors).length) return fail(res, errors);
    const { rows: [row] } = await pool.query(
      'INSERT INTO category_tech (name, sort_order) VALUES ($1, $2) RETURNING id, name, sort_order',
      [name, sort],
    );
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
});

router.put('/tech-categories/:id', async (req, res, next) => {
  try {
    const { errors, name, sort } = categoryInput(req.body ?? {});
    if (Object.keys(errors).length) return fail(res, errors);
    const { rowCount } = await pool.query(
      'UPDATE category_tech SET name = $1, sort_order = $2, updated_at = NOW() WHERE id = $3',
      [name, sort, req.params.id],
    );
    if (rowCount === 0) return notFound(res);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.delete('/tech-categories/:id', async (req, res, next) => {
  try {
    const { rows: logos } = await pool.query(
      'SELECT logo FROM item_tech WHERE category_tech_id = $1 AND logo IS NOT NULL', [req.params.id],
    );
    const { rowCount } = await pool.query('DELETE FROM category_tech WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return notFound(res);
    logos.forEach((l) => deleteUpload(l.logo));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/* ================= Item tech ================= */

router.get('/tech-items', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT i.id, i.category_tech_id, i.name, i.logo, i.sort_order, c.name AS category_name
         FROM item_tech i JOIN category_tech c ON c.id = i.category_tech_id
        ORDER BY c.sort_order, c.name, i.sort_order, i.name`,
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/tech-items/:id', async (req, res, next) => {
  try {
    const { rows: [row] } = await pool.query(
      'SELECT id, category_tech_id, name, logo, sort_order FROM item_tech WHERE id = $1', [req.params.id],
    );
    if (!row) return notFound(res);
    res.json(row);
  } catch (err) {
    next(err);
  }
});

async function itemInput(body) {
  const errors = {};
  const categoryId = Number(body.category_tech_id);
  if (!isInt(body.category_tech_id ?? '') || !Number.isInteger(categoryId)) {
    errors.category_tech_id = 'Pilih kategori.';
  } else {
    const { rowCount } = await pool.query('SELECT 1 FROM category_tech WHERE id = $1', [categoryId]);
    if (rowCount === 0) errors.category_tech_id = 'Kategori tidak ditemukan.';
  }
  const name = str(body.name);
  if (!name) errors.name = 'Nama tech wajib diisi.';
  else if (name.length > 255) errors.name = 'Nama maksimal 255 karakter.';
  const sort = sortOrder(body.sort_order, errors);
  return { errors, categoryId, name, sort };
}

router.post('/tech-items', techLogoUpload.single('logo'), async (req, res, next) => {
  try {
    const { errors, categoryId, name, sort } = await itemInput(req.body ?? {});
    if (Object.keys(errors).length) {
      deleteFiles(req.file ? [req.file] : []);
      return fail(res, errors);
    }
    const logo = req.file ? `tech/${req.file.filename}` : null;
    const { rows: [row] } = await pool.query(
      `INSERT INTO item_tech (category_tech_id, name, logo, sort_order)
       VALUES ($1, $2, $3, $4) RETURNING id, category_tech_id, name, logo, sort_order`,
      [categoryId, name, logo, sort],
    );
    res.status(201).json(row);
  } catch (err) {
    deleteFiles(req.file ? [req.file] : []);
    next(err);
  }
});

router.put('/tech-items/:id', techLogoUpload.single('logo'), async (req, res, next) => {
  try {
    const { rows: [old] } = await pool.query('SELECT logo FROM item_tech WHERE id = $1', [req.params.id]);
    if (!old) {
      deleteFiles(req.file ? [req.file] : []);
      return notFound(res);
    }
    const { errors, categoryId, name, sort } = await itemInput(req.body ?? {});
    if (Object.keys(errors).length) {
      deleteFiles(req.file ? [req.file] : []);
      return fail(res, errors);
    }
    let logo = old.logo;
    if (req.file) logo = `tech/${req.file.filename}`;
    else if (isTrue(req.body.remove_logo)) logo = null;

    await pool.query(
      `UPDATE item_tech SET category_tech_id = $1, name = $2, logo = $3, sort_order = $4, updated_at = NOW()
        WHERE id = $5`,
      [categoryId, name, logo, sort, req.params.id],
    );
    if (old.logo && old.logo !== logo) deleteUpload(old.logo);
    res.json({ ok: true });
  } catch (err) {
    deleteFiles(req.file ? [req.file] : []);
    next(err);
  }
});

router.delete('/tech-items/:id', async (req, res, next) => {
  try {
    const { rows: [old] } = await pool.query('DELETE FROM item_tech WHERE id = $1 RETURNING logo', [req.params.id]);
    if (!old) return notFound(res);
    deleteUpload(old.logo);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/* ================= Sertifikasi ================= */

router.get('/certifications', async (_req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM certifications ORDER BY sort_order ASC, issued_at DESC NULLS LAST');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/certifications/:id', async (req, res, next) => {
  try {
    const { rows: [row] } = await pool.query('SELECT * FROM certifications WHERE id = $1', [req.params.id]);
    if (!row) return notFound(res);
    res.json(row);
  } catch (err) {
    next(err);
  }
});

function certInput(body) {
  const errors = {};
  const name = str(body.name);
  if (!name) errors.name = 'Nama sertifikasi wajib diisi.';
  else if (name.length > 255) errors.name = 'Nama maksimal 255 karakter.';
  const issuer = str(body.issuer);
  if (!issuer) errors.issuer = 'Penerbit wajib diisi.';
  else if (issuer.length > 255) errors.issuer = 'Penerbit maksimal 255 karakter.';

  const issued = str(body.issued_at);
  const expires = str(body.expires_at);
  if (issued && !isDate(issued)) errors.issued_at = 'Tanggal terbit tidak valid.';
  if (expires && !isDate(expires)) errors.expires_at = 'Tanggal berlaku tidak valid.';
  if (issued && expires && isDate(issued) && isDate(expires) && expires < issued) {
    errors.expires_at = 'Tanggal berlaku harus setelah tanggal terbit.';
  }

  const credentialId = str(body.credential_id);
  if (credentialId && credentialId.length > 255) errors.credential_id = 'ID kredensial maksimal 255 karakter.';
  const credentialUrl = str(body.credential_url);
  if (credentialUrl && !isUrl(credentialUrl)) errors.credential_url = 'Tautan harus diawali http:// atau https://.';

  const sort = sortOrder(body.sort_order, errors);
  return {
    errors,
    data: {
      name, issuer, issued_at: issued, expires_at: expires,
      credential_id: credentialId, credential_url: credentialUrl, sort_order: sort,
    },
  };
}

router.post('/certifications', certImageUpload.single('image'), async (req, res, next) => {
  try {
    const { errors, data } = certInput(req.body ?? {});
    if (Object.keys(errors).length) {
      deleteFiles(req.file ? [req.file] : []);
      return fail(res, errors);
    }
    const image = req.file ? `certifications/${req.file.filename}` : null;
    const { rows: [row] } = await pool.query(
      `INSERT INTO certifications
         (name, issuer, issued_at, expires_at, credential_id, credential_url, image, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [data.name, data.issuer, data.issued_at, data.expires_at, data.credential_id,
       data.credential_url, image, data.sort_order],
    );
    res.status(201).json(row);
  } catch (err) {
    deleteFiles(req.file ? [req.file] : []);
    next(err);
  }
});

router.put('/certifications/:id', certImageUpload.single('image'), async (req, res, next) => {
  try {
    const { rows: [old] } = await pool.query('SELECT image FROM certifications WHERE id = $1', [req.params.id]);
    if (!old) {
      deleteFiles(req.file ? [req.file] : []);
      return notFound(res);
    }
    const { errors, data } = certInput(req.body ?? {});
    if (Object.keys(errors).length) {
      deleteFiles(req.file ? [req.file] : []);
      return fail(res, errors);
    }
    let image = old.image;
    if (req.file) image = `certifications/${req.file.filename}`;
    else if (isTrue(req.body.remove_image)) image = null;

    await pool.query(
      `UPDATE certifications SET name = $1, issuer = $2, issued_at = $3, expires_at = $4,
              credential_id = $5, credential_url = $6, image = $7, sort_order = $8, updated_at = NOW()
        WHERE id = $9`,
      [data.name, data.issuer, data.issued_at, data.expires_at, data.credential_id,
       data.credential_url, image, data.sort_order, req.params.id],
    );
    if (old.image && old.image !== image) deleteUpload(old.image);
    res.json({ ok: true });
  } catch (err) {
    deleteFiles(req.file ? [req.file] : []);
    next(err);
  }
});

router.delete('/certifications/:id', async (req, res, next) => {
  try {
    const { rows: [old] } = await pool.query('DELETE FROM certifications WHERE id = $1 RETURNING image', [req.params.id]);
    if (!old) return notFound(res);
    deleteUpload(old.image);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/* ================= Perjalanan / pengalaman ================= */

router.get('/experiences', async (_req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM experiences ORDER BY start_year DESC, sort_order ASC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/experiences/:id', async (req, res, next) => {
  try {
    const { rows: [row] } = await pool.query('SELECT * FROM experiences WHERE id = $1', [req.params.id]);
    if (!row) return notFound(res);
    res.json(row);
  } catch (err) {
    next(err);
  }
});

function experienceInput(body) {
  const errors = {};
  const role = str(body.role);
  if (!role) errors.role = 'Peran wajib diisi.';
  else if (role.length > 255) errors.role = 'Peran maksimal 255 karakter.';
  const company = str(body.company);
  if (!company) errors.company = 'Perusahaan / tempat wajib diisi.';
  else if (company.length > 255) errors.company = 'Perusahaan maksimal 255 karakter.';

  const startRaw = str(body.start_year);
  let start = null;
  if (!startRaw || !isInt(startRaw) || Number(startRaw) < 1950 || Number(startRaw) > 2100) {
    errors.start_year = 'Tahun mulai harus antara 1950 dan 2100.';
  } else start = Number(startRaw);

  let end = null;
  const endRaw = str(body.end_year);
  if (!isTrue(body.is_current) && endRaw !== null) {
    if (!isInt(endRaw) || Number(endRaw) < 1950 || Number(endRaw) > 2100) errors.end_year = 'Tahun selesai harus antara 1950 dan 2100.';
    else if (start !== null && Number(endRaw) < start) errors.end_year = 'Tahun selesai tidak boleh sebelum tahun mulai.';
    else end = Number(endRaw);
  }

  const sort = sortOrder(body.sort_order, errors);
  return {
    errors,
    data: { role, company, start_year: start, end_year: end, description: str(body.description), sort_order: sort },
  };
}

router.post('/experiences', async (req, res, next) => {
  try {
    const { errors, data } = experienceInput(req.body ?? {});
    if (Object.keys(errors).length) return fail(res, errors);
    const [role_en, description_en] = await Promise.all([resolveEn(data.role), resolveEn(data.description)]);
    const { rows: [row] } = await pool.query(
      `INSERT INTO experiences (role, company, start_year, end_year, description, sort_order, role_en, description_en)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [data.role, data.company, data.start_year, data.end_year, data.description, data.sort_order, role_en, description_en],
    );
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
});

router.put('/experiences/:id', async (req, res, next) => {
  try {
    const { errors, data } = experienceInput(req.body ?? {});
    if (Object.keys(errors).length) return fail(res, errors);
    const { rows: [old] } = await pool.query(
      'SELECT role, description, role_en, description_en FROM experiences WHERE id = $1', [req.params.id],
    );
    if (!old) return notFound(res);
    const [role_en, description_en] = await Promise.all([
      resolveEn(data.role, old.role, old.role_en),
      resolveEn(data.description, old.description, old.description_en),
    ]);
    const { rowCount } = await pool.query(
      `UPDATE experiences SET role = $1, company = $2, start_year = $3, end_year = $4,
              description = $5, sort_order = $6, role_en = $7, description_en = $8, updated_at = NOW()
        WHERE id = $9`,
      [data.role, data.company, data.start_year, data.end_year, data.description, data.sort_order, role_en, description_en, req.params.id],
    );
    if (rowCount === 0) return notFound(res);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.delete('/experiences/:id', async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM experiences WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return notFound(res);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
