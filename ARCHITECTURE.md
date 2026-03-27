# Vidintel — Next.js Architecture (App Router)

## Directory Structure

```
vidintel-app/
├── .env.local                  # Local secrets (git-ignored)
├── .env.example                # Template for onboarding
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
│
├── public/
│   └── favicon.ico
│
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout — fonts, metadata, providers
│   │   ├── page.tsx            # Landing page — hero + search input
│   │   ├── globals.css         # Tailwind directives + custom tokens
│   │   │
│   │   ├── channel/
│   │   │   └── [id]/
│   │   │       ├── page.tsx    # Results page (Server Component)
│   │   │       └── loading.tsx # Skeleton UI while data fetches
│   │   │
│   │   ├── api/
│   │   │   └── channel/
│   │   │       └── route.ts    # POST — resolve URL → channel data + videos
│   │   │
│   │   └── not-found.tsx       # 404 page
│   │
│   ├── components/
│   │   ├── ui/                 # Primitive UI atoms
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── card.tsx
│   │   │
│   │   ├── search-bar.tsx      # Channel URL input + validation + submit
│   │   ├── channel-header.tsx  # Avatar, name, stats card
│   │   ├── video-list.tsx      # Grid/list of video cards
│   │   ├── video-card.tsx      # Single video — thumbnail, title, metrics
│   │   ├── sort-controls.tsx   # Sort dropdown + direction toggle
│   │   ├── date-filter.tsx     # Date range pill selector
│   │   ├── performance-chart.tsx  # Recharts area/bar chart
│   │   ├── trending-badge.tsx  # "Trending" indicator badge
│   │   ├── export-button.tsx   # CSV download trigger
│   │   └── error-display.tsx   # Friendly error states
│   │
│   ├── lib/
│   │   ├── youtube/
│   │   │   ├── client.ts       # YouTube Data API v3 wrapper
│   │   │   ├── resolve-channel.ts  # URL → channel ID resolution
│   │   │   ├── fetch-videos.ts     # Fetch recent videos + stats
│   │   │   └── types.ts        # Shared YouTube API types
│   │   │
│   │   ├── url-parser.ts       # Parse & validate all channel URL formats
│   │   ├── formatters.ts       # Number/date formatting (1.2M, "3 days ago")
│   │   ├── csv-export.ts       # Generate CSV from video data
│   │   └── constants.ts        # App-wide constants
│   │
│   └── types/
│       └── index.ts            # App-level TypeScript types
│
└── PRD.md
```

---

## Route Architecture

### Pages (App Router)

| Route | File | Type | Purpose |
|---|---|---|---|
| `/` | `app/page.tsx` | Server Component | Landing page with hero text + `<SearchBar>`. No data fetching. |
| `/channel/[id]` | `app/channel/[id]/page.tsx` | Server Component | Fetches channel + video data server-side, renders full results page. `[id]` is the resolved YouTube channel ID (e.g., `UC_x5XG1OV2P6uZZ5FSM9Ttw`). |
| `/channel/[id]` (loading) | `app/channel/[id]/loading.tsx` | Loading UI | Skeleton cards + shimmer while the server component streams. |

### API Route

| Endpoint | Method | File | Purpose |
|---|---|---|---|
| `/api/channel` | `POST` | `app/api/channel/route.ts` | Accepts raw user input (any URL format), resolves to channel ID, returns channel metadata + video list. Used by `<SearchBar>` to resolve ambiguous inputs before navigating. |

**Why a POST route instead of just the Server Component page?**
The `<SearchBar>` needs to resolve the raw user input (a handle, vanity URL, bare `@name`, etc.) into a canonical channel ID *before* navigating to `/channel/[id]`. The API route does the resolution, then the client navigates to the results page with the clean ID.

---

## Data Flow

```
User pastes URL
       │
       ▼
┌──────────────┐    POST /api/channel     ┌──────────────────┐
│  SearchBar   │ ──────────────────────►  │  API Route        │
│  (Client)    │                          │  route.ts         │
└──────────────┘                          └────────┬─────────┘
       │                                           │
       │  ◄── { channelId }                        │ url-parser.ts → resolve-channel.ts
       │                                           │ (YouTube channels.list)
       ▼                                           │
  router.push(                                     ▼
  `/channel/${id}`)                         Returns channelId
       │
       ▼
┌──────────────────────┐
│  /channel/[id]/page  │   Server Component
│  (Server)            │──── fetch-videos.ts ────► YouTube Data API v3
└──────────────────────┘         │                 (search.list + videos.list)
       │                         │
       │  ◄── channelData +      │
       │      videos[]           │
       ▼                         ▼
┌──────────────────────────────────────┐
│  Client Components                    │
│  ChannelHeader · VideoList · Chart    │
│  SortControls · DateFilter · Export   │
└──────────────────────────────────────┘
```

