import { pool } from '../db.js';

export function slugify(text) {
  return String(text)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function uniqueSlug(source, ignoreId = null) {
  const base = slugify(source) || 'proyek';
  let slug = base;
  let n = 2;
  while (
    (await pool.query('SELECT 1 FROM projects WHERE slug = $1 AND id IS DISTINCT FROM $2', [slug, ignoreId])).rowCount > 0
  ) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

export async function attachRelations(projects) {
  if (projects.length === 0) return [];
  const ids = projects.map((p) => p.id);

  const { rows: images } = await pool.query(
    `SELECT id, project_id, path, caption, sort_order FROM project_images
      WHERE project_id = ANY($1::int[]) ORDER BY sort_order, id`,
    [ids],
  );
  const { rows: techs } = await pool.query(
    `SELECT pt.project_id, i.id, i.name, i.logo
       FROM item_tech_project pt JOIN item_tech i ON i.id = pt.item_tech_id
      WHERE pt.project_id = ANY($1::int[]) ORDER BY i.name`,
    [ids],
  );

  return projects.map((p) => ({
    ...p,
    images: images.filter((img) => img.project_id === p.id),
    techs: techs.filter((t) => t.project_id === p.id),
  }));
}

/** order: 'home' = unggulan dulu (beranda), 'list' = urutan biasa (halaman daftar) */
export async function listProjects({ limit = 9, offset = 0, order = 'list' } = {}) {
  const orderSql =
    order === 'home'
      ? 'is_featured DESC, sort_order ASC, created_at DESC'
      : 'sort_order ASC, created_at DESC';
  const { rows } = await pool.query(
    `SELECT * FROM projects ORDER BY ${orderSql} LIMIT $1 OFFSET $2`,
    [limit, offset],
  );
  return attachRelations(rows);
}

export async function listOthers(excludeId, limit = 3) {
  const { rows } = await pool.query(
    'SELECT * FROM projects WHERE id <> $1 ORDER BY sort_order ASC, created_at DESC LIMIT $2',
    [excludeId, limit],
  );
  return attachRelations(rows);
}

export async function countProjects() {
  const { rows: [{ count }] } = await pool.query('SELECT COUNT(*)::int AS count FROM projects');
  return count;
}

export async function findProjectBySlug(slug) {
  const { rows } = await pool.query('SELECT * FROM projects WHERE slug = $1', [slug]);
  return rows[0] ? (await attachRelations(rows))[0] : null;
}

export async function findProjectById(id) {
  const { rows } = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
  return rows[0] ? (await attachRelations(rows))[0] : null;
}
