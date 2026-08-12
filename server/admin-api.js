import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const DIST = path.join(ROOT, 'dist');
const DATA_DIR = path.join(PUBLIC, 'data');
const CONFIG_FILE = path.join(__dirname, 'config.json');

const ALLOWED_FOLDERS = new Set(['gallery', 'site-images', 'team']);
const ALLOWED_EXT = new Set(['jpg', 'jpeg', 'png', 'jfif', 'webp', 'gif']);
const MAX_BODY = 40 * 1024 * 1024;

// Admin changes are committed back to the GitHub repo so they survive Render's
// ephemeral filesystem (free-tier instances lose local files on every
// redeploy/spin-down). Requires REPO_TOKEN env var set on the host.
const REPO_OWNER = 'viki863-star';
const REPO_NAME = 'Hussainihomesfoundationpakistan';
const REPO_BRANCH = 'main';

async function githubFetch(apiPath, options = {}) {
  const token = process.env.REPO_TOKEN;
  if (!token) return null;
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${apiPath}`,
      {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'hussaini-homes-admin',
          ...(options.headers || {}),
        },
      }
    );
    if (res.status === 401 || res.status === 403 || res.status === 404) return null;
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  } catch {
    return null;
  }
}

async function gitPutFile(relPath) {
  const local = path.join(ROOT, relPath);
  if (!fs.existsSync(local)) return;
  const apiPath = 'public/' + relPath.split(path.sep).join('/');
  let sha = null;
  const existing = await githubFetch(apiPath, { method: 'GET' });
  if (existing && existing.status === 200 && existing.data.sha) sha = existing.data.sha;
  const body = { message: `admin: update ${relPath}`, content: fs.readFileSync(local).toString('base64'), branch: REPO_BRANCH };
  if (sha) body.sha = sha;
  await githubFetch(apiPath, { method: 'PUT', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
}

async function gitDeleteFile(relPath) {
  const apiPath = 'public/' + relPath.split(path.sep).join('/');
  const existing = await githubFetch(apiPath, { method: 'GET' });
  if (!existing || existing.status !== 200 || !existing.data.sha) return;
  await githubFetch(apiPath, {
    method: 'DELETE',
    body: JSON.stringify({ message: `admin: delete ${relPath}`, sha: existing.data.sha, branch: REPO_BRANCH }),
    headers: { 'Content-Type': 'application/json' },
  });
}

const tokens = new Set();

function getConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } catch {
    const cfg = { password: 'hussaini2024' };
    try { fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2)); } catch { /* ignore */ }
    return cfg;
  }
}

function readJSON(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function writeJSON(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function mirrorToDist(relPath) {
  try {
    const s = path.join(PUBLIC, relPath);
    const d = path.join(DIST, relPath);
    fs.mkdirSync(path.dirname(d), { recursive: true });
    fs.copyFileSync(s, d);
  } catch { /* dist not present yet — fine */ }
}

function sendJSON(res, status, body) {
  const out = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(out),
  });
  res.end(out);
}

function sanitizeFilename(name) {
  let n = path.basename(String(name || '')).replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
  if (!n || n.startsWith('.')) n = 'img';
  return n;
}

function safeJoin(rootDir, rel) {
  const target = path.resolve(rootDir, rel);
  const root = path.resolve(rootDir);
  if (target !== root && !target.startsWith(root + path.sep)) throw new Error('Invalid path');
  return target;
}

function isAuthed(req) {
  const auth = req.headers['authorization'] || '';
  return auth.startsWith('Bearer ') && tokens.has(auth.slice(7));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    let done = false;
    req.on('data', c => {
      if (done) return;
      size += c.length;
      if (size > MAX_BODY) { done = true; reject(new Error('Upload too large')); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      if (done) return;
      done = true;
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); }
      catch { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

export async function handleApi(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const p = url.pathname;

  try {
    if (p === '/api/admin/login' && req.method === 'POST') {
      const body = await readBody(req);
      if (body.password === getConfig().password) {
        const token = crypto.randomUUID();
        tokens.add(token);
        return sendJSON(res, 200, { ok: true, token });
      }
      return sendJSON(res, 401, { ok: false, error: 'Wrong password' });
    }

    if (!isAuthed(req)) {
      return sendJSON(res, 401, { ok: false, error: 'Unauthorized' });
    }

    if (p === '/api/admin/site' && req.method === 'GET') {
      return sendJSON(res, 200, {
        gallery: readJSON(path.join(DATA_DIR, 'gallery.json'), { items: [] }),
        images: readJSON(path.join(DATA_DIR, 'site-images.json'), {}),
        team: readJSON(path.join(DATA_DIR, 'team.json'), { officials: [], committees: [] }),
      });
    }

    if (p === '/api/admin/gallery' && req.method === 'POST') {
      const body = await readBody(req);
      const items = Array.isArray(body.items) ? body.items : [];
      writeJSON(path.join(DATA_DIR, 'gallery.json'), { items });
      mirrorToDist('data/gallery.json');
      await gitPutFile('data/gallery.json');
      return sendJSON(res, 200, { ok: true });
    }

    if (p === '/api/admin/images' && req.method === 'POST') {
      const body = await readBody(req);
      const images = body.images && typeof body.images === 'object' ? body.images : {};
      writeJSON(path.join(DATA_DIR, 'site-images.json'), images);
      mirrorToDist('data/site-images.json');
      await gitPutFile('data/site-images.json');
      return sendJSON(res, 200, { ok: true });
    }

    if (p === '/api/admin/team' && req.method === 'POST') {
      const body = await readBody(req);
      const officials = Array.isArray(body.officials) ? body.officials : [];
      const committees = Array.isArray(body.committees) ? body.committees : [];
      writeJSON(path.join(DATA_DIR, 'team.json'), { officials, committees });
      mirrorToDist('data/team.json');
      await gitPutFile('data/team.json');
      return sendJSON(res, 200, { ok: true });
    }

    if (p === '/api/admin/upload' && req.method === 'POST') {
      const body = await readBody(req);
      const folder = String(body.folder || '');
      if (!ALLOWED_FOLDERS.has(folder)) return sendJSON(res, 400, { ok: false, error: 'Bad folder' });
      const ext = String(body.ext || 'jpg').replace(/^\./, '').toLowerCase();
      if (!ALLOWED_EXT.has(ext)) return sendJSON(res, 400, { ok: false, error: 'Bad file type' });
      const buf = Buffer.from(String(body.data || ''), 'base64');
      if (!buf.length) return sendJSON(res, 400, { ok: false, error: 'Empty file' });

      let fname = sanitizeFilename(body.filename) || `img-${Date.now()}`;
      const base = fname.replace(/\.[a-z0-9]+$/i, '');
      fname = `${base || 'img'}.${ext}`;

      const rel = path.join('images', folder, fname);
      const target = safeJoin(PUBLIC, rel);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, buf);
      mirrorToDist(rel);
      await gitPutFile(rel);
      return sendJSON(res, 200, { ok: true, src: '/' + rel.split(path.sep).join('/') });
    }

    if (p === '/api/admin/delete-image' && req.method === 'POST') {
      const body = await readBody(req);
      const src = String(body.src || '');
      if (!src.startsWith('/images/gallery/')) {
        return sendJSON(res, 400, { ok: false, error: 'Only gallery images can be deleted' });
      }
      const rel = src.replace(/^\//, '').split('/').join(path.sep);
      const target = safeJoin(PUBLIC, rel);
      if (fs.existsSync(target)) fs.unlinkSync(target);
      try { const d = path.join(DIST, rel); if (fs.existsSync(d)) fs.unlinkSync(d); } catch { /* ignore */ }
      await gitDeleteFile(rel);
      return sendJSON(res, 200, { ok: true });
    }

    if (p === '/api/admin/password' && req.method === 'POST') {
      const body = await readBody(req);
      const cfg = getConfig();
      if (body.password !== cfg.password) return sendJSON(res, 401, { ok: false, error: 'Wrong current password' });
      const np = String(body.newPassword || '');
      if (np.length < 6) return sendJSON(res, 400, { ok: false, error: 'Password must be at least 6 characters' });
      cfg.password = np;
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2));
      return sendJSON(res, 200, { ok: true });
    }

    return sendJSON(res, 404, { ok: false, error: 'Not found' });
  } catch (err) {
    return sendJSON(res, 400, { ok: false, error: err.message || 'Error' });
  }
}
