import { DesignContent } from '../../../shared/models';
import { OBJECT_POOL_META } from './object-pool.meta';

/**
 * Object Pool — reuse expensive resources (connections / threads).
 */
const content: DesignContent = {
  meta: OBJECT_POOL_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'An **Object Pool** keeps a set of **initialized objects ready to use**. Clients **borrow** an object, use it, then **return** it. This avoids repeated create/destroy costs for expensive resources.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Creational + performance',
          body: 'Often grouped with creational patterns because it controls **how instances are obtained**. In production you almost always use a battle-tested pool (HikariCP, thread pools) rather than rolling your own.',
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
          body: 'A **bike-share dock**: a fixed number of bikes sit ready. You check one out, ride, and return it. Creating a brand-new bike for every trip would be absurd — same idea for DB connections and worker threads.',
        },
        {
          type: 'mermaid',
          caption: 'Borrow and return lifecycle.',
          definition: `sequenceDiagram
  participant C as Client
  participant P as ConnectionPool
  C->>P: borrow()
  P-->>C: Connection
  C->>C: query...
  C->>P: release(Connection)
  Note over P: connection returns to idle set`,
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
            ['Databases', 'JDBC pools (HikariCP, Tomcat JDBC, c3p0)'],
            ['Concurrency', 'Java `ExecutorService` / thread pools'],
            ['Networking', 'HTTP connection pools, gRPC channel pools'],
            ['Games', 'Bullet / particle object pools to avoid GC spikes'],
            ['Graphics', 'Buffer or texture pools'],
            ['Serverless / runtimes', 'Warm instance reuse (related operational idea)'],
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
            'Simplified pool for a pretend `DbConnection`. Production pools add validation, timeouts, leak detection, and metrics.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'SimpleConnectionPool.java',
          code: `import java.util.ArrayDeque;
import java.util.Deque;

public final class SimpleConnectionPool {
  private final Deque<DbConnection> idle = new ArrayDeque<>();
  private final int maxSize;
  private int created;

  public SimpleConnectionPool(int maxSize) {
    this.maxSize = maxSize;
  }

  public synchronized DbConnection borrow() {
    if (!idle.isEmpty()) {
      return idle.pop();
    }
    if (created < maxSize) {
      created++;
      return new DbConnection("conn-" + created);
    }
    throw new IllegalStateException("pool exhausted");
  }

  public synchronized void release(DbConnection connection) {
    idle.push(connection);
  }
}

final class DbConnection {
  private final String id;
  DbConnection(String id) { this.id = id; }
  void query(String sql) { /* use connection */ }
  String id() { return id; }
}

// usage
SimpleConnectionPool pool = new SimpleConnectionPool(10);
DbConnection c = pool.borrow();
try {
  c.query("SELECT 1");
} finally {
  pool.release(c); // always return
}`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Always return in `finally`',
          body: 'Leaked borrows exhaust the pool and freeze the app under load — a classic production incident pattern.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Cuts allocation / handshake cost for expensive objects.',
            'Bounds resource usage (max connections, max threads).',
            'Improves latency and GC behavior under load.',
          ],
          cons: [
            'Complexity: sizing, validation, timeouts, fairness.',
            'Exhaustion and leaks cause cascading failures.',
            'Stale objects need health checks before reuse.',
          ],
        },
      ],
    },
    {
      id: 'best-practices',
      title: 'Best practices',
      blocks: [
        {
          type: 'bestPractices',
          practices: [
            'Prefer **HikariCP** / framework pools over custom pools for databases.',
            'Size pools from **DB limits** and concurrency math — not guesswork.',
            'Use **try/finally** or try-with-resources so borrows always return.',
            'Add **connection validation** and idle timeouts for long-lived pools.',
            'Expose metrics: active, idle, wait time, exhaustion count.',
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
              question: 'What is the Object Pool pattern?',
              answer:
                'A managed set of reusable objects. Clients **borrow** and **return** instances instead of constructing and destroying expensive resources repeatedly.',
            },
            {
              question: 'Where is it most common in backend systems?',
              answer:
                '**Database connection pools** and **thread pools**. Also HTTP client connection pools. These are the answers interviewers expect first.',
            },
            {
              question: 'How do you choose pool size?',
              answer:
                'For DB pools: consider DB `max_connections`, number of app instances, and expected concurrent queries. Too large starves the DB; too small increases wait time. Measure under load.',
            },
            {
              question: 'Object Pool vs Singleton?',
              answer:
                'Singleton is **one** instance. A pool is **many reusable** instances with a fixed upper bound. A pool manager itself might be a singleton bean.',
            },
            {
              question: 'What happens when the pool is exhausted?',
              answer:
                'Borrow blocks with a timeout, fails fast, or queues — depending on policy. In interviews, mention **fail fast + backpressure** vs unbounded waiting.',
            },
            {
              question: 'Why not pool everything?',
              answer:
                'Pooling cheap objects adds synchronization overhead and complexity. Pool when create/destroy or resource limits dominate cost (sockets, threads, native handles).',
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
          body: '1. **Borrow / return** expensive objects from a bounded pool.\n2. Real uses: **DB connections, threads, sockets, game entities**.\n3. Production = proven libraries + sizing + leak safety.\n4. Discuss exhaustion, validation, and metrics in interviews.',
        },
      ],
    },
  ],
};

export default content;
