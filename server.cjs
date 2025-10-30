// server.cjs
const path = require('path');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static files (adjust folder name kung iba sayo)
app.use(express.static(path.join(__dirname, 'public')));

// uploads (optional sample)
const upload = multer({ dest: path.join(__dirname, 'uploads') });

// ===== PROXY TO RASPBERRY PI (ilagay DITO) =====
const PI = process.env.PI_HOST || '192.168.100.50';  // static IP ng Pi
app.use('/pi', createProxyMiddleware({
  target: `http://${PI}:3001`,
  changeOrtigin: true,
  pathRewrite: { '^/pi': '' }   // /pi/video -> /video
  })
);

// ===== PROXY TO PYTHON ML SERVER =====
app.use('/api', createProxyMiddleware({
  target: 'http://127.0.0.1:8000',
  changeOrigin: true,
  pathRewrite: { '^/api': '' }   // /api/detect -> /detect
}));

// sample endpoints
app.get('/health', (req, res) => res.json({ ok: true }));

// (iba mo pang /api routes dito …)

// START SERVER — laging nasa pinakadulo
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
