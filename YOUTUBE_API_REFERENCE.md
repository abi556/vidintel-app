# Vidintel — YouTube Data API v3 Endpoint Reference

> Complete pipeline: **Raw Input → Channel ID → Uploads Playlist → Video IDs → Statistics**

---

## Quota Budget

| Quota | Value |
|---|---|
| Free daily quota | **10,000 units** |
| Cost per Vidintel analysis (optimized) | **3 units** |
| Cost per Vidintel analysis (simple) | **102 units** |
| Max analyses/day (optimized) | **~3,333** |
| Max analyses/day (simple) | **~98** |

---

## Step 1 — Resolve Raw Input → Channel ID

The user's input can be any of 9+ formats. Each format requires a different resolution strategy.

### 1a. Direct Channel ID (no API call needed)

**Pattern:** Input starts with `UC` and is 24 characters.
**Example:** `UC_x5XG1OV2P6uZZ5FSM9Ttw`
**Cost:** 0 units — use directly.

```
No API call. Pass through.
```

---

### 1b. Handle (`@handle`)

**Endpoint:**
```
GET https://www.googleapis.com/youtube/v3/channels
```

**Parameters:**

| Param | Value |
|---|---|
| `forHandle` | `mkbhd` (without the `@`) |
| `part` | `id,snippet,statistics,brandingSettings` |
| `key` | `YOUTUBE_API_KEY` |

**Example URL:**
```
GET /youtube/v3/channels?forHandle=mkbhd&part=id,snippet,statistics&key=API_KEY
```

**Response (trimmed):**
```json
{
  "items": [{
    "id": "UCBJycsmduvYEL83R_U4JriQ",
    "snippet": {
      "title": "MKBHD",
      "description": "...",
      "customUrl": "@mkbhd",
      "thumbnails": {
        "default": { "url": "https://yt3.ggpht.com/..." },
        "high": { "url": "https://yt3.ggpht.com/..." }
      }
    },
    "statistics": {
      "subscriberCount": "19500000",
      "videoCount": "1800",
      "viewCount": "4200000000"
    }
  }]
}
```

**Quota cost:** 1 unit (channels.list base) + 2 (snippet) + 2 (statistics) = **~5 units**
*(In practice, Google bills `channels.list` at a flat 1 unit regardless of parts requested for simple queries.)*

**Applies to URL formats:**
- `https://www.youtube.com/@mkbhd`
- `https://youtube.com/@mkbhd`
- `https://m.youtube.com/@mkbhd`
- `https://www.youtube.com/@mkbhd/videos?view=0`
- Bare `@mkbhd`

---

### 1c. Legacy Username (`/user/`)

**Endpoint:**
```
GET https://www.googleapis.com/youtube/v3/channels
```

**Parameters:**

| Param | Value |
|---|---|
| `forUsername` | `GoogleDevelopers` |
| `part` | `id,snippet,statistics` |
| `key` | `YOUTUBE_API_KEY` |

**Example URL:**
```
GET /youtube/v3/channels?forUsername=GoogleDevelopers&part=id,snippet,statistics&key=API_KEY
```

**Quota cost:** **1 unit**

**Applies to:**
- `https://www.youtube.com/user/GoogleDevelopers`

---

### 1d. Vanity/Custom URL (`/c/`)

**No direct API parameter exists for `/c/` URLs.** This is the trickiest format.

**Primary strategy:** Try `forHandle` first (many `/c/` names are now handles).
```
GET /youtube/v3/channels?forHandle=GoogleDevelopers&part=id,snippet,statistics&key=API_KEY
```

**Fallback strategy:** If `forHandle` returns empty `items[]`, fall back to search:
```
GET /youtube/v3/search?q=GoogleDevelopers&type=channel&maxResults=1&part=snippet&key=API_KEY
```

**Quota cost:**
- Primary: **1 unit** (channels.list)
- Fallback: **100 units** (search.list) — only used when `forHandle` fails

**Applies to:**
- `https://www.youtube.com/c/GoogleDevelopers`

---

### 1e. Standard Channel URL (`/channel/`)

**Endpoint:**
```
GET https://www.googleapis.com/youtube/v3/channels
```

**Parameters:**

| Param | Value |
|---|---|
| `id` | `UC_x5XG1OV2P6uZZ5FSM9Ttw` (extracted from path) |
| `part` | `id,snippet,statistics,contentDetails` |
| `key` | `YOUTUBE_API_KEY` |

**Quota cost:** **1 unit** — but we also get channel metadata in the same call, so this doubles as Step 2.

**Applies to:**
- `https://www.youtube.com/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw`
- `https://m.youtube.com/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw`

