import { DesignMeta } from '../../../shared/models';

export const OWASP_TOP_10_META: DesignMeta = {
  slug: 'owasp-top-10',
  title: 'OWASP Top 10',
  tagline:
    'Sketchnotes for the OWASP Top 10 — what each risk means, how it shows up, and how to stop it.',
  section: 'interview-questions',
  category: 'Security',
  tags: ['owasp', 'security', 'web', 'interview', 'sketchnotes'],
  technologies: ['OWASP', 'Web Security'],
  difficulty: 'intermediate',
  readingTimeMin: 12,
  status: 'published',
  keywords: [
    'owasp top 10',
    'broken access control',
    'injection',
    'ssrf',
    'security misconfiguration',
  ],
  dateAdded: '2026-07-18',
  popularity: 96,
  icon: '10',
  heroGradient: 'linear-gradient(135deg, #b45309 0%, #1c1917 100%)',
  author: 'System Design Platform',
};
