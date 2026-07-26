import { DesignContent } from '../../../shared/models';
import { CHANGE_DATA_CAPTURE_META } from './change-data-capture.meta';

const content: DesignContent = {
  meta: CHANGE_DATA_CAPTURE_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Change Data Capture (CDC)** tracks and publishes database **inserts, updates, and deletes** so downstream systems stay in sync without dual-writes or heavy polling.\n\nCompare with app-emitted events via the [Transactional Outbox](/designs/transactional-outbox) — outbox is written by the app in the same transaction; log-based CDC reads the DB WAL/binlog.',
        },
        {
          type: 'image',
          src: 'assets/article-images/change-data-capture/01-overview.png',
          alt: 'CDC capturing database changes and streaming them to consumers',
          caption:
            'CDC monitors the database and streams change events. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
      ],
    },
    {
      id: 'how-it-works',
      title: 'How CDC Works',
      blocks: [
        {
          type: 'markdown',
          value:
            'At a high level: continuously **monitor** the database → **capture** each change as an event → **publish** to a queue/stream or change table → consumers apply updates (caches, search, warehouses, other services). Capture can use timestamps, triggers, or transaction logs.',
        },
        {
          type: 'image',
          src: 'assets/article-images/change-data-capture/02-how-cdc-works.png',
          alt: 'CDC flow from database change through capture to downstream consumers',
          caption:
            'Monitor → capture → deliver. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
      ],
    },
    {
      id: 'approaches',
      title: 'Implementation Approaches',
      blocks: [
        {
          type: 'markdown',
          value:
            '### 1. Timestamp-based CDC\n\nPoll rows where `updated_at > last_checkpoint`. Simple, but misses **deletes** (unless soft-delete), can skip rows if clocks skew, and loads the DB with repeated scans.',
        },
        {
          type: 'image',
          src: 'assets/article-images/change-data-capture/03-timestamp-based.png',
          alt: 'Timestamp-based CDC polling rows by updated_at column',
          caption: 'Poll on `updated_at`. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'markdown',
          value:
            '### 2. Trigger-based CDC\n\nDB triggers on INSERT/UPDATE/DELETE write to a change/audit table. Near real-time, but **slows writes** (trigger runs in the transaction) and couples schema to trigger maintenance.',
        },
        {
          type: 'image',
          src: 'assets/article-images/change-data-capture/04-trigger-based.png',
          alt: 'Trigger-based CDC writing change rows from database triggers',
          caption:
            'Triggers log changes during the transaction. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'markdown',
          value:
            '### 3. Log-based CDC (preferred)\n\nRead the write-ahead log / binlog (PostgreSQL logical decoding, MySQL binlog). Tools: **Debezium**, **Kafka Connect**, **AWS DMS**. Low overhead on OLTP, captures deletes, preserves order.',
        },
        {
          type: 'image',
          src: 'assets/article-images/change-data-capture/05-log-based.png',
          alt: 'Log-based CDC reading the database WAL or binlog',
          caption:
            'Stream from the transaction log. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'featureComparison',
          caption: 'CDC approaches compared.',
          columns: ['Timestamp', 'Trigger', 'Log-based'],
          rows: [
            { feature: 'Captures deletes', values: ['Soft-delete only', true, true] },
            { feature: 'Write-path overhead', values: ['Low (poll)', 'High', 'Low'] },
            { feature: 'Latency', values: ['Poll interval', 'Immediate', 'Near real-time'] },
            { feature: 'Ops complexity', values: ['Low', 'Medium', 'Higher'] },
          ],
        },
      ],
    },
    {
      id: 'use-cases',
      title: 'Use Cases',
      blocks: [
        {
          type: 'bestPractices',
          title: 'Where CDC shines',
          practices: [
            '**Microservices sync** — propagate shared data changes via Kafka without dual-write.',
            '**Event sourcing assist** — build an event log from existing tables.',
            '**Warehousing / ETL** — stream OLTP changes into analytics stores.',
            '**Cache invalidation** — drop or refresh Redis keys when rows change.',
            '**Search reindex** — push updates to Elasticsearch/OpenSearch.',
          ],
        },
      ],
    },
    {
      id: 'debezium-kafka',
      title: 'Debezium and Kafka',
      blocks: [
        {
          type: 'image',
          src: 'assets/article-images/change-data-capture/06-debezium-kafka.png',
          alt: 'Debezium connector streaming MySQL or Postgres changes into Kafka topics',
          caption:
            'Debezium + Kafka Connect pipeline. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'markdown',
          value:
            '1. Run Kafka (+ Connect).\n2. Configure a Debezium connector (DB host, tables, server name).\n3. Connector tails WAL/binlog and publishes JSON (or Avro) events to topics like `dbserver.inventory.orders`.\n4. Consumers apply side effects idempotently.',
        },
      ],
    },
    {
      id: 'challenges',
      title: 'Challenges',
      blocks: [
        {
          type: 'markdown',
          value:
            '- **Schema evolution** — added/renamed columns must not break consumers.\n- **High throughput** — backpressure, partitioning, and Connect scaling.\n- **Ordering** — preserve per-key / per-partition order for correct replays.\n- **Security & compliance** — change streams may contain PII; encrypt and ACL topics.',
        },
      ],
    },
    {
      id: 'java-spring',
      title: 'Java / Spring Notes',
      blocks: [
        {
          type: 'markdown',
          value:
            'Apps rarely parse WAL themselves — they **consume** Debezium envelopes from Kafka. Typical fields: `op` (`c`/`u`/`d`/`r`), `before`, `after`, `source.ts_ms`.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'DebeziumListener.java',
          code: `@KafkaListener(topics = "dbserver.public.orders")
public void onChange(String payload) {
  JsonNode root = mapper.readTree(payload);
  String op = root.path("payload").path("op").asText();
  JsonNode after = root.path("payload").path("after");
  JsonNode before = root.path("payload").path("before");

  switch (op) {
    case "c", "u", "r" -> upsertCache(after);
    case "d" -> evictCache(before.path("id").asLong());
    default -> { /* ignore */ }
  }
}`,
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Outbox vs CDC',
          body: 'Need **business events** shaped by the app? Prefer [Transactional Outbox](/designs/transactional-outbox). Need **any** table change without app changes? Prefer **log-based CDC**. Many stacks use both.',
        },
      ],
    },
    {
      id: 'source',
      title: 'Source',
      blocks: [
        {
          type: 'callout',
          variant: 'note',
          title: 'Source',
          body: 'Summarized from Ashish Pratap Singh’s AlgoMaster article “What is Change Data Capture (CDC)?,” with Kafka/Debezium Java notes for this platform.',
        },
      ],
    },
  ],
};

export default content;
