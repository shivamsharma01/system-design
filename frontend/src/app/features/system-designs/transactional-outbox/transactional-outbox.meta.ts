import { DesignMeta } from '../../../shared/models';

export const TRANSACTIONAL_OUTBOX_META: DesignMeta = {
  slug: 'transactional-outbox',
  title: 'Transactional Outbox Pattern',
  tagline:
    'Write domain state and an outbox row in the same database transaction, then relay events to Kafka — the standard fix for the dual-write problem.',
  section: 'design-patterns',
  category: 'Distributed Systems',
  tags: ['outbox', 'dual-write', 'kafka', 'reliability', 'events'],
  technologies: ['PostgreSQL', 'Kafka', 'Debezium', 'Spring'],
  difficulty: 'intermediate',
  readingTimeMin: 13,
  status: 'published',
  keywords: ['outbox table', 'message relay', 'at-least-once publish', 'CDC'],
  dateAdded: '2026-07-10',
  popularity: 93,
  icon: 'OX',
  heroGradient: 'linear-gradient(135deg, #f97316 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
