import { DesignMeta } from '../../../shared/models';

export const QUORUM_META: DesignMeta = {
  slug: 'quorum',
  title: 'Quorum Pattern',
  tagline:
    'Tune read and write replica counts so R + W > N — Dynamo-style tunable consistency, sloppy quorum, and the availability trade-off in replicated stores.',
  section: 'design-patterns',
  category: 'Distributed Systems',
  tags: ['quorum', 'replication', 'consistency', 'dynamodb', 'cassandra', 'availability'],
  technologies: ['DynamoDB', 'Cassandra', 'Riak', 'CockroachDB', 'etcd'],
  difficulty: 'advanced',
  readingTimeMin: 13,
  status: 'published',
  keywords: ['R+W>N', 'read quorum', 'write quorum', 'sloppy quorum', 'hinted handoff'],
  dateAdded: '2026-07-10',
  popularity: 99,
  icon: 'QU',
  heroGradient: 'linear-gradient(135deg, #a855f7 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
