import { DesignContent } from '../../../shared/models';
import { MESSAGE_QUEUES_META } from './message-queues.meta';

const content: DesignContent = {
  meta: MESSAGE_QUEUES_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'A **message queue** is an intermediary that holds messages from **producers** until **consumers** retrieve them. Producers and consumers need not know each other or be online at the same time — that **decoupling** is the core value.\n\nDeeper pattern pages: [Publish-Subscribe](/designs/publish-subscribe), [Competing Consumers](/designs/competing-consumers), [Delivery Semantics](/designs/delivery-semantics), [Dead Letter Channel](/designs/dead-letter-channel), [Kafka Interview](/designs/kafka-interview).',
        },
      ],
    },
    {
      id: 'components',
      title: 'Core Components',
      blocks: [
        {
          type: 'image',
          src: 'assets/article-images/message-queues/01-core-components.png',
          alt: 'Message queue core components: producer, queue/broker, consumer, and message',
          caption:
            'Producer, consumer, queue, broker, and message. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'markdown',
          value:
            '1. **Producer / publisher** — sends messages without waiting on consumers.\n2. **Consumer / subscriber** — pulls (or is pushed) messages and processes them.\n3. **Queue** — stores messages until consumed.\n4. **Broker / queue manager** — routes, persists, and delivers (RabbitMQ, Kafka, SQS, …).\n5. **Message** — payload plus metadata (headers, timestamp, priority, correlation id).',
        },
      ],
    },
    {
      id: 'workflow',
      title: 'How Message Queues Work',
      blocks: [
        {
          type: 'image',
          src: 'assets/article-images/message-queues/02-workflow.png',
          alt: 'Message queue workflow from enqueue through store, dequeue, ack, and delete',
          caption:
            'Create → enqueue → store → dequeue → ack → delete. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'markdown',
          value:
            '1. **Create** — producer builds payload + metadata.\n2. **Enqueue** — message lands on the broker.\n3. **Store** — transient (memory) or durable (disk / replication).\n4. **Dequeue** — consumer receives the message (ordered, priority, or parallel).\n5. **Acknowledge** — consumer confirms successful processing.\n6. **Delete** — broker removes the message so it is not redelivered (unless at-least-once retries).',
        },
      ],
    },
    {
      id: 'types',
      title: 'Types of Queues',
      blocks: [
        {
          type: 'image',
          src: 'assets/article-images/message-queues/03-p2p-vs-pubsub.png',
          alt: 'Point-to-point queue versus publish-subscribe topic with multiple subscribers',
          caption:
            'P2P (one consumer) vs Pub/Sub (many subscribers). Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'markdown',
          value:
            '- **Point-to-point (P2P)** — each message is processed by **one** consumer (task workers).\n- **Publish/Subscribe** — publish to a **topic**; every subscriber gets a copy (notifications, events).\n- **Priority queue** — higher-priority messages jump ahead.\n- **Dead letter queue (DLQ)** — poison / exhausted-retry messages land here for inspection.',
        },
        {
          type: 'image',
          src: 'assets/article-images/message-queues/04-priority-dlq.png',
          alt: 'Priority queue ordering and dead letter queue for failed messages',
          caption:
            'Priority ordering and DLQ for failed messages. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
      ],
    },
    {
      id: 'advantages',
      title: 'Advantages',
      blocks: [
        {
          type: 'bestPractices',
          title: 'Why teams adopt queues',
          practices: [
            '**Decoupling** — producers and consumers evolve independently.',
            '**Async processing** — producers return immediately; work happens later.',
            '**Load balancing** — competing consumers share work.',
            '**Durability / retries** — persist + redelivery survive crashes.',
            '**Scalability** — add consumers horizontally.',
            '**Throttling / load leveling** — absorb spikes without melting the DB.',
          ],
        },
      ],
    },
    {
      id: 'when-to-use',
      title: 'When to Use',
      blocks: [
        {
          type: 'markdown',
          value:
            '| Scenario | Why a queue helps |\n|---|---|\n| **Microservices** | Async boundaries avoid cascading failures |\n| **Background jobs** | Email, image resize, reports off the request path |\n| **Event-driven systems** | Fan-out domain events to many handlers |\n| **Load leveling** | Smooth bursty write traffic |\n| **Reliable delivery** | At-least-once with retries + DLQ |\n\nSkip queues when the call must be **synchronous** end-to-end, latency must be request-bound, or a simple DB outbox / cron is enough.',
        },
      ],
    },
    {
      id: 'best-practices',
      title: 'Best Practices',
      blocks: [
        {
          type: 'markdown',
          value:
            '- **Idempotent consumers** — at-least-once delivery will redeliver.\n- **Durability** — persist messages you cannot afford to lose; use publisher confirms / Kafka acks.\n- **Retries + DLQ** — bounded retries, then quarantine.\n- **Security** — TLS, auth on brokers, least-privilege topics.\n- **Lag metrics** — alert on consumer lag / oldest message age.\n- **Visibility timeout / ack modes** — SQS visibility; Kafka consumer groups; Rabbit manual ack.',
        },
      ],
    },
    {
      id: 'java-spring',
      title: 'Java / Spring Notes',
      blocks: [
        {
          type: 'code',
          language: 'java',
          filename: 'RabbitPublishListen.java',
          showLineNumbers: true,
          code: `// Publish
rabbitTemplate.convertAndSend("orders.exchange", "order.created", event);

// Consume (manual ack for control)
@RabbitListener(queues = "orders.q", ackMode = "MANUAL")
public void onOrder(OrderCreated event, Channel ch, @Header(AmqpHeaders.DELIVERY_TAG) long tag)
    throws IOException {
  try {
    process(event);           // must be idempotent
    ch.basicAck(tag, false);
  } catch (RetryableException e) {
    ch.basicNack(tag, false, true);  // requeue
  } catch (Exception e) {
    ch.basicNack(tag, false, false); // → DLQ if configured
  }
}`,
        },
        {
          type: 'code',
          language: 'java',
          filename: 'KafkaPublishListen.java',
          code: `@Autowired KafkaTemplate<String, OrderCreated> kafka;

public void publish(OrderCreated e) {
  kafka.send("orders", e.customerId(), e); // key → partition affinity
}

@KafkaListener(topics = "orders", groupId = "fulfillment")
public void onOrder(ConsumerRecord<String, OrderCreated> rec) {
  process(rec.value()); // commit offset after success (default AUTO can lose work)
}`,
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Broker landscape',
          body: '**RabbitMQ** — flexible routing, classic queues. **Kafka** — log + consumer groups, high throughput. **SQS / Pub/Sub** — managed. **Redis Streams** — lightweight. **ActiveMQ** — JMS. Choose by ordering needs, fan-out model, and ops burden.',
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
          body: 'Summarized from Ashish Pratap Singh’s AlgoMaster article “What are Message Queues and When to Use Them?,” with Java/Spring notes for this platform.',
        },
      ],
    },
  ],
};

export default content;
