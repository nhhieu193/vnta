// server.js - Phục vụ site tĩnh + API lưu dữ liệu admin vào MySQL
const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');

const PORT = process.env.PORT || 3000;

// Thông tin kết nối MySQL - lấy từ database bạn tạo trong aaPanel (Databases -> Add database)
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;
const DB_USER = process.env.DB_USER || 'calaci_store';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'calaci_store';

// Khi frontend host ở nơi khác (vd. GitHub Pages), khai báo domain được phép gọi API,
// cách nhau bởi dấu phẩy. Để trống/không set = cho phép tất cả (chỉ nên dùng khi test).
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
// Khóa bí mật để tránh người ngoài gọi thẳng API đọc/ghi dữ liệu (kể cả mật khẩu user)
// mà không qua trang web. Để trống = không bảo vệ (chỉ nên dùng khi test cục bộ).
const API_KEY = process.env.API_KEY || '';

const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS kv_store (
      \`key\` VARCHAR(191) PRIMARY KEY,
      value LONGTEXT NOT NULL,
      updated_at DATETIME NOT NULL
    )
  `);
}

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

// Yêu cầu header X-API-Key khớp với API_KEY cho mọi route /api/kv/*.
app.use('/api/kv', (req, res, next) => {
  if (!API_KEY) return next();
  if (req.header('x-api-key') !== API_KEY) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
});

// Toàn bộ key/value hiện có, dùng để hydrate localStorage khi trang tải lên
app.get('/api/kv', async (req, res) => {
  const [rows] = await pool.query('SELECT `key`, value FROM kv_store');
  const result = {};
  rows.forEach((row) => { result[row.key] = row.value; });
  res.json(result);
});

app.get('/api/kv/:key', async (req, res) => {
  const [rows] = await pool.query('SELECT value FROM kv_store WHERE `key` = ?', [req.params.key]);
  if (!rows.length) return res.status(404).json({ error: 'not_found' });
  res.json({ key: req.params.key, value: rows[0].value });
});

app.put('/api/kv/:key', async (req, res) => {
  const { value } = req.body || {};
  if (typeof value !== 'string') {
    return res.status(400).json({ error: 'value phải là chuỗi (JSON.stringify trước khi gửi)' });
  }
  await pool.query(
    `INSERT INTO kv_store (\`key\`, value, updated_at) VALUES (?, ?, NOW())
     ON DUPLICATE KEY UPDATE value = VALUES(value), updated_at = VALUES(updated_at)`,
    [req.params.key, value]
  );
  res.json({ ok: true });
});

app.delete('/api/kv/:key', async (req, res) => {
  await pool.query('DELETE FROM kv_store WHERE `key` = ?', [req.params.key]);
  res.json({ ok: true });
});

// Phục vụ file tĩnh của site (index.html, admin.html, app.js, css, data/...)
app.use(express.static(__dirname));

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`First Date Ăn Gì đang chạy tại http://localhost:${PORT}`);
      console.log(`MySQL database: ${DB_NAME}@${DB_HOST}:${DB_PORT}`);
    });
  })
  .catch((err) => {
    console.error('Không kết nối được MySQL:', err.message);
    process.exit(1);
  });
