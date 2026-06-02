# Notion Loom

An iOS Reminders-style Progressive Web App (PWA) that uses your Notion databases as task lists.

## Features

- Pick any Notion database as a task list
- Check off tasks with animated checkboxes (optimistic UI)
- Show / hide completed tasks (persisted per list)
- Add tasks inline with optional due date
- Swipe left to delete a task
- Drag handle to reorder tasks (order persisted in localStorage)
- Due date badges (red if overdue)
- Install as a PWA — auto-updates when a new version is deployed
- Full dark mode via `prefers-color-scheme`

## Architecture

```
Browser (PWA on GitHub Pages)
    ↕ HTTPS
Cloudflare Worker  ←  you deploy this once (free)
    ↕ HTTPS + Bearer token
Notion API (api.notion.com)
```

Notion's API blocks direct browser requests (no CORS). A tiny Cloudflare Worker relays requests transparently. The Worker never stores your token — it is sent from the browser on every request over HTTPS and forwarded straight to Notion.

Your Notion integration token is stored **only in `localStorage`** on your device. It is never sent to any server other than your own Cloudflare Worker.

## Getting started

### 1. Deploy the Cloudflare Worker (one-time, ~3 min)

1. Go to [workers.cloudflare.com](https://workers.cloudflare.com) and sign in (free account).
2. Click **Create Worker** → **Deploy**.
3. Click **Edit code**, replace everything with the contents of [`worker/index.ts`](worker/index.ts), and click **Save & Deploy**.
4. Copy the Worker URL (e.g. `https://my-worker.workers.dev`).

### 2. Create a Notion integration

1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations).
2. Click **+ New integration**, name it (e.g. "Notion Loom"), and save.
3. Copy the **Internal Integration Token** (`secret_…`).
4. Open each Notion database you want to use → **… → Add connections** → select your integration.

### 3. Open the app

Navigate to `https://risingwolf21.github.io/notion_loom/` and follow the 3-step onboarding to enter your Worker URL and token.

## Local development

```bash
npm install
npm run dev
```

Requires Node 20+. The `canvas` dev dependency is used only to generate PWA icons at build time.

## Deployment

Push to the `production` branch to trigger the GitHub Actions workflow that builds and deploys to GitHub Pages (`gh-pages` branch).

```bash
git push origin main:production
```

## Tech stack

| Concern | Library |
|---|---|
| Build | Vite 8 + React 19 + TypeScript 6 |
| UI primitives | shadcn/ui (Base UI style) — `@base-ui/react` |
| PWA | `vite-plugin-pwa` (autoUpdate) |
| Drag-to-reorder | `@dnd-kit/core` + `@dnd-kit/sortable` |
| Swipe-to-delete | `@use-gesture/react` |
| Date formatting | `date-fns` |
| Styles | Tailwind CSS v4 + iOS-inspired CSS custom properties |
