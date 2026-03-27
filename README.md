# Vidintel

**Vidintel** is a web application for analyzing and comparing YouTube channel performance. Paste a channel URL, handle, or ID to inspect metrics, engagement, and video-level signals, or open **Compare** to view two channels side by side. Exports include CSV, JSON, and PDF reports.

The app is built with **Next.js** (App Router), calls the **YouTube Data API v3** from server-side route handlers only, and ships with a **PWA** (offline fallback page), structured metadata, and security-oriented HTTP headers.

---

## Requirements

- **Node.js** 20 or newer (LTS recommended)
- **npm** (or a compatible client)
- A **Google Cloud** project with the **YouTube Data API v3** enabled and an API key

---

## Setup

1. **Clone the repository** and install dependencies:

   ```bash
   git clone <repository-url>
   cd vidintel-app
   npm install
   ```

2. **Environment variables**

   Copy the example file and add your API key:

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:

   | Variable | Required | Description |
   |----------|----------|-------------|
   | `YOUTUBE_API_KEY` | Yes | Server-only key for YouTube Data API v3 ([Google Cloud Credentials](https://console.cloud.google.com/apis/credentials)) |
   | `NEXT_PUBLIC_BASE_URL` | No | Canonical site URL for Open Graph and meta tags (defaults are suitable for Vercel deployments) |
   | `UPSTASH_REDIS_REST_URL` | No | [Upstash Redis](https://console.upstash.com/) REST URL — enables per-IP rate limiting on `POST /api/channel` (recommended in production) |
   | `UPSTASH_REDIS_REST_TOKEN` | No | Upstash REST token (pair with the URL above) |
   | `RATE_LIMIT_CHANNEL_PER_MINUTE` | No | Max channel-resolve requests per IP per minute when Redis is configured (default `60`, minimum `10`) |

   Never expose the API key with a `NEXT_PUBLIC_` prefix.

3. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Development uses Turbopack (`next dev --turbopack`).

---

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local development server |
| `npm run build` | Production build (webpack; required for the PWA plugin) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run test` | Vitest unit and integration tests |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:coverage` | Tests with coverage |
| `npm run test:e2e` | Playwright end-to-end tests |
| `npm run test:e2e:ui` | Playwright UI mode |

**End-to-end tests:** Install browser binaries once (e.g. Chromium):

```bash
npx playwright install chromium
```

Playwright is configured to start the dev server automatically unless `CI` is set.

---

## Project layout (overview)

- `src/app/` — App Router pages, layouts, and API routes (`/api/channel`, etc.)
- `src/components/` — UI components (search, charts, exports, theme)
- `src/lib/` — YouTube client, analytics, caching helpers, export utilities, tests
- `e2e/` — Playwright specs
- `public/` — Static assets and service worker output from the PWA build

---

## Approach and priorities

The brief was an MVP with a short timeline: **paste a competitor channel URL** and **see which videos are performing strongly**, with a **client-ready** UI on **Next.js**, **Tailwind**, **YouTube Data API**, and **Vercel**.

**Sequencing.** The build prioritized a working vertical slice first: resolve the channel from a URL or handle, load recent videos with comparable metrics, then add **sorting and filtering** and **responsive** layout so the demo works on a phone and a laptop. After that core path was stable, effort went to polish and differentiators: **charts and derived insights**, **compare mode** for two channels, **CSV / JSON / PDF exports**, and **PWA** plus metadata for a credible product feel.

**Tradeoffs.** Server-side route handlers carry the YouTube calls so the API key never ships to the browser; caching and batching choices favor **quota safety** over fetching everything on every request. Automated **Vitest** and **Playwright** tests focus on logic, API contracts, and smoke flows rather than exhaustive UI coverage—enough to refactor safely under time pressure.

**Workflow.** Implementation and documentation moved quickly with AI-assisted editing and iteration; human review, local runs, and tests were used to validate behavior before treating a feature as done.

---

## Build and architecture notes

**Stack.** The UI uses React 19 and Tailwind CSS v4. Data fetching for channels and videos runs on the server via Next.js route handlers so the YouTube API key stays off the client. Responses use conservative caching where appropriate to limit quota usage.

**Security.** Global headers (for example `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) are applied in `next.config.ts`. The API validates input and returns structured errors suitable for the client.

**Abuse and API quota.** Automated clients and scrapers cannot be distinguished perfectly from humans without interactive checks (for example a CAPTCHA). The practical approach here is **per-IP rate limiting** on the expensive `POST /api/channel` route using **Upstash Redis** when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set. Limits are set generously so normal use (including compare mode and repeated tries) stays comfortable; sustained bot-like traffic from an address gets HTTP 429 with `Retry-After`. Without Upstash credentials, the limiter is disabled so local development does not require a database. Users behind the same NAT or corporate network share one bucket—raise `RATE_LIMIT_CHANNEL_PER_MINUTE` if that is a concern.

**Progressive Web App.** Offline support and precaching are provided by `@ducanh2912/next-pwa`, which relies on Workbox’s **webpack** integration. For that reason production builds use `next build --webpack` even though local development uses Turbopack for faster iteration.

**Testing.** Vitest covers pure logic and components; Playwright covers smoke flows, API error handling, manifest and security headers. Run `npm run test` and `npm run test:e2e` before releases or significant changes.

**Exports.** PDF generation uses `jspdf` and `jspdf-autotable`; charts use Recharts where applicable.

---

## Deployment

The app is a standard Next.js deployment. Set `YOUTUBE_API_KEY` (and optionally `NEXT_PUBLIC_BASE_URL`) in your hosting provider’s environment. Add Upstash Redis variables in production to protect your YouTube API quota from scripted abuse. Build with `npm run build` and start with `npm run start`, or use a platform such as [Vercel](https://vercel.com) with the same commands.
