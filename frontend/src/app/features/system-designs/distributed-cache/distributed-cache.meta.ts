import { DesignMeta } from '../../../shared/models';

export const DISTRIBUTED_CACHE_META: DesignMeta = {
  slug: 'distributed-cache',
  title: 'Design a Distributed Cache',
  tagline:
    'A Redis/Memcached-style distributed cache with consistent hashing, replication, and eviction.',
  category: 'Infrastructure',
  tags: ['caching', 'consistent-hashing', 'replication', 'eviction'],
  technologies: ['Consistent Hashing', 'LRU', 'Gossip', 'Redis Cluster'],
  difficulty: 'advanced',
  readingTimeMin: 16,
  status: 'draft',
  keywords: ['cache', 'lru', 'consistent hashing', 'cache invalidation', 'hot keys'],
  dateAdded: '2026-06-28',
  popularity: 78,
  icon: 'DC',
  heroGradient: 'linear-gradient(135deg, #dc2626 0%, #450a0a 100%)',
};
