import { DesignMeta } from '../../../shared/models';

export const NETFLIX_META: DesignMeta = {
  slug: 'netflix',
  title: 'Design Netflix',
  tagline:
    'A global video streaming platform serving billions of hours of content with low latency.',
  category: 'Media & Streaming',
  tags: ['streaming', 'video', 'cdn', 'microservices', 'recommendation'],
  technologies: ['Cassandra', 'Kafka', 'EVCache', 'Open Connect CDN', 'AWS', 'Spring Boot'],
  difficulty: 'advanced',
  readingTimeMin: 22,
  status: 'published',
  keywords: ['video on demand', 'adaptive bitrate', 'transcoding', 'open connect'],
  dateAdded: '2026-06-28',
  popularity: 100,
  icon: 'NF',
  heroGradient: 'linear-gradient(135deg, #b81d24 0%, #0d0d0d 100%)',
  author: 'System Design Platform',
};
