import { DesignMeta } from '../../../shared/models';

export const CHAIN_OF_RESPONSIBILITY_META: DesignMeta = {
  slug: 'chain-of-responsibility',
  title: 'Chain of Responsibility Pattern',
  tagline:
    'Pass a request along handlers until one handles it — middleware, support tiers, and approval workflows.',
  section: 'design-patterns',
  category: 'Behavioral',
  tags: ['chain-of-responsibility', 'behavioral', 'gof', 'lld', 'middleware'],
  technologies: ['Java', 'Servlet Filters', 'Middleware'],
  difficulty: 'intermediate',
  readingTimeMin: 12,
  status: 'published',
  keywords: ['handler chain', 'middleware pipeline', 'request processing'],
  dateAdded: '2026-07-09',
  popularity: 90,
  icon: 'CH',
  heroGradient: 'linear-gradient(135deg, #6366f1 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
