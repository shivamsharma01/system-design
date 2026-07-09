import { DesignMeta } from '../../../shared/models';

export const API_GATEWAY_META: DesignMeta = {
  slug: 'api-gateway',
  title: 'API Gateway Pattern',
  tagline:
    'Single edge entry for routing, authentication, rate limiting, and response aggregation — Kong, AWS API Gateway, and Spring Cloud Gateway in microservice architectures.',
  section: 'design-patterns',
  category: 'Distributed Systems',
  tags: ['api-gateway', 'edge', 'routing', 'auth', 'rate-limiting', 'microservices'],
  technologies: ['Kong', 'AWS API Gateway', 'Spring Cloud Gateway', 'Envoy'],
  difficulty: 'intermediate',
  readingTimeMin: 13,
  status: 'published',
  keywords: ['edge routing', 'JWT validation', 'request aggregation', 'throttling'],
  dateAdded: '2026-07-10',
  popularity: 101,
  icon: 'AY',
  heroGradient: 'linear-gradient(135deg, #0ea5e9 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