---

### Resolution Decision Tree

```
Input
  │
  ├─ starts with "UC" + 24 chars? ──► Use directly (0 units)
  │
  ├─ contains "/channel/" ? ──► Extract ID from path → channels.list by id (1 unit)
  │
  ├─ contains "/@" or starts with "@" ? ──► Strip @ → channels.list forHandle (1 unit)
  │
  ├─ contains "/user/" ? ──► Extract username → channels.list forUsername (1 unit)
  │
  ├─ contains "/c/" ? ──► Extract name → try forHandle (1 unit)
  │   │                         │
  │   │                    empty items?
  │   │                         │
  │   │                         ▼
  │   │                    search.list fallback (100 units)
  │
  ├─ contains "youtube.com/watch" ? ──► REJECT: "That's a video URL"
  │
  ├─ not youtube.com ? ──► REJECT: "Only YouTube URLs supported"
  │
  └─ none match? ──► REJECT: "Couldn't parse that URL"
```

---

## Step 2 — Get Uploads Playlist ID

Every YouTube channel has a hidden "uploads" playlist. Its ID is the channel ID with the `UC` prefix replaced by `UU`.

**Endpoint:**
```
GET https://www.googleapis.com/youtube/v3/channels
```

**Parameters:**

| Param | Value |
|---|---|
| `id` | `UCBJycsmduvYEL83R_U4JriQ` |
| `part` | `contentDetails` |
| `key` | `YOUTUBE_API_KEY` |

**Response (trimmed):**
```json
{
  "items": [{
    "id": "UCBJycsmduvYEL83R_U4JriQ",
    "contentDetails": {
      "relatedPlaylists": {
        "uploads": "UUBJycsmduvYEL83R_U4JriQ"
      }
    }
  }]
}
```

**Quota cost:** **1 unit**

**Optimization:** Combine this with Step 1 by requesting `part=id,snippet,statistics,contentDetails` in the same `channels.list` call. This gets channel metadata + uploads playlist ID in a single 1-unit call.

**Shortcut (no API call):** Replace `UC` prefix with `UU`:
```
Channel ID:  UCBJycsmduvYEL83R_U4JriQ
Uploads ID:  UUBJycsmduvYEL83R_U4JriQ
             ^^
```
This is an undocumented but universally reliable convention. Using this saves 1 unit if you already have the channel ID from Step 1 without `contentDetails`.

---

## Step 3 — List Videos Published in Last 30 Days

### Option A: `playlistItems.list` (RECOMMENDED — 1 unit)

**Endpoint:**
```
GET https://www.googleapis.com/youtube/v3/playlistItems
```

**Parameters:**

| Param | Value |
|---|---|
| `playlistId` | `UUBJycsmduvYEL83R_U4JriQ` |
| `part` | `snippet` |
| `maxResults` | `50` |
| `key` | `YOUTUBE_API_KEY` |

**Response (trimmed):**
```json
{
  "items": [
    {
      "snippet": {
        "publishedAt": "2026-03-20T14:00:00Z",
        "title": "I Tried the New iPhone SE 4...",
        "resourceId": { "videoId": "abc123def45" },
        "thumbnails": {
          "high": { "url": "https://i.ytimg.com/vi/abc123def45/hqdefault.jpg" }
        }
      }
    }
  ],
  "nextPageToken": "CDIQAA"
}
```

**Quota cost:** **1 unit per page** (50 results per page)

**Date filtering:** `playlistItems.list` does NOT support `publishedAfter`. The results come in reverse-chronological order. Client-side strategy:
1. Fetch page 1 (50 videos).
2. Check the `publishedAt` of the last item.
3. If it's within the last 30 days, fetch the next page via `nextPageToken`.
4. Stop when you hit a video older than 30 days.

For most channels, 50 videos covers 30 days. Active channels (daily uploads) may need 1-2 additional pages.

---

### Option B: `search.list` (EXPENSIVE — 100 units)

**Endpoint:**
```
GET https://www.googleapis.com/youtube/v3/search
```

**Parameters:**

| Param | Value |
|---|---|
| `channelId` | `UCBJycsmduvYEL83R_U4JriQ` |
| `part` | `snippet` |
| `type` | `video` |
| `order` | `date` |
| `publishedAfter` | `2026-02-25T00:00:00Z` |
| `maxResults` | `50` |
| `key` | `YOUTUBE_API_KEY` |

**Quota cost:** **100 units**

**Advantage:** Native `publishedAfter` filter — the API handles date filtering server-side.

**Disadvantage:** 100x more expensive. Burns through daily quota in ~98 requests.

