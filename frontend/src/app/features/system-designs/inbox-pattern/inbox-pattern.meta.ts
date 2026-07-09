import { DesignMeta } from '../../../shared/models';

export const INBOX_PATTERN_META: DesignMeta = {
  slug: 'inbox-pattern',
  title: 'Inbox Pattern',
  tagline:
    'Record incoming message IDs in an inbox table so consumers process at-least-once deliveries exactly once — the consumer-side partner to idempotent handlers.',
  section: 'design-patterns',
  category: 'Distributed Systems',
  tags: ['inbox', 'idempotency', 'at-least-once', 'deduplication'],
  technologies: ['PostgreSQL', 'Kafka', 'Spring', 'MySQL'],
  difficulty: 'beginner',
  readingTimeMin: 12,
  status: 'published',
  keywords: ['message deduplication', 'consumer idempotency', 'inbox table', 'exactly-once effect'],
  dateAdded: '2026-07-10',
  popularity: 89,
  icon: 'IB',
  heroGradient: 'linear-gradient(135deg, #14b8a6 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
