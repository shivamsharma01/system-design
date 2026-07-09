import { DesignMeta } from '../../../shared/models';

export const BATCH_INFERENCE_META: DesignMeta = {
  slug: 'batch-inference',
  title: 'Batch Inference Pattern',
  tagline:
    'Offline scoring at scale with Spark or Beam — nightly recommendation precompute, bulk fraud backfills, and cost-efficient throughput.',
  section: 'design-patterns',
  category: 'ML & Data Pipeline',
  tags: ['ml', 'batch', 'inference', 'spark', 'offline'],
  technologies: ['Apache Spark', 'Apache Beam', 'Airflow', 'BigQuery ML', 'S3'],
  difficulty: 'intermediate',
  readingTimeMin: 13,
  status: 'published',
  keywords: ['batch scoring', 'offline inference', 'nightly jobs', 'precompute'],
  dateAdded: '2026-07-09',
  popularity: 87,
  icon: 'BI',
  heroGradient: 'linear-gradient(135deg, #0ea5e9 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
