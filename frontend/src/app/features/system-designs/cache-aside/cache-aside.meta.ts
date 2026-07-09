import { DesignMeta } from '../../../shared/models';

export const CACHE_ASIDE_META: DesignMeta = {
  slug: 'cache-aside',
  title: 'Cache-Aside Pattern',
  tagline:
    'Application reads cache first and loads from the database on miss — the app owns invalidation on every write for predictable consistency.',
  section: 'design-patterns',
  category: 'Distributed Systems',
  tags: ['cache-aside', 'lazy-loading', 'redis', 'invalidation', 'caching'],
  technologies: ['Redis', 'Memcached', 'Caffeine', 'Spring Cache'],
  difficulty: 'intermediate',
  readingTimeMin: 11,
  status: 'published',
  keywords: ['cache miss', 'lazy load', 'cache invalidation', 'read-through alternative'],
  dateAdded: '2026-07-10',
  popularity: 110,
  icon: 'CA',
  heroGradient: 'linear-gradient(135deg, #059669 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
