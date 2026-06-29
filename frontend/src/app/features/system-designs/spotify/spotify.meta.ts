import { DesignMeta } from '../../../shared/models';

export const SPOTIFY_META: DesignMeta = {
  slug: 'spotify',
  title: 'Design Spotify',
  tagline:
    'A music-streaming platform with a massive catalog, low-latency audio delivery, playlists, and personalized discovery.',
  category: 'Media & Streaming',
  tags: ['audio', 'streaming', 'recommendations', 'cdn', 'playlists', 'search'],
  technologies: ['Cassandra', 'PostgreSQL', 'CDN', 'Kafka', 'Elasticsearch', 'BigQuery'],
  difficulty: 'advanced',
  readingTimeMin: 25,
  status: 'published',
  keywords: [
    'music streaming',
    'discover weekly',
    'playlists',
    'audio delivery',
    'recommendations',
    'collaborative filtering',
    'offline playback',
    'gapless',
  ],
  dateAdded: '2026-06-29',
  popularity: 85,
  icon: 'SP',
  heroGradient: 'linear-gradient(135deg, #1db954 0%, #191414 100%)',
  author: 'System Design Platform',
};
