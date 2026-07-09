import { DesignContent } from '../../../shared/models';
import { TRANSACTIONAL_OUTBOX_META } from './transactional-outbox.meta';

const content: DesignContent = {
  meta: TRANSACTIONAL_OUTBOX_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'The **Transactional Outbox** pattern solves the **dual-write problem**: you need to update a database **and** publish a message (e.g. to Kafka), but those are two separate systems with no shared transaction. The fix is to insert the outbound message into an **outbox table in the same database transaction** as the domain write, then a separate **relay process** publishes to the message broker.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Dual-write problem',
          body: 'If you write to DB then publish to Kafka, a crash between the two leaves **inconsistent state** — order saved but event never sent (downstream saga stuck) or event sent but DB rolled back (phantom messages).',
        },
        {
          type: 'table',
          caption: 'Outbox relay options.',
          headers: ['Relay style', 'How it works'],
          rows: [
            ['Polling publisher', 'App or job polls `outbox` for unpublished rows'],
            ['Log-based CDC', 'Debezium reads DB WAL → Kafka Connect sink'],
            ['Transactional messaging', 'Some brokers support XA — rare in cloud-native stacks'],
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
          body: 'A **bank teller** updates your account ledger and slips a **duplicate receipt into the outbox tray** in one atomic action. A back-office clerk periodically collects the tray and mails notifications — if the teller crashes mid-shift, the ledger and tray always match.',
        },
        {
          type: 'mermaid',
          caption: 'Domain write and outbox insert share one DB transaction; relay publishes to Kafka.',
          definition: `flowchart LR
  subgraph same TX
    D[Domain table UPDATE]
    O[Outbox INSERT]
  end
  D --- O
  R[Relay / Debezium CDC] -->|poll or WAL| O
  R --> K[Kafka topic]
  K --> C[Saga / Inventory consumer]`,
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
            ['E-commerce orders', 'Order row + `OrderPlaced` event for payment and inventory sagas'],
            ['Payment capture', 'Ledger entry + `PaymentCaptured` to trigger fulfillment'],
            ['Food delivery', 'Restaurant acceptance + event to dispatch and customer notification'],
            ['Banking transfers', 'Account debit record + `TransferInitiated` for downstream clearing'],
            ['User registration', 'User row + `UserCreated` for email and analytics services'],
            ['Microservice integration', 'Any service that must reliably notify others after a local commit'],
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
            'The outbox row stores **topic, payload, headers, and publish status**. The relay marks rows published (or deletes them) after successful broker ack. Consumers should still be **idempotent** — use the **Inbox pattern** — because relay delivers **at-least-once**.',
        },
        {
          type: 'code',
          language: 'sql',
          filename: 'outbox_table.sql',
          code: `CREATE TABLE outbox (
  id            UUID PRIMARY KEY,
  aggregate_id  UUID NOT NULL,
  event_type    VARCHAR(80) NOT NULL,
  payload       JSONB NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at  TIMESTAMPTZ
);

CREATE INDEX idx_outbox_unpublished
  ON outbox (created_at)
  WHERE published_at IS NULL;`,
        },
        {
          type: 'code',
          language: 'java',
          filename: 'PlaceOrderService.java',
          code: `@Service
public class PlaceOrderService {
  private final JdbcTemplate jdbc;

  @Transactional
  public void placeOrder(PlaceOrderCommand cmd) {
    jdbc.update(
        "INSERT INTO orders (id, customer_id, total, status) VALUES (?, ?, ?, 'PENDING')",
        cmd.orderId(), cmd.customerId(), cmd.total());

    jdbc.update(
        "INSERT INTO outbox (id, aggregate_id, event_type, payload) VALUES (?, ?, ?, ?::jsonb)",
        UUID.randomUUID(),
        cmd.orderId(),
        "OrderPlaced",
        toJson(new OrderPlacedEvent(cmd.orderId(), cmd.items(), cmd.total())));
    // single commit — order and outbox appear together
  }
}

@Component
class OutboxRelay {
  @Scheduled(fixedDelay = 1000)
  void publishPending() {
    List<OutboxRow> batch = outboxRepo.fetchUnpublished(100);
    for (OutboxRow row : batch) {
      kafka.send(row.topic(), row.payload());
      outboxRepo.markPublished(row.id());
    }
  }
}`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Ordering and duplicates',
          body: 'Relay retries produce **duplicate publishes**. Downstream **Saga** steps and inventory handlers must dedupe via message ID + **Inbox pattern**. For strict per-aggregate ordering, partition Kafka by `aggregate_id`.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Atomic domain write + event intent in one DB transaction.',
            'Survives process crashes between DB commit and broker publish.',
            'Works with standard PostgreSQL/MySQL — no exotic XA setup.',
          ],
          cons: [
            'Adds latency until relay runs (unless CDC is near-real-time).',
            'Outbox table needs retention, monitoring, and backpressure handling.',
            'Does not give exactly-once end-to-end — consumers must be idempotent.',
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
              question: 'What is the dual-write problem?',
              answer:
                'Updating a **database** and publishing to a **message broker** are two independent operations. Without coordination, one can succeed and the other fail, breaking consistency across services.',
            },
            {
              question: 'How does the Transactional Outbox fix it?',
              answer:
                'Insert the message into an **outbox table in the same DB transaction** as the business write. A **relay** (polling job or Debezium CDC) publishes to Kafka afterward — the DB becomes the source of truth.',
            },
            {
              question: 'Polling relay vs Debezium CDC?',
              answer:
                '**Polling** is simple: `SELECT … WHERE published_at IS NULL`. **CDC** reads the DB transaction log — lower latency, less DB load, but more operational complexity (Kafka Connect, schema handling).',
            },
            {
              question: 'Does outbox guarantee exactly-once delivery?',
              answer:
                '**No** — relay is at-least-once to the broker. **Exactly-once effect** requires idempotent consumers, often via the **Inbox pattern** or dedupe keys.',
            },
            {
              question: 'How does outbox support sagas?',
              answer:
                'Each saga step commits local state + outbox event atomically. Downstream participants receive reliable events to continue or compensate — critical for **order → payment → inventory** flows.',
            },
            {
              question: 'When would you skip the outbox?',
              answer:
                'When the message **is** the source of truth (Kafka as system of record), or when temporary inconsistency is acceptable and you have reconciliation jobs — rare for money or inventory paths.',
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
          body: '1. Never dual-write — **outbox + relay** atomically couples DB and events.\n2. Relay via **polling** or **CDC** to Kafka.\n3. Real uses: **order placed, payment captured, bank transfer initiated**.\n4. Pair with **Saga** orchestration and **Inbox** consumers for end-to-end reliability.',
        },
      ],
    },
  ],
};

export default content;
