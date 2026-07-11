import { DesignContent } from '../../../shared/models';
import { LRU_CACHE_LLD_META } from './lru-cache-lld.meta';

/**
 * LRU Cache — the classic O(1) get/put coding + LLD crossover problem.
 */
const content: DesignContent = {
  meta: LRU_CACHE_LLD_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'An **LRU (Least Recently Used) Cache** is a fixed-capacity key-value store that evicts the **least recently accessed** entry when it runs out of room. Every access (`get` or `put`) "refreshes" an entry, moving it to the "most recently used" end. When capacity is exceeded, the entry at the "least recently used" end is discarded.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Why interviewers love it',
          body: 'It tests **data structure composition** (HashMap for O(1) lookup + doubly linked list for O(1) reordering), **API design** (what should `get`/`put` return on miss/overflow?), and **concurrency reasoning** — all in ~30 minutes. It shows up both as a **coding round** (LeetCode 146) and as a **class-design** round (design a generic, thread-safe, pluggable-eviction cache service).',
        },
        {
          type: 'table',
          caption: 'LRU Cache at a glance.',
          headers: ['Operation', 'Target complexity', 'Data structure responsible'],
          rows: [
            ['get(key)', 'O(1)', 'HashMap for lookup + list node move-to-front'],
            ['put(key, value)', 'O(1)', 'HashMap insert/update + list insert/evict'],
            ['evict()', 'O(1)', 'Remove tail node of doubly linked list'],
            ['Space', 'O(capacity)', 'One HashMap entry + one list node per key'],
          ],
        },
      ],
    },
    {
      id: 'clarifying-questions',
      title: 'Clarifying Questions',
      blocks: [
        {
          type: 'markdown',
          value:
            'Before coding, pin down the contract. Interviewers reward candidates who ask before assuming.',
        },
        {
          type: 'table',
          headers: ['Question', 'Why it matters'],
          rows: [
            [
              'What should `get(key)` return on a miss?',
              '`-1` (LeetCode convention), `null`, or `Optional<V>` — changes the API and generics.',
            ],
            [
              'Does `put` on an existing key update the value **and** refresh recency?',
              'Yes in the standard definition — a re-`put` counts as a "use".',
            ],
            [
              'Fixed capacity at construction, or resizable at runtime?',
              'Resizing down means you may need to evict multiple entries at once.',
            ],
            [
              'Is the cache accessed by multiple threads?',
              'Determines whether you need a lock, a `ConcurrentHashMap`, or per-segment locking.',
            ],
            [
              'Do entries need a TTL (time-to-live) in addition to LRU?',
              'Adds an expiry check alongside eviction — a common extension.',
            ],
            [
              'Should we support a callback/listener on eviction?',
              'Useful if evicted entries must be flushed to a backing store (write-back cache).',
            ],
            [
              'Key/value types — generic `<K, V>` or fixed to `int`?',
              'LeetCode fixes to `int`; real systems want a generic, reusable cache.',
            ],
          ],
        },
      ],
    },
    {
      id: 'requirements',
      title: 'Requirements',
      blocks: [
        {
          type: 'heading',
          level: 3,
          text: 'Functional requirements',
        },
        {
          type: 'markdown',
          value:
            '- `get(key)` returns the value if present (and marks it most-recently-used), else a sentinel/miss indicator.\n- `put(key, value)` inserts or updates a key, marks it most-recently-used, and evicts the least-recently-used entry if the cache is over capacity.\n- Capacity is fixed and provided at construction time.\n- All operations run in **O(1)** average time.',
        },
        {
          type: 'heading',
          level: 3,
          text: 'Non-functional requirements',
        },
        {
          type: 'markdown',
          value:
            '- **Thread safety** — safe concurrent `get`/`put` from multiple threads without corrupting the linked list.\n- **Low memory overhead** — one map entry + one list node per cached item, no extra copies.\n- **Extensibility** — pluggable eviction policy (LRU today, LFU tomorrow) without rewriting the public API.\n- **Predictable latency** — no O(n) scans, ever, even under eviction pressure.',
        },
        {
          type: 'prosCons',
          title: 'API design decision: generic reusable cache vs. LeetCode-style int cache',
          pros: [
            'Generic `Cache<K, V>` interface is reusable across services (session cache, DB row cache, image cache).',
            'Interface-first design lets you swap LRU for LFU or a TTL cache behind the same contract.',
          ],
          cons: [
            'Generics add boilerplate that is unnecessary if the interviewer only wants the coding-round `int` version.',
            'Always ask which flavor is expected — do not over-engineer a 20-minute coding question.',
          ],
        },
      ],
    },
    {
      id: 'entities',
      title: 'Core Entities',
      blocks: [
        {
          type: 'markdown',
          value:
            'Two building blocks are enough: a **Node** (doubly linked list element) and the **LRUCache** itself, which owns both the node list and the lookup map.',
        },
        {
          type: 'table',
          caption: 'Entity responsibilities.',
          headers: ['Entity', 'Fields', 'Responsibility'],
          rows: [
            [
              'Node<K, V>',
              'key, value, prev, next',
              'One doubly linked list element; the map value points directly at it for O(1) access.',
            ],
            [
              'LRUCache<K, V>',
              'capacity, map (K → Node), head (dummy), tail (dummy)',
              'Orchestrates lookups and recency ordering; the only public-facing class.',
            ],
            [
              'EvictionPolicy (optional)',
              'strategy interface',
              'Abstracts "which node to evict next" so LRU/LFU/FIFO can share the same cache shell.',
            ],
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Sentinel head/tail nodes',
          body: 'Using **dummy head and tail nodes** (instead of nullable `head`/`tail` references) removes almost every null-check from insert/remove code — a small trick that make interview code noticeably cleaner.',
        },
      ],
    },
    {
      id: 'class-design',
      title: 'Class Design',
      blocks: [
        {
          type: 'mermaid',
          caption: 'HashMap gives O(1) lookup; the doubly linked list gives O(1) reordering and eviction.',
          definition: `classDiagram
  class Node {
    +K key
    +V value
    Node prev
    Node next
  }
  class LRUCache {
    -int capacity
    -Map cache
    -Node head
    -Node tail
    +get(key) V
    +put(key, value) void
    -moveToFront(node) void
    -addToFront(node) void
    -removeNode(node) void
    -evictLeastRecentlyUsed() void
  }
  class EvictionPolicy {
    <<interface>>
    +onAccess(node) void
    +onInsert(node) void
    +victim() Node
  }
  class LfuEvictionPolicy
  class LruEvictionPolicy
  LRUCache "1" o-- "many" Node : caches
  Node --> Node : prev / next
  EvictionPolicy <|.. LruEvictionPolicy
  EvictionPolicy <|.. LfuEvictionPolicy
  LRUCache ..> EvictionPolicy : delegates (extension)`,
        },
        {
          type: 'markdown',
          value:
            '- **`cache`** maps each key directly to its `Node`, so `get` never walks the list.\n- **`head`** is the most-recently-used side; **`tail`** is the least-recently-used side (or reverse it — just be consistent).\n- The `EvictionPolicy` interface is **optional** for a pure LRU ask, but showing it demonstrates you can generalize the design — a strong signal in senior LLD rounds (see [Patterns](#patterns)).',
        },
      ],
    },
    {
      id: 'flows',
      title: 'Key Flows',
      blocks: [
        {
          type: 'markdown',
          value: '**`get(key)` flow** — hit moves the node to the front; miss returns immediately.',
        },
        {
          type: 'mermaid',
          caption: 'get(key)',
          definition: `sequenceDiagram
  participant C as Caller
  participant Cache as LRUCache
  participant Map as HashMap
  participant L as Linked List
  C->>Cache: get(key)
  Cache->>Map: lookup(key)
  alt miss
    Map-->>Cache: null
    Cache-->>C: MISS (-1 / null)
  else hit
    Map-->>Cache: node
    Cache->>L: removeNode(node)
    Cache->>L: addToFront(node)
    Cache-->>C: node.value
  end`,
        },
        {
          type: 'markdown',
          value: '**`put(key, value)` flow** — update-in-place if the key exists, otherwise insert and evict if over capacity.',
        },
        {
          type: 'mermaid',
          caption: 'put(key, value)',
          definition: `sequenceDiagram
  participant C as Caller
  participant Cache as LRUCache
  participant Map as HashMap
  participant L as Linked List
  C->>Cache: put(key, value)
  Cache->>Map: lookup(key)
  alt key exists
    Map-->>Cache: node
    Cache->>node: node.value = value
    Cache->>L: removeNode(node)
    Cache->>L: addToFront(node)
  else key is new
    Cache->>Cache: node = new Node(key, value)
    Cache->>Map: put(key, node)
    Cache->>L: addToFront(node)
    alt size > capacity
      Cache->>L: lru = tail.prev
      Cache->>L: removeNode(lru)
      Cache->>Map: remove(lru.key)
    end
  end`,
        },
      ],
    },
    {
      id: 'patterns',
      title: 'Design Patterns Applied',
      blocks: [
        {
          type: 'table',
          headers: ['Pattern', 'Where it shows up'],
          rows: [
            [
              'Strategy',
              'Extract eviction decision (`EvictionPolicy`) so LRU / LFU / FIFO plug into the same `Cache` shell.',
            ],
            [
              'Facade',
              '`LRUCache` hides the HashMap + linked-list wiring behind two simple methods, `get`/`put`.',
            ],
            [
              'Decorator (extension)',
              'Wrap a cache with a `TtlCacheDecorator` or `MetricsCacheDecorator` without touching core eviction logic.',
            ],
            [
              'Template Method (JDK)',
              '`LinkedHashMap.removeEldestEntry()` is a hook method you override — the JDK\'s own take on pluggable eviction.',
            ],
          ],
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Interviewers ask "which pattern is this?"',
          body: 'The honest answer: a plain LRU cache is mostly **data structure composition**, not a GoF pattern. The Strategy angle only appears once you generalize to *pluggable* eviction — mention it, but do not force it into a from-scratch implementation.',
        },
      ],
    },
    {
      id: 'implementation',
      title: 'Implementation (Java)',
      blocks: [
        {
          type: 'markdown',
          value: '**From-scratch, generic, doubly linked list implementation** — the version interviewers expect you to write on a whiteboard or in a coding round.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'LRUCache.java',
          code: `import java.util.HashMap;
import java.util.Map;

public class LRUCache<K, V> {

  /** Intrusive doubly linked list node; map values point straight at these. */
  private static class Node<K, V> {
    final K key;
    V value;
    Node<K, V> prev;
    Node<K, V> next;

    Node(K key, V value) {
      this.key = key;
      this.value = value;
    }
  }

  private final int capacity;
  private final Map<K, Node<K, V>> cache;
  // Dummy sentinels remove every null-check from insert/remove logic.
  private final Node<K, V> head = new Node<>(null, null); // most-recently-used side
  private final Node<K, V> tail = new Node<>(null, null); // least-recently-used side

  public LRUCache(int capacity) {
    if (capacity <= 0) {
      throw new IllegalArgumentException("capacity must be positive");
    }
    this.capacity = capacity;
    this.cache = new HashMap<>(capacity * 2);
    head.next = tail;
    tail.prev = head;
  }

  /** Returns the value for key, or null on a miss. O(1). */
  public synchronized V get(K key) {
    Node<K, V> node = cache.get(key);
    if (node == null) {
      return null;
    }
    moveToFront(node);
    return node.value;
  }

  /** Inserts or updates key, evicting the LRU entry if over capacity. O(1). */
  public synchronized void put(K key, V value) {
    Node<K, V> existing = cache.get(key);
    if (existing != null) {
      existing.value = value;
      moveToFront(existing);
      return;
    }

    Node<K, V> node = new Node<>(key, value);
    cache.put(key, node);
    addToFront(node);

    if (cache.size() > capacity) {
      Node<K, V> lru = tail.prev;
      removeNode(lru);
      cache.remove(lru.key);
    }
  }

  public synchronized int size() {
    return cache.size();
  }

  // -- internal doubly linked list helpers -------------------------------

  private void addToFront(Node<K, V> node) {
    node.prev = head;
    node.next = head.next;
    head.next.prev = node;
    head.next = node;
  }

  private void removeNode(Node<K, V> node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  private void moveToFront(Node<K, V> node) {
    removeNode(node);
    addToFront(node);
  }
}`,
        },
        {
          type: 'markdown',
          value:
            '**Quick alternative** — Java\'s `LinkedHashMap` already maintains access order internally. Overriding `removeEldestEntry` gives you a correct LRU cache in a handful of lines, which is a great "I know the standard library too" callout after showing the from-scratch version:',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'LinkedHashMapLruCache.java',
          code: `public class LinkedHashMapLruCache<K, V> extends LinkedHashMap<K, V> {
  private final int capacity;

  public LinkedHashMapLruCache(int capacity) {
    // initialCapacity, loadFactor, accessOrder=true => reorders on get()
    super(capacity, 0.75f, true);
    this.capacity = capacity;
  }

  @Override
  protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
    return size() > capacity;
  }
}`,
        },
        {
          type: 'markdown',
          value: '**Thread safety discussion.** The `synchronized` methods above are correct but serialize *every* access — a coarse-grained lock that limits throughput under contention. Options, from simplest to most scalable:',
        },
        {
          type: 'table',
          headers: ['Approach', 'Trade-off'],
          rows: [
            [
              'synchronized get/put (shown above)',
              'Simple, correct, but one global lock — reads block writes and vice versa.',
            ],
            [
              'ReentrantReadWriteLock',
              'Wrong fit here: `get` mutates recency order (moves a node), so it is not a pure read — you still need the write lock on every `get`.',
            ],
            [
              'Sharding: N independent LRUCache<K,V> instances by hash(key) % N',
              'Reduces contention (each shard has its own lock) at the cost of a global capacity that is only approximate.',
            ],
            [
              'ConcurrentHashMap + CAS-based list (lock-free)',
              'Highest throughput, significantly harder to implement/verify correctly — usually out of scope for a 45-minute round; mention Caffeine/Guava do this.',
            ],
          ],
        },
        {
          type: 'code',
          language: 'java',
          filename: 'ShardedLRUCache.java',
          collapsible: true,
          collapsed: true,
          code: `/** Reduces lock contention by partitioning keys across N independent LRU shards. */
public class ShardedLRUCache<K, V> {
  private final LRUCache<K, V>[] shards;
  private final int shardCount;

  @SuppressWarnings("unchecked")
  public ShardedLRUCache(int totalCapacity, int shardCount) {
    this.shardCount = shardCount;
    this.shards = new LRUCache[shardCount];
    int perShard = Math.max(1, totalCapacity / shardCount);
    for (int i = 0; i < shardCount; i++) {
      shards[i] = new LRUCache<>(perShard);
    }
  }

  private LRUCache<K, V> shardFor(K key) {
    int h = key.hashCode() & 0x7fffffff;
    return shards[h % shardCount];
  }

  public V get(K key) {
    return shardFor(key).get(key);
  }

  public void put(K key, V value) {
    shardFor(key).put(key, value);
  }
}`,
        },
        {
          type: 'markdown',
          value: '**LFU follow-up.** Interviewers frequently ask you to swap LRU for **LFU (Least Frequently Used)**, tracking access *count* rather than recency, with ties broken by recency. The O(1) trick: a doubly linked list **of frequency buckets**, each bucket holding its own doubly linked list of nodes.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'LFUCache.java',
          collapsible: true,
          collapsed: true,
          code: `import java.util.*;

/** O(1) LFU cache: HashMap<key,val/freq> + HashMap<freq, LinkedHashSet<key>> + minFreq pointer. */
public class LFUCache<K, V> {
  private final int capacity;
  private int minFreq = 0;

  private final Map<K, V> values = new HashMap<>();
  private final Map<K, Integer> freqOf = new HashMap<>();
  private final Map<Integer, LinkedHashSet<K>> bucketsByFreq = new HashMap<>();

  public LFUCache(int capacity) {
    this.capacity = capacity;
  }

  public V get(K key) {
    if (!values.containsKey(key)) {
      return null;
    }
    touch(key);
    return values.get(key);
  }

  public void put(K key, V value) {
    if (capacity <= 0) {
      return;
    }
    if (values.containsKey(key)) {
      values.put(key, value);
      touch(key);
      return;
    }
    if (values.size() >= capacity) {
      // Evict one key from the least-frequent bucket (LinkedHashSet keeps insertion/LRU order).
      LinkedHashSet<K> minBucket = bucketsByFreq.get(minFreq);
      K evictKey = minBucket.iterator().next();
      minBucket.remove(evictKey);
      values.remove(evictKey);
      freqOf.remove(evictKey);
    }
    values.put(key, value);
    freqOf.put(key, 1);
    bucketsByFreq.computeIfAbsent(1, f -> new LinkedHashSet<>()).add(key);
    minFreq = 1;
  }

  private void touch(K key) {
    int freq = freqOf.get(key);
    bucketsByFreq.get(freq).remove(key);
    if (bucketsByFreq.get(freq).isEmpty() && freq == minFreq) {
      minFreq++;
    }
    freqOf.put(key, freq + 1);
    bucketsByFreq.computeIfAbsent(freq + 1, f -> new LinkedHashSet<>()).add(key);
  }
}`,
        },
      ],
    },
    {
      id: 'extensions',
      title: 'Extensions & Follow-ups',
      blocks: [
        {
          type: 'bestPractices',
          title: 'Common follow-up directions',
          practices: [
            '**LFU cache** — swap recency for frequency; O(1) via frequency buckets (shown above).',
            '**TTL / expiring entries** — store an `expiresAt` timestamp per node; check-and-evict lazily on access, plus an optional background sweeper thread.',
            '**Write-through / write-back** — on eviction, flush the dirty value to a backing store (DB/remote cache) instead of silently dropping it.',
            '**Distributed LRU** — a single-process cache does not scale across instances; front it with **Redis** (which supports `maxmemory-policy allkeys-lru`) or shard by consistent hashing across cache nodes.',
            '**Capacity resize at runtime** — shrinking capacity may require evicting multiple LRU entries in a loop until `size() <= newCapacity`.',
            '**Metrics** — hit rate, miss rate, and eviction count are usually asked for as a "how would you know this cache is working" follow-up.',
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Two users, one key — concurrency corner case',
          body: 'If two threads `put` the same **new** key concurrently under a coarse lock, only one wins the race and the other\'s write is serialized right after — correct, just sequential. Without a lock (or with a lock-free map), you risk two nodes for the same key existing in the linked list simultaneously, corrupting `prev`/`next` pointers. Always reason about **this specific race** out loud in interviews.',
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
              question: 'Why HashMap + doubly linked list, and not just one of them?',
              answer:
                'A **HashMap alone** gives O(1) lookup but no notion of order, so eviction would need an O(n) scan. A **linked list alone** gives O(1) reordering but O(n) lookup by key. Combining them — map values pointing directly at list nodes — gives O(1) for both.',
            },
            {
              question: 'Why doubly linked, not singly linked?',
              answer:
                'To remove a node in O(1) you need its **predecessor** to relink `prev.next`. A singly linked list only gives you `next`, forcing an O(n) walk to find the predecessor. A doubly linked list stores `prev` directly on the node.',
            },
            {
              question: 'Why use dummy head/tail sentinel nodes?',
              answer:
                'They eliminate special-casing "list is empty" or "removing the only node" — `addToFront`/`removeNode` become unconditional pointer rewrites with no null checks, which reduces off-by-one bugs under interview pressure.',
            },
            {
              question: 'What is the time and space complexity?',
              answer:
                '`get` and `put` are **O(1)** average time (HashMap lookup + constant list operations). Space is **O(capacity)** — one map entry and one list node per cached key.',
            },
            {
              question: 'How would you make this thread-safe, and what is the cost?',
              answer:
                'The simplest correct approach is a single lock (`synchronized` methods or a `ReentrantLock`) around `get`/`put`, since `get` mutates the list (move-to-front) so it cannot be a pure reader. This serializes all access. For higher throughput, shard the keyspace into N independently-locked sub-caches, accepting an approximate global capacity.',
            },
            {
              question: 'Two threads call `put` on the same brand-new key at the same time — what happens?',
              answer:
                'With a single lock, one call fully completes (creates node, inserts into map and list, possibly evicts) before the other starts — no corruption, just serialized. Without synchronization, both could pass the `cache.get(key) == null` check simultaneously, then both insert nodes, leaving the map with a valid entry but the linked list with two colliding/inconsistent nodes for one key.',
            },
            {
              question: 'How do you extend this into an LFU cache — what changes structurally?',
              answer:
                'Track a frequency counter per key instead of pure recency. Maintain a map of `frequency → ordered set of keys at that frequency` (a bucket), plus a `minFrequency` pointer. On access, move the key from its current bucket to `frequency+1`; on eviction, remove from the `minFrequency` bucket. This keeps LFU at O(1) too.',
            },
            {
              question: 'How would you add a TTL (expiration) on top of LRU?',
              answer:
                'Store an `expiresAt` timestamp on each node. On `get`, check if the entry is expired; if so, remove it and treat it as a miss instead of moving it to front. Optionally run a background thread that periodically sweeps expired nodes so memory is reclaimed even without reads.',
            },
            {
              question: 'Could you use `LinkedHashMap` instead of writing this from scratch?',
              answer:
                'Yes — `new LinkedHashMap<>(capacity, 0.75f, true)` with `accessOrder=true`, overriding `removeEldestEntry` to return `size() > capacity`, gives a correct LRU cache in ~10 lines. Mention it as the pragmatic production answer, but expect the interviewer to still want the from-scratch version to test data-structure fundamentals.',
            },
            {
              question: 'How does this generalize to a real distributed cache like Redis?',
              answer:
                'Redis approximates LRU (not exact, for performance) via random sampling of keys and evicting the "least recently used" among the sample, configurable with `maxmemory-policy allkeys-lru`. At scale, exact global LRU ordering across shards is too expensive to maintain, so approximate algorithms are the norm.',
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
          body: '1. **HashMap + doubly linked list** with dummy sentinels gives O(1) `get`/`put`/`evict`.\n2. `get` is **not** a pure read — it mutates recency, so naive read/write locks do not apply cleanly.\n3. Generalize with a **Strategy** eviction policy if asked to support LFU/FIFO behind one API.\n4. Standard follow-ups: **thread safety**, **LFU**, **TTL**, and **distributed/approximate LRU** (Redis).\n5. Know the `LinkedHashMap` one-liner as the pragmatic production alternative.',
        },
      ],
    },
  ],
};

export default content;
