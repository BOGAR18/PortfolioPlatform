import { Router } from 'express';
import { pool } from '../db.js';
import { listProjects, listOthers, countProjects, findProjectBySlug } from '../lib/projects.js';
import { readSettingsMap, COLOR_KEYS } from '../lib/settings.js';

const router = Router();
const PER_PAGE = 9;

router.get('/home', async (_req, res, next) => {
  try {
    const [cats, items, exps, certs, projects, counts, settings] = await Promise.all([
      pool.query(
        `SELECT c.id, c.name, c.sort_order, COUNT(i.id)::int AS items_count
           FROM category_tech c LEFT JOIN item_tech i ON i.category_tech_id = c.id
          GROUP BY c.id ORDER BY c.sort_order, c.name`,
      ),
      pool.query('SELECT id, category_tech_id, name, logo, sort_order FROM item_tech ORDER BY sort_order, name'),
      pool.query('SELECT * FROM experiences ORDER BY start_year DESC, sort_order ASC'),
      pool.query('SELECT * FROM certifications ORDER BY sort_order ASC, issued_at DESC NULLS LAST'),
      listProjects({ limit: 3, order: 'home' }),
      pool.query(
        `SELECT (SELECT COUNT(*) FROM projects)::int AS projects,
                (SELECT COUNT(*) FROM item_tech)::int AS techs,
                (SELECT COUNT(*) FROM certifications)::int AS certifications`,
      ),
      readSettingsMap(),
    ]);

    res.json({
      categories: cats.rows.map((c) => ({ ...c, items: items.rows.filter((i) => i.category_tech_id === c.id) })),
      experiences: exps.rows,
      certifications: certs.rows,
      projects,
      stats: counts.rows[0],
      techPreview: items.rows.slice(0, 6).map((i) => i.name),
      settings,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/projects', async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const [data, total] = await Promise.all([
      listProjects({ limit: PER_PAGE, offset: (page - 1) * PER_PAGE, order: 'list' }),
      countProjects(),
    ]);
    res.json({
      data,
      meta: { page, perPage: PER_PAGE, total, lastPage: Math.max(1, Math.ceil(total / PER_PAGE)) },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/projects/:slug', async (req, res, next) => {
  try {
    const project = await findProjectBySlug(req.params.slug);
    if (!project) return res.status(404).json({ message: 'Proyek tidak ditemukan.' });
    res.json({ ...project, others: await listOthers(project.id, 3) });
  } catch (err) {
    next(err);
  }
});

/** CSS warna dari pengaturan admin. Selector sama dengan Theme::overridesCss() di lampiran. */
router.get('/theme.css', async (_req, res, next) => {
  try {
    const map = await readSettingsMap();
    const light = [];
    const dark = [];
    for (const [key, cfg] of Object.entries(COLOR_KEYS)) {
      const hex = map[key];
      if (!/^#[0-9A-Fa-f]{6}$/.test(hex ?? '')) continue;
      (cfg.mode === 'light' ? light : dark).push(`${cfg.cssVar}:${hex.toUpperCase()}`);
    }
    let css = '';
    if (light.length) css += `[data-bs-theme="light"]{${light.join(';')}}`;
    if (dark.length) css += `[data-bs-theme="dark"]{${dark.join(';')}}`;
    res.set('Cache-Control', 'no-cache').type('text/css').send(css);
  } catch (err) {
    next(err);
  }
});

router.get('/settings', async (_req, res, next) => {
  try {
    res.json(await readSettingsMap());
  } catch (err) {
    next(err);
  }
});

export default router;
