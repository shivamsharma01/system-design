import { DesignMeta } from '../../../shared/models';

export const GOSSIP_PROTOCOL_META: DesignMeta = {
  slug: 'gossip-protocol',
  title: 'Gossip Protocol Pattern',
  tagline:
    'Spread cluster state epidemically through random peer exchanges — Cassandra and SWIM membership, failure detection, and eventual cluster-wide views without a central registry.',
  section: 'design-patterns',
  category: 'Distributed Systems',
  tags: ['gossip', 'epidemic-protocol', 'membership', 'swim', 'failure-detection'],
  technologies: ['Cassandra', 'Consul', 'Serf', 'Akka Cluster', 'HashiCorp Serf'],
  difficulty: 'intermediate',
  readingTimeMin: 12,
  status: 'published',
  keywords: ['epidemic dissemination', 'SWIM', 'membership list', 'phi accrual failure detector'],
  dateAdded: '2026-07-10',
  popularity: 88,
  icon: 'GP',
  heroGradient: 'linear-gradient(135deg, #ec4899 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
