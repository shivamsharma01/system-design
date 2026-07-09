import { DesignMeta } from '../../../shared/models';

export const ACTOR_MODEL_META: DesignMeta = {
  slug: 'actor-model',
  title: 'Actor Model Pattern',
  tagline:
    'Isolate state behind message mailboxes — Akka, Erlang/OTP, and concurrent design without shared mutable memory.',
  section: 'design-patterns',
  category: 'Concurrency',
  tags: ['actor-model', 'concurrency', 'messaging', 'lld', 'akka'],
  technologies: ['Java', 'Akka', 'Erlang'],
  difficulty: 'advanced',
  readingTimeMin: 14,
  status: 'published',
  keywords: ['mailbox', 'message passing', 'no shared state', 'supervision'],
  dateAdded: '2026-07-09',
  popularity: 84,
  icon: 'AM',
  heroGradient: 'linear-gradient(135deg, #ef4444 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
