import { DesignMeta } from '../../../shared/models';

export const AB_TESTING_MODELS_META: DesignMeta = {
  slug: 'ab-testing-models',
  title: 'A/B Testing for Models Pattern',
  tagline:
    'Split users between model variants — statistical significance on business KPIs like food-delivery ETA accuracy, not AUC alone.',
  section: 'design-patterns',
  category: 'ML & Data Pipeline',
  tags: ['ml', 'ab-testing', 'experimentation', 'statistics', 'kpi'],
  technologies: ['Optimizely', 'LaunchDarkly', 'Statsmodels', 'Experiment platforms', 'Snowflake'],
  difficulty: 'intermediate',
  readingTimeMin: 14,
  status: 'published',
  keywords: ['A/B test', 'statistical significance', 'experiment design', 'business KPI'],
  dateAdded: '2026-07-09',
  popularity: 90,
  icon: 'AB',
  heroGradient: 'linear-gradient(135deg, #22c55e 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
