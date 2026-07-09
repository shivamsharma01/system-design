import { DesignMeta } from '../../../shared/models';

export const GUARDED_SUSPENSION_META: DesignMeta = {
  slug: 'guarded-suspension',
  title: 'Guarded Suspension Pattern',
  tagline:
    'Wait until a precondition is true — wait/notify, Condition queues, and how this differs from Balking.',
  section: 'design-patterns',
  category: 'Concurrency',
  tags: ['guarded-suspension', 'concurrency', 'wait-notify', 'lld', 'condition'],
  technologies: ['Java', 'wait/notify', 'Condition'],
  difficulty: 'intermediate',
  readingTimeMin: 12,
  status: 'published',
  keywords: ['guard condition', 'await signal', 'blocking until ready', 'monitor'],
  dateAdded: '2026-07-09',
  popularity: 82,
  icon: 'GS',
  heroGradient: 'linear-gradient(135deg, #8b5cf6 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
