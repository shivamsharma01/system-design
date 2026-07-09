import { DesignMeta } from '../../../shared/models';

export const BACKEND_FOR_FRONTEND_META: DesignMeta = {
  slug: 'backend-for-frontend',
  title: 'Backend for Frontend Pattern',
  tagline:
    'Dedicated backend per client type — web, mobile, or TV — tailoring APIs for each UX instead of one generic gateway for every surface.',
  section: 'design-patterns',
  category: 'Distributed Systems',
  tags: ['bff', 'backend-for-frontend', 'mobile', 'web', 'aggregation', 'microservices'],
  technologies: ['Node.js', 'GraphQL', 'Spring Boot', 'Netflix Falcor'],
  difficulty: 'intermediate',
  readingTimeMin: 12,
  status: 'published',
  keywords: ['client-specific API', 'aggregation', 'mobile BFF', 'web BFF'],
  dateAdded: '2026-07-10',
  popularity: 87,
  icon: 'BF',
  heroGradient: 'linear-gradient(135deg, #f97316 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
