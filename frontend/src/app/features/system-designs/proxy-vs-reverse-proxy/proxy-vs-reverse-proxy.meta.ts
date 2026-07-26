import { DesignMeta } from '../../../shared/models';

export const PROXY_VS_REVERSE_PROXY_META: DesignMeta = {
  slug: 'proxy-vs-reverse-proxy',
  title: 'Proxy vs Reverse Proxy',
  tagline:
    'Forward proxies act for clients; reverse proxies act for servers — privacy, LB, SSL termination, caching, and Nginx/Spring notes.',
  section: 'fundamentals',
  category: 'Networking',
  tags: ['proxy', 'reverse-proxy', 'nginx', 'ssl', 'fundamentals'],
  technologies: ['Nginx', 'HAProxy', 'Cloudflare', 'Spring Cloud Gateway'],
  difficulty: 'beginner',
  readingTimeMin: 10,
  status: 'published',
  keywords: ['forward proxy', 'reverse proxy', 'SSL termination', 'Nginx', 'WAF'],
  dateAdded: '2026-07-26',
  popularity: 96,
  icon: 'PX',
  heroGradient: 'linear-gradient(135deg, #a855f7 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
