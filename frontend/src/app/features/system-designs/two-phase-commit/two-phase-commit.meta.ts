import { DesignMeta } from '../../../shared/models';

export const TWO_PHASE_COMMIT_META: DesignMeta = {
  slug: 'two-phase-commit',
  title: 'Two-Phase Commit Pattern',
  tagline:
    'Coordinate atomic commit across participants with prepare and commit phases — strong consistency via a transaction manager, but blocking and not partition-tolerant.',
  section: 'design-patterns',
  category: 'Distributed Systems',
  tags: ['2pc', 'distributed-transactions', 'xa', 'acid', 'transaction-manager'],
  technologies: ['XA', 'PostgreSQL 2PC', 'Java Transaction API', 'Oracle Tuxedo'],
  difficulty: 'advanced',
  readingTimeMin: 11,
  status: 'published',
  keywords: ['prepare phase', 'commit phase', 'transaction coordinator', 'blocking protocol'],
  dateAdded: '2026-07-10',
  popularity: 77,
  icon: 'T2',
  heroGradient: 'linear-gradient(135deg, #6366f1 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
