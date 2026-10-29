import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { projectImageUpload, profileImageUpload, deleteFiles, deleteUpload } from '../lib/upload.js';
import { attachRelations, findProjectById, uniqueSlug, slugify } from '../lib/projects.js';
import {
  TEXT_KEYS, SINGLE_KEYS, COLOR_KEYS, readSettingsMap, upsertSetting,
} from '../lib/settings.js';
import { resolveEn } from '../lib/translate.js';
import {
  str, isInt, isUrl, isEmail, isTrue, toArray, fail, parseJsonArray,
} from '../lib/validate.js';

const router = Router();
router.use(requireAuth);

/* ================= Dashboard ================= */

router.get('/dashboard', async (_req, res, next) => {
  try {
    const { rows: [c] } = await pool.query(
      `SELECT (SELECT COUNT(*) FROM category_tech)::int AS categories,
              (SELECT COUNT(*) FROM item_tech)::int AS items,
              (SELECT COUNT(*) FROM projects)::int AS projects,
              (SELECT COUNT(*) FROM certifications)::int AS certifications,
              (SELECT COUNT(*) FROM experiences)::int AS experiences`,
    );
    res.json(c);
  } catch (err) {
    next(err);
  }
});

/* ================= Proyek ================= */

router.get('/projects', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM projects ORDER BY is_featured DESC, sort_order ASC, created_at DESC',
    );
    res.json(await attachRelations(rows));
  } catch (err) {
    next(err);
  }
});

router.get('/projects/:id', async (req, res, next) => {
  try {
    const project = await findProjectById(Number(req.params.id));
    if (!project) return res.status(404).json({ message: 'Proyek tidak ditemukan.' });
    res.json(project);
  } catch (err) {
    next(err);
  }
});

function parseProject(body) {
  const errors = {};

  const title = str(body.title);
  if (!title) errors.title = 'Judul proyek wajib diisi.';
  else if (title.length > 255) errors.title = 'Judul maksimal 255 karakter.';

  const summary = str(body.summary);
  if (!summary) errors.summary = 'Ringkasan wajib diisi.';
  else if (summary.length > 300) errors.summary = 'Ringkasan maksimal 300 karakter.';

  let year = null;
  const yearRaw = str(body.year);
  if (yearRaw !== null) {
    if (!isInt(yearRaw) || Number(yearRaw) < 1990 || Number(yearRaw) > 2100) errors.year = 'Tahun harus antara 1990 dan 2100.';
    else year = Number(yearRaw);
  }

  let sort_order = 0;
  const sortRaw = str(body.sort_order) ?? '0';
  if (!isInt(sortRaw) || Number(sortRaw) < 0) errors.sort_order = 'Urutan harus angka 0 atau lebih.';
  else sort_order = Number(sortRaw);

  const project_url = str(body.project_url);
  if (project_url && !isUrl(project_url)) errors.project_url = 'Tautan proyek harus diawali http:// atau https://.';
  const repo_url = str(body.repo_url);
  if (repo_url && !isUrl(repo_url)) errors.repo_url = 'Tautan source code harus diawali http:// atau https://.';

  const techs = [...new Set(toArray(body.techs).map(Number).filter((n) => Number.isInteger(n) && n > 0))];

  return {
    errors,
    data: {
      title, summary, year, sort_order, project_url, repo_url,
      description: str(body.description),
      is_featured: isTrue(body.is_featured),
      techs,
    },
  };
}

async function syncTechs(db, projectId, techIds) {
  await db.query('DELETE FROM item_tech_project WHERE project_id = $1', [projectId]);
  if (techIds.length > 0) {
    await db.query(
      'INSERT INTO item_tech_project (project_id, item_tech_id) SELECT $1, UNNEST($2::int[])',
      [projectId, techIds],
    );
  }
}

async function addImages(db, projectId, files, startOrder) {
  for (const [i, file] of files.entries()) {
    await db.query(
      'INSERT INTO project_images (project_id, path, sort_order) VALUES ($1, $2, $3)',
      [projectId, `projects/${file.filename}`, startOrder + i],
    );
  }
}

