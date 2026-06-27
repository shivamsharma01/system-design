import { DesignMeta } from '../../../shared/models';

export const WHATSAPP_META: DesignMeta = {
  slug: 'whatsapp',
  title: 'Design WhatsApp',
  tagline:
    'A real-time messaging platform with end-to-end encryption, presence, and group chats for billions of users.',
  category: 'Messaging',
  tags: ['real-time', 'websockets', 'messaging', 'e2e-encryption', 'presence'],
  technologies: ['WebSocket', 'Erlang', 'Kafka', 'Cassandra', 'Redis', 'Protobuf'],
  difficulty: 'intermediate',
  readingTimeMin: 18,
  status: 'published',
  keywords: ['chat', 'instant messaging', 'message queue', 'fan-out', 'signal protocol'],
  dateAdded: '2026-06-28',
  popularity: 98,
  icon: 'WA',
  heroGradient: 'linear-gradient(135deg, #25d366 0%, #075e54 100%)',
  author: 'System Design Platform',
};
