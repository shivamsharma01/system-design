import { DesignMeta } from '../../../shared/models';

export const FEATURE_STORE_META: DesignMeta = {
  slug: 'feature-store',
  title: 'Feature Store Pattern',
  tagline:
    'Feast- and Tecton-style online plus offline stores — consistent features, point-in-time joins, and shared training/serving definitions.',
  section: 'design-patterns',
  category: 'ML & Data Pipeline',
  tags: ['ml', 'features', 'feature-store', 'data-pipeline', 'feast'],
  technologies: ['Feast', 'Tecton', 'Redis', 'Spark', 'BigQuery'],
  difficulty: 'advanced',
  readingTimeMin: 14,
  status: 'published',
  keywords: ['point-in-time join', 'online store', 'offline store', 'feature consistency'],
  dateAdded: '2026-07-09',
  popularity: 89,
  icon: 'FS',
  heroGradient: 'linear-gradient(135deg, #8b5cf6 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
