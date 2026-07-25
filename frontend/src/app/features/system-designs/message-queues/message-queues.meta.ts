import { DesignMeta } from '../../../shared/models';

export const MESSAGE_QUEUES_META: DesignMeta = {
  slug: 'message-queues',
  title: 'Message Queues',
  tagline:
    'Async messaging fundamentals — producers, brokers, P2P vs pub/sub, DLQs, when to use queues, and Spring/Kafka notes.',
  section: 'fundamentals',
  category: 'Messaging',
  tags: ['message-queue', 'async', 'kafka', 'rabbitmq', 'sqs', 'fundamentals'],
  technologies: ['RabbitMQ', 'Kafka', 'SQS', 'Redis Streams', 'Spring AMQP'],
  difficulty: 'beginner',
  readingTimeMin: 14,
  status: 'published',
  keywords: [
    'message queue',
    'broker',
    'dead letter queue',
    'publish subscribe',
    'point to point',
    'consumer group',
  ],
  dateAdded: '2026-07-25',
  popularity: 94,
  icon: 'MQ',
  heroGradient: 'linear-gradient(135deg, #0ea5e9 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
