import { DesignContent } from '../../../shared/models';
import { READ_WRITE_LOCK_META } from './read-write-lock.meta';

const content: DesignContent = {
  meta: READ_WRITE_LOCK_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'A **Read-Write Lock** allows **many concurrent readers** or **one exclusive writer**, but not both at once. It improves throughput for **read-heavy** shared data compared to a single mutual-exclusion lock.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'When it helps',
          body: 'Caches, in-memory config, and catalogs where reads dominate and writes are rare. If writes are frequent, a plain `synchronized` / `ReentrantLock` may be simpler and faster.',
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
          body: 'A **library reading room**: many people can read the same reference book section at once. When a librarian updates the catalog (write), everyone else must wait — exclusive access.',
        },
        {
          type: 'mermaid',
          caption: 'Readers share; writer is exclusive.',
          definition: `flowchart TB
  R1[Reader] --> L[ReadWriteLock]
  R2[Reader] --> L
  R3[Reader] --> L
  W[Writer] --> L
  L --> D[(Shared Data)]`,
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
            ['Caches', 'In-process cache: many gets, occasional put/invalidate'],
            ['Config', 'Hot-reloadable feature flags / pricing tables'],
            ['Routing', 'Read-mostly service discovery / routing tables'],
            ['Collections', 'Concurrent read-heavy maps guarded by RW lock'],
            ['File metadata', 'Shared FS metadata with rare updates'],
            ['Databases', 'Related idea: MVCC / reader-writer at storage layer'],
          ],
        },
      ],
    },
    {
      id: 'implementation',
      title: 'Implementation',
      blocks: [
        {
          type: 'code',
          language: 'java',
          filename: 'ProductCatalogCache.java',
          code: `import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class ProductCatalogCache {
  private final Map<String, Product> cache = new HashMap<>();
  private final ReadWriteLock lock = new ReentrantReadWriteLock();

  public Product get(String id) {
    lock.readLock().lock();
    try {
      return cache.get(id);
    } finally {
      lock.readLock().unlock();
    }
  }

  public void put(String id, Product product) {
    lock.writeLock().lock();
    try {
      cache.put(id, product);
    } finally {
      lock.writeLock().unlock();
    }
  }

  public void invalidate(String id) {
    lock.writeLock().lock();
    try {
      cache.remove(id);
    } finally {
      lock.writeLock().unlock();
    }
  }
}`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Pitfalls',
          body: 'Writer starvation if readers never stop; holding read locks while calling into code that may need a write lock (deadlock); and using RW locks when a concurrent collection (`ConcurrentHashMap`) already fits.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Higher read concurrency than exclusive locks.',
            'Clear shared vs exclusive semantics.',
            'Good fit for read-mostly in-memory structures.',
          ],
          cons: [
            'More overhead than a simple mutex when contention is low.',
            'Writers can starve under continuous reads.',
            'Easy to misuse (lock upgrade, long critical sections).',
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
              question: 'What does a read-write lock guarantee?',
              answer:
                'Multiple threads may hold the **read** lock concurrently. The **write** lock is exclusive — no other readers or writers. Readers see a stable snapshot while no writer holds the lock.',
            },
            {
              question: 'When is it better than synchronized?',
              answer:
                'When the critical section is **read-dominated** and reads are frequent enough that shared access improves throughput. Profile — RW locks are not free.',
            },
            {
              question: 'Can you upgrade a read lock to a write lock?',
              answer:
                'Not safely with plain `ReentrantReadWriteLock` while still holding the read lock (deadlock risk). Release read, acquire write (and re-check state), or use patterns designed for upgrade.',
            },
            {
              question: 'ReentrantReadWriteLock vs StampedLock?',
              answer:
                '`StampedLock` offers optimistic reads with potentially better performance but is harder to use (no reentrancy). Mention both; prefer RW lock for clarity unless profiling demands otherwise.',
            },
            {
              question: 'RW lock vs ConcurrentHashMap?',
              answer:
                'If you only need a concurrent map, use `ConcurrentHashMap`. Use an RW lock when protecting a **custom invariant** across multiple fields/structures that CHM alone cannot express.',
            },
            {
              question: 'LLD example?',
              answer:
                'In-memory **product catalog** or **session registry**: many lookups, rare updates. Or a **leaderboard cache** refreshed periodically under a write lock.',
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
          body: '1. Many **readers** or one **writer** — not both.\n2. Best for **read-heavy** shared state.\n3. Real uses: **caches, config, routing tables**.\n4. Watch starvation, upgrades, and prefer concurrent collections when enough.',
        },
      ],
    },
  ],
};

export default content;
