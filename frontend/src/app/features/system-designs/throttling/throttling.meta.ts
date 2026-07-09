import { DesignMeta } from '../../../shared/models';

export const THROTTLING_META: DesignMeta = {
  slug: 'throttling',
  title: 'Throttling Pattern',
  tagline:
    'Shed load when a service or resource is saturated — slow down or reject excess traffic to protect latency and stability under stress.',
  section: 'design-patterns',
  category: 'Distributed Systems',
  tags: ['throttling', 'load-shedding', 'backpressure', 'overload', 'resilience'],
  technologies: ['Envoy', 'Nginx limit_req', 'AWS API Gateway', 'Adaptive concurrency'],
  difficulty: 'intermediate',
  readingTimeMin: 12,
  status: 'published',
  keywords: ['load shedding', 'adaptive throttling', '503 retry-after', 'overload protection'],
  dateAdded: '2026-07-10',
  popularity: 82,
  icon: 'TH',
  heroGradient: 'linear-gradient(135deg, #ea580c 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
