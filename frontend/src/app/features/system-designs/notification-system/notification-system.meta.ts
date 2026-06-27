import { DesignMeta } from '../../../shared/models';

export const NOTIFICATION_SYSTEM_META: DesignMeta = {
  slug: 'notification-system',
  title: 'Design a Notification System',
  tagline:
    'A multi-channel notification service delivering push, SMS, and email at scale with deduplication.',
  category: 'Infrastructure',
  tags: ['messaging', 'fan-out', 'queues', 'multi-channel'],
  technologies: ['Kafka', 'Redis', 'APNs', 'FCM', 'SES'],
  difficulty: 'intermediate',
  readingTimeMin: 15,
  status: 'draft',
  keywords: ['push notifications', 'sms', 'email', 'fan-out', 'idempotency'],
  dateAdded: '2026-06-28',
  popularity: 80,
  icon: 'NS',
  heroGradient: 'linear-gradient(135deg, #7c3aed 0%, #312e81 100%)',
};
