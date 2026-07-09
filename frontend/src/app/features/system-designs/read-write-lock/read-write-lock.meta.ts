import { DesignMeta } from '../../../shared/models';

export const READ_WRITE_LOCK_META: DesignMeta = {
  slug: 'read-write-lock',
  title: 'Read-Write Lock Pattern',
  tagline:
    'Many concurrent readers or one exclusive writer — caches, config maps, and when ReentrantReadWriteLock actually helps.',
  section: 'design-patterns',
  category: 'Concurrency',
  tags: ['read-write-lock', 'concurrency', 'locking', 'lld', 'cache'],
  technologies: ['Java', 'ReentrantReadWriteLock', 'Caching'],
  difficulty: 'intermediate',
  readingTimeMin: 12,
  status: 'published',
  keywords: ['shared exclusive lock', 'readers writers', 'stamped lock', 'cache'],
  dateAdded: '2026-07-09',
  popularity: 88,
  icon: 'RW',
  heroGradient: 'linear-gradient(135deg, #a855f7 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
