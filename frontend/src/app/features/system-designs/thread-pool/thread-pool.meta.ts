import { DesignMeta } from '../../../shared/models';

export const THREAD_POOL_META: DesignMeta = {
  slug: 'thread-pool',
  title: 'Thread Pool Pattern',
  tagline:
    'Reuse a fixed set of workers for many short tasks — Executors, web servers, and sizing trade-offs for LLD and system design.',
  section: 'design-patterns',
  category: 'Concurrency',
  tags: ['thread-pool', 'concurrency', 'executors', 'lld', 'performance'],
  technologies: ['Java', 'ExecutorService', 'Tomcat'],
  difficulty: 'intermediate',
  readingTimeMin: 13,
  status: 'published',
  keywords: ['executor service', 'worker threads', 'queue rejection', 'pool sizing'],
  dateAdded: '2026-07-09',
  popularity: 95,
  icon: 'TP',
  heroGradient: 'linear-gradient(135deg, #22c55e 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
