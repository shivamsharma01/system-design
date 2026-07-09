import { DesignMeta } from '../../../shared/models';

export const CQRS_META: DesignMeta = {
  slug: 'cqrs',
  title: 'CQRS Pattern',
  tagline:
    'Separate command and query models so writes optimize for consistency and reads optimize for scale — with or without Event Sourcing on the write side.',
  section: 'design-patterns',
  category: 'Distributed Systems',
  tags: ['cqrs', 'commands', 'queries', 'read-model', 'scaling'],
  technologies: ['Kafka', 'Elasticsearch', 'Axon', 'EventStoreDB'],
  difficulty: 'advanced',
  readingTimeMin: 14,
  status: 'published',
  keywords: ['command model', 'query model', 'read replica', 'projection'],
  dateAdded: '2026-07-10',
  popularity: 92,
  icon: 'CQ',
  heroGradient: 'linear-gradient(135deg, #3b82f6 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
