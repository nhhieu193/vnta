// render-proxy/server.js
// Chạy trên Render chỉ để có domain HTTPS miễn phí. Mọi request được forward
// nguyên trạng (kể cả header Origin) tới server thật đang chạy trên VPS,
// nơi dữ liệu được lưu vào SQLite.
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const PORT = process.env.PORT || 10000;
const VPS_ORIGIN = process.env.VPS_ORIGIN; // vd: http://203.0.113.5:3000

if (!VPS_ORIGIN) {
  console.error('Thiếu biến môi trường VPS_ORIGIN, vd: http://<ip-vps>:3000');
  process.exit(1);
}

const app = express();

app.use('/', createProxyMiddleware({
  target: VPS_ORIGIN,
  changeOrigin: true,
  ws: false,
  logger: console
}));

app.listen(PORT, () => {
  console.log(`Render proxy đang chạy tại cổng ${PORT}, forward request tới ${VPS_ORIGIN}`);
});
