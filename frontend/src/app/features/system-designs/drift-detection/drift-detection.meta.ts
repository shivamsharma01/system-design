import { DesignMeta } from '../../../shared/models';

export const DRIFT_DETECTION_META: DesignMeta = {
  slug: 'drift-detection',
  title: 'Drift Detection Pattern',
  tagline:
    'Monitor data and prediction drift with PSI, KL divergence, and statistical tests — trigger retraining before model quality silently degrades.',
  section: 'design-patterns',
  category: 'ML & Data Pipeline',
  tags: ['drift', 'mlops', 'monitoring', 'psi', 'retraining'],
  technologies: ['Evidently AI', 'WhyLabs', 'Prometheus', 'Great Expectations'],
  difficulty: 'advanced',
  readingTimeMin: 13,
  status: 'published',
  keywords: ['data drift', 'concept drift', 'PSI', 'KL divergence', 'model monitoring'],
  dateAdded: '2026-07-09',
  popularity: 88,
  icon: 'DR',
  heroGradient: 'linear-gradient(135deg, #f97316 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
