import { DesignMeta } from '../../../shared/models';

export const CHAOS_ENGINEERING_META: DesignMeta = {
  slug: 'chaos-engineering',
  title: 'Chaos Engineering Pattern',
  tagline:
    'Inject failures on purpose — game days, Chaos Monkey, and proving resilience hypotheses in production-like systems.',
  section: 'design-patterns',
  category: 'Cloud & Resilience',
  tags: ['chaos-engineering', 'cloud', 'resilience', 'reliability', 'hld'],
  technologies: ['Chaos Mesh', 'Litmus', 'Gremlin'],
  difficulty: 'advanced',
  readingTimeMin: 13,
  status: 'published',
  keywords: ['chaos monkey', 'fault injection', 'game day', 'resilience testing'],
  dateAdded: '2026-07-09',
  popularity: 86,
  icon: 'CE',
  heroGradient: 'linear-gradient(135deg, #dc2626 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
