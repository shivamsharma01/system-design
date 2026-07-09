import { DesignMeta } from '../../../shared/models';

export const MESSAGE_FILTER_META: DesignMeta = {
  slug: 'message-filter',
  title: 'Message Filter Pattern',
  tagline:
    'Drop or pass messages based on criteria — keep pipelines focused and reduce noise before expensive processing.',
  section: 'design-patterns',
  category: 'Data & Messaging',
  tags: ['message-filter', 'routing', 'predicate', 'integration'],
  technologies: ['Kafka Streams', 'Apache Camel', 'AWS EventBridge'],
  difficulty: 'beginner',
  readingTimeMin: 10,
  status: 'published',
  keywords: ['filter', 'drop', 'predicate', 'content filter'],
  dateAdded: '2026-07-09',
  popularity: 80,
  icon: 'MF',
  heroGradient: 'linear-gradient(135deg, #64748b 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
