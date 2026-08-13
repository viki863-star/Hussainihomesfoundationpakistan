# Hussaini Homes Website Blueprint

> Audit + implementation blueprint for transforming the existing Hussaini Homes website into a
> premium, cinematic, Awwwards-level interactive site. **Blueprint only — no code changed.**

---

## Current Architecture

| Aspect | Detail |
|---|---|
| Framework | Vite 8 + React 19.2 (JSX, **no TypeScript**) |
| Router | `react-router-dom` 7 (BrowserRouter, basename derived from `import.meta.env.BASE_URL`) |
| Styling | Plain CSS in 3 files: `src/index.css` (tokens/base), `src/App.css` (components), `src/admin.css` (admin panel) |
| I18n | Custom `LangContext` + `i18n.js` (EN/UR); admin overrides via `public/data/content.json` merged with `deepMerge` |
| Content layer | Hardcoded defaults (components, `i18n.js`, `siteImages.js`, `teamData.js`) **overridden by** live JSON in `public/data/*` (`content.json`, `gallery.json`, `team.json`, `site-images.json`) |
| Data fetching | Shared module cache + listener pattern in `useContent.js`; `fetchContent()` seeded from `Preloader` |
| Server | Zero-dependency Node server (`server.js`) serving `dist/` + admin REST API (`server/admin-api.js`); admin saves also commit back to GitHub via Contents API (`REPO_TOKEN`) |
| Deploy | Render production (`hussainihomesfndpk.com`), GitHub Actions → Pages mirror, `vercel.json`/`render.yaml` present; Vite base fixed to `/Hussainihomesfoundationpakistan/` |
| Dependencies | Only `react`, `react-dom`, `react-router-dom` (94-line package footprint — intentionally tiny) |

Routing: `/` (HomePage), `/team/:id` (TeamDetail), `/admin` (Admin). No lazy loading / code splitting.

---

## Current Pages

1. **Home** — one long scroll page, order controlled by `content.json` `sections[]`:
   Hero → Marquee → About → Services → Team → BuildingProgress → ConstructionProgress → Gallery → SuccessStories → Donate → Contact → Footer, plus global FloatingActions (WhatsApp + Donate FABs) and BackToTop.
2. **TeamDetail** (`/team/:id`) — member avatar/photo (letter fallback), role, phone, bio with blockquote parsing; only chairman has a real bio.
3. **Admin** (`/admin`) — password gate; tabs for Dashboard, All Text (EN+UR), Sections, Theme, Gallery, Stories, Building, Team, Photos, Contact/Stats, Settings(pw). Powerful, non-technical-friendly, fully client-exposed.

---

## Current Components

