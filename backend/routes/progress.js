const express = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/:lessonId/complete', requireAuth, async (req, res) => {
  await pool.query(
    `INSERT INTO progress (user_id, lesson_id, completed, completed_at)
     VALUES (?, ?, TRUE, NOW())
     ON DUPLICATE KEY UPDATE completed = TRUE, completed_at = NOW()`,
    [req.user.id, req.params.lessonId]
  );
  res.json({ success: true });
});

router.get('/me', requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    'SELECT lesson_id FROM progress WHERE user_id = ? AND completed = TRUE',
    [req.user.id]
  );
  res.json(rows.map(r => r.lesson_id));
});

module.exports = router;
