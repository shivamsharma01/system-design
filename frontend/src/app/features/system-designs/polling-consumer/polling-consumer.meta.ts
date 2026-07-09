import { DesignMeta } from '../../../shared/models';

export const POLLING_CONSUMER_META: DesignMeta = {
  slug: 'polling-consumer',
  title: 'Polling Consumer Pattern',
  tagline:
    'Consumers pull messages on their schedule — SQS long poll, Kafka poll loops, and when push is not an option.',
  section: 'design-patterns',
  category: 'Data & Messaging',
  tags: ['polling', 'consumer', 'sqs', 'kafka'],
  technologies: ['AWS SQS', 'Kafka', 'Azure Queue Storage', 'Java NIO'],
  difficulty: 'intermediate',
  readingTimeMin: 11,
  status: 'published',
  keywords: ['long poll', 'pull model', 'consumer lag', 'backoff'],
  dateAdded: '2026-07-09',
  popularity: 88,
  icon: 'PO',
  heroGradient: 'linear-gradient(135deg, #22c55e 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
