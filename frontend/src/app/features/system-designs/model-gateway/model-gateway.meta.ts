import { DesignMeta } from '../../../shared/models';

export const MODEL_GATEWAY_META: DesignMeta = {
  slug: 'model-gateway',
  title: 'Model Gateway Pattern',
  tagline:
    'Unified inference entry point — route by model id and version, enforce auth, timeouts, and rate limits across fraud, search, and ads models.',
  section: 'design-patterns',
  category: 'ML & Data Pipeline',
  tags: ['ml', 'gateway', 'routing', 'inference', 'api'],
  technologies: ['Kong', 'Envoy', 'FastAPI', 'gRPC', 'OAuth2'],
  difficulty: 'advanced',
  readingTimeMin: 11,
  status: 'published',
  keywords: ['model gateway', 'inference routing', 'version routing', 'auth', 'timeouts'],
  dateAdded: '2026-07-09',
  popularity: 92,
  icon: 'MG',
  heroGradient: 'linear-gradient(135deg, #3b82f6 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
