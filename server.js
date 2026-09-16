// server.js - Phục vụ site tĩnh + API lưu dữ liệu admin vào SQLite
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const PORT = process.env.PORT || 3000;
const DB_DIR = process.env.DB_DIR || path.join(__dirname, 'db');
const DB_PATH = path.join(DB_DIR, 'app.db');
// Khi frontend host ở nơi khác (vd. GitHub Pages), khai báo domain được phép gọi API,
// cách nhau bởi dấu phẩy. Để trống/không set = cho phép tất cả (chỉ nên dùng khi test).
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS kv_store (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

const getAllStmt = db.prepare('SELECT key, value FROM kv_store');
const getOneStmt = db.prepare('SELECT value FROM kv_store WHERE key = ?');
const upsertStmt = db.prepare(`
  INSERT INTO kv_store (key, value, updated_at) VALUES (?, ?, ?)
  ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
`);
const deleteStmt = db.prepare('DELETE FROM kv_store WHERE key = ?');

const app = express();
app.use(cors({
  origin: ALLOWED_ORIGINS.length > 0 ? ALLOWED_ORIGINS : true
}));
app.use(express.json());

// JSON body không hợp lệ -> trả lỗi gọn, không lộ stack trace/đường dẫn server
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'invalid_json_body' });
  }
  next(err);
});

// Toàn bộ key/value hiện có, dùng để hydrate localStorage khi trang tải lên
app.get('/api/kv', (req, res) => {
  const rows = getAllStmt.all();
  const result = {};
  rows.forEach((row) => { result[row.key] = row.value; });
  res.json(result);
});

app.get('/api/kv/:key', (req, res) => {
  const row = getOneStmt.get(req.params.key);
  if (!row) return res.status(404).json({ error: 'not_found' });
  res.json({ key: req.params.key, value: row.value });
});

app.put('/api/kv/:key', (req, res) => {
  const { value } = req.body || {};
  if (typeof value !== 'string') {
    return res.status(400).json({ error: 'value phải là chuỗi (JSON.stringify trước khi gửi)' });
  }
  upsertStmt.run(req.params.key, value, new Date().toISOString());
  res.json({ ok: true });
});

app.delete('/api/kv/:key', (req, res) => {
  deleteStmt.run(req.params.key);
  res.json({ ok: true });
});

// Phục vụ file tĩnh của site (index.html, admin.html, app.js, css, data/...)
app.use(express.static(__dirname));

app.listen(PORT, () => {
  console.log(`Trưa Nay Ăn Gì đang chạy tại http://localhost:${PORT}`);
  console.log(`SQLite database: ${DB_PATH}`);
});
