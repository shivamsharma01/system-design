import { DesignContent } from '../../../shared/models';
import { POLLING_CONSUMER_META } from './polling-consumer.meta';

const content: DesignContent = {
  meta: POLLING_CONSUMER_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'The **Polling Consumer** actively **pulls** messages from a source on a schedule or loop, rather than having the broker **push** to a callback. The consumer controls pace — how often to poll, batch size, and backoff — which suits queues without push APIs, batch workloads, and rate-limited downstream systems.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Pull vs push',
          body: '**Push**: broker delivers (WebSocket, SNS HTTP). **Poll**: consumer asks "anything for me?" — SQS `ReceiveMessage`, Kafka `poll()`, JDBC `SELECT FOR UPDATE SKIP LOCKED`.',
        },
        {
          type: 'table',
          caption: 'Polling flavors.',
          headers: ['Style', 'Behavior'],
          rows: [
            ['Short poll', 'Immediate return — may be empty, tight loops waste CPU'],
            ['Long poll', 'Wait up to N seconds for messages (SQS WaitTimeSeconds)'],
            ['Kafka poll loop', 'Blocking fetch with max records and timeout'],
            ['Adaptive backoff', 'Increase interval when queue empty'],
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
          body: '**Food pickup counter**: the kitchen does not run to your table. You **check the screen every few minutes** (poll) until your order number appears — you control how often you look, and the kitchen stays decoupled from your pacing.',
        },
        {
          type: 'mermaid',
          caption: 'Consumer-driven pull loop.',
          definition: `sequenceDiagram
  participant C as Polling Consumer
  participant Q as Queue / Broker
  loop poll loop
    C->>Q: receive(max=10, wait=20s)
    alt messages available
      Q-->>C: batch
      C->>C: process + ack/commit
    else empty
      Q-->>C: empty (long poll waited)
      C->>C: optional backoff
    end
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
            ['AWS SQS', 'Workers long-poll with WaitTimeSeconds=20'],
            ['Kafka', '`consumer.poll(Duration)` loop in every client app'],
            ['Azure Queue Storage', 'GetMessages with visibility timeout'],
            ['Database outbox relay', 'Poll outbox table for unpublished rows'],
            ['Email/IMAP', 'Client polls mailbox for new mail'],
            ['Batch ETL', 'Scheduled job polls landing bucket for new files'],
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
            'Tune **batch size**, **long poll wait**, and **parallel consumers** for throughput vs latency. Always **ack/commit after** successful processing (or use idempotent processing with at-least-once). Empty-queue tight loops burn CPU — use long poll or exponential backoff.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'SqsPollingConsumer.java',
          code: `@Component
public class SqsPollingConsumer implements Runnable {
  private final SqsClient sqs;
  private volatile boolean running = true;

  @Override
  public void run() {
    while (running) {
      ReceiveMessageResponse resp = sqs.receiveMessage(ReceiveMessageRequest.builder()
          .queueUrl(queueUrl)
          .maxNumberOfMessages(10)
          .waitTimeSeconds(20) // long poll
          .build());

      if (resp.messages().isEmpty()) {
        continue; // long poll already waited
      }
      for (Message msg : resp.messages()) {
        try {
          handle(msg);
          sqs.deleteMessage(b -> b.queueUrl(queueUrl).receiptHandle(msg.receiptHandle()));
        } catch (Exception e) {
          // message returns after visibility timeout
          log.error("Processing failed", e);
        }
      }
    }
  }
}

// Kafka equivalent: while (running) { ConsumerRecords r = consumer.poll(Duration.ofMillis(500)); ... }`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Visibility timeout trap',
          body: 'SQS: if processing exceeds **visibility timeout**, another consumer gets the same message → duplicates. Extend heartbeat or split work; design **idempotent** handlers.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Consumer controls rate — natural backpressure.',
            'Works through firewalls (outbound pull only).',
            'Easy to scale by adding poller instances.',
          ],
          cons: [
            'Latency floor = poll interval (mitigate with long poll).',
            'Empty polls waste resources if misconfigured.',
            'Consumer must manage offsets/receipts correctly.',
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
              question: 'Polling vs push consumers?',
              answer:
                '**Poll**: consumer pulls — good for queues, batch, rate control. **Push**: broker calls HTTP/gRPC — lower latency, consumer must accept load spikes.',
            },
            {
              question: 'What is SQS long polling?',
              answer:
                '`WaitTimeSeconds` up to 20 — API blocks until a message arrives or timeout. Reduces empty responses vs short poll spam.',
            },
            {
              question: 'How does Kafka polling work?',
              answer:
                '`poll()` fetches batches from brokers, returns records, triggers rebalance. Commit offsets **after** process for at-least-once.',
            },
            {
              question: 'How many SQS pollers per queue?',
              answer:
                'Scale horizontally until **throughput plateaus** or **duplicate processing** from visibility issues rises. One poller can fetch up to 10 messages per call.',
            },
            {
              question: 'Polling the outbox table?',
              answer:
                'Relay service polls `outbox WHERE published=false`, publishes to Kafka, marks published — classic **Transactional Outbox** delivery mechanism.',
            },
            {
              question: 'Adaptive backoff when empty?',
              answer:
                'Increase sleep 1s → 2s → cap 30s when queue empty; reset on message received. Saves cost on low-traffic queues.',
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
          body: '1. Consumers **pull** messages on their schedule.\n2. Use **long poll** (SQS) and tuned **Kafka poll** loops.\n3. Real uses: **SQS workers, Kafka apps, outbox relay**.\n4. Mind **visibility timeout, idempotency, and empty-queue backoff**.',
        },
      ],
    },
  ],
};

export default content;
