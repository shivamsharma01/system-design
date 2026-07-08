import { DesignMeta } from '../../../shared/models';

export const OBJECT_POOL_META: DesignMeta = {
  slug: 'object-pool',
  title: 'Object Pool Pattern',
  tagline:
    'Reuse expensive objects — DB connections, threads, and game bullets — instead of creating and destroying them constantly.',
  section: 'design-patterns',
  category: 'Creational',
  tags: ['object-pool', 'creational', 'performance', 'lld', 'reuse'],
  technologies: ['Java', 'JDBC', 'Thread Pools'],
  difficulty: 'intermediate',
  readingTimeMin: 12,
  status: 'published',
  keywords: [
    'object pool',
    'connection pool',
    'resource reuse',
    'borrow return',
    'hikaricp',
  ],
  dateAdded: '2026-07-09',
  popularity: 85,
  icon: 'OP',
  heroGradient: 'linear-gradient(135deg, #14b8a6 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
