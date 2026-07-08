import { DesignMeta } from '../../../shared/models';

export const FACTORY_METHOD_META: DesignMeta = {
  slug: 'factory-method',
  title: 'Factory Method Pattern',
  tagline:
    'Let subclasses decide which object to create — notifications, payments, and document exporters without hard-coded `new`.',
  section: 'design-patterns',
  category: 'Creational',
  tags: ['factory-method', 'creational', 'gof', 'lld', 'ocp'],
  technologies: ['Java', 'Notifications', 'Payments'],
  difficulty: 'beginner',
  readingTimeMin: 12,
  status: 'published',
  keywords: [
    'factory method',
    'creator',
    'product',
    'object creation',
    'open closed',
  ],
  dateAdded: '2026-07-09',
  popularity: 95,
  icon: 'FM',
  heroGradient: 'linear-gradient(135deg, #10b981 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
