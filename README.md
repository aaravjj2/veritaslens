# VeritasLens

AI-assisted misinformation analysis aligned with the Academia EU hackathon brief: Next.js web app, Chrome MV3 extension, Claude-powered `/api/analyse`, optional Supabase persistence, and automated tests.

## Repository layout

- `web/` — Next.js 15 App Router: landing, paste UI, shareable analysis, dashboard, **settings** (digest + language), Supabase magic-link auth, **NDJSON streaming** `/api/analyse`, account API, **community corrections** API, digest **cron stub**.
- `extension/` — Vite + React sidebar panel, context menu, and packaging script output.
- `supabase/migrations/` — PostgreSQL schema for analyses, sources metadata, and corrections queue.
- `tests/fixtures/` — Sample articles referenced by the technical specification.
- `scripts/package-extension.sh` — Builds `veritaslens-v1.0.zip` for sideloading.
- `docs/assets/` — **Public media**: `thumbnail.jpg` (1200×630), `demo.webm` (screen recording), and `screenshots/*.jpg` (each under 5MB). Copy text for hackathon/GitHub “About” pages from `docs/GITHUB_PROJECT_PAGE.md`.

## Quick start (web)

```bash
cd web
cp .env.example .env.local
# add ANTHROPIC_API_KEY (required for live Claude calls)
# optional: NEXT_PUBLIC_SUPABASE_* + SUPABASE_SERVICE_ROLE_KEY for magic-link auth + DB
npm install
npm run dev
```

Open `http://127.0.0.1:3000/analyse`. `/api/analyse` **streams** NDJSON by default (`delta` lines, then one `final` line with the validated result and `share_id`). Send `"stream": false` in the JSON body if you need a single JSON response (for example in custom tooling).

When Supabase is not configured, analyses persist in an **in-memory** demo store (resets on server restart).

### Supabase CLI: link + migrations

After `npx supabase@latest login`:

```bash
cd /path/to/veritaslens
npx supabase@latest link --project-ref <your-project-ref>
npx supabase@latest db push
```

In the Supabase dashboard under **Authentication → URL configuration**, set the **Site URL** to your app (for example `http://localhost:3000`) and add **Redirect URL** `http://localhost:3000/auth/callback` (plus your production origin when you deploy). Then use **/login** for email magic links.

The browser extension calls the API from `chrome-extension://…`, so it does **not** receive the web app’s Supabase cookies; account-linked history is for sessions on the website.

## Tests & CI

```bash
cd web
npx playwright install chromium   # first time only
npm run verify                    # lint + build + unit tests + e2e
```

Or individually: `npm run lint`, `npm run build`, `npm test`, `npm run e2e`.

## Extension

```bash
cd extension
npm install
npm run build
# or from repo root
./scripts/package-extension.sh
```

Load `extension/dist` (or the generated zip) via Chrome **Extensions → Load unpacked**. Set `VITE_VERITASLENS_API_BASE` when building to point the panel at a deployed API.

## Environment variables

See `web/.env.example` for `ANTHROPIC_API_KEY`, optional `ANTHROPIC_MODEL`, Supabase keys, and `NEXT_PUBLIC_APP_URL` (share links and auth redirects).
