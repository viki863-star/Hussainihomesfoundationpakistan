# AGENTS.md — Hussaini Homes Foundation Website

This file tells any AI agent (or developer) everything needed to safely modify and
deploy this website. Read it fully before making changes.

---

## 1. What this is

A React single-page application (SPA) for **Hussaini Homes Foundation** — an orphan
care center in Parachinar, Pakistan. It has a bilingual English/Urdu UI, a photo
gallery, team pages, construction progress section, donate/contact sections, and a
**built-in admin panel** so non-technical staff can upload photos and edit content.

## 2. Live URLs & Production

| What | URL |
|---|---|
| Production website (live) | https://hussainihomesfndpk.com — **points to Render** |
| Render (Node server + admin) | https://hussaini-homes.onrender.com |
| GitHub Pages (static mirror) | https://viki863-star.github.io/Hussainihomesfoundationpakistan/ |
| Admin panel | https://hussainihomesfndpk.com/admin |
| GitHub repo | https://github.com/viki863-star/Hussainihomesfoundationpakistan (branch `main`) |
| Google Business Profile | hussainihomesfndpk.com (owned on Cloudflare) |

- DNS: Cloudflare (domain) → CNAME to `hussaini-homes.onrender.com`.
- Deploy flow: **push to GitHub `main` → Render auto-deploys → production live.**

## 3. Tech stack

- **Vite 8 + React 19** (JSX, not TypeScript)
- **react-router-dom** — routes: `/` (home), `/team/:id`, `/admin`
- **Plain CSS** — `src/index.css` (design tokens + base), `src/App.css` (components), `src/admin.css` (admin panel)
- **Node** server (only needed for admin API + serving built files/production)

## 4. Folder map (repo root = this folder)

```
vite.config.js        Vite config (+ admin API dev middleware). Base path is fixed
                      to '/Hussainihomesfoundationpakistan/' — DO NOT change it.
server.js             Production Node server (serves built 'dist' + passes /api/* to admin-api)
server/admin-api.js   All admin REST endpoints (/api/admin/...). Handles uploads + JSON writes.
server/config.json    Admin password (DO NOT commit in real secrets; it's already committed)
src/main.jsx          React entry point
src/App.jsx           Router, layout, preloader, cursor, marquee, floating buttons
src/i18n.js           ALL English + Urdu text for the whole site (edit text here)
src/LangContext.jsx   Language + dark/light theme provider (useLang() hook)
src/paths.js          withBase() helper for asset paths
src/siteImages.js     Default image paths used by components (overridable via data file)
src/teamData.js       Default team data (officials/committees)
src/index.css         THEME COLORS + global styles. Start here for color changes.
src/App.css           All component styles
src/components/*.jsx  One file per section (Navbar, Hero, About, Team, ...)
public/images/*       Images actually served to visitors (see §6)
public/data/*.json    Admin-managed content: gallery.json, team.json, site-images.json
public/404.html       SPA fallback for GitHub Pages
public/robots.txt     SEO — points at hussainihomesfndpk.com
public/sitemap.xml    SEO sitemap — points at hussainihomesfndpk.com
index.html            SEO/meta tags, structured data (Schema.org NGO), OG/Twitter cards
```

Sibling folder `../asset/image/` (outside repo) holds the original un-optimized
source images the owner keeps.

## 5. Commands

```bash
npm install          # first time
npm run dev          # local dev server (has admin API via vite middleware)
npm run build        # production build -> dist/  (MUST pass before any commit)
npm run preview      # preview the production build locally (admin API NOT mounted)
npm run lint         # oxlint; there is 1 pre-existing warning (LangContext.jsx) — ignore it
npm start            # node server.js -> serves dist + /api/* on :5177 (full production locally)
```

**Rule: after any change, run `npm run build` AND `npm run lint`. Fix any new errors.**

## 6. How content & images work (IMPORTANT)

There are TWO content layers:

