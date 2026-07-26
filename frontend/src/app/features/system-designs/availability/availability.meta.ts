import { DesignMeta } from '../../../shared/models';

export const AVAILABILITY_META: DesignMeta = {
  slug: 'availability',
  title: 'Availability',
  tagline:
    'Uptime as a percentage — nines, downtime budgets, redundancy, failover, replication, and Spring health/circuit-breaker notes.',
  section: 'fundamentals',
  category: 'Reliability',
  tags: ['availability', 'sla', 'nines', 'uptime', 'fundamentals'],
  technologies: ['Multi-AZ', 'Load Balancer', 'Spring Actuator', 'Resilience4j'],
  difficulty: 'beginner',
  readingTimeMin: 10,
  status: 'published',
  keywords: ['availability', 'five nines', 'uptime', 'downtime', 'failover', 'SLA'],
  dateAdded: '2026-07-26',
  popularity: 97,
  icon: 'AV',
  heroGradient: 'linear-gradient(135deg, #22c55e 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
