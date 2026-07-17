import { DesignContent } from '../../../shared/models';
import { KAFKA_INTERVIEW_META } from './kafka-interview.meta';

const content: DesignContent = {
  meta: KAFKA_INTERVIEW_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'Nineteen deduplicated Kafka questions ordered from core concepts to production failure scenarios. Each answer states the guarantee, its scope, and the operational trade-off.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Interview anchor',
          body: 'Kafka guarantees ordering **within one partition**. Practical reliability normally means **at-least-once delivery plus idempotent business processing**.',
        },
      ],
    },
    {
      id: 'interview-questions',
      title: 'Interview Questions and Answers',
      blocks: [
        {
          type: 'interviewQa',
          items: [
            {
              question: 'Producer vs Consumer?',
              answer:
                'A **producer** publishes records and chooses a partition through a key, round-robin strategy, or custom partitioner. A **consumer** pulls records, processes them, and tracks offsets. Consumers sharing a `group.id` divide partitions among themselves.',
            },
            {
              question: 'What is a Kafka partition?',
              answer:
                'A partition is an ordered, append-only log and Kafka’s unit of parallelism. Records receive increasing offsets. Ordering exists **inside a partition**, not across a whole topic; replication and consumer assignment are also partition-based.',
            },
            {
              question: 'At-most-once vs at-least-once vs exactly-once?',
              answer:
                '**At-most-once** can lose records but avoids redelivery. **At-least-once** avoids loss but can redeliver. Kafka EOS uses idempotent producers and transactions for Kafka operations; external DB or payment effects still require idempotency.',
            },
            {
              question: 'What is a Dead Letter Queue (DLQ/DLT)?',
              answer:
                'A DLT is a separate topic for records that still fail after bounded retries. Preserve the original payload, topic, partition, offset, event ID, and error metadata so operators can diagnose and replay safely.',
            },
            {
              question: 'How do you increase Kafka throughput?',
              answer:
                'Increase useful partition parallelism, batch and compress producer writes, send asynchronously, scale consumers up to partition count, and keep blocking work out of the poll loop. Measure hot keys, broker disk/network, lag, and downstream latency before tuning.',
            },
            {
              question: 'What happens when a broker goes down?',
              answer:
                'For partitions it led, an in-sync follower is elected leader. Followers on that broker become unavailable until recovery. Producers using `acks=all` can fail if ISR drops below `min.insync.replicas`; clients refresh metadata and reconnect.',
            },
            {
              question: 'How do you retry failed messages?',
              answer:
                'Retry only transient failures with bounded exponential backoff and jitter. Use retry topics for longer delays, then route exhausted or non-retryable records to a DLT. Every handler must be idempotent because retries can duplicate effects.',
            },
            {
              question: 'How do you scale Kafka consumers?',
              answer:
                'Add consumers to the same group; Kafka rebalances partitions between them. Useful concurrency is capped by partition count. Increase partitions when more parallelism is needed, while accounting for key ordering and rebalance cost.',
            },
            {
              question: 'Explain Event-Driven Architecture.',
              answer:
                'Services publish facts such as `PaymentCaptured`; independent consumers react asynchronously. This provides loose coupling, buffering, fan-out, and replay, but introduces eventual consistency, schema evolution, idempotency, ordering, and observability challenges.',
            },
            {
              question: 'When do you choose synchronous calls over asynchronous messaging?',
              answer:
                'Use synchronous calls when the caller needs an immediate answer or validation. Use messaging for deferred work, fan-out, buffering, retries, and temporal decoupling. A common hybrid writes synchronously to a DB/outbox and processes downstream work asynchronously.',
            },
            {
              question: 'How would you design a high-throughput Kafka architecture?',
              answer:
                'Define domain-event topics, partition by the smallest required ordering key, use compatible schemas, idempotent batched producers, and one consumer group per workload. Add lag-based scaling, replication factor 3, DLTs, outbox/CDC, and end-to-end telemetry.',
            },
            {
              question:
                'A consumer crashes after processing but before committing its offset. What happens?',
              answer:
                'Kafka redelivers the record because its offset was not committed. This is normal at-least-once behavior. Use a stable event ID and atomically record it with the business update so the second delivery becomes a no-op.',
            },
            {
              question: 'How do you stop one Kafka event being processed twice?',
              answer:
                'Insert the `eventId` into a processed-events table with a unique constraint in the same DB transaction as the business change. A conflict means it was already applied. External APIs must receive the same idempotency key.',
            },
            {
              question:
                'The DB transaction succeeds but Kafka publishing fails. How do you maintain consistency?',
              answer:
                'Use a **transactional outbox**: commit the business row and outbox row in one DB transaction, then publish asynchronously and mark the row sent. CDC such as Debezium is another relay option. Consumers still deduplicate relay retries.',
            },
            {
              question: 'A consumer is running but lag keeps increasing. What do you check?',
              answer:
                'Compare produce and consume rates, then inspect handler p99, downstream DB/API waits, consumer count vs partitions, hot partitions, GC pauses, rebalances, `max.poll.interval.ms`, poison-message retry loops, and broker disk/network health.',
            },
            {
              question: 'One partition is overloaded while others are idle. Why?',
              answer:
                'The key distribution is skewed: a hot tenant/entity, null-key behavior, or faulty custom partitioner directs too much traffic to one partition. Choose a higher-cardinality key or split hot entities while preserving only the ordering scope you need.',
            },
            {
              question: 'How do you safely reprocess records from a DLT?',
              answer:
                'Fix and verify the root cause, ensure handlers are idempotent, preserve original event IDs, replay selectively at a controlled rate, and track outcomes. Never create an automatic DLT-to-main loop that can become a retry storm.',
            },
            {
              question: 'How do you guarantee ordering and exactly-once processing?',
              answer:
                'Put related records on one partition using a stable key and process that partition sequentially. Kafka transactions cover consume-transform-produce inside Kafka. DB and external effects need idempotent writes or outbox/inbox patterns.',
            },
            {
              question:
                'How do you achieve exactly-once business processing over at-least-once delivery?',
              answer:
                'Attach a unique event or business key, atomically deduplicate with the state update, use the key for external side effects, and publish follow-up events through an outbox. Duplicates may arrive, but they cannot change business state twice.',
            },
          ],
        },
      ],
    },
  ],
};

export default content;
