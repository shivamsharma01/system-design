import { DesignMeta } from '../../../shared/models';

export const DROPBOX_META: DesignMeta = {
  slug: 'dropbox',
  title: 'Design Dropbox',
  tagline:
    'A file hosting and sync service: chunking, deduplication, delta sync, and conflict-free multi-device collaboration.',
  section: 'high-level-design',
  category: 'Storage & Cache',
  tags: ['file-sync', 'storage', 'chunking', 'deduplication', 'delta-sync', 'metadata'],
  technologies: ['S3', 'MySQL', 'Kafka', 'Redis', 'Block Storage', 'gRPC'],
  difficulty: 'advanced',
  readingTimeMin: 26,
  status: 'published',
  keywords: [
    'google drive',
    'onedrive',
    'file sync',
    'block storage',
    'content-defined chunking',
    'delta sync',
    'conflict resolution',
    'notification service',
  ],
  dateAdded: '2026-06-29',
  popularity: 83,
  icon: 'DB',
  heroGradient: 'linear-gradient(135deg, #0061ff 0%, #0b1f3a 100%)',
  author: 'System Design Platform',
};
