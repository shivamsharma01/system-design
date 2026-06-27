import { DesignMeta } from '../../../shared/models';

export const RATE_LIMITER_META: DesignMeta = {
  slug: 'rate-limiter',
  title: 'Design a Rate Limiter',
  tagline:
    'A distributed rate limiter protecting APIs using token bucket and sliding window algorithms.',
  category: 'Infrastructure',
  tags: ['algorithms', 'distributed', 'api-gateway', 'throttling'],
  technologies: ['Redis', 'Lua', 'Envoy', 'Token Bucket'],
  difficulty: 'intermediate',
  readingTimeMin: 13,
  status: 'draft',
  keywords: ['throttling', 'token bucket', 'leaky bucket', 'sliding window', 'quota'],
  dateAdded: '2026-06-28',
  popularity: 82,
  icon: 'RL',
  heroGradient: 'linear-gradient(135deg, #0891b2 0%, #164e63 100%)',
};
