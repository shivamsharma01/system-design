import { DesignMeta } from '../../../shared/models';

export const CANARY_RELEASE_META: DesignMeta = {
  slug: 'canary-release',
  title: 'Canary Release Pattern',
  tagline:
    'Ship to a small slice of traffic first — progressive delivery, metrics gates, and safer rollouts than big-bang deploys.',
  section: 'design-patterns',
  category: 'Cloud & Resilience',
  tags: ['canary', 'cloud', 'deployment', 'devops', 'hld'],
  technologies: ['Kubernetes', 'Service Mesh', 'Observability'],
  difficulty: 'intermediate',
  readingTimeMin: 12,
  status: 'published',
  keywords: ['progressive delivery', 'traffic splitting', 'rollback', 'error budget'],
  dateAdded: '2026-07-09',
  popularity: 92,
  icon: 'CR',
  heroGradient: 'linear-gradient(135deg, #f97316 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
