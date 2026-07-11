# High Level Design Catalog

Classic HLD interview problems under the **High Level Design** section (`section: 'high-level-design'`). Mark items `[x]` when a page is published.

## How to use this file

1. Pick a problem from the list.
2. Scaffold: `npm run new:design -- <slug> "Title"` from `frontend/`, then set **`section: 'high-level-design'`** in `*.meta.ts`.
3. Check off the problem here when published.

**Entry format:** title, one-line description, suggested `slug`.

---

## Fundamentals

- [x] **URL Shortener** — Short links, unique key generation, redirects, and read-heavy scaling. `slug: url-shortener`
- [x] **Rate Limiter** — Token bucket, sliding window, and distributed limiting at the edge. `slug: rate-limiter`

## Social & Feeds

- [x] **News Feed (Twitter / X)** — Timelines, fan-out, ranking, and trending. `slug: twitter`
- [x] **Photo Sharing (Instagram)** — Media upload, feeds, stories, and social graph. `slug: instagram`

## Media & Streaming

- [x] **Video Streaming (YouTube)** — Upload, transcoding, CDN delivery, and recommendations. `slug: youtube`

## Messaging

- [x] **Chat Messaging (WhatsApp)** — Real-time delivery, presence, groups, and encryption. `slug: whatsapp`
- [x] **Notification System** — Multi-channel fan-out for push, SMS, and email. `slug: notification-system`

## Location & Mobility

- [x] **Ride Sharing (Uber)** — Matching, geospatial indexes, pricing, and trip lifecycle. `slug: uber`

## Storage & Cache

- [x] **File Storage (Dropbox)** — Sync, chunking, metadata, and conflict handling. `slug: dropbox`
- [x] **Distributed Cache** — Consistent hashing, replication, eviction, and hot keys. `slug: distributed-cache`
