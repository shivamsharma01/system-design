import { DesignContent } from '../../../shared/models';
import { WRITE_BEHIND_CACHE_META } from './write-behind-cache.meta';

const content: DesignContent = {
  meta: WRITE_BEHIND_CACHE_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Write-Behind** (write-back) acknowledges writes to the **cache immediately** and **asynchronously flushes** to the database in batches. Reads still hit cache first (often paired with **read-through**). This maximizes write throughput and hides DB latency — at the cost of a **durability window** where data exists only in cache until flush completes.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Where it sits in the cache family',
          body: '**Cache-Aside**: app invalidates after DB write — strongest app control. **Write-Through**: sync cache + DB on every write — strongest consistency. **Write-Behind**: fastest writes, explicit **durability trade-off**. Pick write-behind only when you can tolerate loss or replay on cache failure.',
        },
        {
          type: 'table',
          caption: 'Durability spectrum.',
          headers: ['Pattern', 'Write latency', 'Durability on crash'],
          rows: [
            ['Write-through', 'High (waits on DB)', 'Strong — both updated'],
            ['Cache-aside + sync DB', 'High', 'Strong after DB commit'],
            ['Write-behind', 'Low (cache only)', 'Weak until flush — may lose in-flight writes'],
            ['Write-behind + WAL', 'Medium', 'Recoverable if journal replay works'],
          ],
        },
      ],
    },
    {
      id: 'concept',
      title: 'Concept and analogy',
      blocks: [
        {
          type: 'callout',
          variant: 'tip',
          title: 'Real-world analogy',
          body: 'A **restaurant order pad**: the server writes your order on the pad and says “got it!” immediately (**cache ack**). The kitchen ticket prints in batch every few minutes (**async flush**). If the pad is lost before batching, orders vanish — you need a **duplicate pad** (WAL/replication) for safety.',
        },
        {
          type: 'mermaid',
          caption: 'Write returns after cache; flusher persists in background.',
          definition: `sequenceDiagram
  participant App
  participant Cache
  participant Flusher
  participant DB

  App->>Cache: write(key, value)
  Cache-->>App: 200 OK (immediate)
  Cache->>Flusher: enqueue dirty entry
  Note over Flusher: batch every N ms or M entries
  Flusher->>DB: bulk UPSERT
  DB-->>Flusher: ack
  Flusher->>Cache: mark clean

  Note over Cache,DB: crash before flush → data loss risk`,
        },
      ],
    },
    {
      id: 'where-used',
      title: 'Where it is used',
      blocks: [
        {
          type: 'table',
          headers: ['Domain', 'Example'],
          rows: [
            ['E-commerce view counters', 'Increment in Redis; flush aggregated counts to analytics DB every 30s'],
            ['Food delivery driver GPS pings', 'Write-behind location cache; batch insert trajectory to time-series store'],
            ['Social like counts', 'Hot counters in cache; periodic merge to Postgres — acceptable slight loss'],
            ['CDN edge logs', 'Buffer impressions at edge; async ship to object storage'],
            ['Session activity timestamps', 'Update last_seen in cache; flush idle sessions on interval'],
            ['Gaming leaderboards', 'Fast score updates in Redis sorted sets; snapshot to DB for durability'],
          ],
        },
      ],
    },
    {
      id: 'implementation',
      title: 'Implementation',
      blocks: [
        {
          type: 'markdown',
          value:
            'Track **dirty keys** in a queue or ring buffer. Flush on **interval**, **batch size**, or **shutdown hook**. Use **idempotent UPSERT** so retries are safe. Mitigate loss with **Redis AOF**, cross-AZ replication, or a **write-ahead log** before ack. Never use write-behind for **financial balances** without strong recovery — prefer **Write-Through** or **Cache-Aside** there. For read path, combine with **read-through** loaders or **cache-aside** invalidation on rare admin corrections.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'WriteBehindCounterService.java',
          code: `public class WriteBehindCounterService {
  private final RedisTemplate<String, String> redis;
  private final JdbcTemplate db;
  private final BlockingQueue<String> dirtyKeys = new LinkedBlockingQueue<>();
  private final ScheduledExecutorService flusher = Executors.newSingleThreadScheduledExecutor();

  public WriteBehindCounterService(RedisTemplate<String, String> redis, JdbcTemplate db) {
    this.redis = redis;
    this.db = db;
    flusher.scheduleAtFixedRate(this::flushBatch, 5, 5, TimeUnit.SECONDS);
  }

  public void incrementViewCount(long productId) {
    String key = "views:" + productId;
    redis.opsForValue().increment(key);
    dirtyKeys.offer(key); // ack to caller — DB write deferred
  }

  private void flushBatch() {
    Set<String> batch = new HashSet<>();
    dirtyKeys.drainTo(batch, 500);
    for (String key : batch) {
      long id = Long.parseLong(key.substring("views:".length()));
      String val = redis.opsForValue().get(key);
      if (val == null) continue;
      db.update(
          "INSERT INTO product_views (product_id, views) VALUES (?, ?) "
              + "ON CONFLICT (product_id) DO UPDATE SET views = EXCLUDED.views",
          id, Long.parseLong(val));
    }
  }
}`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Durability is a product decision',
          body: 'Losing **30 seconds of view counts** may be acceptable; losing **cart checkout state** is not. Document RPO/RTO. On cache failure, have a **recovery path** — replay WAL, rebuild from DB, or degrade feature.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Very low write latency — callers not blocked on DB.',
            'Batching reduces DB write amplification and cost.',
            'Smooths spikes — absorbs flash traffic in cache layer.',
          ],
          cons: [
            'Data loss window if cache dies before flush.',
            'Complex failure modes — ordering, duplicates, partial batches.',
            'Harder reasoning for read-your-writes across regions.',
          ],
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
              question: 'What is write-behind caching?',
              answer:
                'Write updates **cache first** and returns immediately; a **background flusher** persists to DB asynchronously — often in batches. Also called **write-back**.',
            },
            {
              question: 'Write-behind vs write-through?',
              answer:
                '**Write-through**: sync DB write — consistent, slow. **Write-behind**: async — fast, **durability gap** until flush. Use write-through for money; write-behind for metrics and telemetry.',
            },
            {
              question: 'Write-behind vs cache-aside?',
              answer:
                '**Cache-aside** writes **DB first**, then invalidates cache — durable. **Write-behind** writes **cache first** — optimized for write-heavy, loss-tolerant data.',
            },
            {
              question: 'How do you reduce data loss risk?',
              answer:
                'Redis **AOF + replication**, **WAL** before client ack, smaller flush intervals, graceful **shutdown flush**, idempotent DB merges, and avoiding write-behind for critical entities.',
            },
            {
              question: 'What happens on duplicate flush?',
              answer:
                'Design **idempotent** DB writes — UPSERT, additive counters, or version checks. Flusher retries must not double-apply business logic.',
            },
            {
              question: 'Design product view counter at scale.',
              answer:
                'Increment in **Redis** (write-behind), flush aggregated counts every 30s via UPSERT. **CDN** serves static PDP; counter loss of one interval is OK. Admin inventory still uses **cache-aside** with sync DB.',
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
          body: '1. Write-behind = **fast cache ack** + **async DB flush** — throughput over durability.\n2. Contrast **Cache-Aside** (app invalidates) and **Write-Through** (sync dual write).\n3. Mitigate loss with **WAL, replication, batch tuning**, and idempotent flushes.\n4. Real uses: **view counters**, GPS pings, CDN logs — not payment balances.',
        },
      ],
    },
  ],
};

export default content;
