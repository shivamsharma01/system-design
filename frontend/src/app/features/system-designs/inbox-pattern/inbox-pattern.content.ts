import { DesignContent } from '../../../shared/models';
import { INBOX_PATTERN_META } from './inbox-pattern.meta';

const content: DesignContent = {
  meta: INBOX_PATTERN_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'The **Inbox pattern** gives consumers **exactly-once processing effect** under **at-least-once delivery**. Before handling a message, the consumer records its **unique message ID** in an inbox table within the same database transaction as the business update. Duplicate deliveries see the ID already present and **skip** reprocessing.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Consumer-side complement',
          body: 'The **Transactional Outbox** guarantees reliable **publish** after a local write. The **Inbox** guarantees reliable **consume** — together they form a robust integration backbone for sagas and event-driven services.',
        },
        {
          type: 'table',
          caption: 'Delivery semantics.',
          headers: ['Broker guarantee', 'Without inbox', 'With inbox'],
          rows: [
            ['At-least-once', 'Duplicate charges, double inventory deduction', 'Second delivery ignored safely'],
            ['At-most-once', 'Possible message loss', 'Inbox does not fix loss — use ack-after-commit'],
            ['Exactly-once (broker)', 'Broker-specific, limited', 'Inbox achieves same effect in your DB'],
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
          body: 'A **food delivery hub** logs each order ticket number when a rider picks it up. If the same ticket is scanned again (system retry), the clerk sees it already checked off and sends the rider on without cooking a second meal — the **ticket ID** is the dedupe key.',
        },
        {
          type: 'mermaid',
          caption: 'Inbox dedupe inside the consumer local transaction.',
          definition: `sequenceDiagram
  participant K as Kafka
  participant C as Payment Consumer
  participant DB as Database

  K->>C: PaymentCaptured (msg_id=abc)
  C->>DB: BEGIN
  C->>DB: INSERT inbox (abc) — success
  C->>DB: UPDATE ledger (capture funds)
  C->>DB: COMMIT
  C->>K: commit offset

  Note over K,C: duplicate delivery
  K->>C: PaymentCaptured (msg_id=abc)
  C->>DB: INSERT inbox (abc) — conflict / skip
  C-->>C: no-op, ack offset`,
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
            ['Payment processing', 'Dedupe `PaymentCaptured` so customers are not charged twice'],
            ['E-commerce inventory', 'Ignore duplicate `StockReserved` events from outbox relay retries'],
            ['Food delivery dispatch', 'One rider assignment per order event despite Kafka redelivery'],
            ['Banking transfers', 'Process `TransferCompleted` once even if clearing house retries'],
            ['Saga compensations', 'Idempotent `RefundPayment` handler keyed by saga step ID'],
            ['Webhook ingestion', 'Store external event ID before side effects (Stripe, PayPal)'],
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
            'Use a **stable message ID** — Kafka headers, business correlation ID, or hash of (topic, partition, offset) for replay scenarios. Insert into inbox **before** side effects in the **same transaction**. Commit Kafka offset **after** DB commit succeeds.',
        },
        {
          type: 'code',
          language: 'sql',
          filename: 'inbox_table.sql',
          code: `CREATE TABLE inbox (
  message_id    VARCHAR(128) PRIMARY KEY,
  consumer_name VARCHAR(80) NOT NULL,
  received_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  payload_hash  VARCHAR(64)
);

-- composite key if same ID can appear on different consumers
CREATE UNIQUE INDEX uq_inbox_consumer
  ON inbox (consumer_name, message_id);`,
        },
        {
          type: 'code',
          language: 'java',
          filename: 'InboxPaymentConsumer.java',
          code: `@Component
public class InboxPaymentConsumer {
  private final JdbcTemplate jdbc;

  @KafkaListener(topics = "payment.captured")
  @Transactional
  public void onPaymentCaptured(ConsumerRecord<String, String> record) {
    String messageId = header(record, "message-id");
    String consumer = "payment-ledger";

    int inserted = jdbc.update(
        "INSERT INTO inbox (message_id, consumer_name) VALUES (?, ?) ON CONFLICT DO NOTHING",
        messageId, consumer);

    if (inserted == 0) {
      return; // already processed — idempotent skip
    }

    PaymentCapturedEvent event = parse(record.value());
    jdbc.update(
        "UPDATE accounts SET balance = balance - ? WHERE id = ?",
        event.amount(), event.accountId());
    jdbc.update(
        "INSERT INTO ledger_entries (id, account_id, amount, type) VALUES (?, ?, ?, 'DEBIT')",
        UUID.randomUUID(), event.accountId(), event.amount());
  }
}`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Offset commit ordering',
          body: 'Commit the broker offset **only after** the inbox + business TX commits. Early offset commit loses messages on crash; late commit causes redelivery — inbox makes redelivery safe.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Simple, portable idempotency without broker exactly-once magic.',
            'Works with any DB-backed consumer and at-least-once brokers.',
            'Essential partner to Transactional Outbox and saga retries.',
          ],
          cons: [
            'Inbox table grows — plan retention or archival.',
            'Requires meaningful, stable message IDs from producers.',
            'Does not help if business logic itself is non-idempotent without the inbox gate.',
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
              question: 'Why do we need the Inbox pattern if Kafka retries?',
              answer:
                'Kafka (and SQS, etc.) deliver **at-least-once** on failure or rebalance. Without dedupe, a **payment capture** or **inventory deduction** runs twice. Inbox records the message ID so duplicates are no-ops.',
            },
            {
              question: 'Inbox vs idempotent API design?',
              answer:
                '**Idempotent APIs** (e.g. `Idempotency-Key` header) protect HTTP callers. **Inbox** protects **async consumers** from broker redelivery — both are often needed in the same system.',
            },
            {
              question: 'What ID should you use as the dedupe key?',
              answer:
                'Prefer a **producer-assigned UUID** in message headers. Fallback: business key like `orderId + eventType`. Avoid offset-only keys if you replay topics from the beginning.',
            },
            {
              question: 'How does inbox pair with the Transactional Outbox?',
              answer:
                'Outbox ensures events are **published reliably** after a write. Inbox ensures events are **consumed reliably** without duplicate side effects — the two sides of integration safety.',
            },
            {
              question: 'INSERT inbox before or after business logic?',
              answer:
                '**Before**, in the **same transaction**. If business logic fails, inbox row rolls back and the message can be retried. If inbox insert fails on duplicate, skip business logic entirely.',
            },
            {
              question: 'How do you handle poison messages with inbox?',
              answer:
                'Inbox prevents duplicates but not bad payloads. Combine with **Dead Letter Queue**, validation, and alerts. Do not insert inbox until validation passes, or use a separate processing status column.',
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
          body: '1. **Inbox table** dedupes at-least-once message delivery.\n2. Insert message ID + business update in **one transaction**.\n3. Real uses: **payments, inventory, banking, saga steps**.\n4. Combine with **Transactional Outbox** (publish) and **idempotent** business keys.',
        },
      ],
    },
  ],
};

export default content;
