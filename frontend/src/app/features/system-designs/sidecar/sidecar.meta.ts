import { DesignMeta } from '../../../shared/models';

export const SIDECAR_META: DesignMeta = {
  slug: 'sidecar',
  title: 'Sidecar Pattern',
  tagline:
    'Deploy a helper container beside your app in the same pod — Envoy proxy, logging agents, and secrets injection without changing application code.',
  section: 'design-patterns',
  category: 'Distributed Systems',
  tags: ['sidecar', 'kubernetes', 'service-mesh', 'envoy', 'containers'],
  technologies: ['Kubernetes', 'Envoy', 'Istio', 'Fluent Bit', 'Vault Agent'],
  difficulty: 'intermediate',
  readingTimeMin: 12,
  status: 'published',
  keywords: ['sidecar container', 'pod', 'service mesh', 'auxiliary process'],
  dateAdded: '2026-07-10',
  popularity: 107,
  icon: 'SC',
  heroGradient: 'linear-gradient(135deg, #6366f1 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
