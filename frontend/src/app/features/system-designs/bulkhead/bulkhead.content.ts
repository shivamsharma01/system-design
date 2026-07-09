import { DesignContent } from '../../../shared/models';
import { BULKHEAD_META } from './bulkhead.meta';

const content: DesignContent = {
  meta: BULKHEAD_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'The **Bulkhead** pattern **partitions resources** — thread pools, connection pools, semaphores — so failure or slowness in one area cannot drain shared capacity for the entire system. Named after ship **watertight compartments**, it contains blast radius when one dependency misbehaves.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Isolation dimensions',
          body: 'Isolate by **dependency** (payment pool vs email pool), by **tenant** (noisy neighbor control), or by **priority** (checkout threads reserved separately from analytics).',
        },
        {
          type: 'table',
          caption: 'What to partition.',
          headers: ['Resource', 'Bulkhead example'],
          rows: [
            ['Thread pool', '20 threads for payments, 10 for notifications'],
            ['Connection pool', 'Separate Hikari pool per downstream database shard'],
            ['HTTP client concurrency', 'Max 50 in-flight calls to maps API'],
            ['Queue depth', 'Dedicated worker queue for critical checkout path'],
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
          body: 'A **ship’s bulkheads**: if one compartment floods, watertight doors seal it off so the **whole vessel does not sink**. One slow email-sending compartment must not flood the payment-processing compartment.',
        },
        {
          type: 'mermaid',
          caption: 'Separate pools prevent one slow dependency from starving others.',
          definition: `flowchart TB
  subgraph shared["Without bulkhead — one pool"]
    T1[All threads blocked on slow Maps API]
  end
  subgraph bulkhead["With bulkhead — partitioned pools"]
    P[Payment pool — 20 threads]
    N[Notification pool — 10 threads]
    M[Maps pool — 5 threads — full]
    P --> Pay[Payment OK]
    N --> Email[Email OK]
    M --> Maps[Slow Maps — isolated]
  end`,
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
            ['E-commerce checkout', 'Dedicated thread pool for payment capture vs catalog browsing'],
            ['Food delivery', 'Rider GPS updates isolated from order-placement workers'],
            ['Payments', 'Separate connection pools to primary ledger vs fraud-scoring read replica'],
            ['Netflix-style microservices', 'Per-dependency thread pools in Hystrix/Resilience4j commands'],
            ['Kubernetes', 'Resource quotas and limit ranges per namespace as cluster-level bulkheads'],
            ['Tomcat / Jetty', 'Separate executor for admin endpoints vs customer API'],
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
            'Size pools from **measured concurrency** and SLOs — too small causes artificial rejection; too large negates isolation. When a bulkhead is full, **reject fast** (or queue with a small bound) rather than blocking the caller indefinitely.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'BulkheadExecutors.java',
          code: `import io.github.resilience4j.bulkhead.Bulkhead;
import io.github.resilience4j.bulkhead.BulkheadConfig;
import java.util.concurrent.*;

public class OrderOrchestrator {
  private final Bulkhead paymentBulkhead;
  private final Bulkhead notificationBulkhead;
  private final PaymentClient payments;
  private final NotificationClient notifications;

  public OrderOrchestrator() {
    this.paymentBulkhead = Bulkhead.of("payments",
        BulkheadConfig.custom()
            .maxConcurrentCalls(25)
            .maxWaitDuration(Duration.ofMillis(50))
            .build());
    this.notificationBulkhead = Bulkhead.of("notifications",
        BulkheadConfig.custom()
            .maxConcurrentCalls(10)
            .maxWaitDuration(Duration.ZERO) // fail fast when full
            .build());
    this.payments = new PaymentClient();
    this.notifications = new NotificationClient();
  }

  public CheckoutResult checkout(Order order) {
    Receipt receipt = Bulkhead.decorateSupplier(paymentBulkhead,
        () -> payments.capture(order)).get();

    // Slow email provider cannot exhaust payment threads
    CompletableFuture.runAsync(() ->
        Bulkhead.decorateRunnable(notificationBulkhead,
            () -> notifications.sendReceipt(order, receipt)).run());

    return CheckoutResult.ok(receipt);
  }
}`,
        },
        {
          type: 'code',
          language: 'yaml',
          filename: 'hikari-bulkhead-pools.yaml',
          code: `spring:
  datasource:
    checkout:
      hikari:
        pool-name: checkout-pool
        maximum-pool-size: 15
        connection-timeout: 3000
    analytics:
      hikari:
        pool-name: analytics-pool
        maximum-pool-size: 5
        connection-timeout: 1000`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Bulkhead vs unlimited scale-out',
          body: 'Autoscaling **more pods** without per-dependency limits can still **overload a shared database**. Bulkheads cap concurrent pressure on fragile backends.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Contains failures to one compartment.',
            'Protects critical paths from optional features.',
            'Makes resource contention visible (rejected calls).',
          ],
          cons: [
            'Harder to tune — wrong limits cause false rejections.',
            'Total capacity split — may under-utilize hardware.',
            'More pools to monitor and configure.',
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
              question: 'What is the bulkhead pattern?',
              answer:
                '**Resource isolation** — separate thread/connection pools per dependency or priority so one slow path cannot exhaust shared workers and take down unrelated features.',
            },
            {
              question: 'Bulkhead vs circuit breaker?',
              answer:
                '**Bulkhead** limits **concurrent usage** of a dependency. **Circuit breaker** stops calls when **failures** exceed a threshold. Complementary: bulkhead prevents resource exhaustion; breaker stops retrying a known-bad service.',
            },
            {
              question: 'Why is the ship compartment analogy used?',
              answer:
                'Watertight **bulkheads** keep flooding localized. In software, a “flood” of slow maps API calls stays in its pool instead of sinking checkout.',
            },
            {
              question: 'How do you size a bulkhead?',
              answer:
                'From **load tests**: p99 latency, max sustainable concurrency per dependency, and reserved capacity for critical paths. Start conservative; adjust from metrics on rejections and queue depth.',
            },
            {
              question: 'Bulkhead at Kubernetes level?',
              answer:
                '**Resource quotas**, **limit ranges**, and separate deployments per tier. Noisy analytics jobs in one namespace cannot steal CPU/memory from payment namespace.',
            },
            {
              question: 'Food delivery: what would you bulkhead?',
              answer:
                'Separate pools for **order placement** (critical), **driver location pings** (high volume), and **promotional push notifications** (best-effort). A push provider slowdown must not block new orders.',
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
          body: '1. Bulkhead = **partitioned resources** to limit blast radius.\n2. Real uses: **thread pools, Hikari pools, Resilience4j, K8s quotas**.\n3. Pair with **circuit breakers and timeouts** for full resilience.\n4. Size from metrics — reject fast when a compartment is full.',
        },
      ],
    },
  ],
};

export default content;