| File | Role | Notable detail |
|---|---|---|
| `App.jsx` (447 ln) | Shell: CustomCursor (rAF lerp glow+ring), MarqueeTicker, FloatingActions (expandable WhatsApp/Donate), BackToTop, Preloader, IntroOverlay (one-shot branded iframe intro), `useScrollAnimations` (5 IntersectionObservers), ThemeApplier, `useActiveSection`, HomePage section assembly | Imports `useLang` mid-file; `ALL_SECTIONS` map + fallback render |
| `Navbar.jsx` | Fixed glass nav, enhanced logo (hover zoom), desktop/active dots, theme toggle, EN/اردو slide pill, hamburger, scroll-progress bar | Hash-link section scroll handled here |
| `Hero.jsx` (342 ln) | Count-up stats, 30 particles, 3 morph blobs, 3 parallax rings, grid pattern, noise, typewriter, 3D tilt (rAF lerp, pointer-gated), floating chips on building photo, orbit, scroll indicator | Very heavy ambient layer |
| `About.jsx` | Story, 3/4 image + floating accent image, years badge, 6 feature chips | Uses `building-night.jpg` |
| `Services.jsx` | 6 tilt-on-move cards on ink background | JS-handled 3D tilt per card |
| `BuildingProgress.jsx` | Animated progress bars (IO-triggered count-up), budget cards, facilities tags, image, support CTA | Data from `content.building` |
| `ConstructionProgress.jsx` | Full-width poster + lightbox (zoom in/out), 4 milestone checklist items | Poster = `construction-journey-poster.webp` |
| `Gallery.jsx` | Filters (All + 7 cats), duplicated marquee-track carousel, lightbox with arrow-key nav | 25 photos |
| `SuccessStories.jsx` | 3 story cards (img/title/text) + CTA | |
| `Donate.jsx` | Premium: 3 cards (Bank / Mobile Pay / International), copy-to-clipboard fields, mobile-pay badges, mega WhatsApp donate button with pulse rings, hadith quote, monthly budget banner | Top donate experience |
| `Contact.jsx` | Info cards, Google Maps embed + open-btn, form that opens WhatsApp with prefilled message | No backend email |
| `Footer.jsx` | Brand/social, quick links, support links, contact rows, admin link, copyright | Socials YouTube/Instagram are `#` |
| `Team.jsx` / `TeamDetail.jsx` | Officials grid (letter-avatar fallback), committees, detail page | Only 2 officials have photos |
| `Admin.jsx` (1714 ln) | Full site manager (all editors referenced above) | Ships to every visitor in main bundle |

---

## Current Assets

- **Images: 58 files ≈ 19.7 MB** in `public/images`.
  - Biggest: `building-night.png` **2.74 MB** (dead), `orphan-home-construction-progress.png` **2.35 MB** (dead), `team/Chairman.png` **1.99 MB**, `team/vice-chairman…png` **1.73 MB**, `ELOGO.png` 0.34 MB, gallery 25× ~0.2–0.3 MB each.
  - **Dead / unreferenced (~5.5 MB):** `building-night.png`, `orphan-home-construction-progress.png`, `orphan-home-construction-progress.jpg`, `Logo HH.jfif`, `LOGO.png` (used only as OG image in `index.html`).
- No `srcset`/`sizes`, no AVIF/WebP pipeline for photos, no `width/height` attributes on most imgs (hero/logo).
- **Fonts:** Google via `@import` — Playfair Display (display), Outfit (body), Noto Nastaliq Urdu (Urdu). Intro iframe separately loads Poppins.
- **Content JSON:** `content.json` (section order, stats, donate/bank/mobilePay, contact, theme, building, construction, stories), `gallery.json` (25 items, EN+UR labels/details), `team.json` (7 officials, 8 committee members), `site-images.json` (6 slots).
- **SEO:** index.html has title/desc/canonical/OG/Twitter/geo tags + Schema.org `NGO` JSON-LD; `robots.txt` + `sitemap.xml`; admin is `noindex` (server + client).
- Extras: `favicon.svg/png`, `apple-touch-icon.png`, `icons.svg`, `404.html` (Pages redirect), `logo-animation.html` (intro spline), GH Pages verification html.

---

## Existing Functionality

- Bilingual EN/UR with RTL, persisted language + dark/light theme (persisted).
- One-shot intro overlay (skip via Escape; skipped for in-app browsers/reduced-motion).
- Custom cursor, scroll-progress bar, back-to-top, expanding WhatsApp/Donate FABs, marquee.
- Section reveal/stagger/title/counter scroll animations.
- Interactive donation section: copy-IBAN, mobile-pay badges, WhatsApp deep-link CTA, hadith quote.
- Contact form → WhatsApp message (no backend).
- Construction before/after + milestone checklist + zoom lightbox.
- Gallery filters + keyboard-navigable lightbox; team member pages with bio/quote rendering.
- Full admin panel editing text (EN+UR), theme colors, sections, gallery, stories, building data, team, site photos, password; uploads + GitHub commit-back for persistence.
- `prefers-reduced-motion` + `html.iab` (in-app browser) defensive rules — already thoughtfully handled.

---

## Problems Found