1. **Hardcoded defaults** (in code) — component props, `src/i18n.js` text, and
   `SITE_IMAGE_DEFAULTS` in `src/siteImages.js`.
2. **Live JSON data** (editable via `/admin`, overrides defaults):
   - `public/data/gallery.json` → photo gallery items
   - `public/data/team.json` → team officers & committee members (overrides `TEAM_DEFAULTS` in `src/teamData.js`, which is the hardcoded fallback)
   - `public/data/site-images.json` → which image file each "slot" uses

The admin panel reads/writes these JSON files and uploads/stores images into
`public/images/...`, then mirrors them into `dist/` at runtime so production + GitHub
Pages both show them.

**Image slots** (keys in `site-images.json`, referenced by components):
`heroBuilding`, `aboutBuilding`, `constructionBegin`, `constructionToday`,
`constructionPoster`, `logo`.

**To change a site image by code:** put the file in `public/images/`, then update the
matching key in `public/data/site-images.json` (and the default in `src/siteImages.js`).

**To change website text:** edit `src/i18n.js` (both `en:` and `ur:` blocks).
Component text that is NOT in i18n (rare) is edited directly in the component.

## 7. Theme (colors) — red/white requested by client

All colors live in `src/index.css` `:root` (plus a `[data-theme="dark"/"light"]`
override block further down). Current palette:

- `--crimson` `#B91C1C` (primary red) · `--crimson-dark`, `--crimson-deep`, `--crimson-light`
- `--gold` `#D97706` + gold variants (accent — client's theme is crimson+gold+white)
- Neutrals: `--surface`, `--card`, `--white`, `--ink`, `--text`, `--text-muted`

To re-theme: change these variables, then grep `src/App.css` for hard-coded colors
(only a handful exist). Keep contrast readable on both white and dark areas.

## 8. Admin panel (for the owner)

- URL `/admin`, password stored in `server/config.json` (default currently `hussaini2024`).
- Owner is expected to change it via **Settings tab**. Warn them if it is still default.
- Admin features: add/edit/delete gallery photos, reorder, replace the 6 site image
  slots, manage team members & committees, upload images, change password.

## 9. Deploying changes (the flow an AI must follow)

1. Make the code/content change.
2. `npm run build` — must succeed. `npm run lint` — fix any new problems.
3. Commit ONLY intended files: `git add <files>` then `git commit`.
   - Author identity (existing): name `viki863-star`, email `viki863-star@users.noreply.github.com`.
4. `git push origin main`.
5. This triggers Render auto-deploy (production `hussainihomesfndpk.com`) and the
   GitHub Actions Pages workflow (static mirror). Wait ~1–3 min, then verify by
   fetching the live URL and confirming the new asset hash appears.
6. Tell the owner to do a hard refresh (Ctrl+F5).

**Rules / pitfalls:**
- **Never** change `vite.config.js` base path — server.js strips the subpath so one
  build works on both Render and GitHub Pages. Changing it breaks production.
- **Never** commit the `dist/` folder (it is gitignored); it is regenerated on build.
- **Never** edit `public/data/*.json` and then delete/rename the underlying image file —
  admin-managed data references file paths.
- Do **not** commit live-site admin uploads (files written on Render at runtime) back
  as "source"; treat the repo as the source of truth.
- Do not add new npm packages unless necessary; the project intentionally has a tiny
  dependency set (react, react-dom, react-router-dom).
- `server.js` runs on `process.env.PORT || 5177`; on Render the platform sets PORT.
- Lint: the single `react(only-export-components)` warning for `LangContext.jsx` is
  pre-existing — leave it.

## 10. SEO / Google (already configured)

- `index.html` has title, description, canonical, OG/Twitter tags, geo tags, and
  Schema.org `NGO` JSON-LD — all pointing at `https://hussainihomesfndpk.com`.
- `robots.txt` + `sitemap.xml` point at the production domain.
- When the domain/URL ever changes, update all three (index.html, robots.txt, sitemap.xml).