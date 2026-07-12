# Fundamentals Catalog

Building-block topics under the **Fundamentals** section
(`section: 'fundamentals'`). Use this file as a living checklist — mark items
`[x]` when a page is published.

## How to use this file

1. Pick a topic from the list (or propose a new one via a GitHub issue).
2. Scaffold: `npm run new:design -- <slug> "Title"` from `frontend/`, then set
   **`section: 'fundamentals'`** in `*.meta.ts`.
3. Check off the topic here when published.

**Entry format:** title, one-line description, suggested `slug`.

---

## Distributed systems foundations

- [x] **CAP and PACELC** — Consistency vs availability under partition; latency vs consistency when healthy; myths and consistency models. `slug: cap-pacelc`
- [x] **Message Delivery Semantics** — At-most-once, at-least-once, and effectively-once; Kafka acks, offsets, and idempotency. `slug: delivery-semantics`
- [x] **Distributed ID Generation** — Auto-increment, UUID v4/v7, Snowflake, Base62 counters, and ticket/leaf ranges. `slug: id-generation`

## Interview prep

- [x] **Back-of-Envelope Estimation** — Powers of two, latency numbers, QPS/storage/bandwidth formulas, and worked mini examples. `slug: back-of-envelope`

---

## Suggested next fundamentals

Topics that would complement the published set (not yet scaffolded):

- [ ] **Quorum and replication** — R + W > N, read repair, hinted handoff.
- [ ] **Consensus basics** — Raft/Paxos at interview depth (leader election, log replication).
- [ ] **Caching fundamentals** — Hit ratio, eviction, stampede, cache-aside vs write-through.
- [ ] **Sharding strategies** — Key choice, hot partitions, resharding.
- [ ] **Time and clocks** — NTP, logical clocks, hybrid logical clocks.
