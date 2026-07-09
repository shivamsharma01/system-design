import { DesignMeta } from '../../../shared/models';

export const AMBASSADOR_META: DesignMeta = {
  slug: 'ambassador',
  title: 'Ambassador Pattern',
  tagline:
    'A local proxy container handles outbound connectivity — retries, TLS termination, routing, and circuit breaking so the app talks to localhost only.',
  section: 'design-patterns',
  category: 'Distributed Systems',
  tags: ['ambassador', 'sidecar', 'proxy', 'egress', 'istio'],
  technologies: ['Envoy', 'Istio', 'Linkerd', 'Kubernetes', 'NGINX'],
  difficulty: 'advanced',
  readingTimeMin: 13,
  status: 'published',
  keywords: ['egress proxy', 'local proxy', 'outbound routing', 'service mesh'],
  dateAdded: '2026-07-10',
  popularity: 108,
  icon: 'AE',
  heroGradient: 'linear-gradient(135deg, #0ea5e9 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
