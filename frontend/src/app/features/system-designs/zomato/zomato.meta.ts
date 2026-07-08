import { DesignMeta } from '../../../shared/models';

export const ZOMATO_META: DesignMeta = {
  slug: 'zomato',
  title: 'Design Zomato',
  tagline:
    'A food-delivery and restaurant-discovery platform: search, ordering, real-time delivery tracking, and a three-sided marketplace.',
  section: 'system-design',
  category: 'Location Services',
  tags: ['food-delivery', 'geospatial', 'marketplace', 'real-time', 'search', 'logistics'],
  technologies: ['Elasticsearch', 'PostgreSQL', 'Redis', 'Kafka', 'H3', 'WebSocket', 'Cassandra'],
  difficulty: 'advanced',
  readingTimeMin: 26,
  status: 'published',
  keywords: [
    'swiggy',
    'doordash',
    'uber eats',
    'food ordering',
    'delivery partner',
    'restaurant discovery',
    'order state machine',
    'last mile',
    'eta',
  ],
  dateAdded: '2026-06-29',
  popularity: 84,
  icon: 'ZO',
  heroGradient: 'linear-gradient(135deg, #cb202d 0%, #1c1c1c 100%)',
  author: 'System Design Platform',
};
