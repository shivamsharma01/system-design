import { DesignMeta } from '../../../shared/models';

export const TWITTER_META: DesignMeta = {
  slug: 'twitter',
  title: 'Design Twitter / X',
  tagline:
    'A social platform with timelines, fan-out, and trending topics for hundreds of millions of users.',
  section: 'system-design',
  category: 'Social Network',
  tags: ['timeline', 'fan-out', 'feed', 'graph', 'ranking', 'trending'],
  technologies: ['Redis', 'Manhattan', 'Cassandra', 'Kafka', 'Elasticsearch', 'Snowflake'],
  difficulty: 'advanced',
  readingTimeMin: 24,
  status: 'published',
  keywords: [
    'x',
    'tweets',
    'newsfeed',
    'fan-out on write',
    'fan-out on read',
    'home timeline',
    'celebrity problem',
    'social graph',
  ],
  dateAdded: '2026-06-28',
  popularity: 88,
  icon: 'X',
  heroGradient: 'linear-gradient(135deg, #1d9bf0 0%, #0f1419 100%)',
  author: 'System Design Platform',
};
