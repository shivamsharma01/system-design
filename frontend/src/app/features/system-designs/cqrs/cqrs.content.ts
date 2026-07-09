import { DesignContent } from '../../../shared/models';
import { CQRS_META } from './cqrs.meta';

const content: DesignContent = {
  meta: CQRS_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**CQRS (Command Query Responsibility Segregation)** splits the **write model** (commands that change state) from the **read model** (queries optimized for display). Commands enforce business rules and emit changes; queries hit denormalized projections, caches, or search indexes tuned for fast reads.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Not always Event Sourcing',
          body: 'CQRS **does not require Event Sourcing**. You can CQRS with a normalized write DB and a separate read replica or materialized view. **Event Sourcing** is often combined with CQRS on the write side, but they are independent choices.',
        },
        {
          type: 'table',
          caption: 'When CQRS pays off.',
          headers: ['Signal', 'Example'],
          rows: [
            ['Read/write ratio skew', 'Food delivery: millions of menu/browse queries, fewer order writes'],
            ['Different read shapes', 'Banking: OLTP ledger writes vs regulatory reporting aggregates'],
            ['Independent scaling', 'E-commerce product catalog reads on Elasticsearch, orders on PostgreSQL'],
            ['Complex domain writes', 'Checkout command model separate from order history timeline query'],
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
          body: 'A **restaurant kitchen vs menu board**: the kitchen (commands) follows strict recipes and inventory rules when fulfilling orders. The menu board (queries) is a simplified, customer-friendly view — updated after dishes change, but nobody cooks from the chalkboard directly.',
        },
        {
          type: 'mermaid',
          caption: 'Commands update write model; events feed read projections.',
          definition: `flowchart TB
  UI[Client / API]
  UI -->|PlaceOrder command| CW[Command Handler]
  CW --> WM[(Write Model DB)]
  WM -->|domain event| BUS[Event Bus / Outbox]
  BUS --> P1[Order Summary Projection]
  BUS --> P2[Search Index Projection]
  P1 --> RM1[(Read DB — dashboards)]
  P2 --> RM2[(Elasticsearch — search)]
  UI -->|GetOrderHistory query| RM1
  UI -->|SearchProducts query| RM2`,
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
            ['E-commerce', 'Write: order service; Read: order tracking page, recommendation feed'],
            ['Food delivery', 'Write: place/cancel order; Read: live map, restaurant listings, ETA'],
            ['Banking', 'Write: transfer command; Read: balance history, spending analytics dashboard'],
            ['Social feeds', 'Write: post/like commands; Read: fan-out timeline materialized views'],
            ['Booking systems', 'Write: reservation holds; Read: availability calendar optimized for search'],
            ['With Event Sourcing', 'Events as write log; multiple read models rebuilt from stream'],
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
            'Start simple: **same database**, separate command and query services or packages. Evolve to **separate stores** when read patterns diverge. Projections update **asynchronously** — users see **eventual consistency** on reads unless you add read-your-writes tactics (route to primary, version tokens).',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'PlaceOrderCommandHandler.java',
          code: `@Service
public class PlaceOrderCommandHandler {
  private final OrderRepository writeRepo;
  private final ApplicationEventPublisher events;

  @Transactional
  public OrderId handle(PlaceOrderCommand cmd) {
    Order order = Order.create(cmd.customerId(), cmd.items());
    writeRepo.save(order);
    events.publishEvent(new OrderPlacedEvent(order.id(), order.total(), order.items()));
    return order.id();
  }
}

@RestController
@RequestMapping("/queries")
public class OrderQueryController {
  private final OrderReadRepository readRepo; // separate schema or DB

  @GetMapping("/orders/{customerId}")
  public List<OrderSummaryDto> history(@PathVariable UUID customerId) {
    return readRepo.findSummariesByCustomer(customerId);
  }
}`,
        },
        {
          type: 'code',
          language: 'sql',
          filename: 'read_projection.sql',
          code: `-- Write model (normalized)
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL,
  status VARCHAR(20) NOT NULL,
  total_cents BIGINT NOT NULL
);

-- Read model (denormalized for UI)
CREATE TABLE order_summary_view (
  order_id UUID PRIMARY KEY,
  customer_id UUID NOT NULL,
  status_label VARCHAR(40) NOT NULL,
  item_count INT NOT NULL,
  total_display VARCHAR(20) NOT NULL,
  placed_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_order_summary_customer ON order_summary_view (customer_id, placed_at DESC);`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Complexity tax',
          body: 'CQRS adds **projection lag**, duplicate models, and sync bugs. Do not apply to CRUD domains with symmetric reads/writes — use it when scaling or model shapes genuinely diverge.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Scale reads and writes independently.',
            'Optimize each model for its job — strict writes, fast denormalized reads.',
            'Natural fit with event-driven projections and multiple UIs.',
          ],
          cons: [
            'Eventual consistency on read side — UX must tolerate or compensate.',
            'More moving parts: projectors, rebuild jobs, schema drift.',
            'Overkill for simple CRUD microservices.',
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
              question: 'What problem does CQRS solve?',
              answer:
                'When **read and write** workloads or data shapes differ sharply, a single model forces compromises. CQRS lets writes stay transactional and correct while reads use denormalized, cached, or search-optimized stores.',
            },
            {
              question: 'CQRS with vs without Event Sourcing?',
              answer:
                '**Without ES**: commands update a normal write DB; projectors copy/transform to read DB. **With ES**: commands append events; read models rebuild from the event stream — see **Event Sourcing** pattern for details.',
            },
            {
              question: 'How do you handle stale reads after a command?',
              answer:
                'Accept **eventual consistency**, return a **202 + poll**, use **read-your-writes** (route to updated replica), or include a **version** the UI waits on before showing confirmation.',
            },
            {
              question: 'Design CQRS for a food delivery order tracker.',
              answer:
                '**Command side**: `PlaceOrder`, `CancelOrder` on write DB with inventory/payment rules. **Query side**: denormalized `order_tracker` with restaurant name, rider location, ETA — updated from Kafka events, served from Redis or read replica.',
            },
            {
              question: 'When should you NOT use CQRS?',
              answer:
                'Simple domains, small teams, symmetric CRUD, or when strong immediate read-after-write on the same aggregate is mandatory everywhere without extra infrastructure.',
            },
            {
              question: 'How does CQRS relate to Event Sourcing?',
              answer:
                'They complement each other: **Event Sourcing** is a write-side persistence style; **CQRS** is the read/write split. ES often feeds CQRS projections, but CQRS can use traditional relational writes.',
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
          body: '1. **Separate command and query models** when read/write needs diverge.\n2. Works **with or without Event Sourcing**.\n3. Real uses: **e-commerce dashboards, delivery tracking, banking analytics**.\n4. Expect **eventual consistency** on reads — design UX and projections accordingly.',
        },
      ],
    },
  ],
};

export default content;
