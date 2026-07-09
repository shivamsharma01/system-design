import { DesignContent } from '../../../shared/models';
import { MATERIALIZED_VIEW_META } from './materialized-view.meta';

const content: DesignContent = {
  meta: MATERIALIZED_VIEW_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'A **Materialized View** is a **precomputed, read-optimized projection** built from the write-side data model or event stream. Instead of joining five tables on every dashboard request, you maintain a denormalized table or document that answers queries in O(1). It is the **read half of CQRS**: commands update the authoritative write model; a projector listens to changes and refreshes the view.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Refresh strategies',
          body: '**Full rebuild** — simplest, run nightly or on schema change. **Incremental** — apply each domain event to the view (preferred at scale). **On-demand** — refresh when a user opens a stale report. **Hybrid** — incremental updates plus periodic full reconcile to fix drift.',
        },
        {
          type: 'table',
          caption: 'Materialized view vs alternatives.',
          headers: ['Approach', 'When to use'],
          rows: [
            ['Live JOIN query', 'Low traffic, strong consistency, simple schema'],
            ['Materialized view', 'High read volume, complex aggregates, dashboards'],
            ['Cache-aside', 'Single-entity hot reads — not multi-table rollups'],
            ['Read replica', 'Same schema as write DB — still pays JOIN cost at query time'],
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
          body: 'A **store’s end-of-day sales summary sheet**: clerks ring up individual transactions (writes) all day. The manager does not re-count every receipt when asked “how did we do?” — a **pre-tallied sheet** (materialized view) is updated after each sale or refreshed hourly. The sheet may lag reality by minutes, but answers are instant.',
        },
        {
          type: 'mermaid',
          caption: 'Events from the write model feed incremental projection updates.',
          definition: `flowchart LR
  CMD[Command Handler]
  WM[(Write Model)]
  EVT[Domain Events]
  PROJ[Projection Worker]
  MV[(Materialized View)]
  DASH[Dashboard / API]

  CMD --> WM
  WM --> EVT
  EVT --> PROJ
  PROJ -->|UPSERT / aggregate| MV
  DASH -->|SELECT precomputed rows| MV`,
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
            ['E-commerce analytics', 'Daily revenue by category — updated from order-placed events into ClickHouse'],
            ['Food delivery ops', 'Restaurant SLA dashboard: avg prep time, cancellation rate per zone'],
            ['Banking reporting', 'Customer balance history timeline denormalized for mobile app queries'],
            ['Social feeds', 'Fan-out timeline per user — materialized from follow graph + post events'],
            ['Search indexes', 'Elasticsearch product catalog rebuilt incrementally from catalog change stream'],
            ['CQRS read models', 'Order summary table separate from normalized order write schema'],
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
            'Store projections in a **read-optimized store** (PostgreSQL summary table, Redis hash, Elasticsearch, ClickHouse). Use **idempotent consumers** so replaying events does not double-count. Track **projection version** or **last-processed offset** for recovery. Expose **staleness metadata** (`asOf`, `lagMs`) on API responses so dashboards can show “data 30s behind”. Pair with **Transactional Outbox** or **Event Sourcing** for reliable event delivery.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'OrderSummaryProjector.java',
          code: `public class OrderSummaryProjector {
  private final JdbcTemplate readDb;
  private final String consumerGroup = "order-summary-v1";

  @KafkaListener(topics = "order-events", groupId = consumerGroup)
  public void onOrderPlaced(OrderPlaced event) {
    readDb.update("""
        INSERT INTO order_summary_by_customer
          (customer_id, order_count, total_spent_cents, last_order_at)
        VALUES (?, 1, ?, ?)
        ON CONFLICT (customer_id) DO UPDATE SET
          order_count = order_summary_by_customer.order_count + 1,
          total_spent_cents = order_summary_by_customer.total_spent_cents + EXCLUDED.total_spent_cents,
          last_order_at = EXCLUDED.last_order_at
        """,
        event.customerId(),
        event.totalCents(),
        event.placedAt());
  }

  public CustomerSummary getSummary(UUID customerId) {
    return readDb.queryForObject(
        "SELECT * FROM order_summary_by_customer WHERE customer_id = ?",
        CustomerSummary.ROW_MAPPER, customerId);
  }
}`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Staleness and drift',
          body: 'Incremental projections can **drift** after bugs or missed events. Run a **nightly reconcile job** that compares view totals against source-of-truth aggregates. For regulated dashboards, document acceptable lag and monitor consumer lag metrics.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Sub-millisecond reads for complex aggregates and dashboards.',
            'Decouples read scaling from write path — scale projections independently.',
            'Natural fit with CQRS and event-driven architectures.',
          ],
          cons: [
            'Eventually consistent — views lag behind writes.',
            'Extra storage and pipeline complexity (projectors, replay, versioning).',
            'Schema changes require coordinated projection migrations.',
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
              question: 'What is a materialized view?',
              answer:
                'A **precomputed read model** derived from write-side data or events. Queries hit the denormalized projection instead of expensive live JOINs. Common in **CQRS** as the query-optimized side.',
            },
            {
              question: 'How does it relate to CQRS?',
              answer:
                '**CQRS** separates command and query models. The materialized view **is** the query model — built by projectors consuming domain events or change-data-capture from the write model.',
            },
            {
              question: 'Full rebuild vs incremental refresh?',
              answer:
                '**Full rebuild** is simpler but costly at scale. **Incremental** applies each event (UPSERT, counter bump) — lower latency, needs idempotency and offset tracking. Most production systems use incremental plus periodic reconcile.',
            },
            {
              question: 'How do you handle projection failures?',
              answer:
                'Store **last processed offset**, make handlers **idempotent**, replay from checkpoint on restart. Dead-letter failed events. Nightly **reconcile job** detects drift. Version projections (`v2`) for schema migrations with dual-write period.',
            },
            {
              question: 'Materialized view vs cache-aside?',
              answer:
                '**Cache-aside** caches individual entity lookups with TTL. **Materialized view** stores **pre-aggregated, multi-entity** shapes (dashboards, timelines). Views are updated by events; caches are invalidated on write.',
            },
            {
              question: 'Design a seller revenue dashboard.',
              answer:
                'Write model: normalized orders table. Emit `OrderCompleted` events. Projector upserts `seller_daily_revenue` in ClickHouse. API reads materialized table with `asOf` timestamp. Full rebuild job weekly. Alert on consumer lag > 60s.',
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
          body: '1. Materialized views **precompute read models** for fast dashboards and CQRS queries.\n2. Refresh via **incremental event projection** with idempotent consumers and offset tracking.\n3. Accept **eventual staleness** — expose lag metadata and run reconcile jobs.\n4. Pair with **CQRS**, **Event Sourcing**, or **Transactional Outbox** for reliable updates.',
        },
      ],
    },
  ],
};

export default content;
