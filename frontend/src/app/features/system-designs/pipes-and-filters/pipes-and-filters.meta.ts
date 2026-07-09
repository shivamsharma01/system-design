import { DesignMeta } from '../../../shared/models';

export const PIPES_AND_FILTERS_META: DesignMeta = {
  slug: 'pipes-and-filters',
  title: 'Pipes and Filters Pattern',
  tagline:
    'Chain independent processing stages through pipes — ETL pipelines, stream processing, and composable data flows.',
  section: 'design-patterns',
  category: 'Data & Messaging',
  tags: ['pipes-filters', 'etl', 'pipeline', 'stream-processing'],
  technologies: ['Apache Flink', 'Kafka Streams', 'AWS Glue', 'Unix pipes'],
  difficulty: 'intermediate',
  readingTimeMin: 12,
  status: 'published',
  keywords: ['filter', 'transform', 'pipeline stage', 'data flow'],
  dateAdded: '2026-07-09',
  popularity: 88,
  icon: 'PF',
  heroGradient: 'linear-gradient(135deg, #14b8a6 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
