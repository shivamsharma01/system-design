import { DesignContent } from '../../../shared/models';
import { DOUBLE_CHECKED_LOCKING_META } from './double-checked-locking.meta';

const content: DesignContent = {
  meta: DOUBLE_CHECKED_LOCKING_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Double-Checked Locking (DCL)** lazily initializes a shared resource with **minimal synchronization**: check without a lock, then lock and check again before creating. In Java it requires **`volatile`** (or safer alternatives) to be correct under the memory model.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Interview favorite',
          body: 'Often asked with Singleton. Strong answers mention the broken pre-Java-5 form, `volatile`, and prefer **holder class** or **enum** when a classic singleton is needed.',
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
          body: 'Opening a shared office supply closet: peek through the window (fast check). If empty, get the key (lock), peek again (another thread may have restocked), then restock once.',
        },
        {
          type: 'mermaid',
          caption: 'Two checks around the lock.',
          definition: `flowchart TD
  A[Read instance] -->|non-null| Done[Return]
  A -->|null| B[Lock]
  B --> C[Read instance again]
  C -->|non-null| U[Unlock and return]
  C -->|null| D[Create instance]
  D --> U`,
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
            ['Singleton', 'Lazy app-wide config / client SDK init'],
            ['Expensive resources', 'First-use init of a native library or connection'],
            ['Caches', 'Lazy build of a derived index on first access'],
            ['Frameworks', 'Historical patterns in older Java libraries'],
            ['Modern preference', 'DI containers, holder idiom, `enum`, or `Lazy<>` types'],
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
          value: '**Correct DCL in Java** — `volatile` prevents publishing a partially constructed object:',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'LazyConfigDcl.java',
          code: `public final class LazyConfig {
  private static volatile LazyConfig instance;

  private final String dbUrl;

  private LazyConfig() {
    this.dbUrl = System.getenv().getOrDefault("DB_URL", "jdbc:h2:mem:app");
  }

  public static LazyConfig getInstance() {
    LazyConfig local = instance;          // 1st check (no lock)
    if (local == null) {
      synchronized (LazyConfig.class) {
        local = instance;                 // 2nd check
        if (local == null) {
          instance = local = new LazyConfig();
        }
      }
    }
    return local;
  }

  public String dbUrl() { return dbUrl; }
}`,
        },
        {
          type: 'markdown',
          value: '**Usually better:** initialization-on-demand holder (class loading is thread-safe):',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'LazyConfigHolder.java',
          code: `public final class LazyConfigHolder {
  private LazyConfigHolder() {}

  private static class Holder {
    private static final LazyConfigHolder INSTANCE = new LazyConfigHolder();
  }

  public static LazyConfigHolder getInstance() {
    return Holder.INSTANCE;
  }
}`,
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Avoids synchronizing on every access after init.',
            'Defers expensive construction until first use.',
            'Useful teaching tool for the Java Memory Model.',
          ],
          cons: [
            'Easy to get wrong without `volatile`.',
            'Holder / enum / DI are clearer for most singletons.',
            'Does not help if you need more than one instance later.',
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
              question: 'What is double-checked locking?',
              answer:
                'A lazy-init technique: check the reference **without** locking; if null, enter a synchronized block and **check again** before creating, so only the first creators contend on the lock.',
            },
            {
              question: 'Why is volatile required in Java?',
              answer:
                'Without `volatile`, another thread can see a **non-null reference to a partially constructed object** due to instruction reordering / unsafe publication. `volatile` establishes a happens-before edge on write/read of the reference.',
            },
            {
              question: 'Was DCL always broken in Java?',
              answer:
                'The classic form was unsafe under older memory models. Since Java 5, **`volatile` makes DCL correct**. Still, many prefer holder or enum for simplicity.',
            },
            {
              question: 'DCL vs eager singleton?',
              answer:
                'Eager is simpler and thread-safe via class init, but pays construction cost at startup. DCL/holder delay cost until first use.',
            },
            {
              question: 'What would you recommend in production?',
              answer:
                'Prefer **DI singleton scope**, **enum singleton**, or **holder idiom**. Use DCL only when you must lazy-init a non-class-load resource and understand the JMM constraints.',
            },
            {
              question: 'Relate to Singleton pattern.',
              answer:
                'DCL is an **implementation tactic** for a thread-safe lazy Singleton — not a separate creational pattern. Interviewers often combine both topics.',
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
          body: '1. DCL = lazy init with **two checks** around a lock.\n2. In Java, use **`volatile`** (or prefer holder/enum).\n3. Real uses: **lazy singletons / expensive first-use init**.\n4. Explain the memory-model bug to score interview points.',
        },
      ],
    },
  ],
};

export default content;
