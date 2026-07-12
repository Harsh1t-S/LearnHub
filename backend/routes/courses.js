const express = require('express');
const pool = require('../config/db');
const { requireAuth, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

function slugify(text) {
  return text.toString().toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

router.get('/', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT c.*, (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id AND l.status = "published") AS lesson_count FROM courses c ORDER BY sort_order ASC, id ASC'
  );
  res.json(rows);
});

router.get('/:slug', optionalAuth, async (req, res) => {
  const [courses] = await pool.query('SELECT * FROM courses WHERE slug = ?', [req.params.slug]);
  if (courses.length === 0) return res.status(404).json({ error: 'Course not found' });
  const course = courses[0];

  const isAdmin = req.user && req.user.role === 'admin';
  const statusFilter = isAdmin ? '' : 'AND status = "published"';
  const [lessons] = await pool.query(
    `SELECT id, title, slug, status, sort_order FROM lessons WHERE course_id = ? ${statusFilter} ORDER BY sort_order ASC, id ASC`,
    [course.id]
  );
  res.json({ ...course, lessons });
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { title, description, icon } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });
  const slug = slugify(title);
  try {
    const [result] = await pool.query(
      'INSERT INTO courses (title, slug, description, icon, created_by) VALUES (?, ?, ?, ?, ?)',
      [title, slug, description || '', icon || '📘', req.user.id]
    );
    res.status(201).json({ id: result.insertId, title, slug, description, icon });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'A course with this title already exists' });
    console.error(err);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { title, description, icon, sort_order } = req.body;
  await pool.query(
    'UPDATE courses SET title = COALESCE(?, title), description = COALESCE(?, description), icon = COALESCE(?, icon), sort_order = COALESCE(?, sort_order) WHERE id = ?',
    [title, description, icon, sort_order, req.params.id]
  );
  res.json({ success: true });
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  await pool.query('DELETE FROM courses WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