router.post('/projects', projectImageUpload.array('images', 10), async (req, res, next) => {
  const files = req.files ?? [];
  const { data, errors } = parseProject(req.body);
  if (Object.keys(errors).length) {
    deleteFiles(files);
    return fail(res, errors);
  }

  const client = await pool.connect();
  try {
    const slug = await uniqueSlug(str(req.body.slug) ?? data.title);
    const [title_en, summary_en, description_en] = await Promise.all([
      resolveEn(data.title), resolveEn(data.summary), resolveEn(data.description),
    ]);
    await client.query('BEGIN');
    const { rows: [project] } = await client.query(
      `INSERT INTO projects
         (title, slug, summary, description, project_url, repo_url, year, is_featured, sort_order,
          title_en, summary_en, description_en)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id, slug`,
      [data.title, slug, data.summary, data.description, data.project_url, data.repo_url,
       data.year, data.is_featured, data.sort_order, title_en, summary_en, description_en],
    );
    await syncTechs(client, project.id, data.techs);
    await addImages(client, project.id, files, 0);
    await client.query('COMMIT');
    res.status(201).json(project);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    deleteFiles(files);
    next(err);
  } finally {
    client.release();
  }
});

router.put('/projects/:id', projectImageUpload.array('images', 10), async (req, res, next) => {
  const files = req.files ?? [];
  const id = Number(req.params.id);
  const existing = await findProjectById(id);
  if (!existing) {
    deleteFiles(files);
    return res.status(404).json({ message: 'Proyek tidak ditemukan.' });
  }

  const { data, errors } = parseProject(req.body);
  let slug = existing.slug;
  const slugInput = str(req.body.slug);
  if (slugInput) {
    const base = slugify(slugInput);
    if (!base) errors.slug = 'Slug hanya boleh berisi huruf, angka, dan tanda hubung.';
    else if (base !== existing.slug) slug = await uniqueSlug(base, id);
  }

  if (Object.keys(errors).length) {
    deleteFiles(files);
    return fail(res, errors);
  }

  let imageMeta = [];
  try {
    imageMeta = JSON.parse(req.body.image_meta ?? '[]');
  } catch {
    imageMeta = [];
  }
  const deleteIds = toArray(req.body.delete_images).map(Number).filter(Number.isInteger);
  const knownIds = new Set(existing.images.map((img) => img.id));
  const removedPaths = [];

  const client = await pool.connect();
  try {
    const [title_en, summary_en, description_en] = await Promise.all([
      resolveEn(data.title, existing.title, existing.title_en),
      resolveEn(data.summary, existing.summary, existing.summary_en),
      resolveEn(data.description, existing.description, existing.description_en),
    ]);
    await client.query('BEGIN');
    await client.query(
      `UPDATE projects SET title = $1, slug = $2, summary = $3, description = $4, project_url = $5,
              repo_url = $6, year = $7, is_featured = $8, sort_order = $9,
              title_en = $10, summary_en = $11, description_en = $12, updated_at = NOW()
        WHERE id = $13`,
      [data.title, slug, data.summary, data.description, data.project_url, data.repo_url,
       data.year, data.is_featured, data.sort_order, title_en, summary_en, description_en, id],
    );
    await syncTechs(client, id, data.techs);

    for (const imgId of deleteIds.filter((x) => knownIds.has(x))) {
      const { rows: [row] } = await client.query(
        'DELETE FROM project_images WHERE id = $1 AND project_id = $2 RETURNING path', [imgId, id],
      );
      if (row) removedPaths.push(row.path);
    }

    for (const meta of imageMeta) {
      const imgId = Number(meta?.id);
      if (!knownIds.has(imgId) || deleteIds.includes(imgId)) continue;
      await client.query(
        'UPDATE project_images SET caption = $1, sort_order = $2 WHERE id = $3 AND project_id = $4',
        [str(meta.caption), Number(meta.sort_order) || 0, imgId, id],
      );
    }

    const { rows: [{ next }] } = await client.query(
      'SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM project_images WHERE project_id = $1', [id],
    );
    await addImages(client, id, files, next);

    await client.query('COMMIT');
    removedPaths.forEach(deleteUpload);
    res.json({ ok: true, slug });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    deleteFiles(files);
    next(err);
  } finally {
    client.release();
  }
});

