# Lyric Pad

> **AI-powered songwriting + music generation** — write lyrics, get smart suggestions, and generate a full track in minutes.

Built for the **Wubble Hackathon**.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-dad20cbe.lyric--pad.pages.dev-lime?style=for-the-badge)](https://dad20cbe.lyric-pad.pages.dev/)

---

## Demo

[Watch the demo video](https://drive.google.com/file/d/1ejuwulQsST6Fvh8sJ3i3P71ZtIJktEpV/view?usp=sharing)

---

## What is Lyric Pad?

Songwriting is hard — getting from a blank page to a finished track is even harder. Lyric Pad bridges that gap by combining a purpose-built lyric editor with Gemini-powered AI suggestions and Wubble's music generation API.

- Write and organize your lyrics in structured blocks (Verse, Hook, Chorus, Bridge, etc.)
- Get real-time word-level AI suggestions with rationale
- Analyze your lyrics for vibe, emotional impact, and how they stack up against current musical trends
- Generate a full music track from your lyrics directly inside the app

---

## Features

### Lyric Pad Editor
A block-based editor designed for songwriters, not developers.

- **Block types:** Verse, Hook, Chorus, Bridge, Outro, Intro, Pre-Chorus
- **Drag-and-drop reordering** via dnd-kit — rearrange your song structure freely
- **Auto-expanding textareas** — the editor grows as you write
- **Real-time persistence** — all changes are saved to localStorage instantly, no sign-in required

### AI Word Suggestions (Gemini 2.5 Flash)
Highlight a section and let Gemini suggest better words.

- Returns up to 3 targeted word swap suggestions per request
- Each suggestion includes the original word, a replacement, and a plain-English rationale
- Focused on impact, not verbosity — only swaps that actually improve the lyric are returned

### Lyric Analysis (Gemini 2.5 Flash)
Understand how your lyrics land before you record.

- **Vibe** — the emotional energy and mood your lyrics convey
- **Impact** — the type of listener your lyrics will resonate with most
- **Status Quo** — how your lyric positions itself against current musical trends

### Wubble Studio
Generate a full music track from your lyrics without leaving the app.

- Describe the vibe and send your lyrics to Wubble's AI
- Real-time generation status updates (generating → streaming → completed)
- Built-in audio player with scrubber, play/pause, and time display
- Access to both the live AAC stream (during generation) and the final MP3 (on completion)
- Re-uses your Wubble project across requests so you don't lose history

### Project Dashboard
Manage all your songs from a single view.

- Color-coded project cards with title, creation date, and last-updated time
- Sort by **most recent** or **alphabetical**
- Quick **delete** with confirmation guard
- Fully local — your projects live on your device, no account needed

### Rate Limiting
Fair usage enforcement without accounts.

- Device fingerprinting via Fingerprint.js — no login required for per-device limits
- Fixed-window rate limiting backed by Cloudflare KV (30 requests / 60 seconds by default)
- Returns `429 Too Many Requests` with a `Retry-After` header when the limit is hit
- Limits persist across Cloudflare Worker isolates

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 19.2 | UI framework |
| TypeScript | 5.9 | Type safety |
| Vite | 8.0 | Build tool & dev server |
| TanStack Router | 1.168 | File-based client-side routing |
| TanStack Query | 5.96 | Server state, caching, mutations |
| TanStack Form | 1.28 | Form state management |
| Tailwind CSS | 4.2 | Utility-first styling |
| dnd-kit | latest | Drag-and-drop block reordering |
| Fingerprint.js | 5.1 | Device fingerprinting for rate limiting |
| Hono Client | 4.12 | Typed RPC to backend |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Hono | 4.12 | Web framework for Cloudflare Workers |
| Cloudflare Workers | — | Serverless runtime |
| Cloudflare KV | — | Rate limit counter storage |
| Wrangler | 4.4 | Cloudflare CLI & local dev |
| Zod | 4.3 | Request/response schema validation |
| TypeScript | 6.0 | Type safety |

### AI & External APIs

| Service | Purpose |
|---|---|
| Google Gemini 2.5 Flash | Lyric word suggestions + analysis |
| Wubble API | AI music generation from lyrics |

---

## Architecture

```
wubble-hackathon-your-lyric-inspo/
├── frontend/          # React app (Cloudflare Pages)
├── backend/           # Hono API (Cloudflare Workers)
└── pnpm-workspace.yaml
```

**Key architectural decisions:**

- **Monorepo (pnpm workspaces)** — frontend and backend share type definitions via Hono's RPC client for end-to-end type safety.
- **Local-first storage** — Projects and lyrics are stored entirely in `localStorage`. No backend database is needed for the core editing experience.
- **Typed RPC** — The frontend imports the backend's Hono app type and uses `hc<AppType>()` for fully typed API calls with zero code generation.
- **Polling pattern** — Wubble music generation is asynchronous. The backend returns a `request_id`, and the frontend polls `GET /api/polling/:request_id` until the track is ready.
- **Device fingerprinting** — Every API request includes an `X-Device-ID` header injected by Fingerprint.js. The backend uses this as the rate limiting key rather than IP address (which changes frequently on mobile/VPN).
- **File-based routing** — TanStack Router scans `src/routes/` at build time, generating a fully typed route tree.

---

## Project Structure

```
frontend/
├── src/
│   ├── routes/
│   │   ├── __root.tsx          # Root layout (dev tools, router outlet)
│   │   ├── index.tsx           # Dashboard — project list, create modal
│   │   └── project.$id.tsx     # Editor — lyric pad, chat, analysis
│   ├── components/             # Shared React components
│   ├── lib/
│   │   ├── client.ts           # Hono typed RPC client
│   │   ├── api.ts              # API function wrappers
│   │   ├── storage.ts          # localStorage + device fingerprinting
│   │   ├── queryKeys.ts        # TanStack Query key factory
│   │   └── utils.ts            # Formatting, UUID, helpers
│   ├── types/index.ts          # Project, Block, Message types
│   └── index.css               # Design tokens (Sonic Industrialist theme)
├── vite.config.ts              # Vite + TanStack Router + Tailwind
└── package.json

backend/
├── src/
│   ├── index.ts                # App entry, middleware, route registration
│   ├── schemas.ts              # Zod schemas for all requests/responses
│   ├── middleware.ts           # Device ID validation, rate limiting
│   └── routes/
│       ├── ai.ts               # POST /api/suggest, POST /api/analyze
│       └── wubble.ts           # POST /api/chat, GET /api/polling/:id
├── wrangler.jsonc              # Cloudflare Worker config
└── package.json
```

---

## API Reference

All endpoints are prefixed with `/api`. Every request must include the `X-Device-ID` header (injected automatically by the frontend).

---

### `POST /api/suggest`

Get AI word swap suggestions for a block of lyrics.

**Request**
```json
{ "lyrics": "I walk alone through the rain" }
```

**Response**
```json
[
  {
    "original": "walk",
    "suggestion": "trudge",
    "rationale": "Conveys heavier emotional weight and physical effort."
  },
  {
    "original": "rain",
    "suggestion": "downpour",
    "rationale": "More visceral and overwhelming, amplifies the isolation."
  }
]
```

---

### `POST /api/analyze`

Analyze lyrics for vibe, impact, and trend positioning.

**Request**
```json
{ "lyrics": "I walk alone through the rain\nNo one to call my name" }
```

**Response**
```json
{
  "vibe": "Melancholic and introspective with a sense of quiet defiance.",
  "impact": "Resonates with listeners processing loneliness or personal reinvention.",
  "status_quo": "Aligns with the current wave of emotional pop and indie folk crossovers."
}
```

---

### `POST /api/chat`

Start an async music generation job from lyrics and a vibe description.

**Request**
```json
{
  "message": "Make it a rainy lo-fi track with soft piano",
  "lyrics": "I walk alone through the rain\nNo one to call my name",
  "project_id": "optional-existing-wubble-project-id"
}
```

**Response**
```json
{
  "request_id": "req_abc123",
  "project_id": "proj_xyz789"
}
```

---

### `GET /api/polling/:request_id`

Poll the status of a music generation job.

**Response (generating)**
```json
{
  "status": "generating",
  "model_response": null,
  "streaming": null
}
```

**Response (completed)**
```json
{
  "status": "completed",
  "model_response": "Here's your lo-fi rainy track...",
  "streaming": {
    "stream_url": "https://cdn.wubble.ai/stream/abc.aac",
    "final_audio_url": "https://cdn.wubble.ai/final/abc.mp3"
  }
}
```

**Response (failed)**
```json
{
  "status": "failed",
  "error": "Generation timed out"
}
```

---

### Rate Limiting

| Header | Description |
|---|---|
| `X-Device-ID` | Required on all `/api/*` requests. Generated by Fingerprint.js. |
| `Retry-After` | Returned on `429` responses. Number of seconds until the window resets. |

Default limit: **30 requests per 60 seconds per device**.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 9+
- A [Cloudflare account](https://dash.cloudflare.com/) (free tier works)
- A [Google AI Studio](https://aistudio.google.com/) API key (Gemini)
- A Wubble API key

### 1. Clone the repository

```bash
git clone https://github.com/your-username/wubble-hackathon-your-lyric-inspo.git
cd wubble-hackathon-your-lyric-inspo
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure backend environment variables

Create `backend/.dev.vars` (this file is gitignored):

```bash
WUBBLE_API_KEY=your_wubble_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Create the KV namespace (first time only)

```bash
cd backend
pnpm wrangler kv namespace create RATE_LIMIT_KV
```

Copy the returned `id` into `backend/wrangler.jsonc` under the `kv_namespaces` binding.

For local dev, also create a preview namespace:
```bash
pnpm wrangler kv namespace create RATE_LIMIT_KV --preview
```

### 5. Start the backend

```bash
cd backend
pnpm run dev
# Runs on http://localhost:8787
```

### 6. Start the frontend

In a new terminal:

```bash
cd frontend
pnpm run dev
# Runs on http://localhost:5173
# /api requests are proxied to http://localhost:8787
```

Open [http://localhost:5173](http://localhost:5173) to use the app.

---

## Environment Variables

### Backend (`backend/.dev.vars` for local, Cloudflare dashboard for production)

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Google AI Studio API key for Gemini 2.5 Flash |
| `WUBBLE_API_KEY` | Yes | Wubble API key for music generation |

### Frontend

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE` | `/` | API base URL. In dev, Vite proxies `/api` to `localhost:8787`. |

---

## Deployment

### Backend — Cloudflare Workers

```bash
cd backend
pnpm run deploy
# Runs: wrangler deploy --minify
```

Set production secrets via the Cloudflare dashboard or CLI:

```bash
pnpm wrangler secret put GEMINI_API_KEY
pnpm wrangler secret put WUBBLE_API_KEY
```

### Frontend — Cloudflare Pages

Connect your GitHub repo to Cloudflare Pages and configure:

| Setting | Value |
|---|---|
| Build command | `cd frontend && pnpm run build` |
| Build output directory | `frontend/dist` |
| Root directory | `/` (repo root) |

Set `VITE_API_BASE` to your deployed Worker URL in the Pages environment variables.

---

## Design System

Lyric Pad uses a custom design language called **"Sonic Industrialist"** — brutalist structure with playful energy.

| Token | Value | Usage |
|---|---|---|
| Accent | `#CCFF00` (lime) | Primary actions, highlights |
| Secondary | `#b50058` (magenta) | Destructive actions, accents |
| Surface | `#f6f6f6` | Card backgrounds |
| Border | `4px solid #000` | All interactive elements |
| Shadow | `4–12px offset, black` | Cards, buttons, modals |
| Display font | Archivo Black | Headings |
| Body font | Space Grotesk | Body copy, UI |
| Mono font | JetBrains Mono | Code, metadata |

---

## Hackathon Notes

This project was built for the **Wubble Hackathon**. The core flow — write lyrics → get AI feedback → generate a track — was designed to demonstrate a tight integration between the Wubble music generation API and a purpose-built creative tool.

The backend is intentionally lightweight: no user accounts, no database for projects. The focus is on the creative loop, not infrastructure. A D1 database binding is wired up in `wrangler.jsonc` for future use if the project is extended.

---

## License

MIT
