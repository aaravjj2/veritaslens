# Public project page — copy/paste fields

Use this file when filling out a Devpost, hackathon portal, or GitHub “About” / README sections.

---

## General info

### Project name (≤60 characters)

**VeritasLens**

### Elevator pitch (≤200 characters)

**AI-assisted credibility analysis for news-like text: stream NDJSON results in the browser, optional Supabase auth, Chrome extension panel, and community corrections—built for transparent, EU-aligned misinformation workflows.**

---

## Project Story (*About the project* — Markdown)

```markdown
## Inspiration

Misinformation spreads faster than manual fact-checking. We wanted a **practical, developer-friendly** tool that helps readers reason about *how* a paragraph reads—not a black-box “true/false” oracle, but structured signals (language tactics, sentence-level notes) aligned with an **Academia EU–style** hackathon brief: transparency, shareability, and optional persistence.

## What we learned

- **Streaming UX matters**: returning **NDJSON** from `/api/analyse` keeps the UI responsive while a model works.
- **Auth is not one-size-fits-all**: the **Chrome extension** cannot rely on first-party cookies the same way the website can—so account-linked flows need a deliberate **token bridge**.
- **Offline + SW** is a real product surface: a small **service worker** shell improves resilience for demos and flaky networks.

## How we built it

- **Web**: Next.js 15 (App Router) + React 19 + Tailwind v4, API routes for analyse, share links, digest cron stub, and corrections.
- **Model integration**: Anthropic Messages API with schema validation (Zod) for structured outputs.
- **Data**: Supabase (optional) with SQL migrations; **in-memory** fallback when env vars are absent.
- **Extension**: Vite + React MV3 (panel + background + content script).
- **Quality**: Vitest unit tests, Playwright E2E (including a guided **showcase** tour that captures screenshots/video).

## Challenges we faced

- **CORS + extension origins** vs cookie-based sessions.
- **Streaming parsers** in the client (NDJSON) with robust error handling.
- **Consistent scoring UI** without over-claiming certainty—copy and UI tone had to stay careful and honest.
```

---

## Built with

**Languages:** TypeScript, JavaScript, SQL (PostgreSQL migrations)

**Web:** Next.js 15, React 19, Tailwind CSS 4, Zod, App Router middleware

**Backend / APIs:** Next.js Route Handlers, Anthropic SDK, Resend (email hooks), Jose (JWT for extension token flow)

**Data & auth:** Supabase (Auth + Postgres), `@supabase/ssr`

**Extension:** Vite 6, Chrome Manifest V3

**Testing:** Vitest, Playwright, MSW (API mocking in tests)

**CI / hosting:** GitHub Actions, Vercel

---

## Media (repo paths)

| Asset | Path |
|--------|------|
| **Thumbnail** (1200×630 JPEG, <5MB) | `docs/assets/thumbnail.jpg` |
| **Live demo recording** (WebM, <5MB) | `docs/assets/demo.webm` |
| **Screenshots** (JPEG, each <5MB) | `docs/assets/screenshots/*.jpg` |

### Raw URLs (for Devpost / forms after `main` is pushed)

- Thumbnail: `https://raw.githubusercontent.com/aaravjj2/veritaslens/main/docs/assets/thumbnail.jpg`
- Demo video: `https://raw.githubusercontent.com/aaravjj2/veritaslens/main/docs/assets/demo.webm`
- Screenshots: replace filename in  
  `https://raw.githubusercontent.com/aaravjj2/veritaslens/main/docs/assets/screenshots/capture-01-landing.jpg` … `capture-10-offline-shell.jpg`
