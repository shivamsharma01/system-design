import { DesignMeta } from '../../../shared/models';

export const LEADER_ELECTION_META: DesignMeta = {
  slug: 'leader-election',
  title: 'Leader Election Pattern',
  tagline:
    'Elect exactly one coordinator among replicas — Raft, ZooKeeper, and etcd provide automatic failover when the leader crashes or partitions heal.',
  section: 'design-patterns',
  category: 'Distributed Systems',
  tags: ['leader-election', 'consensus', 'raft', 'zookeeper', 'etcd', 'coordination'],
  technologies: ['ZooKeeper', 'etcd', 'Raft', 'Kubernetes Lease', 'Curator'],
  difficulty: 'advanced',
  readingTimeMin: 12,
  status: 'published',
  keywords: ['leader', 'follower', 'failover', 'distributed lock', 'consensus'],
  dateAdded: '2026-07-10',
  popularity: 104,
  icon: 'LE',
  heroGradient: 'linear-gradient(135deg, #f59e0b 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
