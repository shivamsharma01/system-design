import { DesignMeta } from '../../../shared/models';

export const CLAIM_CHECK_META: DesignMeta = {
  slug: 'claim-check',
  title: 'Claim Check Pattern',
  tagline:
    'Store large payloads in blob storage; messages carry only a reference — S3 claim checks for lean, fast queues.',
  section: 'design-patterns',
  category: 'Data & Messaging',
  tags: ['claim-check', 'messaging', 's3', 'large-payload'],
  technologies: ['AWS S3', 'SQS', 'Kafka', 'Azure Blob'],
  difficulty: 'intermediate',
  readingTimeMin: 11,
  status: 'published',
  keywords: ['blob reference', 'message size limit', 'external storage'],
  dateAdded: '2026-07-09',
  popularity: 82,
  icon: 'CC',
  heroGradient: 'linear-gradient(135deg, #f97316 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
