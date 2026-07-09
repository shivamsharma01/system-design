import { DesignMeta } from '../../../shared/models';

export const CONTENT_BASED_ROUTER_META: DesignMeta = {
  slug: 'content-based-router',
  title: 'Content-Based Router Pattern',
  tagline:
    'Inspect message body or metadata to choose the destination — a specialized router for type, region, or priority routing.',
  section: 'design-patterns',
  category: 'Data & Messaging',
  tags: ['content-router', 'routing', 'message-inspection', 'integration'],
  technologies: ['Apache Camel', 'Kafka Streams', 'AWS EventBridge Rules'],
  difficulty: 'intermediate',
  readingTimeMin: 12,
  status: 'published',
  keywords: ['predicate routing', 'message type', 'dynamic destination'],
  dateAdded: '2026-07-09',
  popularity: 87,
  icon: 'CB',
  heroGradient: 'linear-gradient(135deg, #3b82f6 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