---

## Component Breakdown

### Server Components (no `"use client"`)
| Component | Responsibility |
|---|---|
| `app/page.tsx` | Static landing — renders `<SearchBar>` |
| `app/channel/[id]/page.tsx` | Fetches data, passes props to client components |

### Client Components (`"use client"`)
| Component | State it owns | Why client? |
|---|---|---|
| `search-bar.tsx` | Input value, validation errors, loading | User interaction, `router.push()` |
| `video-list.tsx` | Current sort, current filter | Client-side sort/filter for instant UX |
| `sort-controls.tsx` | Selected sort key + direction | User interaction |
| `date-filter.tsx` | Selected date range | User interaction |
| `performance-chart.tsx` | None (pure render) | Recharts requires browser APIs |
| `export-button.tsx` | None | Triggers browser file download |

### Pure Server / Shared
| Component | Notes |
|---|---|
| `channel-header.tsx` | Stateless card — can stay server component |
| `video-card.tsx` | Stateless, rendered inside client `VideoList` so becomes client |
| `trending-badge.tsx` | Stateless, computed from props |
| All `ui/*` primitives | Stateless design tokens |

---

## YouTube API Integration

### `lib/youtube/client.ts`
Thin wrapper over `fetch` that appends the API key and base URL. No SDK dependency — keeps the bundle lean.

```typescript
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

export async function youtubeGet<T>(
  endpoint: string,
  params: Record<string, string>
): Promise<T> {
  const url = new URL(`${YOUTUBE_API_BASE}/${endpoint}`);
  url.searchParams.set("key", process.env.YOUTUBE_API_KEY!);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`YouTube API ${res.status}: ${res.statusText}`);
  return res.json();
}
```

### `lib/youtube/resolve-channel.ts`
Resolution chain based on parsed URL type:

1. **Direct channel ID** (`UC...`) → use as-is
2. **Handle** (`@mkbhd`) → `channels.list?forHandle=mkbhd`
3. **Username** → `channels.list?forUsername=GoogleDevelopers`
4. **Vanity/custom** → `search.list?q=GoogleDevelopers&type=channel` (fallback)

### `lib/youtube/fetch-videos.ts`
Two API calls, chained:

1. `search.list(channelId, order=date, maxResults=50)` → returns video IDs
2. `videos.list(id=<comma-joined>, part=statistics,snippet)` → returns full metrics

This two-step approach is required because `search.list` doesn't return statistics.

### API Quota Budget

| Call | Cost | Per request |
|---|---|---|
| `channels.list` | 1 unit | 1 |
| `search.list` | 100 units | 1 |
| `videos.list` | 1 unit | 1 |
| **Total per analysis** | | **~102 units** |
| **Daily quota** | | **10,000 units** |
| **Analyses per day** | | **~98** |

This is sufficient for a demo MVP. If quota becomes a concern, replace `search.list` with `playlistItems.list` on the channel's "uploads" playlist (1 unit instead of 100).

---

## Caching Strategy

| Layer | Mechanism | TTL | Rationale |
|---|---|---|---|
| **YouTube API responses** | Next.js `fetch` with `revalidate` | **300s (5 min)** | Video stats don't change second-to-second; 5 min keeps data fresh enough for a demo while protecting quota. |
| **Channel ID resolution** | Next.js `fetch` with `revalidate` | **3600s (1 hr)** | Channel IDs are stable — handles don't remap frequently. Cache aggressively. |
| **Static assets** | Vercel Edge CDN | Immutable | Next.js handles this automatically via content hashing. |
| **Page shell** | ISR not used | N/A | Each channel is dynamic data; no static generation. |
| **Client-side sort/filter** | In-memory (React state) | Session | Sort and filter operate on the already-fetched dataset — zero additional API calls. |

**Cache invalidation:** Not needed for MVP. Data is inherently ephemeral — each visit fetches fresh-enough data.

