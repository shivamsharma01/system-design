import { DesignContent } from '../../../shared/models';
import { BACK_OF_ENVELOPE_META } from './back-of-envelope.meta';

const content: DesignContent = {
  meta: BACK_OF_ENVELOPE_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Back-of-envelope estimation** turns vague scale (“millions of users”) into **QPS, storage, and bandwidth** numbers you can design against. Interviewers care less about perfect accuracy and more that you **state assumptions**, use **powers of two**, round to **nice numbers**, and apply a **peak = 2–5× average** multiplier. These estimates drive sharding, caching, and whether a single database is even plausible.',
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Interview rhythm',
          body: '1) Clarify DAU / write vs read ratio. 2) Convert to **avg QPS**, then **peak**. 3) Estimate **storage** growth per year. 4) Check **bandwidth** for media. 5) Say what the numbers imply (“~5K QPS → one Redis shard is fine; 500K QPS → fan-out design”).',
        },
        {
          type: 'table',
          caption: 'Powers of 2 every engineer should know.',
          headers: ['Power', 'Approx value', 'Handy for'],
          rows: [
            ['2¹⁰', '≈ 10³ (1 thousand)', 'Quick “thousand” swaps'],
            ['2²⁰', '≈ 10⁶ (1 million)', '1 MiB ≈ 10⁶ bytes'],
            ['2³⁰', '≈ 10⁹ (1 billion)', '1 GiB'],
            ['2⁴⁰', '≈ 10¹² (1 trillion)', '1 TiB'],
            ['Day seconds', '≈ 10⁵ (86400)', 'QPS = daily ops / 10⁵'],
          ],
        },
      ],
    },
    {
      id: 'latency-numbers',
      title: 'Latency numbers to know',
      blocks: [
        {
          type: 'table',
          caption: 'Order-of-magnitude latencies (approximate).',
          headers: ['Operation', 'Latency', 'Implication'],
          rows: [
            ['L1 cache reference', '~1 ns', 'CPU-local'],
            ['L2 cache reference', '~4 ns', 'Still in-core'],
            ['Mutex lock/unlock', '~25 ns', ''],
            ['Main memory reference', '~100 ns', 'RAM is ~100× L1'],
            ['Compress 1 KB with Zippy', '~2 µs', ''],
            ['Send 2 KB over 1 Gbps network', '~20 µs', ''],
            ['SSD random read', '~16–150 µs', 'Orders faster than disk'],
            ['Round trip same datacenter', '~0.5 ms', 'Intra-DC RTT'],
            ['Disk seek (HDD)', '~10 ms', 'Avoid random HDD I/O'],
            ['Round trip CA → Netherlands', '~150 ms', 'WAN dominates'],
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Use latencies as intuition, not trivia',
          body: 'If each request does **10 sequential disk seeks**, you are already at ~100 ms before business logic. Prefer **batching**, **sequential I/O**, **SSD**, or **cache**. Cross-region sync will never feel like a local Redis `GET`.',
        },
      ],
    },
    {
      id: 'formulas',
      title: 'Core formulas',
      blocks: [
        {
          type: 'markdown',
          value:
            '**QPS from DAU**\n\n- Daily actions ≈ `DAU × actions_per_user_per_day`\n- Average QPS ≈ `daily_actions / 86_400` ≈ `daily_actions / 10⁵`\n- Peak QPS ≈ `avg × 2..5` (sometimes higher for flash sales)\n\n**Storage**\n\n- `rows × bytes_per_row × replication_factor` (+ indexes ≈ +20–50%)\n- Growth: multiply by years retained or daily write rate × retention\n\n**Bandwidth**\n\n- `concurrent_users × bitrate` (video/audio)\n- Or `QPS × response_size` for APIs\n\n**Connections (chat)**\n\n- Concurrent ≈ `DAU × fraction_online` — drives gateway fan-out and sticky sessions.',
        },
        {
          type: 'mermaid',
          caption: 'Estimation flow in an interview.',
          definition: `flowchart LR
  A[DAU / RPS ask] --> B[Avg QPS]
  B --> C[Peak QPS]
  C --> D[Shards / caches]
  A --> E[Bytes per write]
  E --> F[Storage / year]
  A --> G[Payload size]
  G --> H[Bandwidth]`,
        },
      ],
    },
    {
      id: 'worked-examples',
      title: 'Worked mini examples',
      blocks: [
        {
          type: 'markdown',
          value:
            '**1) URL shortener — write QPS**\n\nAssume **100M DAU**, each creates **0.1** short links/day → **10M writes/day**.\n\nAvg write QPS ≈ `10⁷ / 10⁵` = **100 QPS**. Peak ≈ **300–500 QPS**. Reads often **10–100×** writes → design for **1K–10K read QPS** with caching.\n\nStorage: 10M new rows/day × ~100 B ≈ **1 GB/day** raw ≈ **~365 GB/year** before indexes/replicas.\n\n**2) Chat — concurrent connections**\n\n**50M DAU**, **10%** online at peak → **5M** concurrent WebSockets. If each gateway holds **500K** connections → **≥ 10** gateway machines (plus headroom). Message fan-out for group chat dominates CPU/bandwidth more than raw connection count.\n\n**3) Video bitrate**\n\n**1M** concurrent HD streams at **5 Mbps** → `10⁶ × 5×10⁶` = **5 Tbps** egress — CDN is mandatory, origin alone cannot serve it.',
        },
        {
          type: 'table',
          caption: 'Quick sanity checks.',
          headers: ['If you get…', 'Ask yourself…'],
          rows: [
            ['Avg QPS > 100K from modest DAU', 'Did you forget /86400?'],
            ['Storage < 1 GB/year at huge write rate', 'Bytes per row too small?'],
            ['Single DB handles 50K write QPS', 'Unrealistic without sharding/batching'],
            ['Peak = avg', 'Forgot traffic spikes?'],
          ],
        },
      ],
    },
    {
      id: 'tips',
      title: 'Estimation tips',
      blocks: [
        {
          type: 'callout',
          variant: 'warning',
          title: 'Common pitfalls',
          body: 'Silent assumptions (“everyone online 24/7”), mixing **MB vs MiB**, ignoring **replication** and **indexes**, and optimizing microservices before proving **one Postgres** cannot hold the write rate.',
        },
        {
          type: 'markdown',
          value:
            '- **State assumptions out loud** (“assuming 5 reads per write”).\n- **Round aggressively**: 86,400 → 10⁵; 2.7K QPS → ~3K.\n- **Peak = 2–5× avg** unless the prompt gives a spike profile.\n- Separate **read QPS** and **write QPS** — caches change reads, not durable writes.\n- Translate numbers into **architecture decisions**, not just arithmetic.',
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
              question: 'How do you convert DAU to QPS?',
              answer:
                'Estimate actions per user per day, multiply by DAU for daily volume, divide by **~86,400** (≈10⁵) for average QPS, then multiply by **2–5×** for peak.',
            },
            {
              question: 'Why memorize latency numbers?',
              answer:
                'They tell you what is **impossible** in a request path (e.g. many HDD seeks, cross-Atlantic sync) and justify caches, batching, and async design.',
            },
            {
              question: 'Estimate storage for a Twitter-like timeline.',
              answer:
                'Tweets/day × average size × retention × replicas. Example: 500M tweets/day × 300 B ≈ 150 GB/day ≈ **~55 TB/year** raw; indexes and media metadata add more; media blobs dominate separately.',
            },
            {
              question: 'What is a “nice number” strategy?',
              answer:
                'Prefer **10, 100, 1K, 1M** scales so mental math stays accurate. Interviewers expect order-of-magnitude correctness, not three decimal places.',
            },
            {
              question: 'How many machines for 100K QPS?',
              answer:
                'Depends on work per request. If one app instance does **2K QPS**, need **~50** instances at avg, **100–250** at peak, plus DB/cache tiers sized on their own QPS and connections.',
            },
            {
              question: 'Bandwidth vs QPS?',
              answer:
                'QPS counts requests; bandwidth is `QPS × payload` or `users × bitrate`. A low-QPS video product can still need **Tbps** egress.',
            },
            {
              question: 'Give URL shortener read/write estimate.',
              answer:
                'Writes often hundreds of QPS; reads **orders of magnitude higher**. Cache hot redirects in CDN/edge so origin read QPS collapses.',
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
          body: '1. Know **powers of 2** and rough **latency** orders.\n2. **QPS ≈ daily_ops / 10⁵**; **peak ≈ 2–5× avg**.\n3. Storage = **rows × size × RF**; bandwidth = **users × bitrate** or **QPS × size**.\n4. Work examples: URL shortener QPS, chat connections, video egress.\n5. State assumptions, round nicely, turn numbers into design choices.',
        },
      ],
    },
  ],
};

export default content;
