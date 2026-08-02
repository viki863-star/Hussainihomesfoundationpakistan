import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleApi } from './server/admin-api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, 'dist');
const PORT = process.env.PORT || 5177;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.jfif': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

function serveStatic(req, res, urlPath) {
  let rel;
  try {
    rel = decodeURIComponent(urlPath).replace(/^\/+/, '');
  } catch {
    res.writeHead(400); res.end('Bad request'); return;
  }
  if (!rel) rel = 'index.html';

  const filePath = path.resolve(DIST, rel);
  const root = path.resolve(DIST);
  if (filePath !== root && !filePath.startsWith(root + path.sep)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Content-Length': stat.size,
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=0',
      });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    // SPA fallback — only for extension-less routes
    if (!path.basename(rel).includes('.')) {
      const idx = path.join(DIST, 'index.html');
      fs.stat(idx, (e2, st2) => {
        if (e2) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('No build found. Run "npm run build" first, then start the server.');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Content-Length': st2.size });
        fs.createReadStream(idx).pipe(res);
      });
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname.startsWith('/api/')) {
    handleApi(req, res).catch(e => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: e.message || 'Server error' }));
    });
    return;
  }
  serveStatic(req, res, url.pathname);
});

server.listen(PORT, () => {
  console.log(`Hussaini Homes server: http://localhost:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin`);
});
