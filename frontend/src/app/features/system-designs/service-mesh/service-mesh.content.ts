import { DesignContent } from '../../../shared/models';
import { SERVICE_MESH_META } from './service-mesh.meta';

const content: DesignContent = {
  meta: SERVICE_MESH_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'A **service mesh** is an infrastructure layer that handles **service-to-service (east-west)** communication: mutual TLS, retries, timeouts, traffic shifting, and telemetry — usually via a **sidecar proxy** next to each workload, configured by a **control plane**.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Why meshes exist',
          body: 'Microservices need the same resilience and security in **every language**. Libraries (Resilience4j) work per runtime; a mesh pushes policy into the **data plane** so Java, Go, and Node get uniform mTLS and metrics without rewriting each service.',
        },
        {
          type: 'table',
          caption: 'Mesh building blocks.',
          headers: ['Plane', 'Role', 'Examples'],
          rows: [
            ['Data plane', 'Proxies that carry traffic and enforce policy', 'Envoy sidecars (Istio), Linkerd2-proxy'],
            ['Control plane', 'Config, certificates, discovery, policy APIs', 'Istiod, Linkerd control plane'],
            ['Observability sink', 'Metrics, traces, access logs from proxies', 'Prometheus, Jaeger/Tempo, OpenTelemetry'],
          ],
        },
      ],
    },
    {
      id: 'data-vs-control',
      title: 'Data Plane vs Control Plane',
      blocks: [
        {
          type: 'markdown',
          value:
            'The **data plane** is on the request path. The **control plane** is not — it pushes certificates, routes, and destination rules to proxies. If the control plane blips, existing proxies usually keep last-known-good config; new pods may not get identities until it recovers.',
        },
        {
          type: 'mermaid',
          caption: 'Sidecar data plane with central control plane.',
          definition: `flowchart TB
  CP[Control plane\\nIstiod / Linkerd]
  subgraph PodA
    A[App A]
    SA[Envoy sidecar]
  end
  subgraph PodB
    B[App B]
    SB[Envoy sidecar]
  end
  CP -.->|certs, routes, policy| SA
  CP -.->|certs, routes, policy| SB
  A --> SA
  SA -->|mTLS| SB
  SB --> B`,
        },
        {
          type: 'table',
          headers: ['Concern', 'Handled by'],
          rows: [
            ['Encrypt pod-to-pod traffic (mTLS)', 'Data plane + CA from control plane'],
            ['Route 10% traffic to v2', 'VirtualService / TrafficSplit → proxy config'],
            ['Retry idempotent GETs', 'Proxy retry policy'],
            ['Collect golden metrics (RPS, latency, errors)', 'Proxy stats → Prometheus'],
            ['Issue short-lived workload certificates', 'Control plane CA (SPIFFE-style identities)'],
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Differentiate Sidecar and Ambassador',
          body: '**Sidecar** is the *deployment pattern* (helper process beside the app). **Ambassador** is a *sidecar used as an egress/client proxy* for outbound concerns. A **service mesh** is the *platform*: many sidecars (often Envoy) plus a control plane that programs them uniformly. Mesh ⊃ sidecar; sidecar ≠ mesh.',
        },
      ],
    },
    {
      id: 'capabilities',
      title: 'mTLS, Resilience, and Observability',
      blocks: [
        {
          type: 'markdown',
          value:
            '### Security — mutual TLS\n\nEach workload gets an identity (SPIFFE ID). Proxies authenticate each other and encrypt traffic. You get **zero-trust networking** inside the cluster without app crypto code.\n\n### Resilience — retries, timeouts, circuit breaking\n\nConfigure per-route **timeouts**, **retry budgets** (with idempotency rules), and **outlier detection / circuit breakers** so one bad host is ejected. Mesh policies complement — and sometimes replace — in-process libraries.\n\n### Observability\n\nProxies emit **RED metrics**, access logs, and propagate **trace context**. You see service graphs without instrumenting every handler (though app spans still help).',
        },
        {
          type: 'code',
          language: 'yaml',
          filename: 'istio-destination-rule.yaml',
          code: `apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: payments
spec:
  host: payments.default.svc.cluster.local
  trafficPolicy:
    connectionPool:
      http:
        http1MaxPendingRequests: 100
        http2MaxRequests: 1000
    outlierDetection:
      consecutive5xxErrors: 5
      interval: 30s
      baseEjectionTime: 60s
    tls:
      mode: ISTIO_MUTUAL`,
        },
        {
          type: 'code',
          language: 'yaml',
          filename: 'istio-virtual-service-retries.yaml',
          code: `apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: catalog
spec:
  hosts:
    - catalog
  http:
    - route:
        - destination:
            host: catalog
      timeout: 2s
      retries:
        attempts: 3
        perTryTimeout: 500ms
        retryOn: connect-failure,refused-stream,unavailable`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Retries amplify load',
          body: 'Mesh retries on **non-idempotent** POSTs can double-charge. Restrict `retryOn`, set budgets, and combine with **timeouts** and **circuit breakers**. Same rules as library retries — the mesh just makes misuse global.',
        },
      ],
    },
    {
      id: 'when-to-use',
      title: 'Mesh vs Library vs API Gateway',
      blocks: [
        {
          type: 'table',
          caption: 'Choose the right layer.',
          headers: ['Approach', 'Strengths', 'Weaknesses', 'Use when'],
          rows: [
            [
              'In-process library (Resilience4j)',
              'No sidecar hop; fine-grained per-call control',
              'Per language; inconsistent policy; no mTLS for free',
              'Few services, one primary stack, simple topology',
            ],
            [
              'API Gateway only',
              'Strong north-south: auth, rate limit, public APIs',
              'Does not secure or observe east-west by default',
              'Monolith or few backends; external clients are the main concern',
            ],
            [
              'Service mesh',
              'Uniform mTLS, traffic, telemetry across languages',
              'Ops complexity, latency, resource cost of sidecars',
              'Many services, polyglot, compliance needs mTLS everywhere',
            ],
          ],
        },
        {
          type: 'markdown',
          value:
            'A healthy default: **API Gateway** at the edge, **library resilience** for critical business calls you must control in code, and a **mesh** when east-west security and fleet-wide policy become harder than operating Istio/Linkerd.',
        },
        {
          type: 'prosCons',
          title: 'Service mesh trade-offs',
          pros: [
            'Language-agnostic policy and mTLS.',
            'Central traffic management (canary, fault injection).',
            'Consistent golden signals without rewriting every service.',
          ],
          cons: [
            'Extra hop latency and CPU/memory per pod.',
            'Steep operational learning curve (CRDs, upgrades, debugging).',
            'Failure modes: misconfig can break all mesh traffic at once.',
          ],
        },
      ],
    },
    {
      id: 'ops-and-latency',
      title: 'Latency and Operational Complexity',
      blocks: [
        {
          type: 'markdown',
          value:
            'Each sidecar adds **serialization and hops**. For chatty fan-out paths, measure p99 carefully. **Ambient / sidecar-less** modes (e.g. Istio ambient) aim to reduce that tax — know they exist for interviews.\n\nOps cost includes certificate rotation, control-plane HA, version upgrades, and “why is Envoy rejecting this cluster?” debugging. Budget platform engineering time; do not bolt a mesh on overnight before a launch.',
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Start small',
          body: 'Enable mesh on a **non-critical namespace** first: mTLS permissive → strict, one canary VirtualService, dashboards for sidecar CPU. Expand after on-call can debug proxy config confidently.',
        },
        {
          type: 'table',
          headers: ['Symptom', 'Likely cause'],
          rows: [
            ['Sudden 503s cluster-wide', 'DestinationRule / mTLS mode mismatch'],
            ['High sidecar CPU', 'Huge filter chains, access logging everything, or too many clusters'],
            ['App works without mesh, fails with it', 'App expects plaintext localhost; wrong outbound port'],
            ['Control plane down, old pods OK', 'Cached config; new pods cannot get certs'],
          ],
        },
      ],
    },
    {
      id: 'interview-questions',
      title: 'Interview Questions',
      blocks: [
        {
          type: 'interviewQa',
          items: [
            {
              question: 'What is a service mesh?',
              answer:
                'An infrastructure layer for **east-west** traffic providing mTLS, traffic control, and observability via a **data plane** (proxies) programmed by a **control plane** (Istio, Linkerd), so apps stay mostly unaware of the network policy.',
            },
            {
              question: 'Data plane vs control plane?',
              answer:
                '**Data plane** = Envoy/sidecars on the request path. **Control plane** = distributes certs, discovery, and routing config. Control plane outage should not drop existing healthy traffic if proxies retain config.',
            },
            {
              question: 'How does mesh mTLS work?',
              answer:
                'Control plane issues short-lived certificates bound to workload identity. Sidecars present and verify certs on every connection, encrypting traffic. Apps talk plaintext to localhost proxy; the wire is encrypted.',
            },
            {
              question: 'Mesh vs Resilience4j?',
              answer:
                '**Resilience4j** is in-process, JVM-specific, call-site precise. **Mesh** is polyglot and uniform but coarser and adds latency. Teams often use both: mesh for mTLS/telemetry, libraries for business-critical fallbacks.',
            },
            {
              question: 'Mesh vs API Gateway?',
              answer:
                '**Gateway** = north-south edge (auth, rate limits, public API). **Mesh** = service-to-service inside the cluster. Gateways do not replace mesh mTLS between internal services.',
            },
            {
              question: 'Sidecar vs Ambassador vs mesh?',
              answer:
                '**Sidecar** = colocated helper process. **Ambassador** = sidecar specialized for outbound proxying. **Mesh** = fleet of sidecars + control plane with shared policy. Ambassador/Sidecar pages describe patterns; mesh is the productized platform.',
            },
            {
              question: 'When would you not adopt a mesh?',
              answer:
                'Small fleet, single language, no compliance need for ubiquitous mTLS, or no platform team to operate it. Prefer gateway + libraries until pain is real.',
            },
            {
              question: 'How do retries and circuit breaking work in Envoy/Istio?',
              answer:
                'VirtualService sets retry/timeout; DestinationRule sets connection pools and **outlier detection** (eject hosts with consecutive errors). Configure carefully for idempotency and retry budgets.',
            },
            {
              question: 'What observability do you get “for free”?',
              answer:
                'Per-route **request rate, error rate, latency**; optional access logs; distributed tracing headers propagated by the proxy. You still need app-level spans for business logic detail.',
            },
          ],
        },
      ],
    },
    {
      id: 'summary',
      title: 'Summary',
      blocks: [
        {
          type: 'callout',
          variant: 'summary',
          title: 'Key takeaways',
          body: '1. Mesh = **data plane (Envoy)** + **control plane (Istio/Linkerd)** for east-west traffic.\n2. Delivers **mTLS, retries/timeouts/circuit breaking, metrics/traces** uniformly across languages.\n3. Not a substitute for **API Gateway**; not the same as the **Sidecar/Ambassador** patterns alone.\n4. Trade latency and **ops complexity** for policy uniformity — adopt when polyglot scale justifies it.',
        },
      ],
    },
  ],
};

export default content;
