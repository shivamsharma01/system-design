import { DesignContent } from '../../../shared/models';
import { CACHE_EVICTION_META } from './cache-eviction.meta';

const content: DesignContent = {
  meta: CACHE_EVICTION_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'Cache memory is finite. An **eviction strategy** decides which entries to drop when the cache is full (or when TTLs expire). Choice depends on access patterns — recency, frequency, age, or randomness.\n\nRelated: [LRU Cache LLD](/designs/lru-cache-lld), [Distributed Cache — eviction policies](/designs/distributed-cache#eviction-policies).',
        },
      ],
    },
    {
      id: 'lru',
      title: '1. Least Recently Used (LRU)',
      blocks: [
        {
          type: 'markdown',
          value:
            'Evict the item that has not been accessed for the longest time. On hit, move the entry to “most recent”; on miss when full, drop the least recent.',
        },
        {
          type: 'image',
          src: 'assets/article-images/cache-eviction/01-lru.png',
          alt: 'LRU cache walkthrough showing recency list and eviction of least recently used item',
          caption:
            'Example capacity 3: after accessing A then adding D, B is evicted. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'prosCons',
          title: 'LRU',
          pros: ['Intuitive default', 'Matches many web/API patterns', 'O(1) with hashmap + DLL'],
          cons: ['Metadata overhead', 'Scan pollution can evict hot keys'],
        },
      ],
    },
    {
      id: 'lfu',
      title: '2. Least Frequently Used (LFU)',
      blocks: [
        {
          type: 'markdown',
          value:
            'Evict the item with the **lowest access count**. Ties often break with LRU/FIFO. Favors stably popular keys over one-hit wonders.',
        },
        {
          type: 'image',
          src: 'assets/article-images/cache-eviction/02-lfu.png',
          alt: 'LFU cache with frequency counts and eviction of lowest-frequency item',
          caption:
            'Frequency counters decide eviction. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'prosCons',
          title: 'LFU',
          pros: ['Keeps true “hot” items', 'Resists scan pollution better than LRU'],
          cons: ['More bookkeeping', 'Can cling to formerly popular keys without decay'],
        },
      ],
    },
    {
      id: 'fifo',
      title: '3. First In, First Out (FIFO)',
      blocks: [
        {
          type: 'markdown',
          value:
            'Evict the **oldest inserted** item, ignoring access frequency. Simple queue; no recency tracking on hits.',
        },
        {
          type: 'image',
          src: 'assets/article-images/cache-eviction/03-fifo.png',
          alt: 'FIFO cache evicting the earliest inserted entry regardless of access',
          caption: 'Insertion order only. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'prosCons',
          title: 'FIFO',
          pros: ['Trivial to implement', 'Predictable'],
          cons: ['May evict still-hot early items', 'Ignores access patterns'],
        },
      ],
    },
    {
      id: 'random',
      title: '4. Random Replacement (RR)',
      blocks: [
        {
          type: 'markdown',
          value:
            'Evict a **random** entry. Surprisingly competitive when access patterns are hard to predict; zero tracking cost.',
        },
        {
          type: 'image',
          src: 'assets/article-images/cache-eviction/04-random.png',
          alt: 'Random replacement picking an arbitrary cache entry to evict',
          caption:
            'No metadata beyond the map. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'prosCons',
          title: 'Random',
          pros: ['Cheap', 'No pathological ordering bugs'],
          cons: ['Can drop hot keys by chance', 'Harder to reason about'],
        },
      ],
    },
    {
      id: 'mru',
      title: '5. Most Recently Used (MRU)',
      blocks: [
        {
          type: 'markdown',
          value:
            'Evict the **most recently** accessed item. Useful when a recent access means “done for now” (e.g. cycling through a large catalog once).',
        },
        {
          type: 'image',
          src: 'assets/article-images/cache-eviction/05-mru.png',
          alt: 'MRU eviction removing the most recently used cache entry',
          caption:
            'Opposite of LRU — niche but valid. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'prosCons',
          title: 'MRU',
          pros: ['Good for sequential one-pass workloads'],
          cons: ['Wrong default for most APIs', 'Evicts what you just touched'],
        },
      ],
    },
    {
      id: 'ttl',
      title: '6. Time-To-Live (TTL)',
      blocks: [
        {
          type: 'markdown',
          value:
            'Entries expire after a configured lifetime, independent of capacity pressure. Often **combined** with LRU/LFU: TTL bounds staleness; size policy bounds memory.',
        },
        {
          type: 'image',
          src: 'assets/article-images/cache-eviction/06-ttl.png',
          alt: 'TTL-based expiration removing cache entries after their lifetime elapses',
          caption:
            'Clock-based eviction / refresh. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'prosCons',
          title: 'TTL',
          pros: ['Bounds staleness', 'Simple operational knob'],
          cons: ['May expire hot data', 'Does not alone solve capacity'],
        },
      ],
    },
    {
      id: 'two-tier',
      title: '7. Two-Tiered Caching',
      blocks: [
        {
          type: 'markdown',
          value:
            '**L1** (local process: Caffeine/Guava) + **L2** (remote: Redis). L1 is tiny and ultra-fast; L2 is shared across instances. Eviction policies can differ per tier.',
        },
        {
          type: 'image',
          src: 'assets/article-images/cache-eviction/07-two-tier.png',
          alt: 'Two-tier cache with local L1 and remote L2 Redis-style store',
          caption: 'Local + remote tiers. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'prosCons',
          title: 'Two-tier',
          pros: [
            'Best of local latency + shared coherence',
            'Shields Redis from duplicate hot keys',
          ],
          cons: ['Invalidation across L1s is harder', 'More moving parts'],
        },
      ],
    },
    {
      id: 'java',
      title: 'Java / Redis Notes',
      blocks: [
        {
          type: 'code',
          language: 'java',
          filename: 'LruLinkedHashMap.java',
          code: `public final class LruCache<K, V> extends LinkedHashMap<K, V> {
  private final int capacity;

  public LruCache(int capacity) {
    super(capacity, 0.75f, true); // access-order
    this.capacity = capacity;
  }

  @Override
  protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
    return size() > capacity;
  }
}`,
        },
        {
          type: 'code',
          language: 'java',
          filename: 'CaffeineExample.java',
          code: `Cache<String, Product> cache = Caffeine.newBuilder()
    .maximumSize(10_000)           // size eviction (W-TinyLFU under the hood)
    .expireAfterWrite(Duration.ofMinutes(5))
    .build();`,
        },
        {
          type: 'markdown',
          value:
            '**Redis `maxmemory-policy`:** `allkeys-lru`, `volatile-lru`, `allkeys-lfu`, `volatile-ttl`, `volatile-random`, `noeviction`, …\n\n**Two-tier:** Guava/Caffeine as L1 + Redis as L2; invalidate L1 on write events (pub/sub or short L1 TTL).',
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
          body: 'Summarized from Ashish Pratap Singh’s AlgoMaster article “7 Cache Eviction Strategies You Should Know,” with Java/Redis notes for this platform.',
        },
      ],
    },
  ],
};

export default content;
