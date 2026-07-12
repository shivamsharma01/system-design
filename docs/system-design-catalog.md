# System Design Catalog

Flagship product deep-dives and the interview framework under the
**System Design** section (`section: 'system-design'`). Mark items `[x]` when a
page is published.

## How to use this file

1. Pick a topic from the list (or propose a new one via a GitHub issue).
2. Scaffold: `npm run new:design -- <slug> "Title"` from `frontend/`, then set
   **`section: 'system-design'`** in `*.meta.ts`.
3. Check off the topic here when published.

**Entry format:** title, one-line description, suggested `slug`.

---

## Interview prep

- [x] **Interview Framework** — RESHADED structure, time budgets, and anti-patterns for system design rounds. `slug: interview-framework`

## Product deep-dives

- [x] **Netflix** — Streaming control plane, Open Connect CDN, EVCache, and playback at scale. `slug: netflix`
- [x] **Amazon** — E-commerce catalog, cart, orders, and payments at marketplace scale. `slug: amazon`
- [x] **Discord** — Real-time chat, gateway shards, presence, and fan-out. `slug: discord`
- [x] **Payment Gateway** — Idempotency, ledger, auth→capture→settle, and reconciliation. `slug: payment-gateway`
- [x] **Spotify** — Music streaming, catalog, playlists, and recommendations. `slug: spotify`
- [x] **Zomato** — Food delivery matching, geospatial search, and order lifecycle. `slug: zomato`

---

## Suggested next deep-dives

Topics that would complement the flagship set (not yet scaffolded):

- [ ] **Google Drive / Dropbox-style sync** — already covered as HLD `dropbox`; a product deep-dive could focus on client sync protocol.
- [ ] **Uber at product depth** — HLD `uber` exists; a System Design page could cover marketplace economics and surge.
- [ ] **Slack / Teams** — workplace messaging, channels, search, and compliance.
