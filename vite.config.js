import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { handleApi } from './server/admin-api.js'

// https://vite.dev/config/
export default defineConfig({
  base: '/Hussainihomesfoundationpakistan/',
  plugins: [
    react(),
    {
      name: 'admin-api',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url || !req.url.startsWith('/api/')) return next();
          try {
            await handleApi(req, res);
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: false, error: err.message || 'Server error' }));
          }
        });
      },
    },
  ],
})
