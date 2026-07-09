import { DesignMeta } from '../../../shared/models';

export const MATERIALIZED_VIEW_META: DesignMeta = {
  slug: 'materialized-view',
  title: 'Materialized View Pattern',
  tagline:
    'Precompute read-optimized projections from write-side events — the query half of CQRS with refresh strategies, incremental updates, and staleness trade-offs for dashboards.',
  section: 'design-patterns',
  category: 'Distributed Systems',
  tags: ['materialized-view', 'read-model', 'projection', 'cqrs', 'denormalization'],
  technologies: ['Kafka', 'Elasticsearch', 'Cassandra', 'Redis', 'ClickHouse'],
  difficulty: 'intermediate',
  readingTimeMin: 12,
  status: 'published',
  keywords: ['read model', 'projection', 'refresh strategy', 'denormalized query', 'dashboard'],
  dateAdded: '2026-07-10',
  popularity: 96,
  icon: 'VW',
  heroGradient: 'linear-gradient(135deg, #0ea5e9 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