---

## Environment Variables

### Required

| Variable | Where | Purpose |
|---|---|---|
| `YOUTUBE_API_KEY` | `.env.local` | YouTube Data API v3 key (server-side only — no `NEXT_PUBLIC_` prefix) |

### `.env.example` (committed to repo)

```bash
# YouTube Data API v3 key — get one at https://console.cloud.google.com
YOUTUBE_API_KEY=
```

### `.env.local` (git-ignored, local dev)

```bash
YOUTUBE_API_KEY=AIza...your-key-here
```

### Vercel Environment Variables

Set via Vercel Dashboard → Project → Settings → Environment Variables:
- `YOUTUBE_API_KEY` → Production + Preview

**Security note:** The API key is only used in server-side code (Route Handler + Server Components). It is never exposed to the browser. No `NEXT_PUBLIC_` prefix.

---

## Deployment Steps (Vercel)

### 1. Prerequisites
```bash
# Install dependencies
npm install

# Verify local build
npm run build

# Test locally
npm run start
```

### 2. Vercel Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Link project (first time)
vercel link

# Set environment variable
vercel env add YOUTUBE_API_KEY
# Paste your API key when prompted
# Select: Production, Preview, Development
```

### 3. Deploy
```bash
# Preview deploy (creates unique URL)
vercel

# Production deploy
vercel --prod
```

### 4. Post-Deploy Verification
- [ ] Visit production URL
- [ ] Paste `https://www.youtube.com/@mkbhd` → confirm results load
- [ ] Paste `@mkbhd` (bare handle) → confirm it resolves
- [ ] Test on mobile viewport
- [ ] Verify no API key in browser network tab

### CI Shortcut (for the weekend sprint)
No CI pipeline for MVP. Push to `main`, Vercel auto-deploys via GitHub integration.

---

## ADR-001: Client-Side Sort/Filter vs. Server Refetch

### Context
Videos need to be sortable by views/likes/date/engagement and filterable by date range.

### Decision
Sort and filter entirely on the client from the initial dataset (up to 50 videos).

### Rationale
- **Performance:** Instant — no round-trip for re-sorting.
- **Quota:** Zero additional API calls.
- **Simplicity:** State lives in one `<VideoList>` client component.
- **Trade-off:** Limited to 50 most recent videos (YouTube `search.list` max per request). Acceptable for "what's working this month."

### Alternative Considered
Server-side refetch with different `order` params — rejected because it burns 102 quota units per sort change and adds latency.

---

## ADR-002: API Route for Resolution + Server Component for Rendering

### Context
The user's raw input needs to be resolved to a canonical channel ID before we can fetch and display data.

### Decision
Split into two steps:
1. `POST /api/channel` — resolves input → returns `{ channelId }`
2. `/channel/[id]/page.tsx` — server component fetches and renders with the clean ID

### Rationale
- **Clean URLs:** `/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw` is bookmarkable and shareable.
- **Separation of concerns:** URL parsing/resolution is isolated from data rendering.
- **Cacheable:** The results page with a stable ID can benefit from Next.js fetch caching. A page keyed by arbitrary raw input would have poor cache hit rates.
- **Error handling:** Resolution errors (bad URL, channel not found) are caught early in the API route before navigation, so the user gets inline feedback on the landing page instead of navigating to a broken page.

### Alternative Considered
Single server action that resolves + fetches in one call, rendering on a search-param-based page (`/?q=@mkbhd`). Rejected because it produces ugly URLs and prevents caching by channel ID.

---

## Quota-Saving Optimization Path

If the 10,000 unit/day quota becomes limiting, swap the data-fetching strategy:

**Current (simple, 102 units):**
`search.list` → `videos.list`

**Optimized (cheap, 3 units):**
1. `channels.list(id=X, part=contentDetails)` → get `uploads` playlist ID (1 unit)
2. `playlistItems.list(playlistId=UU..., maxResults=50)` → get video IDs (1 unit)
3. `videos.list(id=<joined>, part=statistics,snippet)` → get full data (1 unit)

This drops the cost from **102 → 3 units per analysis** (34x improvement), supporting **~3,300 analyses/day** on the free quota. The code is structured so this swap is a single-file change in `fetch-videos.ts`.

---

*Architecture aligned with PRD.md scope. No database, no auth, no persistent state — everything is live-fetched and session-scoped.*
