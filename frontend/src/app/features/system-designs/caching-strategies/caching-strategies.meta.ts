import { DesignMeta } from '../../../shared/models';

export const CACHING_STRATEGIES_META: DesignMeta = {
  slug: 'caching-strategies',
  title: 'Caching Strategies',
  tagline:
    'Read-through, cache-aside, write-through, write-around, and write-back — when to use each and how they compare.',
  section: 'fundamentals',
  category: 'Caching',
  tags: ['caching', 'cache-aside', 'write-through', 'write-back', 'fundamentals'],
  technologies: ['Redis', 'Caffeine', 'Spring Cache'],
  difficulty: 'intermediate',
  readingTimeMin: 12,
  status: 'published',
  keywords: [
    'caching strategies',
    'read through',
    'cache aside',
    'write through',
    'write around',
    'write back',
  ],
  dateAdded: '2026-07-25',
  popularity: 95,
  icon: 'CS',
  heroGradient: 'linear-gradient(135deg, #f59e0b 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
