# Hussaini Homes — Orphan Care Center Website

Bilingual (English / Urdu) website for the **Hussaini Homes Foundation** — an orphan care center in Pakistan. Built with **Vite + React**, plain CSS, and a small zero-dependency Node server.

## Features

- 🌐 **Bilingual** — switch between English and Urdu from the navbar
- 🏠 Home, About, Services, Construction Progress (before / after), Team, Gallery, Donate, Contact
- 🔐 **Admin panel** at `/admin` — password protected, lets a non-technical client:
  - add / edit / delete / reorder gallery photos (titles & captions in EN + UR)
  - replace website photos (chairman, hero building, about building, construction, logo)
  - edit team names, phones, roles, and member photos
  - change the admin password
- 🖼️ Content is **data-driven** (`public/data/*.json`) — edits appear without rebuilding

## Run locally

```bash
npm install        # once
npm run dev        # open the printed link (usually http://localhost:5173)
```

Admin panel: add `/admin` to the URL → `http://localhost:5173/admin`

> Default admin password is set in `server/config.json` (auto-created on first run). **Change it** before going live.

## Production build

```bash
npm run build      # creates dist/
npm start          # serves dist/ + admin API on http://localhost:5177
```

## Deploy (Render)

A `render.yaml` blueprint is included. On [render.com](https://render.com):
**New → Web Service → connect this repo** → Render auto-detects the blueprint.
The build runs `npm install && npm run build`, start runs `npm start`.

> Note: admin photo uploads are written to the server's disk. On Render's free tier the filesystem is ephemeral (resets on redeploy); use a Render Disk or object storage for permanent uploads.
