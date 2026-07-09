import { DesignMeta } from '../../../shared/models';

export const CONSISTENT_HASHING_META: DesignMeta = {
  slug: 'consistent-hashing',
  title: 'Consistent Hashing Pattern',
  tagline:
    'Map keys and nodes on a hash ring with virtual nodes — add or remove servers with minimal key remapping for Redis Cluster, Cassandra, and CDNs.',
  section: 'design-patterns',
  category: 'Distributed Systems',
  tags: ['consistent-hashing', 'hash-ring', 'virtual-nodes', 'partitioning', 'load-balancing'],
  technologies: ['Redis Cluster', 'Cassandra', 'Memcached', 'Amazon Dynamo', 'Akamai CDN'],
  difficulty: 'intermediate',
  readingTimeMin: 12,
  status: 'published',
  keywords: ['hash ring', 'virtual node', 'minimal remapping', 'vnode', 'Redis Cluster'],
  dateAdded: '2026-07-10',
  popularity: 114,
  icon: 'HR',
  heroGradient: 'linear-gradient(135deg, #10b981 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
