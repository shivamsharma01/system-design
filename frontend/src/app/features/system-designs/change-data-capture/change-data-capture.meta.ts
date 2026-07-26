import { DesignMeta } from '../../../shared/models';

export const CHANGE_DATA_CAPTURE_META: DesignMeta = {
  slug: 'change-data-capture',
  title: 'Change Data Capture (CDC)',
  tagline:
    'Track database inserts, updates, and deletes in real time — timestamp, trigger, and log-based approaches with Debezium and Kafka.',
  section: 'fundamentals',
  category: 'Data Integration',
  tags: ['cdc', 'debezium', 'kafka', 'wal', 'fundamentals'],
  technologies: ['Debezium', 'Kafka Connect', 'PostgreSQL', 'MySQL', 'AWS DMS'],
  difficulty: 'intermediate',
  readingTimeMin: 12,
  status: 'published',
  keywords: ['change data capture', 'Debezium', 'WAL', 'binlog', 'Kafka Connect', 'log-based CDC'],
  dateAdded: '2026-07-26',
  popularity: 91,
  icon: 'CDC',
  heroGradient: 'linear-gradient(135deg, #8b5cf6 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
