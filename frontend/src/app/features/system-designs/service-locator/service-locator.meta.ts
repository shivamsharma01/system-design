import { DesignMeta } from '../../../shared/models';

export const SERVICE_LOCATOR_META: DesignMeta = {
  slug: 'service-locator',
  title: 'Service Locator Pattern',
  tagline:
    'A registry to look up dependencies — useful historically, often an anti-pattern today versus constructor injection.',
  section: 'design-patterns',
  category: 'Architectural',
  tags: ['service-locator', 'architectural', 'di', 'lld', 'anti-pattern'],
  technologies: ['Java', 'DI Containers'],
  difficulty: 'intermediate',
  readingTimeMin: 11,
  status: 'published',
  keywords: ['service registry', 'hidden dependencies', 'vs dependency injection'],
  dateAdded: '2026-07-09',
  popularity: 80,
  icon: 'SL',
  heroGradient: 'linear-gradient(135deg, #64748b 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
