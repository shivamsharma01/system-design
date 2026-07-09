import { DesignMeta } from '../../../shared/models';

export const WIRE_TAP_META: DesignMeta = {
  slug: 'wire-tap',
  title: 'Wire Tap Pattern',
  tagline:
    'Copy messages to a monitoring or audit channel without affecting the main flow — observability with zero latency impact.',
  section: 'design-patterns',
  category: 'Data & Messaging',
  tags: ['wire-tap', 'monitoring', 'audit', 'observability'],
  technologies: ['Apache Camel', 'Kafka MirrorMaker', 'AWS Kinesis', 'OpenTelemetry'],
  difficulty: 'beginner',
  readingTimeMin: 10,
  status: 'published',
  keywords: ['tap', 'side channel', 'audit trail', 'non-invasive'],
  dateAdded: '2026-07-09',
  popularity: 78,
  icon: 'WT',
  heroGradient: 'linear-gradient(135deg, #06b6d4 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
