import { DesignMeta } from '../../../shared/models';

export const SERVICE_DISCOVERY_META: DesignMeta = {
  slug: 'service-discovery',
  title: 'Service Discovery Pattern',
  tagline:
    'Dynamic lookup of healthy service instances — client-side vs server-side discovery with Eureka, Consul, and Kubernetes DNS.',
  section: 'design-patterns',
  category: 'Distributed Systems',
  tags: ['service-discovery', 'eureka', 'consul', 'kubernetes', 'dns', 'load-balancing'],
  technologies: ['Eureka', 'Consul', 'Kubernetes DNS', 'AWS Cloud Map'],
  difficulty: 'intermediate',
  readingTimeMin: 14,
  status: 'published',
  keywords: ['service registry', 'client-side discovery', 'server-side discovery', 'health-aware routing'],
  dateAdded: '2026-07-10',
  popularity: 84,
  icon: 'SV',
  heroGradient: 'linear-gradient(135deg, #14b8a6 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
