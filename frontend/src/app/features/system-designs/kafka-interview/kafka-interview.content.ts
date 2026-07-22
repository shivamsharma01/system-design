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
            'Nineteen Kafka interview questions, ordered from core concepts to real production failures. Each answer explains the guarantee Kafka gives you, where that guarantee stops applying, and the trade-off you take on in practice.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Interview anchor',
          body: 'Kafka only guarantees ordering **within a single partition** — never across a whole topic. In practice, "reliable" usually means **at-least-once delivery** (a message might arrive twice) **plus idempotent processing** (processing it twice has the same effect as once).',
        },
      ],
    },
    {
      id: 'interview-questions',
      title: 'Interview Questions and Answers',
      blocks: [
        {
          type: 'interviewQa',
          variant: 'sketch',
          items: [
            {
              question: 'Producer vs Consumer?',
              answer:
                'A **producer** sends (publishes) records to a topic. It decides which partition each record goes to, using a key, round-robin, or a custom rule.\n\nA **consumer** reads records, processes them, and keeps track of which ones it has already read using offsets (a position marker per partition). Consumers can share the same `group.id`; when they do, Kafka splits up the partitions between them so each partition is only read by one consumer in that group at a time.',
            },
            {
              question: 'What is a Kafka partition?',
              answer:
                'A partition is an ordered, append-only log — you can only add new records to the end, never edit old ones. It is the basic unit Kafka uses to spread work in parallel. Each record gets an increasing number called an offset.\n\nOrdering only holds **inside one partition**, not across an entire topic. Replication (copying data to other brokers for safety) and consumer assignment also happen at the partition level, not the topic level.',
            },
            {
              question: 'At-most-once vs at-least-once vs exactly-once?',
              answer:
                "**At-most-once** means a message might get lost, but it will never be processed twice.\n\n**At-least-once** means a message is never lost, but it might be processed more than once (a duplicate).\n\n**Exactly-once** (Kafka calls this EOS) uses idempotent producers and transactions, but this guarantee only covers operations happening **inside Kafka**. If your consumer also writes to a database or calls an external API, you still have to make those steps idempotent yourself — Kafka can't do that part for you.",
            },
            {
              question: 'What is a Dead Letter Queue (DLQ/DLT)?',
              answer:
                'A DLT is a separate topic where you send records that still fail even after a limited number of retries. Store the original payload, the source topic/partition/offset, a unique event ID, and details about the error alongside it. That way, an operator can later inspect why it failed and safely replay it.',
            },
            {
              question: 'How do you increase Kafka throughput?',
              answer:
                "A few levers work together:\n\n- Increase the number of partitions actually being used in parallel.\n- Batch and compress what producers send instead of sending one record at a time.\n- Send asynchronously, without waiting on each write.\n- Scale up consumers, but only up to the number of partitions — beyond that, extra consumers sit idle.\n- Keep slow or blocking work out of the consumer's poll loop.\n\nBefore tuning any of this, measure first: check for hot keys, broker disk/network limits, consumer lag, and downstream latency, so you fix the actual bottleneck.",
            },
            {
              question: 'What happens when a broker goes down?',
              answer:
                'For every partition that broker was leading, Kafka elects a new leader from the in-sync replicas (followers that were fully caught up). Partitions where the broker was only a follower become temporarily unavailable until it comes back.\n\nIf a producer uses `acks=all` (wait for all in-sync replicas to confirm), writes can start failing if too many replicas fall out of sync, dropping below `min.insync.replicas`. Clients notice the change, refresh their view of the cluster, and reconnect to the new leader automatically.',
            },
            {
              question: 'How do you retry failed messages?',
              answer:
                "Only retry failures that look temporary — a brief network blip, not a bad message. Use backoff that increases with each retry, with some randomness added (jitter) so retries don't all pile up at once.\n\nFor longer delays, route the message to a separate retry topic instead of blocking the main consumer. Once retries run out, or the error clearly isn't retryable, send the record to a dead letter topic.\n\nBecause retries can cause the same message to run twice, every handler must be idempotent — running it twice should have the same effect as running it once.",
            },
            {
              question: 'How do you scale Kafka consumers?',
              answer:
                "Add more consumers to the same consumer group, and Kafka automatically rebalances (redistributes) partitions across them.\n\nThere's a limit though: you can't usefully have more active consumers than partitions, since each partition is only read by one consumer in a group at a time. If you need more parallelism, add more partitions — but be aware this can affect ordering (records sharing a key must still land on the same partition) and rebalances take some time to settle.",
            },
            {
              question: 'Explain Event-Driven Architecture.',
              answer:
                "Services publish facts about things that happened — for example, a `PaymentCaptured` event — and other services react to them independently, without a direct call between them.\n\nBenefits: services stay loosely coupled, work can be buffered during spikes, one event can be delivered to many consumers (fan-out), and you can replay past events if needed.\n\nTrade-offs: data isn't instantly consistent everywhere (this is called eventual consistency), and you now have to manage schema changes over time, duplicate processing, ordering, and monitoring across services.",
            },
            {
              question: 'When do you choose synchronous calls over asynchronous messaging?',
              answer:
                'Use a synchronous call (direct request, wait for response) when the caller needs an answer immediately, or needs to validate something before moving on.\n\nUse asynchronous messaging when the work can happen later, needs to fan out to multiple consumers, benefits from buffering, or needs automatic retries.\n\nA common middle ground: write to the database (often alongside an "outbox" record) synchronously, and let everything downstream happen asynchronously.',
            },
            {
              question: 'How would you design a high-throughput Kafka architecture?',
              answer:
                'Start with one topic per domain event. Choose a partition key based on the smallest scope you actually need ordering for (for example, per customer, not globally) — a narrower key spreads load better.\n\nUse schemas that stay compatible as they evolve, make producers idempotent and send in batches, and give each independent workload its own consumer group.\n\nAdd auto-scaling driven by consumer lag, set replication factor to 3 for durability, add dead letter topics for failures, use the outbox pattern or CDC (Change Data Capture) for reliable publishing, and add tracing/metrics/logging across the whole flow.',
            },
            {
              question:
                'A consumer crashes after processing but before committing its offset. What happens?',
              answer:
                "Kafka will redeliver that record, because it never recorded the offset as committed. This is expected behavior with at-least-once delivery — it's not a bug.\n\nTo handle it safely, give each event a stable, unique ID, and save that ID together with the business update in one atomic step. When the duplicate arrives, your code recognizes the ID and does nothing the second time.",
            },
            {
              question: 'How do you stop one Kafka event being processed twice?',
              answer:
                'Store the event\'s unique ID (`eventId`) in a "processed events" table with a uniqueness constraint, inside the same database transaction as the business change. If the same event shows up again, inserting its ID will fail with a conflict — that tells you it was already handled, so you skip it.\n\nIf the event also triggers a call to an external API, pass that same ID along as an idempotency key so the external system can also detect duplicates.',
            },
            {
              question:
                'The DB transaction succeeds but Kafka publishing fails. How do you maintain consistency?',
              answer:
                'Use the **transactional outbox** pattern: in one database transaction, save both the business row and a record of the event to publish (in an "outbox" table). A separate process then reads the outbox, publishes to Kafka, and marks the row as sent.\n\nTools like Debezium can do this relay automatically using CDC (Change Data Capture), which reads database change logs instead of a custom publisher. Either way, consumers should still deduplicate, since the relay might occasionally publish the same event more than once.',
            },
            {
              question: 'A consumer is running but lag keeps increasing. What do you check?',
              answer:
                "First compare how fast records are being produced versus consumed — that tells you if it's a real backlog or a temporary spike.\n\nThen dig into: how long the handler takes at the p99 (99th percentile, i.e. near-worst-case latency), whether it's waiting on a slow downstream database or API, whether you have enough consumers for your partition count, whether one partition is getting more traffic than others, garbage collection pauses, frequent rebalances, the `max.poll.interval.ms` setting, whether a single bad message (\"poison message\") is stuck retrying forever, and whether the broker's disk or network is under pressure.",
            },
            {
              question:
                'A Kafka consumer group keeps rebalancing every few minutes. What could trigger it?',
              answer:
                'A rebalance occurs when group membership or subscribed partition metadata changes. Common triggers are a consumer exceeding `max.poll.interval.ms` because record processing, retries, blocking I/O, or GC pauses keep it from calling `poll`; missed heartbeats/session timeout from CPU starvation, network pauses, or broker issues; pod restarts/autoscaling/rolling deployments; consumers joining/leaving; topic partition-count changes; unstable `group.instance.id`; and application code repeatedly subscribing/unsubscribing.\n\nCorrelate consumer coordinator logs/rebalance reason with pod events, GC, processing p99, heartbeat/request latency, and deployment/HPA timestamps. Keep the poll loop responsive: reduce `max.poll.records`, offload processing with bounded ordering-aware workers, pause/resume partitions, add downstream timeouts, and set `max.poll.interval.ms` above worst legitimate batch time rather than masking hangs. Use cooperative-sticky assignment and static membership to reduce disruption, graceful `wakeup/close` on shutdown, and avoid autoscaling oscillation. Rebalances are normal on membership changes; frequent unexplained ones indicate liveness or lifecycle instability.',
            },
            {
              question: 'One partition is overloaded while others are idle. Why?',
              answer:
                "This usually means the partition key isn't spread evenly. Common causes: one tenant or entity sends far more traffic than others, records are missing a key (null keys often fall back to one partition), or a custom partitioner has a bug.\n\nFix it by choosing a key with more variety (higher cardinality), or by splitting up the busiest entities — while still keeping together only the records that genuinely need to stay in order with each other.",
            },
            {
              question: 'How do you safely reprocess records from a DLT?',
              answer:
                "Before replaying anything: find and fix the root cause, and confirm your handlers are idempotent so replays can't cause harm. Keep the original event IDs so duplicates can still be detected.\n\nThen replay selectively and at a controlled, slow rate, tracking the outcome of each record. Never wire a dead letter topic to automatically feed back into the main topic — that can turn into a retry storm that never stops.",
            },
            {
              question: 'How do you guarantee ordering and exactly-once processing?',
              answer:
                'Send related records to the same partition using a consistent key, and process that partition\'s records one at a time, in order.\n\nKafka transactions can give you exactly-once behavior for the "read, transform, write" steps that happen entirely inside Kafka. But once you also write to a database or call external services, you still need idempotent writes, or an outbox/inbox pattern, to avoid duplicate effects outside Kafka.',
            },
            {
              question:
                'How do you achieve exactly-once business processing over at-least-once delivery?',
              answer:
                'Give each event, or business action, a unique key. When processing it, check for and record that key in the same atomic step as your state update — this catches duplicates. Use that same key when triggering any external side effects, and publish follow-up events through an outbox.\n\nThe result: duplicate messages can still arrive, but they can never change your business state more than once.',
            },
          ],
        },
      ],
    },
  ],
};

export default content;
