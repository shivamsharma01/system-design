import { DesignMeta } from '../../../shared/models';

export const DEAD_LETTER_CHANNEL_META: DesignMeta = {
  slug: 'dead-letter-channel',
  title: 'Dead Letter Channel Pattern',
  tagline:
    'Route poison or failed messages to a DLQ for inspection and replay — Kafka, SQS, and resilient consumer design.',
  section: 'design-patterns',
  category: 'Data & Messaging',
  tags: ['dlq', 'dead-letter', 'error-handling', 'messaging'],
  technologies: ['AWS SQS DLQ', 'Kafka', 'RabbitMQ', 'Azure Service Bus'],
  difficulty: 'intermediate',
  readingTimeMin: 11,
  status: 'published',
  keywords: ['poison message', 'retry', 'replay', 'error queue'],
  dateAdded: '2026-07-09',
  popularity: 90,
  icon: 'DL',
  heroGradient: 'linear-gradient(135deg, #ef4444 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
