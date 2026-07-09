import { DesignMeta } from '../../../shared/models';

export const PUBLISH_SUBSCRIBE_META: DesignMeta = {
  slug: 'publish-subscribe',
  title: 'Publish-Subscribe Pattern',
  tagline:
    'Producers publish to topics; subscribers consume independently — Kafka, SNS, and the decoupling story interviewers love.',
  section: 'design-patterns',
  category: 'Data & Messaging',
  tags: ['pub-sub', 'messaging', 'kafka', 'sns', 'decoupling'],
  technologies: ['Kafka', 'AWS SNS', 'RabbitMQ', 'Google Pub/Sub'],
  difficulty: 'intermediate',
  readingTimeMin: 12,
  status: 'published',
  keywords: ['topic', 'subscriber', 'fan-out', 'event bus'],
  dateAdded: '2026-07-09',
  popularity: 92,
  icon: 'PS',
  heroGradient: 'linear-gradient(135deg, #8b5cf6 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
