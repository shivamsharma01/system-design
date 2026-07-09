import { DesignMeta } from '../../../shared/models';

export const UNIT_OF_WORK_META: DesignMeta = {
  slug: 'unit-of-work',
  title: 'Unit of Work Pattern',
  tagline:
    'Track changes across objects and commit once — ORM sessions, transactions, and atomic business operations.',
  section: 'design-patterns',
  category: 'Architectural',
  tags: ['unit-of-work', 'architectural', 'transactions', 'lld', 'orm'],
  technologies: ['Java', 'JPA', 'Hibernate'],
  difficulty: 'intermediate',
  readingTimeMin: 12,
  status: 'published',
  keywords: ['transaction', 'identity map', 'change tracking', 'commit'],
  dateAdded: '2026-07-09',
  popularity: 89,
  icon: 'UW',
  heroGradient: 'linear-gradient(135deg, #a855f7 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
