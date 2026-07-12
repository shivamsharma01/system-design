import { DesignMeta } from '../../../shared/models';

export const SERVICE_MESH_META: DesignMeta = {
  slug: 'service-mesh',
  title: 'Service Mesh',
  tagline:
    'Infrastructure layer for service-to-service traffic — Envoy data plane plus Istio/Linkerd control plane for mTLS, retries, circuit breaking, and observability.',
  section: 'design-patterns',
  category: 'Distributed Systems',
  tags: [
    'service-mesh',
    'istio',
    'linkerd',
    'envoy',
    'mtls',
    'sidecar',
    'observability',
  ],
  technologies: ['Istio', 'Linkerd', 'Envoy', 'Consul Connect', 'OpenTelemetry'],
  difficulty: 'advanced',
  readingTimeMin: 17,
  status: 'published',
  keywords: [
    'data plane',
    'control plane',
    'sidecar proxy',
    'zero-trust networking',
    'traffic management',
  ],
  dateAdded: '2026-07-12',
  popularity: 96,
  icon: 'SM',
  heroGradient: 'linear-gradient(135deg, #7c3aed 0%, #0f172a 100%)',
  author: 'System Design Platform',
};
