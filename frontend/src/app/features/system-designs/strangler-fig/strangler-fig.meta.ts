import { DesignMeta } from '../../../shared/models';

export const STRANGLER_FIG_META: DesignMeta = {
  slug: 'strangler-fig',
  title: 'Strangler Fig Pattern',
  tagline:
    'Incrementally replace a legacy monolith by routing traffic to new microservices — grow the new system around the old until the legacy can be retired.',
  section: 'design-patterns',
  category: 'Distributed Systems',
  tags: ['strangler-fig', 'legacy-modernization', 'migration', 'routing', 'microservices'],
  technologies: ['API Gateway', 'NGINX', 'Spring Cloud Gateway', 'Feature Flags'],
  difficulty: 'intermediate',
  readingTimeMin: 11,
  status: 'published',
  keywords: ['strangler pattern', 'legacy replacement', 'incremental migration', 'facade routing'],
  dateAdded: '2026-07-10',
  popularity: 111,
  icon: 'SF',
  heroGradient: 'linear-gradient(135deg, #16a34a 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
