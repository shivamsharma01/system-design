import { DesignContent } from '../../../shared/models';
import { READ_WRITE_THROUGH_CACHE_META } from './read-write-through-cache.meta';

const content: DesignContent = {
  meta: READ_WRITE_THROUGH_CACHE_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'In **Read-Through** and **Write-Through** caching, the **cache sits in front of** the database and owns the coordination logic. **Read-through**: on miss, the cache **loads** from DB via a registered loader and returns to the caller. **Write-through**: every write goes **synchronously** to cache and DB — callers see one simple API. Contrast with **Cache-Aside**, where application code explicitly get/set/invalidate.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Write-through vs write-behind',
          body: '**Write-through** persists to DB **before** returning — consistent but slower. **Write-Behind** returns after cache update and **async flushes** to DB — higher throughput, durability risk. Read-through pairs naturally with write-through for symmetric cache ownership.',
        },
        {
          type: 'table',
          caption: 'Pattern responsibilities.',
          headers: ['Pattern', 'Who loads on miss?', 'Write path'],
          rows: [
            ['Cache-aside', 'Application code', 'App writes DB, invalidates cache'],
            ['Read-through', 'Cache library loader', 'N/A (read only)'],
            ['Write-through', 'Cache (on read-through stack)', 'Cache writes DB synchronously'],
            ['Write-behind', 'Cache', 'Cache queues async DB write'],
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
          body: 'A **hotel concierge desk** (cache) that always checks the **master reservation system** (database): if your room is not on the desk list, the concierge fetches it (**read-through**). When you extend your stay, the concierge updates both the desk clipboard and the master system **before** confirming (**write-through**).',
        },
        {
          type: 'mermaid',
          caption: 'Cache mediates all reads and synchronous writes.',
          definition: `sequenceDiagram
  participant App
  participant Cache
  participant DB

  App->>Cache: get(key)
  alt hit
    Cache-->>App: value
  else miss — read-through
    Cache->>DB: load(key)
    DB-->>Cache: row
    Cache-->>App: value
  end

  App->>Cache: put(key, value)
  Note over Cache,DB: write-through
  Cache->>DB: INSERT/UPDATE
  DB-->>Cache: ack
  Cache-->>App: success`,
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
            ['E-commerce pricing service', 'Hazelcast read-through loader pulls tariff rows; write-through on admin price edit'],
            ['CDN edge KV', 'Some edge caches read-through to origin on miss with short TTL'],
            ['Session store', 'Redis with read-through hydration from Postgres on session miss'],
            ['Food delivery geo-fences', 'LoadingCache read-through for zone polygons; write-through on boundary update'],
            ['API rate metadata', 'Cache read-through for tenant config; write-through when billing tier changes'],
            ['Reference data APIs', 'Country/currency lists loaded through cache — always warm after first access'],
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
            'Use **LoadingCache** (Caffeine, Guava) or Redis modules that support loaders. Write-through must handle **DB failure** — roll back cache entry or mark dirty. Combine read-through with **TTL and size bounds**. If writes are bursty and latency-sensitive, compare **Write-Behind** instead of write-through; if you want full app control, stay with **Cache-Aside**.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'ReadWriteThroughCache.java',
          code: `public class TariffCacheService {
  private final LoadingCache<String, Tariff> cache;
  private final TariffRepository db;

  public TariffCacheService(TariffRepository db) {
    this.db = db;
    this.cache = Caffeine.newBuilder()
        .maximumSize(10_000)
        .expireAfterWrite(Duration.ofMinutes(10))
        .build(this::loadFromDb); // read-through loader
  }

  private Tariff loadFromDb(String sku) {
    return db.findBySku(sku).orElseThrow(() -> new NotFoundException(sku));
  }

  public Tariff get(String sku) {
    return cache.get(sku); // miss triggers loadFromDb automatically
  }

  public void save(Tariff tariff) {
    db.save(tariff);           // write-through: DB first
    cache.put(tariff.sku(), tariff); // then cache stays in sync
  }

  public void delete(String sku) {
    db.delete(sku);
    cache.invalidate(sku);
  }
}`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Write-through latency',
          body: 'Every write waits on **DB fsync** — fine for admin updates, painful for high-frequency counters. For hot write paths use **Cache-Aside** with async invalidation or **Write-Behind** with accepted durability window.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Clean caller API — no manual cache get/set scattered in code.',
            'Write-through keeps cache and DB **strongly aligned** on success.',
            'Read-through centralizes loader logic and stampede control.',
          ],
          cons: [
            'Tighter coupling to cache provider features.',
            'Write-through adds latency on every mutation.',
            'Harder to bypass cache when debugging — all traffic flows through layer.',
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
              question: 'What is read-through caching?',
              answer:
                'Cache **automatically loads** from DB on miss via a registered loader function. Application calls `cache.get(key)` only — no explicit miss handling.',
            },
            {
              question: 'What is write-through caching?',
              answer:
                'Write goes to **cache and DB synchronously** before ack. Cache and store stay consistent; write latency includes DB time.',
            },
            {
              question: 'Read-through vs cache-aside?',
              answer:
                '**Cache-aside**: app checks cache, on miss queries DB, app sets cache. **Read-through**: cache invokes loader — less app boilerplate, more provider lock-in.',
            },
            {
              question: 'Write-through vs write-behind?',
              answer:
                '**Write-through**: sync DB write — durable, slower. **Write-behind**: async flush — fast, may lose data on crash. See **Write-Behind Cache** for batching and recovery.',
            },
            {
              question: 'When would you avoid write-through?',
              answer:
                'High-frequency writes (view counters, click streams), strict **low-latency write** SLOs, or when DB is the bottleneck — use cache-aside invalidation or write-behind with risk acceptance.',
            },
            {
              question: 'Design reference data API with Caffeine.',
              answer:
                'LoadingCache with read-through from Postgres, 10k max entries, 10m TTL. Admin mutations use write-through save(). CDN caches HTTP GET separately with shorter TTL.',
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
          body: '1. Read-through = cache **loads on miss**; write-through = **sync dual write**.\n2. Simpler app code vs **Cache-Aside** manual orchestration.\n3. Write-through trades **latency for consistency** — compare **Write-Behind** for speed.\n4. Real uses: **LoadingCache**, Redis loaders, reference data and pricing services.',
        },
      ],
    },
  ],
};

export default content;
