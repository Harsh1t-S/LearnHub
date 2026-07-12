const express = require('express');
const pool = require('../config/db');
const { requireAuth, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

function slugify(text) {
  return text.toString().toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

router.get('/:id', optionalAuth, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM lessons WHERE id = ?', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Lesson not found' });
  const lesson = rows[0];

  if (lesson.status !== 'published' && !(req.user && req.user.role === 'admin')) {
    return res.status(403).json({ error: 'This lesson is not published yet' });
  }

  if (!req.user) {
    return res.json({
      id: lesson.id,
      course_id: lesson.course_id,
      title: lesson.title,
      slug: lesson.slug,
      status: lesson.status,
      requiresAuth: true
    });
  }

  const [quizzes] = await pool.query(
    'SELECT id, question, options, correct_index, sort_order FROM quizzes WHERE lesson_id = ? ORDER BY sort_order ASC, id ASC',
    [lesson.id]
  );

  res.json({ ...lesson, quizzes });
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { course_id, title, content_html, status } = req.body;
  if (!course_id || !title) return res.status(400).json({ error: 'course_id and title are required' });
  const slug = slugify(title);
  try {
    const [result] = await pool.query(
      'INSERT INTO lessons (course_id, title, slug, content_html, status, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [course_id, title, slug, content_html || '', status || 'draft', req.user.id]
    );
    res.status(201).json({ id: result.insertId, course_id, title, slug, status: status || 'draft' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'A lesson with this title already exists in this course' });
    console.error(err);
    res.status(500).json({ error: 'Failed to create lesson' });
  }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { title, content_html, status, sort_order, playground_langs } = req.body;
  await pool.query(
    `UPDATE lessons SET
       title = COALESCE(?, title),
       content_html = COALESCE(?, content_html),
       status = COALESCE(?, status),
       sort_order = COALESCE(?, sort_order),
       playground_langs = COALESCE(?, playground_langs)
     WHERE id = ?`,
    [title, content_html, status, sort_order, playground_langs ? JSON.stringify(playground_langs) : null, req.params.id]
  );
  res.json({ success: true });
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  await pool.query('DELETE FROM lessons WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

router.post('/:id/quizzes', requireAuth, requireAdmin, async (req, res) => {
  const { question, options, correct_index } = req.body;
  if (!question || !Array.isArray(options) || options.length < 2 || correct_index == null) {
    return res.status(400).json({ error: 'question, options[] (>=2) and correct_index are required' });
  }
  const [result] = await pool.query(
    'INSERT INTO quizzes (lesson_id, question, options, correct_index) VALUES (?, ?, ?, ?)',
    [req.params.id, question, JSON.stringify(options), correct_index]
  );
  res.status(201).json({ id: result.insertId });
});

router.post('/quizzes/:quizId/attempt', requireAuth, async (req, res) => {
  const { selected_index } = req.body;
  const [rows] = await pool.query('SELECT * FROM quizzes WHERE id = ?', [req.params.quizId]);
  if (rows.length === 0) return res.status(404).json({ error: 'Quiz not found' });
  const quiz = rows[0];
  const isCorrect = Number(selected_index) === Number(quiz.correct_index);

  await pool.query(
    'INSERT INTO quiz_attempts (user_id, quiz_id, selected_index, is_correct) VALUES (?, ?, ?, ?)',
    [req.user.id, req.params.quizId, selected_index, isCorrect]
  );

  res.json({ correct: isCorrect, correct_index: quiz.correct_index });
});

module.exports = router;
