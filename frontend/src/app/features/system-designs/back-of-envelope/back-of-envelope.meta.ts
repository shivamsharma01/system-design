import { DesignMeta } from '../../../shared/models';

export const BACK_OF_ENVELOPE_META: DesignMeta = {
  slug: 'back-of-envelope',
  title: 'Back-of-Envelope Estimation',
  tagline:
    'Powers of two, latency numbers, QPS from DAU, storage and bandwidth math — interview estimation with clear assumptions and peak multipliers.',
  section: 'fundamentals',
  category: 'Interview Prep',
  tags: [
    'estimation',
    'capacity',
    'qps',
    'latency-numbers',
    'storage',
    'bandwidth',
    'interview',
  ],
  technologies: ['Estimation formulas', 'Latency numbers'],
  difficulty: 'beginner',
  readingTimeMin: 12,
  status: 'published',
  keywords: [
    'back of envelope',
    'capacity estimation',
    'powers of 2',
    'Jeff Dean numbers',
    'DAU to QPS',
    'peak traffic',
    'URL shortener QPS',
  ],
  dateAdded: '2026-07-12',
  popularity: 98,
  icon: 'BA',
  heroGradient: 'linear-gradient(135deg, #22c55e 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
