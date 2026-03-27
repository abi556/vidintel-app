# Vidintel — Product Requirements Document (MVP)

**Product:** Vidintel — YouTube Competitor Video Analysis Tool
**Owner:** VidMetrics
**Target Ship Date:** Monday (weekend build)
**Status:** MVP / Demo-ready

---

## Problem

Enterprise creators and media agencies need a fast, visual way to analyze a competitor's recent YouTube video performance without cobbling together manual spreadsheets or switching between tools. Today this takes hours of tab-hopping; Vidintel makes it instant.

## Goal

Deliver a polished, deployable web app where a user pastes a YouTube channel URL and immediately sees which videos are performing best this month — sortable, filterable, and client-demo-ready.

### Success Criteria

| Metric | Target |
|---|---|
| Time from paste to results | < 3 seconds |
| Mobile Lighthouse performance | > 85 |
| Publicly accessible URL | Vercel deployment |
| Demo-ready polish | Passes the "show a client" test |

## Non-Goals

- **User accounts / auth** — No login, no saved history. This is a single-session tool for the MVP.
- **Multi-channel comparison** — Analyze one channel at a time; side-by-side is post-MVP.
- **Historical trend tracking** — No persistent database or time-series storage. Data is fetched live per request.
- **Monetization / billing** — No paywall, usage limits, or Stripe integration.
- **Comment or sentiment analysis** — Out of scope; focus is on video-level performance metrics only.
- **YouTube Shorts-specific handling** — Shorts will appear in results but won't receive a dedicated UI treatment.
- **Rate-limit management dashboard** — If the YouTube API quota is hit, show a graceful error; don't build quota monitoring.

## Core Features (MVP)

| # | Feature | Priority |
|---|---|---|
| 1 | **Channel URL input** — Single text field with paste-and-go UX | P0 |
| 2 | **Channel header card** — Name, avatar, subscriber count, total videos | P0 |
| 3 | **Video list** — Thumbnail, title, views, likes, comments, published date | P0 |
| 4 | **Sort** — By views, likes, date, engagement rate | P0 |
| 5 | **Filter** — Date range (this month / last 30 days / last 90 days) | P0 |
| 6 | **Responsive design** — Desktop + mobile-first layout | P0 |
| 7 | **Performance chart** — Bar or area chart of views over recent uploads | P1 (bonus) |
| 8 | **Trending indicators** — Visual badges for videos outperforming channel average | P1 (bonus) |
| 9 | **CSV export** — Download current result set | P1 (bonus) |
| 10 | **Loading skeleton + error states** — Polished empty/error/loading UX | P0 |

## Edge Cases: Channel URL Formats

The input field must normalize **all** of the following into a usable channel identifier before calling the YouTube Data API:

| Format | Example | Extraction Strategy |
|---|---|---|
| Standard channel URL | `https://www.youtube.com/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw` | Parse `UC...` ID directly from path |
| Custom handle URL | `https://www.youtube.com/@mkbhd` | Strip `@`, resolve via `search.list` or `channels.list?forHandle=` |
| Legacy username URL | `https://www.youtube.com/user/GoogleDevelopers` | Resolve via `channels.list?forUsername=` |
| Custom vanity URL | `https://www.youtube.com/c/GoogleDevelopers` | Resolve via search or forHandle fallback |
| Short URL | `https://youtube.com/@mkbhd` | Same as handle — normalize missing `www.` |
| With trailing slash/params | `https://www.youtube.com/@mkbhd/videos?view=0` | Strip path segments and query params after identifier |
| Mobile URL | `https://m.youtube.com/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw` | Replace `m.` prefix, then parse normally |
| Bare handle text | `@mkbhd` | Detect `@` prefix, resolve as handle |
| Pasted channel ID | `UC_x5XG1OV2P6uZZ5FSM9Ttw` | Detect `UC` prefix pattern, use directly |
| Invalid / non-channel URL | `https://www.youtube.com/watch?v=dQw4w9WgXcQ` | Reject with clear error: "Please enter a channel URL, not a video link" |
| Non-YouTube URL | `https://vimeo.com/channels/staffpicks` | Reject: "Only YouTube channel URLs are supported" |

**Validation rule:** If none of the above patterns match, display an inline error *before* making any API call.

## Technical Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Styling | Tailwind CSS |
| Charts | Recharts or Chart.js |
| Data | YouTube Data API v3 (server-side route handler) |
| Deployment | Vercel |
| Language | TypeScript |

## Demo Script (Monday Morning — 5 minutes)

> **Audience:** Founder + enterprise media client

### Act 1 — The Hook (30 sec)
> "Imagine you could paste any competitor's YouTube channel and instantly see what's working for them this month. That's Vidintel."

### Act 2 — Live Demo (3 min)

1. **Open Vidintel** in the browser — show the clean landing state.
2. **Paste a well-known channel URL** (e.g., `https://www.youtube.com/@mkbhd`) into the input.
3. **Results load** — point out the channel header card (avatar, name, subscriber count).
4. **Scroll the video list** — highlight thumbnails, view counts, and published dates.
5. **Sort by views** — "Instantly see their top-performing content this month."
6. **Sort by engagement** — "Or find the videos with the highest engagement rate — these are the ones their audience really cares about."
7. **Show trending badges** — "Videos with this indicator are outperforming the channel's average — that's where the momentum is."
8. **Open the chart** — "Here's a visual timeline of how their recent uploads are performing."
9. **Click Export CSV** — "Your team can pull this into a spreadsheet for deeper analysis in seconds."
10. **Resize to mobile** — "It works on any device — your team can check competitor performance from their phone between meetings."

### Act 3 — The Close (1.5 min)
> "We built this over the weekend to prove the concept. Next steps: multi-channel comparison, saved reports, and integration into the VidMetrics dashboard. But right now — paste any channel URL and get instant competitive intelligence."

**Handle Q&A:** Be prepared for "what if the channel URL looks different?" — demonstrate pasting a `@handle`, a `/channel/UC...` URL, and a bare `@name` to show the input is forgiving.

---

*This PRD scopes a weekend MVP. Features beyond this document are intentionally deferred to avoid scope creep before the Monday demo.*
