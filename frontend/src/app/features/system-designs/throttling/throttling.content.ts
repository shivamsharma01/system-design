import { DesignContent } from '../../../shared/models';
import { THROTTLING_META } from './throttling.meta';

const content: DesignContent = {
  meta: THROTTLING_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Throttling** protects a service when demand exceeds **safe capacity** — by slowing, queueing, or **rejecting excess** requests so latency stays bounded and the system survives overload. Unlike a fixed **Rate Limiter Pattern** quota per client, throttling is often **adaptive**: it reacts to CPU, queue depth, error rates, or upstream saturation to **shed load** in real time.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Throttling vs rate limiting',
          body: '**Rate limiting** enforces a **contract** (“100 req/min per API key”). **Throttling** is **overload protection** (“server is melting — reject or delay until healthy”). Many gateways do both: rate limits at the edge, adaptive throttling inside the mesh. See the **Rate Limiter Pattern** page for token-bucket and sliding-window quotas.',
        },
        {
          type: 'table',
          caption: 'Common throttling signals.',
          headers: ['Signal', 'Action'],
          rows: [
            ['Thread pool saturated', 'Return 503 + Retry-After; reject new work'],
            ['P99 latency spike', 'Adaptive concurrency limit (Envoy, Netflix)'],
            ['Downstream dependency slow', 'Reduce accepted RPS to that path'],
            ['CPU > threshold', 'Load shed non-critical endpoints first'],
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
          body: 'A **highway metered on-ramp**: when the freeway is congested, the light stays red longer so merging traffic does not gridlock everyone. Throttling **paces entry** to match capacity — some drivers wait, but traffic keeps moving.',
        },
        {
          type: 'mermaid',
          caption: 'Adaptive throttling increases rejections as load rises.',
          definition: `flowchart LR
  A[Incoming requests] --> B{Capacity OK?}
  B -->|yes| C[Process normally]
  B -->|no| D[Throttle / shed load]
  D --> E[503 + Retry-After]
  D --> F[Queue with max wait]
  C --> G[Monitor latency / CPU]
  G --> B`,
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
            ['E-commerce flash sale', 'Checkout API throttles when order DB connection pool is exhausted'],
            ['Public APIs', 'Return 503 when origin overload; CDN serves stale product catalog'],
            ['Food delivery peak dinner', 'Dispatch service sheds low-priority ETA recalculations first'],
            ['Search autocomplete', 'Drop suggest requests under load; keep core search path'],
            ['Redis-backed session store', 'App throttles writes when Redis latency exceeds SLO'],
            ['Service mesh', 'Envoy adaptive concurrency reduces accepted connections on latency rise'],
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
            'Combine **hard limits** (max concurrent requests, bounded queues) with **adaptive** controls (latency-based rejection). Return **503 Service Unavailable** with **Retry-After** so clients back off. Prioritize tiers: shed analytics and recommendations before checkout. Pair with **circuit breakers** on sick dependencies — throttling protects your service; breakers protect you from theirs.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'AdaptiveThrottler.java',
          code: `public class AdaptiveThrottler {
  private final Semaphore inFlight;
  private final AtomicInteger consecutiveHighLatency = new AtomicInteger(0);
  private static final Duration LATENCY_BUDGET = Duration.ofMillis(150);

  public AdaptiveThrottler(int maxConcurrent) {
    this.inFlight = new Semaphore(maxConcurrent);
  }

  public <T> T execute(Supplier<T> work) {
    if (!inFlight.tryAcquire()) {
      throw new ServiceUnavailableException("server overloaded", Duration.ofSeconds(2));
    }
    long start = System.nanoTime();
    try {
      T result = work.get();
      recordLatency(System.nanoTime() - start);
      return result;
    } finally {
      inFlight.release();
    }
  }

  private void recordLatency(long nanos) {
    if (Duration.ofNanos(nanos).compareTo(LATENCY_BUDGET) > 0) {
      if (consecutiveHighLatency.incrementAndGet() > 5) {
        // tighten: temporarily reduce permits (adaptive shed)
        inFlight.acquireUninterruptibly(Math.min(10, inFlight.availablePermits() / 4));
        consecutiveHighLatency.set(0);
      }
    } else {
      consecutiveHighLatency.set(0);
    }
  }
}`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Throttling without client backoff fails',
          body: 'If you return 503 but clients **retry immediately**, you amplify the storm. Document **exponential backoff**; use **Retry-After** headers. Coordinate with the **Rate Limiter Pattern** at the edge so abusive clients are capped before they hit overload logic.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Prevents catastrophic latency collapse under spike load.',
            'Protects shared resources — DB pools, Redis, thread pools.',
            'Adaptive variants self-heal as pressure drops.',
          ],
          cons: [
            'Rejected requests need clear UX — “try again” vs silent failure.',
            'Hard to tune; wrong thresholds shed legitimate traffic.',
            'Differs from fair per-tenant quotas — combine with rate limiting.',
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
              question: 'What is throttling?',
              answer:
                '**Load shedding** when a system nears capacity — reject, queue, or delay excess requests so remaining work stays within latency and stability SLOs.',
            },
            {
              question: 'Throttling vs rate limiting?',
              answer:
                '**Rate limiting** = per-client **quota** (fair usage contract). **Throttling** = **overload protection** when the server is saturated regardless of who asks. Use both: rate limits at API edge, throttling when internal signals show distress.',
            },
            {
              question: 'What HTTP status for throttled requests?',
              answer:
                'Often **503 Service Unavailable** with **Retry-After**, or **429** when policy-driven. Be consistent in your API docs so clients implement backoff correctly.',
            },
            {
              question: 'How does adaptive throttling work?',
              answer:
                'Monitor **latency, CPU, or queue depth**. When metrics degrade, reduce accepted concurrency or RPS dynamically (Envoy adaptive concurrency, Netflix concurrency limits). Restore limits as health improves.',
            },
            {
              question: 'Design flash sale checkout protection.',
              answer:
                '**Queue or token** for checkout slots; throttle browse/search separately; **Redis** for inventory holds with short TTL; shed recommendation APIs first; rate-limit bots at CDN edge.',
            },
            {
              question: 'Throttling vs bulkhead?',
              answer:
                '**Bulkhead** isolates **pools** per dependency (payments cannot starve catalog). **Throttling** caps **total** ingress when the whole service or a critical pool is overloaded. They complement each other.',
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
          body: '1. Throttling = **shed load** when capacity is exceeded — protect latency and stability.\n2. Distinct from **Rate Limiter Pattern** quotas; often deployed **together**.\n3. Return **503/429 + Retry-After**; require client backoff.\n4. Real uses: **flash sales**, API overload, Redis/DB pool protection, Envoy adaptive concurrency.',
        },
      ],
    },
  ],
};

export default content;
