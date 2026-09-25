# portfolio-frontend

Izzul Faturrizky's portfolio and its CMS admin panel.
React 18 · TypeScript · Vite 8 · Tailwind CSS 4 · Motion · TanStack Query · React Router 7.

Text content comes from [`portfolio-backend`](../portfolio-backend). Nothing on the site is
hard-coded that an editor would want to change: profile, projects, experience, skills,
posts, stats, links, home page copy and SEO text are all edited at `/admin`.

**Images and documents live here**, in `public/media`, and are served by this site —
see [Images and documents](#images-and-documents).

## Quick start

Start the backend first (see its README), then:

```bash
cp .env.example .env
npm install
npm run dev          # http://localhost:5173 — the CMS is at /admin
```

The dev server forwards `/api` to `API_PROXY_TARGET` (`http://localhost:4000`), so the
browser talks to a single origin, just like production behind a rewrite.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check, then build to `dist/` |
| `npm run preview` | Serve the production build (with the same proxy) |
| `npm run typecheck` | Type-check only |

## Environment

| Variable | Used by | Notes |
| --- | --- | --- |
| `VITE_API_URL` | the bundle | Defaults to `/api/v1`. Set an absolute URL only if the site does **not** proxy `/api` (see Deployment). Baked in at build time. |
| `API_PROXY_TARGET` | dev / preview server | Where `/api` is forwarded. A deployed API URL works too. |

## What is where

```
public/media/                    images and documents (projects, posts, profile, site, documents)
media-manifest.ts                Vite plugin publishing /media/manifest.json
src/
  main.tsx, App.tsx, router.tsx   entry, providers, routes (detail pages and /admin are lazy)
  styles/globals.css              design tokens, themes, utilities, form and dialog styles
  lib/                            API client, queries, theme store, motion presets, helpers
  hooks/useDocumentMeta.ts        title, description and share tags per page
  components/
    layout/                       header, mobile menu, footer, page transitions, smooth scroll
    sections/                     hero, process flow, stats, project cards, timeline, posts…
    ui/                           buttons, reveal, animated headline, counter, media, form field…
  pages/                          Home, Projects, Project, About, Blog, Post, Contact, 404
  admin/
    resources.ts                  every CMS screen's fields and list columns, as data
    api.ts, auth.tsx              token handling and the session provider
    components/                   form renderer, markdown editor, tags, media library, dialogs
    pages/                        dashboard, lists, editors, messages, media, account
```

### Adding a field or a content type to the CMS

1. Backend: add the column in `src/db/schema.ts`, run `npm run db:generate` and
   `npm run db:migrate`, and add the field to the Zod schema in
   `src/modules/admin/resources.ts` (and to the public route if visitors should see it).
2. Frontend: add the field to the matching entry in `src/admin/resources.ts`. The list,
   form, validation messages and saving all come from that definition.

## Images and documents

Every image, GIF and PDF the site shows is a file in this repository:

```
public/media/
  projects/     project covers and case-study images
  posts/        blog covers and in-article images
  profile/      photo
  site/         share image
  documents/    CV and other PDFs
```

Content stores the path (`/media/projects/cover.gif`), and the site's host serves the
file from its CDN — so images keep working when the API sleeps or redeploys on a free
tier. The build also publishes `/media/manifest.json`, listing every file.

There are three ways to add a file:

1. **CMS, locally**: run both repos, open **Media** (or any image field) and upload. The
   file is written into `public/media`; commit and push it.
2. **CMS, in production**: with GitHub storage configured on the backend (see its README),
   an upload is committed to this repository and Vercel redeploys — live in about a minute.
   Pull before your next local push.
3. **By hand**: copy the file into the right folder, commit and push. It shows up in the CMS
   picker after the deploy.

Keep GIFs short and under a few megabytes; every visitor downloads them.

## Design system

- **Palette**: neutral greys with one accent (orange). Tokens live on `:root` in
  `globals.css` and are exposed to Tailwind as `canvas`, `surface`, `subtle`, `ink`,
  `ink-muted`, `line`, `accent`, `accent-ink`…. Every text/background pair meets WCAG AA
  in both themes.
- **Themes**: the site follows the system setting. The toggle pins the *opposite* theme,
  and toggling back clears the pin (two states, not three). A small inline script in
  `index.html` applies a pinned theme before first paint. Where View Transitions are
  supported, the new theme is revealed as a circle growing from the button.
- **Type**: Geist for text, Geist Mono for labels, and Instrument Serif italic for the one
  emphasised word in a heading. In the CMS, wrap that word in `*asterisks*`.
- **Motion**: page cross-fades, headlines rising word by word, reveals on scroll, count-up
  stats, a self-drawing process line and timeline, and a reading progress bar. Anyone
  with `prefers-reduced-motion` gets fades without movement; decorative effects that
  loop stop after a few cycles. Scroll-linked effects use CSS scroll timelines where
  available and simply stay static elsewhere.
- **Accessibility**: skip link, landmarks, focus moved to the new page after navigation,
  visible focus rings, native `<dialog>` for menus and confirmations, and form errors
  that appear on `:user-invalid` with `aria-invalid` kept in sync.

## Deployment (Vercel)

Recommended: let the site proxy the API, so the admin's refresh cookie is first-party in
every browser (Safari blocks third-party cookies). Replace `vercel.json` with:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://YOUR-API-HOST/api/:path*" },
    { "source": "/((?!api/|media/).*)", "destination": "/index.html" }
  ]
}
```

Keep `VITE_API_URL=/api/v1`, and on the backend set `CORS_ORIGINS` to the site's URL and
`COOKIE_SAMESITE=lax`.

Alternative: point `VITE_API_URL` at the API directly (`https://api.example.com/api/v1`)
and use `COOKIE_SAMESITE=none` with `COOKIE_SECURE=true` on the backend. Sessions then
depend on the browser allowing third-party cookies.

## Content to review before launch

- Upload a CV PDF in **Profile → CV / resume** to show the "Download CV" button, and a
  photo if you want one instead of the monogram.
- The three sample blog posts in **Blog posts** were written for the launch; rewrite or
  unpublish them.
- `public/media/projects/stock-issuer-data-management.gif` is 320 px wide and carries a
  makeagif watermark. A new recording will look much sharper in the large case-study view.
