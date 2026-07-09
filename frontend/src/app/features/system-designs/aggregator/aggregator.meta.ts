import { DesignMeta } from '../../../shared/models';

export const AGGREGATOR_META: DesignMeta = {
  slug: 'aggregator',
  title: 'Aggregator Pattern',
  tagline:
    'Combine related messages into one result using correlation IDs and completion rules — order fulfillment and batch replies.',
  section: 'design-patterns',
  category: 'Data & Messaging',
  tags: ['aggregator', 'correlation-id', 'messaging', 'saga'],
  technologies: ['Kafka', 'Apache Camel', 'Spring Integration', 'AWS Step Functions'],
  difficulty: 'intermediate',
  readingTimeMin: 13,
  status: 'published',
  keywords: ['correlation id', 'scatter-gather', 'completion condition'],
  dateAdded: '2026-07-09',
  popularity: 86,
  icon: 'AG',
  heroGradient: 'linear-gradient(135deg, #a855f7 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
