import { DesignMeta } from '../../../shared/models';

export const URL_SHORTENER_META: DesignMeta = {
  slug: 'url-shortener',
  title: 'Design a URL Shortener',
  tagline: 'A TinyURL/Bitly-style service that maps long URLs to short, shareable links at scale.',
  category: 'Web Services',
  tags: ['hashing', 'key-generation', 'caching', 'read-heavy'],
  technologies: ['PostgreSQL', 'Redis', 'Base62', 'Snowflake IDs', 'CDN'],
  difficulty: 'beginner',
  readingTimeMin: 14,
  status: 'published',
  keywords: ['tinyurl', 'bitly', 'short link', 'redirect', 'base62'],
  dateAdded: '2026-06-28',
  popularity: 95,
  icon: 'URL',
  heroGradient: 'linear-gradient(135deg, #2563eb 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
