import { DesignMeta } from '../../../shared/models';

export const FEATURE_PIPELINE_META: DesignMeta = {
  slug: 'feature-pipeline',
  title: 'Feature Pipeline Pattern',
  tagline:
    'Transform raw events into engineered features for training and serving — Feast, Tecton, and orchestration that keeps train-serve parity.',
  section: 'design-patterns',
  category: 'ML & Data Pipeline',
  tags: ['features', 'ml', 'feast', 'feature-store', 'pipeline'],
  technologies: ['Feast', 'Tecton', 'Spark', 'Airflow'],
  difficulty: 'intermediate',
  readingTimeMin: 12,
  status: 'published',
  keywords: ['feature engineering', 'feature store', 'train-serve skew', 'orchestration', 'batch features'],
  dateAdded: '2026-07-09',
  popularity: 94,
  icon: 'FE',
  heroGradient: 'linear-gradient(135deg, #6366f1 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
