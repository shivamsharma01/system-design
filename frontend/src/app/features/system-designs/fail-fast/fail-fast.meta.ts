import { DesignMeta } from '../../../shared/models';

export const FAIL_FAST_META: DesignMeta = {
  slug: 'fail-fast',
  title: 'Fail Fast Pattern',
  tagline:
    'Detect hopeless errors early and return immediately — validation, circuit open states, and avoiding retry storms.',
  section: 'design-patterns',
  category: 'Cloud & Resilience',
  tags: ['fail-fast', 'cloud', 'resilience', 'errors', 'hld'],
  technologies: ['Java', 'APIs', 'Validation'],
  difficulty: 'beginner',
  readingTimeMin: 10,
  status: 'published',
  keywords: ['early failure', 'guard clauses', 'no retry', 'fast feedback'],
  dateAdded: '2026-07-09',
  popularity: 88,
  icon: 'FF',
  heroGradient: 'linear-gradient(135deg, #ef4444 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
