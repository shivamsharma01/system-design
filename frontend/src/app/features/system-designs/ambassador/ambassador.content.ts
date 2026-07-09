import { DesignContent } from '../../../shared/models';
import { AMBASSADOR_META } from './ambassador.meta';

const content: DesignContent = {
  meta: AMBASSADOR_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'The **Ambassador Pattern** places a **local proxy** (typically a sidecar) between your application and the outside world for **outbound** calls. The app sends requests to **localhost**; the ambassador handles **retries**, **TLS**, **routing**, **circuit breaking**, and **auth** to upstream services. This decouples connectivity policy from application code.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Outbound focus',
          body: 'Unlike an API gateway (north-south ingress), the ambassador manages **egress** — how this instance reaches payment APIs, inventory, or legacy SOAP endpoints — with policies enforced locally.',
        },
        {
          type: 'table',
          caption: 'Ambassador responsibilities.',
          headers: ['Concern', 'Handled by ambassador'],
          rows: [
            ['Retries & backoff', 'Envoy retry policy on 5xx / connect-failure'],
            ['TLS/mTLS', 'Terminate or originate TLS to upstream clusters'],
            ['Routing', 'Split traffic across service versions or regions'],
            ['Resilience', 'Circuit breaking, timeouts, outlier detection'],
            ['Observability', 'Per-dependency metrics without SDK in app'],
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
          body: 'A **diplomatic ambassador** in a foreign country: your company (app) sends instructions to the local embassy (localhost proxy). The ambassador handles protocol, security clearances, and retries with local authorities — you never negotiate border rules yourself.',
        },
        {
          type: 'mermaid',
          caption: 'App calls localhost; ambassador proxies to external services.',
          definition: `flowchart LR
  APP["Order service\\napp container"]
  AMB["Ambassador sidecar\\nEnvoy egress :15001"]
  PAY["Payment API"]
  INV["Inventory API"]
  LEG["Legacy SOAP host"]

  APP -->|"HTTP localhost"| AMB
  AMB -->|"mTLS + retry"| PAY
  AMB -->|"timeout 500ms"| INV
  AMB -->|"protocol bridge"| LEG`,
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
            ['E-commerce checkout', 'Ambassador retries card-auth calls with jitter; app sees single localhost endpoint'],
            ['Food delivery', 'Egress proxy routes map API calls through regional endpoint with automatic failover'],
            ['Payments', 'Ambassador enforces mTLS to processor; PCI scope reduced — app never holds client certs'],
            ['Netflix-style microservices', 'Envoy egress sidecar per instance — Hystrix-style resilience without JVM libraries'],
            ['Legacy modernization', 'Ambassador translates REST from new services to legacy HTTP/SOAP upstream during strangler cutover'],
            ['Istio service mesh', 'istio-proxy handles both ingress and ambassador-style egress via ServiceEntry and DestinationRule'],
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
            'Point application HTTP clients at **`127.0.0.1:<ambassador-port>`**. Configure the proxy with **cluster definitions**, **retry budgets**, and **timeout** per upstream. In Istio, **ServiceEntry** registers external hosts; **DestinationRule** sets connection pools and outlier detection.',
        },
        {
          type: 'code',
          language: 'yaml',
          filename: 'istio-egress-ambassador.yaml',
          code: `apiVersion: networking.istio.io/v1
kind: ServiceEntry
metadata:
  name: payment-processor
spec:
  hosts:
    - api.payment-processor.com
  ports:
    - number: 443
      name: https
      protocol: HTTPS
  location: MESH_EXTERNAL
  resolution: DNS
---
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: payment-processor
spec:
  host: api.payment-processor.com
  trafficPolicy:
    connectionPool:
      http:
        maxRetries: 3
        idleTimeout: 30s
    outlierDetection:
      consecutive5xxErrors: 5
      interval: 30s
      baseEjectionTime: 60s`,
        },
        {
          type: 'code',
          language: 'java',
          filename: 'AmbassadorEgressClient.java',
          code: `// All outbound traffic goes through localhost ambassador
public class InventoryAmbassadorClient {
  private static final String AMBASSADOR_BASE = "http://127.0.0.1:15001";

  private final HttpClient http = HttpClient.newHttpClient();

  public StockLevel fetchStock(String sku) {
    HttpRequest req = HttpRequest.newBuilder()
        .uri(URI.create(AMBASSADOR_BASE + "/inventory/v1/stock/" + sku))
        .header("x-request-id", RequestContext.currentId())
        .timeout(Duration.ofMillis(800))
        .GET()
        .build();
    // Envoy applies retry, mTLS, and circuit breaking upstream
    HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
    if (res.statusCode() >= 500) {
      throw new DependencyUnavailableException("inventory via ambassador");
    }
    return StockLevel.parse(res.body());
  }
}`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Do not double-retry',
          body: 'If the **app** and **ambassador** both retry, attempts multiply (**retry storm**). Pick one layer — typically ambassador retries with budget; app fails fast on timeout.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Centralized egress policy without per-language SDKs.',
            'mTLS and cert rotation handled outside the app.',
            'Consistent observability labels per upstream dependency.',
          ],
          cons: [
            'Extra network hop and memory per pod.',
            'Proxy config errors affect all egress from that pod.',
            'Debugging requires correlating app logs with proxy access logs.',
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
              question: 'What does the Ambassador Pattern do?',
              answer:
                'Provides a **local outbound proxy** (usually a sidecar) that handles connectivity concerns — retries, TLS, routing — so the app only calls **localhost**.',
            },
            {
              question: 'Ambassador vs API Gateway?',
              answer:
                '**Gateway** is a **shared ingress** entry for many clients. **Ambassador** is **per-instance egress** — each pod’s proxy manages its own outbound calls. Complementary, not interchangeable.',
            },
            {
              question: 'How does Istio implement the ambassador pattern?',
              answer:
                '**istio-proxy** sidecar intercepts outbound traffic via **iptables/eBPF**. **ServiceEntry** declares external hosts; **DestinationRule** sets retries, pools, and outlier detection.',
            },
            {
              question: 'Why localhost instead of calling services directly?',
              answer:
                '**Policy without code changes** — same app binary in dev (direct) and prod (via ambassador). **Uniform mTLS**, retries, and metrics applied by platform team.',
            },
            {
              question: 'Ambassador vs Sidecar — relationship?',
              answer:
                'Ambassador is a **use case** of the sidecar pattern focused on **outbound proxying**. Log shippers are sidecars but not ambassadors.',
            },
            {
              question: 'Design payment service egress for a multi-region mesh.',
              answer:
                'Deploy **Envoy ambassador** per pod. **ServiceEntry** for processor DNS. **DestinationRule** with regional failover, **retry budget**, **timeout 2s**, **circuit breaker** on 5xx. App calls `127.0.0.1:15001/payments` only.',
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
          body: '1. Ambassador = **local egress proxy** for outbound resilience.\n2. App talks **localhost**; proxy handles **TLS, retries, routing**.\n3. Real uses: **Istio/Envoy egress, legacy protocol bridging**.\n4. Pair with **sidecar** deployment; avoid **double retries**.',
        },
      ],
    },
  ],
};

export default content;
