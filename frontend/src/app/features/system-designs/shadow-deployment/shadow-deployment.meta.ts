import { DesignMeta } from '../../../shared/models';

export const SHADOW_DEPLOYMENT_META: DesignMeta = {
  slug: 'shadow-deployment',
  title: 'Shadow Deployment Pattern',
  tagline:
    'Mirror production traffic to a new model — compare predictions with zero user impact before promoting fraud or ranking models.',
  section: 'design-patterns',
  category: 'ML & Data Pipeline',
  tags: ['ml', 'deployment', 'shadow', 'validation', 'safe-rollout'],
  technologies: ['Istio', 'Envoy', 'Kafka', 'Prometheus', 'Custom middleware'],
  difficulty: 'intermediate',
  readingTimeMin: 12,
  status: 'published',
  keywords: ['shadow traffic', 'dark launch', 'prediction comparison', 'zero user impact'],
  dateAdded: '2026-07-09',
  popularity: 88,
  icon: 'SH',
  heroGradient: 'linear-gradient(135deg, #64748b 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
