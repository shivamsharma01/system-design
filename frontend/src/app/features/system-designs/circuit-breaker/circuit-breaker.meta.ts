import { DesignMeta } from '../../../shared/models';

export const CIRCUIT_BREAKER_META: DesignMeta = {
  slug: 'circuit-breaker',
  title: 'Circuit Breaker Pattern',
  tagline:
    'Stop calling a failing dependency after a threshold — closed, open, and half-open states with Resilience4j to prevent cascade failures.',
  section: 'design-patterns',
  category: 'Distributed Systems',
  tags: ['circuit-breaker', 'resilience', 'resilience4j', 'fault-tolerance', 'microservices'],
  technologies: ['Resilience4j', 'Hystrix', 'Istio', 'Envoy outlier detection'],
  difficulty: 'advanced',
  readingTimeMin: 13,
  status: 'published',
  keywords: ['open circuit', 'half-open', 'failure threshold', 'cascade failure'],
  dateAdded: '2026-07-10',
  popularity: 103,
  icon: 'CK',
  heroGradient: 'linear-gradient(135deg, #dc2626 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
