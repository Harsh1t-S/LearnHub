const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const blockedTypes = /exe|bat|cmd|sh|msi|com|scr|dll|jar|apk/;
const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (blockedTypes.test(ext)) return cb(new Error('This file type is not allowed: ' + ext));
    cb(null, true);
  }
});

function classify(mimeType, filename) {
  if (mimeType?.startsWith('image/')) return 'image';
  if (mimeType?.startsWith('video/')) return 'video';
  if (mimeType?.startsWith('audio/')) return 'audio';
  return 'file';
}

router.post('/upload', requireAuth, requireAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const base = process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
  const url = `${base}/uploads/${req.file.filename}`;
  const kind = classify(req.file.mimetype, req.file.originalname);
  const [result] = await pool.query(
    'INSERT INTO media (filename, original_name, mime_type, url, uploaded_by) VALUES (?, ?, ?, ?, ?)',
    [req.file.filename, req.file.originalname, req.file.mimetype, url, req.user.id]
  );
  res.status(201).json({
    id: result.insertId,
    url,
    mime_type: req.file.mimetype,
    kind,
    original_name: req.file.originalname,
    size: req.file.size
  });
});

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM media ORDER BY created_at DESC LIMIT 200');
  res.json(rows);
});

module.exports = router;
