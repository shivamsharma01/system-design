import { DesignContent } from '../../../shared/models';
import { SIDECAR_META } from './sidecar.meta';

const content: DesignContent = {
  meta: SIDECAR_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'The **Sidecar Pattern** deploys a **helper container** alongside your application container in the same **Kubernetes pod**. The sidecar extends the app with cross-cutting concerns — **proxying**, **logging**, **metrics**, **secrets injection** — without modifying application source code. Both containers share the **network namespace** (localhost) and can share **volumes**.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Why a sidecar?',
          body: 'Keep the app focused on business logic. Offload infrastructure plumbing — TLS, observability, config reload — to a companion process that ships and upgrades independently.',
        },
        {
          type: 'table',
          caption: 'Common sidecar roles.',
          headers: ['Role', 'Examples'],
          rows: [
            ['Service mesh proxy', 'Envoy (Istio/Linkerd) — mTLS, retries, telemetry'],
            ['Log shipping', 'Fluent Bit, Filebeat — tail app logs to Elasticsearch'],
            ['Secrets', 'Vault Agent, CSI driver — mount rotated credentials'],
            ['Config sync', 'Consul Template — hot-reload config files on disk'],
          ],
        },
      ],
    },
    {
      id: 'concept',
      title: 'Concept and analogy',
      blocks: [
        {
          type: 'callout',
          variant: 'tip',
          title: 'Real-world analogy',
          body: 'A **motorcycle sidecar**: the rider (app) steers the journey; the sidecar passenger (helper) carries tools, navigation, and communication gear. They move as one unit but have separate jobs — neither has to become the other.',
        },
        {
          type: 'mermaid',
          caption: 'Kubernetes pod with app container and sidecar sharing localhost.',
          definition: `flowchart LR
  subgraph pod["Pod — shared network namespace"]
    APP["App container\\n:8080 business logic"]
    SC["Sidecar container\\nEnvoy / Fluent Bit / Vault"]
    APP <-->|localhost| SC
  end
  INGRESS["Ingress / mesh"] --> SC
  SC --> APP
  SC --> EXT["External services\\nlogs, secrets, upstream APIs"]`,
        },
      ],
    },
    {
      id: 'where-used',
      title: 'Where it is used',
      blocks: [
        {
          type: 'table',
          headers: ['Domain', 'Example'],
          rows: [
            ['E-commerce checkout', 'Envoy sidecar adds mTLS and retry policy between order and payment pods'],
            ['Food delivery', 'Fluent Bit sidecar ships rider GPS and dispatch logs to centralized observability'],
            ['Payments', 'Vault Agent sidecar renews PCI-scoped DB credentials without app restart'],
            ['Netflix-style microservices', 'Zuoy/Envoy sidecars per instance — traffic policy without library coupling'],
            ['Legacy modernization', 'NGINX sidecar terminates TLS in front of unmodified monolith container during strangler migration'],
            ['Kubernetes platform', 'Istio injects istio-proxy sidecar into every pod in the mesh automatically'],
          ],
        },
      ],
    },
    {
      id: 'implementation',
      title: 'Implementation',
      blocks: [
        {
          type: 'markdown',
          value:
            'Define multiple containers in a **Pod spec**. The app binds to `127.0.0.1` or a shared Unix socket; the sidecar handles external I/O. Use **init containers** when the sidecar must start first (e.g., download TLS certs). Watch **resource limits** — sidecars consume CPU/memory on every pod replica.',
        },
        {
          type: 'code',
          language: 'yaml',
          filename: 'sidecar-pod.yaml',
          code: `apiVersion: v1
kind: Pod
metadata:
  name: order-service
  labels:
    app: order-service
spec:
  containers:
    - name: order-app
      image: ecommerce/order-service:2.4.1
      ports:
        - containerPort: 8080
      env:
        - name: HTTP_PROXY
          value: "http://127.0.0.1:15001"  # traffic via Envoy
      volumeMounts:
        - name: logs
          mountPath: /var/log/app
    - name: envoy-sidecar
      image: envoyproxy/envoy:v1.31
      ports:
        - containerPort: 15001
      args: ["-c", "/etc/envoy/envoy.yaml"]
      resources:
        requests:
          cpu: 100m
          memory: 128Mi
        limits:
          cpu: 500m
          memory: 256Mi
    - name: log-shipper
      image: fluent/fluent-bit:3.0
      volumeMounts:
        - name: logs
          mountPath: /var/log/app
          readOnly: true
  volumes:
    - name: logs
      emptyDir: {}`,
        },
        {
          type: 'code',
          language: 'java',
          filename: 'AppWithLocalhostProxy.java',
          code: `// App only knows localhost — sidecar handles outbound mesh routing
public class PaymentClient {
  private final HttpClient http = HttpClient.newBuilder()
      .connectTimeout(Duration.ofMillis(200))
      .build();

  public PaymentResult charge(ChargeRequest req) {
    // Envoy sidecar listens on 127.0.0.1:15001
    HttpRequest httpReq = HttpRequest.newBuilder()
        .uri(URI.create("http://127.0.0.1:15001/payments/charge"))
        .header("Content-Type", "application/json")
        .POST(HttpRequest.BodyPublishers.ofString(req.toJson()))
        .timeout(Duration.ofSeconds(2))
        .build();
    HttpResponse<String> res = http.send(httpReq, HttpResponse.BodyHandlers.ofString());
    return PaymentResult.fromJson(res.body());
  }
}`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Operational cost',
          body: 'Every replica runs **N+1 containers**. A 500 mCPU Envoy sidecar across 2,000 pods is **1,000 cores** of overhead. Measure before mesh-wide injection; consider **node-level agents** for logging when pod density is extreme.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Extends apps without code changes or library dependencies.',
            'Independent upgrade cycle for proxy, logging, and secrets tooling.',
            'Shared localhost simplifies mTLS and traffic capture in the mesh.',
          ],
          cons: [
            'Extra CPU/memory per pod — cost scales with replica count.',
            'Debugging spans two containers; logs must be correlated.',
            'Startup ordering and shared volume permissions add complexity.',
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
              question: 'What is the Sidecar Pattern?',
              answer:
                'A **companion container** in the same pod as the app, sharing network and volumes. It handles infrastructure concerns (proxy, logs, secrets) so the app stays focused on domain logic.',
            },
            {
              question: 'Sidecar vs Ambassador Pattern?',
              answer:
                '**Ambassador** is a **specialized sidecar** focused on **outbound** proxying — retries, TLS, routing to external services. All ambassadors are sidecars; not all sidecars are ambassadors (e.g., a log shipper is sidecar only).',
            },
            {
              question: 'Why share a pod instead of a separate Deployment?',
              answer:
                '**Localhost networking** — the app talks to `127.0.0.1` with zero cross-node latency. **Lifecycle coupling** — sidecar and app scale, schedule, and die together. Separate deployments lose tight localhost binding.',
            },
            {
              question: 'Name three real sidecar use cases in Kubernetes.',
              answer:
                '**Envoy/Istio** for service mesh, **Fluent Bit** for log forwarding, **Vault Agent** for dynamic secret files. Also common: **config sync** and **TLS cert rotation** sidecars.',
            },
            {
              question: 'What are the downsides of service mesh sidecars?',
              answer:
                '**Resource overhead** per pod, **latency hop** through proxy, **operational complexity** (mTLS certs, config drift), and **cold start** time when injecting many containers.',
            },
            {
              question: 'How would you add observability to 200 legacy Java services without code changes?',
              answer:
                'Inject an **Envoy or OpenTelemetry collector sidecar** via admission webhook. Capture traffic at localhost, emit metrics/traces centrally. Optionally pair with a **log shipper sidecar** for stdout forwarding.',
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
          body: '1. Sidecar = **helper container** in the same pod, sharing localhost.\n2. Real uses: **Envoy mesh, Fluent Bit logging, Vault secrets**.\n3. Related: **Ambassador** for outbound proxying.\n4. Trade-off: **zero app changes** vs **per-replica resource cost**.',
        },
      ],
    },
  ],
};

export default content;
