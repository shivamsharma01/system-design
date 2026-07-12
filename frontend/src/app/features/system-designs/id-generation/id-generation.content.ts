import { DesignContent } from '../../../shared/models';
import { ID_GENERATION_META } from './id-generation.meta';

const content: DesignContent = {
  meta: ID_GENERATION_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'Distributed systems need **unique IDs** for users, orders, URLs, and events — often **without a single database sequence**. Choices trade off **coordination**, **sortability**, **size**, and **security** (guessability). Common options: **auto-increment**, **UUID v4 / v7**, **Snowflake-style** (timestamp + worker + sequence), **Base62 counters** (TinyURL), and **ticket / leaf ranges** from a central allocator.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'What interviewers probe',
          body: 'Can IDs be generated **offline**? Are they **roughly time-ordered** for DB locality? What happens if two datacenters mint IDs concurrently? Is the ID **user-facing** (short, opaque) or internal only?',
        },
        {
          type: 'table',
          caption: 'At-a-glance comparison.',
          headers: ['Approach', 'Sortable', 'Coordination', 'Unique without central DB?'],
          rows: [
            ['Auto-increment', 'Yes', 'High (single writer / sequence)', 'No'],
            ['UUID v4', 'No', 'None', 'Yes (probabilistic)'],
            ['UUID v7', 'Yes (time)', 'None', 'Yes'],
            ['Snowflake', 'Yes (time)', 'Worker ID assignment', 'Yes (per worker)'],
            ['Base62 counter', 'Yes', 'Central counter / ranges', 'No (needs allocator)'],
            ['Ticket / leaf ranges', 'Yes (within range)', 'Periodic batch fetch', 'Yes between refreshes'],
          ],
        },
      ],
    },
    {
      id: 'concept',
      title: 'Approaches in depth',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Auto-increment (DB sequences)**\n\nPros: simple, compact, sortable, great joins. Cons: **single-primary bottleneck**, hard to shard (sequence ownership), leaks volume (IDs reveal count), multi-region failover needs sequence handoff.\n\n**UUID v4**\n\n122 bits of randomness — collision risk negligible. Pros: no coordination, easy merge across shards. Cons: **random** → poor B-tree locality, 16 bytes, not sortable, ugly in URLs.\n\n**UUID v7**\n\nUnix timestamp (ms) + random bits. Keeps **time-ordered** inserts while remaining globally mintable. Prefer over v4 for new DB primary keys when you want UUID compatibility + locality.\n\n**Snowflake (64-bit)**\n\nClassic layout: `timestamp | datacenter | worker | sequence` (e.g. 41 | 5 | 5 | 12). ~69 years of ms timestamps, 1024 workers, 4096 IDs/ms/worker. Requires **unique worker IDs** (config, ZooKeeper, or hash of hostname) and clock-skew handling (reject or wait if clock moves backward).\n\n**TinyURL-style Base62**\n\nMap a **monotonic counter** to `[0-9A-Za-z]`. Short public IDs. Counter must be allocated carefully (Redis `INCR`, DB sequence, or pre-allocated ranges) to avoid hot spots and collisions.\n\n**Tickets / leaf ranges**\n\nA **ticket server** (or Meta’s **Leaf**) hands out ranges (`1000–1999`). App servers mint locally inside the range, then fetch a new range. Cuts coordination from per-ID to per-batch; similar idea to **Flickr ticket servers**.',
        },
        {
          type: 'mermaid',
          caption: 'Snowflake ID bit layout (illustrative).',
          definition: `flowchart LR
  subgraph bits["64-bit Snowflake"]
    T["timestamp 41b"]
    D["datacenter 5b"]
    W["worker 5b"]
    S["sequence 12b"]
  end
  T --> D --> W --> S`,
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Real-world analogy',
          body: 'Airport gate numbers: **auto-increment** is one clerk stamping tickets in order. **UUID** is everyone picking a random lottery code. **Snowflake** is each gate agent with a unique stamp pad and a clock. **Leaf ranges** is the clerk giving each agent a book of 1,000 blank tickets at a time.',
        },
      ],
    },
    {
      id: 'tradeoffs',
      title: 'Trade-offs and pitfalls',
      blocks: [
        {
          type: 'prosCons',
          title: 'Design trade-offs',
          pros: [
            'Snowflake / UUID v7: sortable, high throughput, multi-region friendly.',
            'Ticket ranges: simple local minting with low network chatter.',
            'Base62: excellent UX for short links.',
          ],
          cons: [
            'Auto-increment: scales poorly across shards and regions.',
            'UUID v4: index fragmentation and larger indexes.',
            'Snowflake: clock sync and worker-ID management operational burden.',
            'Predictable counters: enumeration / scraping risk for public IDs.',
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Security note',
          body: 'Sequential public IDs enable **scraping** and business-intelligence leaks. For user-facing resources, prefer **unguessable** tokens (random) or authorize strictly; keep sequential IDs internal.',
        },
        {
          type: 'table',
          caption: 'Coordination vs sortability matrix.',
          headers: ['Need', 'Prefer'],
          rows: [
            ['No central dependency, OK random order', 'UUID v4'],
            ['No central dependency, want time order', 'UUID v7 or Snowflake'],
            ['Short URLs', 'Base62 + range allocator'],
            ['Single-region monolith', 'DB auto-increment'],
            ['High QPS multi-region', 'Snowflake / Leaf / UUID v7'],
          ],
        },
      ],
    },
    {
      id: 'implementation',
      title: 'Implementation notes',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Worker ID assignment:** static config, hash(`hostname`) mod N (risk of collision), or ephemeral node in ZooKeeper/etcd. **Clock issues:** NTP step-back → pause minting or use logical tick; document SLA.\n\n**Leaf / tickets:** persist `max_id` in a strongly consistent store; allocate `step` IDs atomically (`UPDATE ... RETURNING`). Cache the range in process memory; on restart, fetch a fresh range (discard unused — safer than reuse).\n\n**Base62 encode:** repeatedly divide by 62; alphabet length 62 → ~**7 chars** covers billions of IDs.',
        },
      ],
    },
    {
      id: 'interview-questions',
      title: 'Interview Questions',
      blocks: [
        {
          type: 'interviewQa',
          items: [
            {
              question: 'Why not auto-increment everywhere?',
              answer:
                'Single sequence becomes a **write hotspot** and couples ID generation to one primary. Multi-region and sharded DBs need sequence ownership rules. Also leaks growth rate.',
            },
            {
              question: 'UUID v4 vs v7?',
              answer:
                '**v4** is random — no coordination, poor insert locality. **v7** embeds a timestamp so IDs are **time-sortable** and friendlier to B-trees, still mintable anywhere.',
            },
            {
              question: 'Explain Snowflake IDs.',
              answer:
                'A 64-bit int combining **timestamp**, **datacenter**, **worker**, and **sequence**. Unique per worker without a central DB per ID; roughly time-ordered; watch **clock skew** and **worker ID uniqueness**.',
            },
            {
              question: 'How does TinyURL generate short IDs?',
              answer:
                'Maintain a **counter** (or hash the long URL — collisions need care). Encode the integer in **Base62** for short strings. Pre-allocate counter ranges for scale.',
            },
            {
              question: 'What are ticket servers / Leaf?',
              answer:
                'A service issues **ID ranges** to application servers. Apps increment locally inside the range, reducing load on the central allocator. Leaf adds high-availability and optional Snowflake-like modes.',
            },
            {
              question: 'How do you avoid ID collisions across regions?',
              answer:
                'Partition the space: **region bits** in Snowflake, separate counter ranges per region, or UUIDs. Never run two independent auto-increments without offsets/namespaces.',
            },
            {
              question: 'Are Snowflake IDs secure for public URLs?',
              answer:
                'They are **guessable** (sequential within a ms) and reveal timing. Use a separate random public token or encrypt/hash if the ID is exposed.',
            },
            {
              question: 'Design IDs for an order service at 50K writes/s.',
              answer:
                'Snowflake or Leaf ranges: each app instance mints locally. Persist orders with time-sortable IDs for range queries. Keep a random **order token** for customer-facing URLs.',
            },
          ],
        },
      ],
    },
    {
      id: 'summary',
      title: 'Summary',
      blocks: [
        {
          type: 'callout',
          variant: 'summary',
          title: 'Key takeaways',
          body: '1. Auto-increment is simple but a **coordination bottleneck**.\n2. **UUID v4** = no coord, not sortable; **v7** = time-ordered UUIDs.\n3. **Snowflake** = timestamp + worker + sequence at huge QPS.\n4. **Base62 counters** fit short URLs; **tickets/Leaf** batch allocation.\n5. Compare on **sortability, uniqueness, coordination**, and public guessability.',
        },
      ],
    },
  ],
};

export default content;