router.delete('/projects/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { rows: images } = await pool.query('SELECT path FROM project_images WHERE project_id = $1', [id]);
    const { rowCount } = await pool.query('DELETE FROM projects WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ message: 'Proyek tidak ditemukan.' });
    images.forEach((img) => deleteUpload(img.path));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/* ================= Pengaturan konten ================= */

router.get('/settings', async (_req, res, next) => {
  try {
    const map = await readSettingsMap();
    const texts = Object.fromEntries(
      TEXT_KEYS.map((k) => [k, { id: map[k] ?? '', en: map[`${k}_en`] ?? '' }]),
    );
    const single = Object.fromEntries(SINGLE_KEYS.map((k) => [k, map[k] ?? '']));

    const idValues = parseJsonArray(map.about_values);
    const enValues = parseJsonArray(map.about_values_en);
    const slots = Math.max(4, idValues.length);
    const values = Array.from({ length: slots }, (_, i) => ({
      icon: idValues[i]?.icon ?? 'bi-star',
      id_title: idValues[i]?.title ?? '',
      id_text: idValues[i]?.text ?? '',
      en_title: enValues[i]?.title ?? '',
      en_text: enValues[i]?.text ?? '',
    }));

    const colors = Object.fromEntries(
      Object.entries(COLOR_KEYS).map(([k, cfg]) => [k, map[k] || cfg.default]),
    );

    res.json({ texts, single, values, colors, photo: map.contact_photo || '' });
  } catch (err) {
    next(err);
  }
});

/* Foto profil di kartu kontak: disimpan sebagai setting 'contact_photo' */
router.post('/settings/photo', (req, res, next) => {
  profileImageUpload.single('photo')(req, res, async (err) => {
    if (err) return next(err);
    if (!req.file) return fail(res, { photo: 'Pilih file foto terlebih dahulu.' });
    try {
      const rel = `profile/${req.file.filename}`;
      const map = await readSettingsMap();
      await upsertSetting(pool, 'contact_photo', rel);
      deleteUpload(map.contact_photo);
      res.json({ ok: true, photo: rel });
    } catch (e) {
      deleteFiles([req.file]);
      next(e);
    }
  });
});

router.delete('/settings/photo', async (_req, res, next) => {
  try {
    const map = await readSettingsMap();
    await upsertSetting(pool, 'contact_photo', null);
    deleteUpload(map.contact_photo);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.put('/settings', async (req, res, next) => {
  const body = req.body ?? {};
  const errors = {};
  const entries = [];

  for (const key of TEXT_KEYS) {
    const id = str(body.texts?.[key]?.id);
    const en = str(body.texts?.[key]?.en);
    if ((id ?? '').length > 1000 || (en ?? '').length > 1000) errors[`texts.${key}`] = 'Teks maksimal 1000 karakter.';
    entries.push([key, id], [`${key}_en`, en]);
  }

  for (const key of SINGLE_KEYS) {
    const value = str(body.single?.[key]);
    if (value && key === 'contact_email' && !isEmail(value)) errors[key] = 'Format email tidak valid.';
    if (value && key.startsWith('social_') && !isUrl(value)) errors[key] = 'Tautan harus diawali https://';
    if (value && key === 'contact_whatsapp' && !/^\d{6,20}$/.test(value.replace(/\s/g, ''))) {
      errors[key] = 'Nomor WhatsApp hanya angka, format internasional tanpa +.';
    }
    entries.push([key, value]);
  }

  const rawValues = toArray(body.values).slice(0, 8);
  const idOut = [];
  const enOut = [];
  for (const row of rawValues) {
    const icon = str(row?.icon) ?? 'bi-star';
    const idTitle = str(row?.id_title) ?? '';
    const idText = str(row?.id_text) ?? '';
    const enTitle = str(row?.en_title) ?? idTitle;
    const enText = str(row?.en_text) ?? idText;
    if (!idTitle && !idText && !enTitle && !enText) continue;
    idOut.push({ icon, title: idTitle, text: idText });
    enOut.push({ icon, title: enTitle, text: enText });
  }
  entries.push(['about_values', idOut.length ? JSON.stringify(idOut) : null]);
  entries.push(['about_values_en', enOut.length ? JSON.stringify(enOut) : null]);

  const reset = isTrue(body.reset_colors);
  for (const [key] of Object.entries(COLOR_KEYS)) {
    const value = reset ? null : str(body.colors?.[key]);
    if (value && !/^#[0-9A-Fa-f]{6}$/.test(value)) errors[key] = 'Warna harus berformat #RRGGBB.';
    entries.push([key, value]);
  }

  if (Object.keys(errors).length) return fail(res, errors);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const [key, value] of entries) await upsertSetting(client, key, value);
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    next(err);
  } finally {
    client.release();
  }
});

export default router;