### Code / functional
1. **No code splitting** — the 1714-line Admin panel, full EN+UR i18n (incl. long chairman bio), and everything else ship in one **384 KB / 114 KB gzip** JS bundle loaded by every visitor.
2. **`useContent.js` fetches `/data/content.json` without `withBase()`** → on GitHub Pages subpath it 404s and silently falls back to defaults, so admin edits don’t appear on the Pages mirror.
3. **Hero stats are hard-coded** (31 / 7 / 2018) — `content.json` `stats` exists but is never read by Hero.
4. **Double preloader gating** — one-shot intro iframe (~5.3 s + Poppins font + separate HTML doc) then preloader (~1.2–1.9 s); first paint of real content can be ~6.5 s.
5. **Triplicated source of truth** — text/defaults repeated across `i18n.js`, `useContent.js` `DEFAULTS`, and `Admin.jsx` initial state → drift already visible (see #6).
6. **Inconsistent contact data** — i18n shows "Email: Coming Soon" while `content.json` has a real email; hero CTA/"Learn More" labels are re-hard-coded instead of using `h.cta`/`h.learn`; several different phone numbers (0307 5905907 / 0302 5905907 / 0303 4030009) across sections.
7. **Gallery `span` flag ignored** — admin supports "large card" but `GalleryCard` never uses it.
8. **5 team officials without photos** return `/images/team/{id}.png` (nonexistent) → 5 wasted 404 requests before the letter fallback.
9. **`#donate` not in navIds** → active-section dot never highlights Donate; `construction` has id `construction-progress` that nothing links to.
10. **Dead assets ≈5.5 MB** (listed above) slow deploys and bloat the image dir.

### Structure / maintainability
11. **`App.css` is one 4,270-line file** with many appended override blocks — navbar, hero, donate and reduced-motion rules appear in multiple places; 83 hard-coded hex colors leak past the admin theme system; two separate dark/light theme writers.
12. Two animation systems coexist (CSS-class IO observers in `App.jsx` + per-component IO in Hero/BuildingProgress) — consistent-ish but scattered; no shared hook.

---

## Performance Problems

| Area | Issue |
|---|---|
| JS payload | 384 KB/114 KB gzip, uncached splitting; admin + all i18n shipped to everyone |
| Images | ~19.7 MB total; multi-MB PNG/JPEG/plain-JPEG without compression; no responsive `srcset`/`sizes`, no AVIF/WebP, no dimension attributes (CLS risk on hero/logo) |
| Orchestration | Hero re-renders on *every* scroll event (`setParallaxY`); Navbar sets scroll state per scroll; CustomCursor rAF loop runs continuously; particles/blobs/rings/noise + cursor + marquee + shimmer all animate simultaneously |
| First load | Google Fonts via `@import` + separate Poppins in intro iframe; 5.3 s intro gates the hero |
| Fonts/Urdu | Noto Nastaliq Urdu is a heavy subset; no `font-display` tuning or preloaded critical subsets |
| Network | Gallery lightbox uses same full-res files; no thumbnails |

---

## Accessibility Problems

- **No global `:focus-visible` design system** — only skip-link, contact form inputs, construction buttons/lightbox have explicit focus styles; navbar links/buttons rely on browser defaults.
- **Mobile menu** is a `<div role="button">` with no `aria-expanded`, no Escape-to-close, no focus management/trap; body-scroll lock only.
- **Lightboxes**: Gallery lightbox lacks `role="dialog"`/`aria-modal`/focus trap/focus return; Construction lightbox has `role` but no trap/return.
- **No `<main>` landmark** (content is a plain `#main-content` div); sections lack `aria-labelledby`.
- Gallery/stories image `alt` is always the English title even in Urdu mode.
- `.reveal`/`.stagger-item` start at `opacity:0` via CSS — if JS/IO fails, content stays invisible (no `no-js` fallback).
- Reduced-motion + in-app-browser handling already exists (good baseline to preserve).

---

## Design Problems

- **Noise floor is high**: particles + 3 blobs + 3 rings + grid + spotlight + noise overlay + cursor glow/ring + marquee + shimmer + gradient text simultaneously — "premium template" busy, not coherent cinema.
- **Uniform rhythm**: 7 consecutive sections share "centered eyebrow + Playfair title + subtitle" with no narrative arc; two adjacent building-themed sections (BuildingProgress → ConstructionProgress) feel repetitive.
- **Focus diluted** for the primary goal (donation): the donate CTA is buried at second-to-last; secondary flourishes (typewriter, tilt, particles) compete with the mission story.
- Two building sections + a building-heavy gallery + blog-ish stories create category overlap with no hierarchy.
- Dark-first design with a large `[data-theme=light]` override block bolted on; theme toggling is present but the light theme is inconsistent.
- RTL mirrors (FABs, back-to-top) work but add edge-case CSS seams.
- Text/stat/marquee copy is repetitive across sections (31 children, since 2018 repeated 5+ times).

---

# New Creative Direction

## "A Home Where Futures Begin"

One continuous cinematic scroll that treats the building and the children as one story of rising
hope: **the physical home under construction is the metaphor for the futures being built inside
it.** Crimson + warm gold on deep ink, editorial serif display, large real photography, restrained
motion where every movement has a reason.

Keep the **donation goal end-to-end**: an always-present FAB (existing), a recurring "light it up"
trigger, and a culminating donation finale.

## New Homepage Journey

The new story arc (maps existing content where possible):

1. **Hero** — rebuild of current hero (offset headline, building photo, stats, chips, scroll cue) with a calmer, curated ambient layer and a single primary CTA.
2. **Interactive Building** — fuse `BuildingProgress` + `ConstructionProgress` into one scroll-driven stage: the 3-floor building "lights up / constructs" as you scroll; floors map to `content.building.bars` (Ground=done, 1st=done, 2nd=structural, 3rd=planned); progress bars + budget cards + zoomable before/after poster.
3. **Inside Hussaini Homes** — reframe About around real interior work (use gallery `school`, `meals`, `prayer` photos) + the existing story/feature content.
4. **Chairman's Message** — NEW section; use the existing real chairman bio (already in `i18n.js` `teamDetail.bios.chairman`) + optimized `Chairman.png`; pull one phrase as an editorial pull-quote. Aspirational, not invented.
5. **A Day in Their Life** — reuse SuccessStories study/eating/school photos as a horizontal day-timeline (Dawn prayer → Class → Meals → Study → Sleep).
6. **Little Moments** — the Gallery (25 photos, filters, lightbox) reimagined as a cinematic gutter/collage; honor the `span` flag. Thumbnails + lightbox with proper dialog semantics.
7. **Dreams** — NEW; a child-voice quote strip. **Needs real content** (child/teacher quotes or drawings). Do NOT invent names/quotes.
8. **Future Builder** — return to the construction set: `construction-beginning.webp` → `construction-today.webp` progression + milestone checklist (existing data).
9. **Impact** — animated counters + budget figures from `content.stats` + `content.building.budget` (fix the hard-coded stats bug); hadith quote can anchor this.
10. **Leadership** — only officials with photos (Chairman, Vice-Chairman) in a premium suite; letter-avatars for the rest until real photos exist.
11. **Team** — the committees grid (existing) moved here; keep phones + detail links.
12. **Stories** — existing 3 story cards, now with richer imagery and the existing series of real captions.
13. **Community** — Contact section (existing info, map, WhatsApp-form) + real socials.
14. **Night Ending** — use `building-night.jpg` (optimized) as a dusk close, echoing the heading metaphor, before the conversion finale.
15. **Donation** — the existing Donate section is already the best asset — restage as the finale (bank/mobile/intl, copy buttons, mega WhatsApp CTA, hadith). 
16. **Footer** — existing footer + admin entry kept subtle.

## Animation System

- **Three layers, one language:**
  1. *Entrance* — staggered line/word reveals for headlines (clip-path, GPU-only `opacity`/`transform`), card staggers (keep current `stagger-group`).
  2. *Scroll-driven* — IntersectionObserver-driven "build" progress for the Interactive Building; parallax only on the hero + night close, rAF-throttled (no `setState` per scroll pixel).
  3. *Ambient* — drastically reduced: 1 hue-shift orb + optional grain, keeping the marquee as the only persistent transform.
- All motion runs at ≤60 fps via transforms only; `will-change` only on animating layers.
- **`prefers-reduced-motion: reduce`** disables ambient + entrance and shows content immediately (extend the existing excellent index.css rule app-wide).
- Keep `html.iab` defensive switches for Facebook/IG/Messenger webviews.

## Design System

- **Tokens** in CSS custom properties: crimson/gold scales (existing), ink→surface neutrals, spacing scale, radius, shadows, easing (`--ease-out-expo`, `--ease-spring`), type scale (Playfair Display + Outfit + Noto Nastaliq Urdu).
- **One CSS architecture** replacing the 4,270-line file: tokens → base → layout → components → sections → states/variants → theme overrides (single consolidated `[data-theme=light]` block).
- **Type hierarchy**: display serif for 1 heading per section; body Outfit; Urdu Nastaliq with taller line-height (rule already exists — keep).
- **Photography style**: warm, human-first crops; images carry the emotion; text stays white on ink.
- **Color usage**: ink base for journey sections; crimson for love/shelter; gold for hope/CTA; white for trust/care. Accessibility AA contrast maintained.

## Mobile Strategy

- Single mobile layout with the truncated nav (hamburger, existing) upgraded to an accessible dialog (Escape, focus trap, `aria-expanded`).
- Sticky bottom action bar (Donate + WhatsApp) on touch — take the existing FAB and make it a proper `position:fixed` dock; collapse to icon-only under 480 px.
- Disable heavy ambient layers below 768 px (already partially done); replace hero particles with a static gradient.
- Intended image sizes matched to breakpoints (`srcset`); `1016px`-ish cover crops for the hero.
- Touch hit targets ≥ 44 px; no hover-dependent functionality anywhere (tilt is desktop-only).

## Performance Strategy

- **Code split** admin via `React.lazy()` (admin only downloads for admins); consider splitting TeamDetail.
- **Image pipeline**: AVIF/WebP + responsive `srcset`/`sizes`, pre-resize to display sizes, `width`/`height` to kill CLS, `fetchpriority="high"` for the hero, `preload` top 2–3 images, thumbnails in gallery.
- **Remove dead assets** (~5.5 MB) and dedupe logos/PNGs/JPEGs of the same photo.
- Optimize ELOGO (0.34 MB → targeted <60 KB); compress `Chairman.png` (~2 MB → <200 KB).
- **Defer flair**: ship intro as prerendered static + skip on repeat; preloader max ~900 ms; no extra fonts in the intro.
- Throttle/`rAF`-gate scroll handlers; keep the tiny dependency set (**add no packages** unless a need is proven).
- Optional: `content-visibility: auto` on below-fold sections; HTTP caching headers (already set) kept.

## Accessibility Strategy

- Global `:focus-visible` ring tokenized (gold outline on ink, crimson on surfaces); visible focus everywhere.
- Hamburger + lightboxes become compliant dialogs (focus trap, focus return, `aria-modal`, Escape).
- `<main>` landmark + `aria-labelledby` per section; keep skip-link (exists).
- Urdu `alt` text and localized lightbox captions; `lang` attribute already switched with locale.
- Content visible without JS (render fallback classes) — never rely on JS-only visibility for core text.
- Keyboard navigation through the whole journey; carousel pauses on hover/focus.

## Technology Strategy

- **Keep:** Vite 8 + React 19 + react-router-dom 7 + Node static server + plain CSS + the public/ data-driven content model.
- **Adopt (no new deps required):** `React.lazy` for admin, a shared `useInView`/scroll util (one place instead of many), CSS custom-property architecture, AVIF/WebP build plugin or lightweight script (or offline `sharp` step — evaluate).
- **Optional later:** TypeScript incrementally; a headless CMS is **not** needed (admin panel already builds values into JSON).
- Everything stays deployable on Render + GH Pages with the fixed base path (do not change `vite.config.js` base).

## Implementation Phases

Each phase ships independently and keeps the site live.

- **P0 — Quick wins (low risk, 1 phase):** code-split Admin; `withBase` fix in `useContent`; Hero stats from `content.stats`; honor gallery `span`; remove dead assets; fix footer social `#` links / consistent contact data; skip intro on repeat visits.
- **P1 — Foundation:** new CSS architecture + consolidated tokens/light-theme; shared InView hook; global focus system; hamburger/lightbox dialog a11y; prefers-reduced-motion pass; mobile dock.
- **P2 — New Hero + Interactive Building:** calm cinematic hero; merge the two building sections into the scroll-built stage (frontend-only; keep data files).
- **P3 — New journey sections:** Chairman's Message, A Day in Their Life, Dreams (pending content), Night Ending; restage Gallery as "Little Moments".
- **P4 — Donation finale + Impact:** restage Donate as conversion finale; Impact counters from data; add analytics (privacy-safe) + donor confirmation UI.
- **P5 — Media & polish:** image pipeline (AVIF/WebP/srcset), LCP/CLS budget pass, content model migration script (map old `content.json` fields to new keys with backward-compatible defaults), final QA on low-end + in-app browsers.

## Risks

- **Content conflicts must be reconciled first:** chairman bio says "50+ children" while hero/about/stats say 31; phone/email mismatches across sections. Re-red/reconcile with the client before copy reuse.
- **Real content gaps** (leadership photos, child quotes/drawings, night photo, international donation flow, email address) — sections must gracefully degrade to placeholders (existing letter-avatars pattern) rather than inventing facts.
- **Cultural/religious sensitivity:** all hadith/quotes already in the site are real and sourced — preserve verbatim; do not paraphrase attribution.
- **Admin compatibility:** the admin panel edits the same `content.json` keys; the new section model needs a migration layer mapping old keys → new sections so client-saved data keeps working.
- **Low-end/in-app-browser users:** keep FABs usable and ambient layers off there (existing `iab` + reduced-motion rules must survive the redesign).
- **GH Pages mirror:** every absolute `/…` reference and the `useContent` URL must go through `withBase` or admin edits silently degrade there.
- **Client has no designer/photographer:** rely on the existing real photo set; heavy visual polish must work with the ~58 current images.

## Missing Content / Assets

- Photos for 5 officials (letter-avatars today).
- Real child quotes / drawings for "Dreams" section (privacy-sensitive).
- Night/dusk photo of the building for "Night Ending" (use optimized `building-night.jpg` in the interim).
- Live international donation path (PayPal/Western Union) — currently "contact us".
- Working email address + socials (YouTube/Instagram are `#`).
- Reconciled, single source of truth for phone numbers and child count (31 vs 50).
- Optional: a short chairman video/message (for the "Chairman's Message" stop).

## Current Progress

- [x] Full repository inspection (src, components, pages, CSS, JS, public assets, data, server, configs, workflows, README, AGENTS.md).
- [x] Architecture / routing / components / assets mapped (above).
- [x] Problems identified: code, performance, accessibility, design.
- [x] KEEP / IMPROVE / REBUILD / REMOVE triage (above, inline).
- [x] Build verified: `npm run build` succeeds (JS 384 KB → 114 KB gzip; CSS 107 KB → 20 KB gzip).
- [x] Blueprint written (this file).
- [ ] Implementation — **not started; awaiting instruction.**