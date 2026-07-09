import { DesignMeta } from '../../../shared/models';

export const MESSAGE_ROUTER_META: DesignMeta = {
  slug: 'message-router',
  title: 'Message Router Pattern',
  tagline:
    'Route messages to the right channel by rules, headers, or predicates — the traffic cop of integration pipelines.',
  section: 'design-patterns',
  category: 'Data & Messaging',
  tags: ['message-router', 'routing', 'integration', 'esb'],
  technologies: ['Apache Camel', 'Kafka Connect', 'AWS EventBridge', 'RabbitMQ'],
  difficulty: 'intermediate',
  readingTimeMin: 11,
  status: 'published',
  keywords: ['routing slip', 'recipient list', 'dynamic router'],
  dateAdded: '2026-07-09',
  popularity: 85,
  icon: 'MR',
  heroGradient: 'linear-gradient(135deg, #6366f1 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
