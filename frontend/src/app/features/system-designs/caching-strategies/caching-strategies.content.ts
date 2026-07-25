import { DesignContent } from '../../../shared/models';
import { CACHING_STRATEGIES_META } from './caching-strategies.meta';

const content: DesignContent = {
  meta: CACHING_STRATEGIES_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'Caching cuts latency and DB load, but **who reads/writes the cache** changes consistency and complexity. These five strategies show up constantly in interviews and production.\n\nDeep dives: [Cache-Aside](/designs/cache-aside), [Read/Write-Through](/designs/read-write-through-cache), [Write-Behind](/designs/write-behind-cache), [Distributed Cache](/designs/distributed-cache).',
        },
      ],
    },
    {
      id: 'read-through',
      title: '1. Read-Through',
      blocks: [
        {
          type: 'markdown',
          value:
            'The cache sits between the app and the DB. On a **miss**, the **cache** loads from the DB, stores the value, and returns it. The app never talks to the DB for reads.',
        },
        {
          type: 'image',
          src: 'assets/article-images/caching-strategies/01-read-through.png',
          alt: 'Read-through caching: application talks to cache; cache loads database on miss',
          caption:
            'Cache owns the miss path. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'prosCons',
          title: 'Read-Through',
          pros: [
            'App logic stays simple — no populate-on-miss code',
            'Great for read-heavy, rarely changing data',
          ],
          cons: [
            'First miss pays DB latency inside the cache layer',
            'Needs TTL (or invalidation) to limit staleness',
          ],
        },
      ],
    },
    {
      id: 'cache-aside',
      title: '2. Cache-Aside (Lazy Load)',
      blocks: [
        {
          type: 'markdown',
          value:
            'The **application** checks the cache; on miss it reads the DB and **populates** the cache. On writes, the app updates the DB and typically **invalidates** (or updates) the cache key.',
        },
        {
          type: 'image',
          src: 'assets/article-images/caching-strategies/02-cache-aside.png',
          alt: 'Cache-aside: application reads cache, loads DB on miss, and writes back to cache',
          caption:
            'App owns load and populate. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Most common default',
          body: 'Flexible and explicit. See the full pattern page: [Cache-Aside](/designs/cache-aside).',
        },
      ],
    },
    {
      id: 'write-through',
      title: '3. Write-Through',
      blocks: [
        {
          type: 'markdown',
          value:
            'Every write goes to the **cache and DB synchronously**. Cache stays consistent with the store; write latency is higher.',
        },
        {
          type: 'image',
          src: 'assets/article-images/caching-strategies/03-write-through.png',
          alt: 'Write-through: application write updates cache and database together',
          caption:
            'Sync write to cache + DB. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'prosCons',
          title: 'Write-Through',
          pros: ['Cache rarely stale on successful writes', 'Simple mental model'],
          cons: ['Slower writes', 'May cache data that is never read again'],
        },
      ],
    },
    {
      id: 'write-around',
      title: '4. Write-Around',
      blocks: [
        {
          type: 'markdown',
          value:
            'Writes go **only to the DB**. The cache is populated on a later **read** (often via cache-aside / read-through). Avoids polluting the cache with write-once data.',
        },
        {
          type: 'image',
          src: 'assets/article-images/caching-strategies/04-write-around.png',
          alt: 'Write-around: writes bypass cache to the database; cache filled on subsequent reads',
          caption:
            'Write DB only; cache on later read. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'prosCons',
          title: 'Write-Around',
          pros: ['Keeps cache focused on hot reads', 'Good for write-heavy, rarely re-read data'],
          cons: ['First post-write read is always a miss', 'Temporary inconsistency until refill'],
        },
      ],
    },
    {
      id: 'write-back',
      title: '5. Write-Back (Write-Behind)',
      blocks: [
        {
          type: 'markdown',
          value:
            'Writes hit the **cache first** and return quickly; the cache **asynchronously** flushes to the DB. Fastest writes; risk of loss if the cache dies before flush — mitigate with AOF/replication (e.g. Redis).',
        },
        {
          type: 'image',
          src: 'assets/article-images/caching-strategies/05-write-back.png',
          alt: 'Write-back: application writes to cache; cache asynchronously flushes to database',
          caption:
            'Async flush from cache to DB. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Durability trade-off',
          body: 'Prefer write-back for metrics, sessions, or workloads that tolerate bounded loss — not for money movement. See [Write-Behind Cache](/designs/write-behind-cache).',
        },
      ],
    },
    {
      id: 'comparison',
      title: 'Comparison',
      blocks: [
        {
          type: 'image',
          src: 'assets/article-images/caching-strategies/06-comparison-table.png',
          alt: 'Comparison table of five caching strategies across consistency, write latency, and use cases',
          caption:
            'Side-by-side trade-offs. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'featureComparison',
          caption: 'Quick pick guide.',
          columns: ['Read-Through', 'Cache-Aside', 'Write-Through', 'Write-Around', 'Write-Back'],
          rows: [
            {
              feature: 'Who loads on miss',
              values: ['Cache', 'App', 'Cache/App', 'App (on read)', 'Cache'],
            },
            {
              feature: 'Write path',
              values: [
                'Varies',
                'DB + invalidate',
                'Cache+DB sync',
                'DB only',
                'Cache then async DB',
              ],
            },
            {
              feature: 'Write latency',
              values: ['N/A', 'DB', 'Higher', 'DB', 'Lowest'],
            },
            {
              feature: 'Staleness risk',
              values: ['TTL', 'Invalidate timing', 'Low', 'Until next read', 'Until flush'],
            },
          ],
        },
      ],
    },
    {
      id: 'java-spring',
      title: 'Java / Spring Notes',
      blocks: [
        {
          type: 'code',
          language: 'java',
          filename: 'SpringCacheAside.java',
          code: `// Cache-aside style via Spring Cache
@Cacheable(cacheNames = "products", key = "#id")
public Product get(long id) {
  return repo.findById(id).orElseThrow();
}

@CachePut(cacheNames = "products", key = "#p.id")
public Product save(Product p) {
  return repo.save(p);
}

@CacheEvict(cacheNames = "products", key = "#id")
public void delete(long id) {
  repo.deleteById(id);
}`,
        },
        {
          type: 'markdown',
          value:
            '- **Caffeine / Redis** as `CacheManager` backends.\n- **Write-back**: update local/Redis immediately, publish to a queue / `@Async` listener that persists to the DB.\n- **Read-through**: libraries like Hibernate L2 or some Redis clients can own the miss path; most Spring apps still use cache-aside annotations.',
        },
      ],
    },
    {
      id: 'source',
      title: 'Source',
      blocks: [
        {
          type: 'callout',
          variant: 'note',
          title: 'Source',
          body: 'Summarized from Ashish Pratap Singh’s AlgoMaster article “Top 5 Caching Strategies Explained,” with Java/Spring notes for this platform.',
        },
      ],
    },
  ],
};

export default content;
