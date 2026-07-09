import { DesignMeta } from '../../../shared/models';

export const ENSEMBLE_ROUTING_META: DesignMeta = {
  slug: 'ensemble-routing',
  title: 'Ensemble Routing Pattern',
  tagline:
    'Combine predictions from multiple models via voting, stacking, or weighted averaging — Netflix recommendations, fraud ensembles, and production ML routing.',
  section: 'design-patterns',
  category: 'ML & Data Pipeline',
  tags: ['ensemble', 'ml', 'routing', 'stacking', 'recommendations'],
  technologies: ['scikit-learn', 'XGBoost', 'TensorFlow Serving', 'SageMaker'],
  difficulty: 'intermediate',
  readingTimeMin: 12,
  status: 'published',
  keywords: ['voting', 'stacking', 'weighted average', 'model routing', 'blending'],
  dateAdded: '2026-07-09',
  popularity: 92,
  icon: 'ER',
  heroGradient: 'linear-gradient(135deg, #8b5cf6 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
