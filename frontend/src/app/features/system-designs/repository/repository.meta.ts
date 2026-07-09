import { DesignMeta } from '../../../shared/models';

export const REPOSITORY_META: DesignMeta = {
  slug: 'repository',
  title: 'Repository Pattern',
  tagline:
    'Collection-like access to aggregates — hide SQL/ORM details so domain code stays persistence-ignorant.',
  section: 'design-patterns',
  category: 'Architectural',
  tags: ['repository', 'architectural', 'persistence', 'lld', 'ddd'],
  technologies: ['Java', 'Spring Data', 'JPA'],
  difficulty: 'beginner',
  readingTimeMin: 12,
  status: 'published',
  keywords: ['data access', 'aggregate root', 'persistence ignorance'],
  dateAdded: '2026-07-09',
  popularity: 97,
  icon: 'RP',
  heroGradient: 'linear-gradient(135deg, #22c55e 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
