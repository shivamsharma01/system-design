import { DesignMeta } from '../../../shared/models';

export const THREE_PHASE_COMMIT_META: DesignMeta = {
  slug: 'three-phase-commit',
  title: 'Three-Phase Commit Pattern',
  tagline:
    'Add a pre-commit phase to 2PC so non-faulty nodes can proceed after coordinator failure — reduces blocking, yet remains rare compared to Saga in production.',
  section: 'design-patterns',
  category: 'Distributed Systems',
  tags: ['3pc', 'distributed-transactions', 'consensus', 'non-blocking', '2pc'],
  technologies: ['Research protocols', 'Distributed DB internals', 'XA variants'],
  difficulty: 'intermediate',
  readingTimeMin: 13,
  status: 'published',
  keywords: ['pre-commit', 'canCommit', 'doCommit', 'non-blocking commit', '3PC vs 2PC'],
  dateAdded: '2026-07-10',
  popularity: 105,
  icon: 'T3',
  heroGradient: 'linear-gradient(135deg, #7c3aed 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
