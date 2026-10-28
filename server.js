// server.js - Phục vụ site tĩnh + API lưu dữ liệu admin vào MySQL
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
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
// Dữ liệu lưu dạng chuỗi JSON lớn (kho món, log 500 dòng...) — mặc định 100kb của express quá nhỏ,
// vượt quá thì lệnh lưu bị từ chối (413) và dữ liệu không lên server.
app.use(express.json({ limit: '5mb' }));

// Express 4 không tự bắt lỗi của hàm async (vd. MySQL mất kết nối) → bọc lại để trả 500
// thay vì làm sập cả server.
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

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
app.get('/api/kv', wrap(async (req, res) => {
  const [rows] = await pool.query('SELECT `key`, value FROM kv_store');
  const result = {};
  rows.forEach((row) => { result[row.key] = row.value; });
  res.json(result);
}));

app.get('/api/kv/:key', wrap(async (req, res) => {
  const [rows] = await pool.query('SELECT value FROM kv_store WHERE `key` = ?', [req.params.key]);
  if (!rows.length) return res.status(404).json({ error: 'not_found' });
  res.json({ key: req.params.key, value: rows[0].value });
}));

app.put('/api/kv/:key', wrap(async (req, res) => {
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
}));

// Nối thêm dòng vào một mảng JSON (log hành động, kế hoạch đã chốt) thay vì ghi đè cả mảng,
// để nhiều thiết bị cùng ghi không xóa mất dữ liệu của nhau.
app.post('/api/kv/:key/append', wrap(async (req, res) => {
  const { items, max } = req.body || {};
  if (!Array.isArray(items)) return res.status(400).json({ error: 'items phải là mảng' });
  const limit = Math.min(Math.max(parseInt(max, 10) || 500, 1), 5000);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query('SELECT value FROM kv_store WHERE `key` = ? FOR UPDATE', [req.params.key]);
    let list = [];
    if (rows.length) {
      try { const v = JSON.parse(rows[0].value); if (Array.isArray(v)) list = v; } catch (e) {}
    }
    const seen = new Set(list.map((x) => JSON.stringify(x)));
    items.forEach((x) => { const k = JSON.stringify(x); if (!seen.has(k)) { seen.add(k); list.push(x); } });
    if (list.length > limit) list = list.slice(list.length - limit);
    await conn.query(
      `INSERT INTO kv_store (\`key\`, value, updated_at) VALUES (?, ?, NOW())
       ON DUPLICATE KEY UPDATE value = VALUES(value), updated_at = VALUES(updated_at)`,
      [req.params.key, JSON.stringify(list)]
    );
    await conn.commit();
    res.json({ ok: true, count: list.length });
  } catch (err) {
    await conn.rollback().catch(() => {});
    throw err;
  } finally {
    conn.release();
  }
}));

app.delete('/api/kv/:key', wrap(async (req, res) => {
  await pool.query('DELETE FROM kv_store WHERE `key` = ?', [req.params.key]);
  res.json({ ok: true });
}));

// ---- Nhạc MP3 (admin tải lên, lưu trên đĩa VPS; danh sách lưu trong kv_store key tnag_music) ----
const MUSIC_DIR = path.join(__dirname, 'uploads', 'music');
fs.mkdirSync(MUSIC_DIR, { recursive: true });

function requireApiKey(req, res, next) {
  if (!API_KEY || req.header('x-api-key') === API_KEY) return next();
  res.status(401).json({ error: 'unauthorized' });
}

// Body gửi lên là dữ liệu MP3 thô; tên gốc truyền qua query ?name=
app.post('/api/music', requireApiKey, express.raw({ type: '*/*', limit: '25mb' }), (req, res) => {
  const buf = req.body;
  if (!Buffer.isBuffer(buf) || buf.length < 4) return res.status(400).json({ error: 'empty_file' });
  const isId3 = buf.slice(0, 3).toString('latin1') === 'ID3';
  const isFrame = buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0;
  if (!isId3 && !isFrame) return res.status(400).json({ error: 'not_mp3' });
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const file = id + '.mp3';
  fs.writeFileSync(path.join(MUSIC_DIR, file), buf);
  res.json({ ok: true, id, file });
});

app.delete('/api/music/:file', requireApiKey, (req, res) => {
  if (!/^[a-z0-9]+\.mp3$/.test(req.params.file)) return res.status(400).json({ error: 'bad_name' });
  fs.rm(path.join(MUSIC_DIR, req.params.file), { force: true }, () => res.json({ ok: true }));
});

app.use('/uploads/music', express.static(MUSIC_DIR));

// Chỉ phục vụ đúng các file của trang web. KHÔNG mở cả thư mục dự án, vì trong đó có
// .env (mật khẩu MySQL, API_KEY), .git, server.js, node_modules... ai cũng tải được.
const PUBLIC_FILE = /^\/(index\.html|admin\.html|(app|admin|audio|config|hydrate)\.js|(styles|admin)\.css|data\/[a-z0-9_-]+\.js|favicon\.ico)$/i;
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.use((req, res, next) => {
  if ((req.method === 'GET' || req.method === 'HEAD') && PUBLIC_FILE.test(req.path)) {
    return res.sendFile(path.join(__dirname, req.path));
  }
  next();
});

app.use((req, res) => res.status(404).json({ error: 'not_found' }));
// Lỗi không lường trước (vd. MySQL mất kết nối) → trả 500 gọn, server vẫn chạy tiếp
app.use((err, req, res, next) => {
  console.error('[server]', err && err.message);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'server_error' });
});

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
