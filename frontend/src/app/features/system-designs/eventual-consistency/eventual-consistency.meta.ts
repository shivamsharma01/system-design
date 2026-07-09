import { DesignMeta } from '../../../shared/models';

export const EVENTUAL_CONSISTENCY_META: DesignMeta = {
  slug: 'eventual-consistency',
  title: 'Eventual Consistency Pattern',
  tagline:
    'Replicas converge over time under CAP trade-offs — read-your-writes caveats, banking balances, and distributed state.',
  section: 'design-patterns',
  category: 'Data & Messaging',
  tags: ['consistency', 'cap', 'replication', 'distributed-systems'],
  technologies: ['Cassandra', 'DynamoDB', 'Kafka', 'CRDTs'],
  difficulty: 'advanced',
  readingTimeMin: 14,
  status: 'published',
  keywords: ['cap theorem', 'read-your-writes', 'replica lag', 'convergence'],
  dateAdded: '2026-07-09',
  popularity: 96,
  icon: 'EC',
  heroGradient: 'linear-gradient(135deg, #dc2626 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
