import { DesignContent } from '../../../shared/models';
import { THREAD_POOL_META } from './thread-pool.meta';

const content: DesignContent = {
  meta: THREAD_POOL_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'A **Thread Pool** keeps a **fixed (or bounded) set of worker threads** ready to run many short-lived tasks. Creating a new OS thread per request is expensive; reusing workers cuts overhead and caps concurrency.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'In Java',
          body: '`ExecutorService` / `ThreadPoolExecutor` is the standard API. Prefer it over raw `new Thread()` for almost all server-side work.',
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
          body: 'A **bank with N tellers**: customers form a queue; tellers handle one customer at a time and take the next. Hiring a new teller for every customer would be chaos — same idea as unbounded `new Thread()`.',
        },
        {
          type: 'mermaid',
          caption: 'Tasks flow through a pool.',
          definition: `flowchart LR
  T[Tasks] --> Q[(Work Queue)]
  Q --> W1[Worker]
  Q --> W2[Worker]
  Q --> W3[Worker]`,
        },
        {
          type: 'table',
          headers: ['Knob', 'What it controls'],
          rows: [
            ['corePoolSize', 'Threads kept alive even if idle'],
            ['maximumPoolSize', 'Hard cap on threads'],
            ['workQueue', 'Pending tasks when all workers busy'],
            ['RejectedExecutionHandler', 'Policy when queue + pool are full'],
          ],
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
            ['Web servers', 'Tomcat / Jetty request worker pools'],
            ['Async jobs', 'Sending email, generating PDFs, thumbnails'],
            ['Parallel CPU work', 'Map-reduce style batch over in-memory data'],
            ['DB / I/O fan-out', 'Bounded parallel calls to downstream APIs'],
            ['Scheduled work', '`ScheduledThreadPoolExecutor` for cron-like tasks'],
            ['Reactive bridges', 'Offloading blocking calls from event loops'],
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
          filename: 'NotificationWorkers.java',
          code: `import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

public class NotificationWorkers {
  private final ExecutorService pool = new ThreadPoolExecutor(
      4,                          // core
      8,                          // max
      60L, TimeUnit.SECONDS,
      new ArrayBlockingQueue<>(500),
      new ThreadPoolExecutor.CallerRunsPolicy() // backpressure: run on caller
  );

  public void sendAsync(String userId, String message) {
    pool.execute(() -> {
      // push / email / SMS
      System.out.println("notify " + userId + ": " + message);
    });
  }

  public void shutdown() {
    pool.shutdown();
  }
}`,
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Sizing rule of thumb',
          body: '**CPU-bound:** ≈ number of cores (or cores + 1). **I/O-bound:** higher, based on wait time — but always bound by downstream limits (DB pool size, API quotas). Measure under load.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Amortizes thread creation cost.',
            'Caps concurrency and protects downstream systems.',
            'Central place for metrics, rejection, and shutdown.',
          ],
          cons: [
            'Wrong size → under-utilization or thread thrash / queue delay.',
            'Blocking tasks can starve the pool.',
            'Must handle rejection and graceful shutdown explicitly.',
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
              question: 'Why use a thread pool instead of new Thread per task?',
              answer:
                'Thread creation and stack memory are costly; unbounded threads can exhaust the machine. A pool **reuses** workers and **bounds** concurrency.',
            },
            {
              question: 'How do you size a pool?',
              answer:
                'CPU-bound ≈ cores; I/O-bound higher but constrained by DB connections and latency. Prefer load tests over formulas alone. Never exceed what dependencies can handle.',
            },
            {
              question: 'What happens when the queue is full?',
              answer:
                'The `RejectedExecutionHandler` runs: abort (throw), caller-runs, discard, or discard-oldest. **Caller-runs** is a common backpressure choice.',
            },
            {
              question: 'fixedThreadPool vs cachedThreadPool?',
              answer:
                '`newFixedThreadPool(n)` — fixed size, unbounded queue (watch memory). `newCachedThreadPool` — creates threads as needed, can explode under load. Prefer an explicit `ThreadPoolExecutor` in production.',
            },
            {
              question: 'How does this relate to Object Pool?',
              answer:
                'Thread Pool is an **object pool of threads** specialized for running tasks. Same borrow/reuse idea; different resource.',
            },
            {
              question: 'LLD / system design tip?',
              answer:
                'Separate pools for **CPU**, **I/O**, and **critical** paths (bulkheads) so a slow email sender cannot starve payment confirmation workers.',
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
          body: '1. Reuse a **bounded** set of workers for many tasks.\n2. Tune **size, queue, rejection** deliberately.\n3. Real uses: **servers, async jobs, fan-out I/O**.\n4. Mention bulkheads and sizing in interviews.',
        },
      ],
    },
  ],
};

export default content;
