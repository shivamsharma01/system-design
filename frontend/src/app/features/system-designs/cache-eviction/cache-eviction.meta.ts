import { DesignMeta } from '../../../shared/models';

export const CACHE_EVICTION_META: DesignMeta = {
  slug: 'cache-eviction',
  title: 'Cache Eviction Strategies',
  tagline:
    'LRU, LFU, FIFO, random, MRU, TTL, and two-tier caches — how to choose what to drop when memory is full.',
  section: 'fundamentals',
  category: 'Caching',
  tags: ['cache', 'eviction', 'lru', 'lfu', 'ttl', 'fundamentals'],
  technologies: ['Redis', 'Caffeine', 'Guava', 'LinkedHashMap'],
  difficulty: 'intermediate',
  readingTimeMin: 14,
  status: 'published',
  keywords: ['cache eviction', 'LRU', 'LFU', 'FIFO', 'TTL', 'maxmemory-policy'],
  dateAdded: '2026-07-25',
  popularity: 92,
  icon: 'CE',
  heroGradient: 'linear-gradient(135deg, #ef4444 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