---

### Comparison

| Factor | playlistItems.list | search.list |
|---|---|---|
| Quota cost | **1 unit** | **100 units** |
| Server-side date filter | No | Yes (`publishedAfter`) |
| Response order | Chronological (newest first) | By relevance or date |
| Includes Shorts | Yes | Yes |
| Pagination | `nextPageToken` | `nextPageToken` |
| Max per page | 50 | 50 |

**Decision:** Use `playlistItems.list` and filter dates client-side. The 100x quota saving is worth the trivial date-comparison code.

---

## Step 4 — Fetch Video Statistics

`playlistItems.list` and `search.list` both return video IDs and snippets, but **neither returns statistics** (views, likes, comments). A second call is required.

**Endpoint:**
```
GET https://www.googleapis.com/youtube/v3/videos
```

**Parameters:**

| Param | Value |
|---|---|
| `id` | `abc123def45,xyz789ghi01,...` (comma-separated, max 50) |
| `part` | `statistics` |
| `key` | `YOUTUBE_API_KEY` |

**Response (trimmed):**
```json
{
  "items": [
    {
      "id": "abc123def45",
      "statistics": {
        "viewCount": "2456789",
        "likeCount": "98234",
        "commentCount": "4521"
      }
    }
  ]
}
```

**Quota cost:** **1 unit** (regardless of how many video IDs, up to 50)

**Batch strategy:** Join all video IDs from Step 3 into a single comma-separated string. The `videos.list` endpoint accepts up to 50 IDs per call. If Step 3 returned more than 50 videos (multiple pages), batch into groups of 50.

---

## Complete Pipeline Summary

```
Step   Endpoint                 Purpose                          Cost    Cache TTL
─────  ───────────────────────  ───────────────────────────────  ──────  ─────────
  1    channels.list            Resolve input → channelId +      1 unit  1 hour
                                metadata + uploads playlist ID
                                (part=id,snippet,statistics,
                                 contentDetails)

  2    (skip — derive UU       Uploads playlist ID               0       ∞
       from UC prefix)

  3    playlistItems.list       Recent video IDs + snippets      1 unit  5 min
                                (paginate until >30 days ago)

  4    videos.list              View, like, comment counts       1 unit  5 min
                                (batch up to 50 IDs)

                                                         TOTAL:  3 units
```

---

## Fallback & Error Handling

| Scenario | Detection | Fallback |
|---|---|---|
| `forHandle` returns empty | `items.length === 0` | Try `search.list` with channel type (costs 100 units) |
| `forUsername` returns empty | `items.length === 0` | Try `forHandle` with same string, then `search.list` |
| Channel has 0 videos | `playlistItems` returns empty | Show "This channel has no public videos" |
| Video is private/deleted | Missing from `videos.list` response | Skip — don't render card, don't crash |
| API key invalid | HTTP 400 + `keyInvalid` error | Show "Configuration error — contact support" |
| Quota exceeded | HTTP 403 + `quotaExceeded` | Show "Daily limit reached. Try again tomorrow." with `Retry-After` hint |
| Rate limited | HTTP 403 + `rateLimitExceeded` | Exponential backoff: wait 1s, retry once. If still 403, surface error. |
| Network timeout | `fetch` throws | Show "YouTube is unreachable. Check your connection." |
| Channel not found | HTTP 200 but `items: []` after all resolution attempts | Show "Channel not found. Double-check the URL." |

### Error Response Shape

Every error surfaced to the client should follow a consistent structure:

```typescript
type ApiError = {
  code: "CHANNEL_NOT_FOUND" | "INVALID_URL" | "QUOTA_EXCEEDED"
       | "API_ERROR" | "NETWORK_ERROR";
  message: string;       // User-friendly
  detail?: string;       // Debug info (dev only)
};
```

---

## TypeScript Types for API Responses

```typescript
interface ChannelData {
  id: string;
  title: string;
  description: string;
  customUrl: string;
  thumbnailUrl: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  uploadsPlaylistId: string;
}

interface VideoData {
  id: string;
  title: string;
  publishedAt: string;       // ISO 8601
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  engagementRate: number;    // computed: (likes + comments) / views
  isTrending: boolean;       // computed: views > channel average
}

interface AnalysisResult {
  channel: ChannelData;
  videos: VideoData[];
  fetchedAt: string;         // ISO 8601
  videoCount: number;        // actual count returned
}
```

---

*This reference uses the optimized 3-unit pipeline (playlistItems over search). The `search.list` fallback is reserved only for `/c/` vanity URLs where `forHandle` fails.*
