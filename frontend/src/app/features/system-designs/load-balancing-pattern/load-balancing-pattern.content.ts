import { DesignContent } from '../../../shared/models';
import { LOAD_BALANCING_PATTERN_META } from './load-balancing-pattern.meta';

const content: DesignContent = {
  meta: LOAD_BALANCING_PATTERN_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Load balancing** spreads incoming traffic across a pool of healthy backends so no single instance becomes a bottleneck. It is the foundation of horizontal scale: add capacity by adding instances, and let the balancer decide *where* each request goes. Broader context: [Scalability](/designs/scalability), [Avoiding SPOFs](/designs/single-point-of-failure), [Proxy vs Reverse Proxy](/designs/proxy-vs-reverse-proxy).',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'What interviewers want',
          body: 'Name **L4 vs L7**, pick an **algorithm** with a reason, explain **health checks** and **draining**, and know when **sticky sessions** hurt. Contrast load balancers with **API Gateway** (edge features) and **service mesh** (east-west policy).',
        },
        {
          type: 'table',
          caption: 'Where load balancing shows up.',
          headers: ['Layer', 'Example'],
          rows: [
            ['DNS / GSLB', 'Route users to the nearest region'],
            ['Edge / reverse proxy', 'Nginx, HAProxy, AWS ALB in front of app pods'],
            ['L4 network', 'AWS NLB, LVS — TCP/UDP without inspecting HTTP'],
            ['Client-side', 'gRPC client pickers, Envoy sidecar, Consuls'],
            ['Database / cache', 'ProxySQL, Redis Cluster hashing'],
          ],
        },
      ],
    },
    {
      id: 'l4-vs-l7',
      title: 'L4 vs L7',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Layer 4 (transport)** balances on IP/port and TCP/UDP connection state. It is fast, protocol-agnostic, and cannot route on HTTP path or headers. **Layer 7 (application)** terminates (or inspects) HTTP/gRPC and can route by host, path, cookie, or header — at higher CPU and latency cost.',
        },
        {
          type: 'table',
          caption: 'L4 vs L7 at a glance.',
          headers: ['Dimension', 'L4 (NLB, LVS)', 'L7 (ALB, Nginx http, Envoy)'],
          rows: [
            ['Sees', 'IP, port, TCP/UDP', 'HTTP method, path, headers, cookies'],
            ['Routing', 'Per connection / 5-tuple', 'Per request; content-based'],
            ['TLS', 'Often passthrough (or terminate once)', 'Usually terminate; can re-encrypt'],
            [
              'Latency / throughput',
              'Very high throughput, low overhead',
              'More CPU; richer features',
            ],
            [
              'Use when',
              'Raw TCP, gaming, Kafka, extreme QPS',
              'Microservices HTTP, path routing, WAF',
            ],
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'AWS shorthand',
          body: '**NLB** ≈ L4 (connection-level, static IPs, ultra low latency). **ALB** ≈ L7 (HTTP/HTTPS, path/host rules, target groups). Many stacks use NLB → Envoy/ALB for both speed and smart routing.',
        },
        {
          type: 'mermaid',
          caption: 'Edge L7 balancer in front of a service pool.',
          definition: `flowchart LR
  Client --> LB["Load Balancer\\n(L4 or L7)"]
  LB --> A[Instance A]
  LB --> B[Instance B]
  LB --> C[Instance C]
  HC[Health checks] -.-> A
  HC -.-> B
  HC -.-> C`,
        },
      ],
    },
    {
      id: 'algorithms',
      title: 'Balancing Algorithms',
      blocks: [
        {
          type: 'markdown',
          value:
            'Pick the algorithm from **traffic shape** and **session affinity** needs — not from habit. Interview answers should justify the choice. Also see [Consistent Hashing](/designs/consistent-hashing) for ring-based affinity.',
        },
        {
          type: 'image',
          src: 'assets/article-images/load-balancing-pattern/01-overview.png',
          alt: 'Load balancer distributing requests across multiple backend servers',
          caption:
            'Balancer sits in front of a server pool. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'markdown',
          value:
            '### 1. Round Robin\n\nCycle through servers in order. Simple and even for **homogeneous** backends with similar request cost.',
        },
        {
          type: 'image',
          src: 'assets/article-images/load-balancing-pattern/02-round-robin.png',
          alt: 'Round robin assigning requests to servers in cyclic order',
          caption:
            'Request 1→S1, 2→S2, 3→S3, 4→S1…. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'RoundRobin.java',
          code: `public final class RoundRobin {
  private final List<String> servers;
  private final AtomicInteger idx = new AtomicInteger();

  public RoundRobin(List<String> servers) {
    this.servers = List.copyOf(servers);
  }

  public String next() {
    int i = Math.floorMod(idx.getAndIncrement(), servers.size());
    return servers.get(i);
  }
}`,
        },
        {
          type: 'prosCons',
          title: 'Round Robin',
          pros: ['Simple', 'Even distribution on identical servers'],
          cons: ['Ignores live load', 'Slow server still gets equal share'],
        },
        {
          type: 'markdown',
          value:
            '### 2. Weighted Round Robin\n\nAssign **weights** by capacity (CPU/RAM). Higher weight → proportionally more requests. Good for mixed VM sizes or canaries.',
        },
        {
          type: 'image',
          src: 'assets/article-images/load-balancing-pattern/03-weighted-round-robin.png',
          alt: 'Weighted round robin giving more traffic to higher-capacity servers',
          caption:
            'Weights steer share of traffic. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'image',
          src: 'assets/article-images/load-balancing-pattern/04-weighted-rr-code.png',
          alt: 'Code sketch of weighted round robin implementation',
          caption: 'Reference sketch. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'WeightedRoundRobin.java',
          code: `public final class WeightedRoundRobin {
  private final List<String> expanded = new ArrayList<>();
  private final AtomicInteger idx = new AtomicInteger();

  public WeightedRoundRobin(Map<String, Integer> weights) {
    weights.forEach((s, w) -> {
      for (int i = 0; i < w; i++) expanded.add(s);
    });
  }

  public String next() {
    return expanded.get(Math.floorMod(idx.getAndIncrement(), expanded.size()));
  }
}`,
        },
        {
          type: 'markdown',
          value:
            '### 3. Least Connections\n\nSend the next request to the server with the **fewest active connections**. Ideal when request durations vary.',
        },
        {
          type: 'image',
          src: 'assets/article-images/load-balancing-pattern/05-least-connections.png',
          alt: 'Least connections routing to the server with the fewest open connections',
          caption:
            'Pick the least-busy server by connection count. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'image',
          src: 'assets/article-images/load-balancing-pattern/06-least-connections-code.png',
          alt: 'Code sketch of least connections load balancer',
          caption: 'Reference sketch. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'LeastConnections.java',
          code: `record Backend(String id, AtomicInteger active) {}

public final class LeastConnections {
  private final List<Backend> pool;

  public LeastConnections(List<Backend> pool) { this.pool = pool; }

  public Backend pick() {
    return pool.stream()
        .min(Comparator.comparingInt(b -> b.active().get()))
        .orElseThrow();
  }

  public void withConnection(Backend b, Runnable work) {
    b.active().incrementAndGet();
    try { work.run(); } finally { b.active().decrementAndGet(); }
  }
}`,
        },
        {
          type: 'markdown',
          value:
            '### 4. Least Response Time\n\nPrefer the server with the **lowest recent latency** (often combined with connection count). Best when response times differ across the pool.',
        },
        {
          type: 'image',
          src: 'assets/article-images/load-balancing-pattern/07-least-response-time.png',
          alt: 'Least response time routing to the fastest responding server',
          caption:
            'Optimize for measured latency. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'image',
          src: 'assets/article-images/load-balancing-pattern/08-least-response-time-code.png',
          alt: 'Code sketch of least response time load balancer',
          caption: 'Reference sketch. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'LeastResponseTime.java',
          code: `record TimedBackend(String id, AtomicLong ewmaMs, AtomicInteger active) {}

public final class LeastResponseTime {
  private final List<TimedBackend> pool;

  public TimedBackend pick() {
    return pool.stream()
        .min(Comparator
            .comparingLong((TimedBackend b) -> b.ewmaMs().get())
            .thenComparingInt(b -> b.active().get()))
        .orElseThrow();
  }

  public void record(TimedBackend b, long latencyMs) {
    // simple EWMA; production uses richer metrics
    long prev = b.ewmaMs().get();
    b.ewmaMs().set((long) (0.8 * prev + 0.2 * latencyMs));
  }
}`,
        },
        {
          type: 'markdown',
          value:
            '### 5. IP Hash\n\n`hash(clientIp) % N` pins a client to a backend — simple **session persistence** without cookies. Watch NAT (many users, one IP) and remapping when N changes — prefer [consistent hashing](/designs/consistent-hashing) for caches.',
        },
        {
          type: 'image',
          src: 'assets/article-images/load-balancing-pattern/09-ip-hash.png',
          alt: 'IP hash mapping client IPs to fixed backend servers',
          caption:
            'Same client IP → same server. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'image',
          src: 'assets/article-images/load-balancing-pattern/10-ip-hash-code.png',
          alt: 'Code sketch of IP hash load balancer',
          caption: 'Reference sketch. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'IpHash.java',
          code: `public final class IpHash {
  private final List<String> servers;

  public IpHash(List<String> servers) { this.servers = List.copyOf(servers); }

  public String pick(String clientIp) {
    int h = clientIp.hashCode();
    return servers.get(Math.floorMod(h, servers.size()));
  }
}`,
        },
        {
          type: 'image',
          src: 'assets/article-images/load-balancing-pattern/11-algorithm-summary.png',
          alt: 'Summary comparison of five load balancing algorithms',
          caption:
            'When to use each algorithm. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'table',
          caption: 'Quick pick guide.',
          headers: ['Algorithm', 'Best for', 'Watch out'],
          rows: [
            ['Round Robin', 'Homogeneous servers', 'Ignores load'],
            ['Weighted RR', 'Mixed capacity / canary', 'Weights must match reality'],
            ['Least Connections', 'Uneven request duration', 'Needs accurate counts'],
            ['Least Response Time', 'Latency-sensitive pools', 'Needs good metrics'],
            ['IP Hash', 'Simple stickiness', 'NAT skew; remaps on N change'],
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Sticky sessions trade-offs',
          body: 'Cookie or IP stickiness simplifies in-memory sessions but **hurts scale-out and draining**. Prefer **external session store** (Redis) and **stateless apps**. Use stickiness only when you must (WebSocket affinity, legacy apps).',
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Source',
          body: 'Algorithm diagrams and walkthroughs summarized from Ashish Pratap Singh’s AlgoMaster article “Load Balancing Algorithms Explained with Code (and Visuals),” with Java sketches for this platform.',
        },
      ],
    },
    {
      id: 'health-and-draining',
      title: 'Health Checks and Connection Draining',
      blocks: [
        {
          type: 'markdown',
          value:
            'A balancer that ignores health is a **random outage distributor**. Health checks remove bad targets; **connection draining** (deregistration delay) finishes in-flight work before the instance dies.',
        },
        {
          type: 'table',
          headers: ['Mechanism', 'Purpose'],
          rows: [
            ['Liveness probe', 'Process alive? Restart if not (orchestrator)'],
            ['Readiness / target health', 'Ready for traffic? Balancer stops sending if not'],
            ['Deep health', 'Can reach DB / dependency? Use carefully — cascading fails'],
            ['Connection draining', 'Stop new requests; wait for active ones (e.g. 30–300s)'],
            ['Outlier detection', 'Eject hosts with high error rate (Envoy) without full redeploy'],
          ],
        },
        {
          type: 'mermaid',
          caption: 'Deploy with drain before terminate.',
          definition: `sequenceDiagram
  participant O as Orchestrator
  participant LB as Load balancer
  participant P as Pod
  O->>LB: Mark draining / deregister
  LB-->>P: No new connections
  P->>P: Finish in-flight requests
  O->>P: SIGTERM / terminate
  O->>LB: Register new healthy pod`,
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Health check design',
          body: 'Keep readiness **cheap and local** (process up, listens on port). Avoid calling downstreams in every probe or a DB blip marks *all* pods unhealthy and you take the whole fleet offline.',
        },
      ],
    },
    {
      id: 'hardware-vs-software',
      title: 'Hardware vs Software Balancers',
      blocks: [
        {
          type: 'markdown',
          value:
            'Classic **hardware appliances** (F5, Citrix) still exist in enterprises. Most cloud-native systems use **software**: reverse proxies and managed LBs.',
        },
        {
          type: 'table',
          caption: 'Common software / cloud options.',
          headers: ['Product', 'Typical role'],
          rows: [
            ['Nginx / HAProxy', 'L4/L7 reverse proxy; TLS termination; simple RR/least-conn'],
            ['Envoy', 'L7 proxy; filters; gRPC; mesh data plane; advanced retries'],
            ['AWS ALB', 'Managed L7; path/host rules; target groups; WAF integration'],
            ['AWS NLB', 'Managed L4; millions of connections; static IPs; TCP/UDP'],
            ['GCE / Azure LB', 'Cloud L4/L7 analogues with regional/global options'],
          ],
        },
        {
          type: 'prosCons',
          title: 'Software / cloud LB trade-offs',
          pros: [
            'Elastic capacity; no rack appliances to refresh.',
            'Config-as-code; integrates with K8s Ingress / Gateway API.',
            'Rich L7 features (retries, header routing, observability).',
          ],
          cons: [
            'You own tuning, timeouts, and certificate lifecycle (unless fully managed).',
            'Misconfigured health checks cause flapping.',
            'Single poorly sized LB tier can itself become the bottleneck.',
          ],
        },
      ],
    },
    {
      id: 'vs-gateway-mesh',
      title: 'vs API Gateway and Service Mesh',
      blocks: [
        {
          type: 'markdown',
          value:
            'These layers overlap on “routing traffic” but solve different problems. Saying “just put a load balancer” when the interviewer means edge auth or mesh mTLS is a common miss.',
        },
        {
          type: 'table',
          caption: 'Cross-link: Load balancer vs API Gateway vs Service Mesh.',
          headers: ['Concern', 'Load balancer', 'API Gateway', 'Service mesh'],
          rows: [
            [
              'Primary job',
              'Distribute load across instances',
              'North-south edge: auth, rate limit, aggregate',
              'East-west policy: mTLS, retries, telemetry',
            ],
            [
              'Traffic',
              'Any TCP/HTTP pool',
              'External clients → services',
              'Service ↔ service inside cluster',
            ],
            [
              'Awareness',
              'Targets + health',
              'APIs, tenants, quotas',
              'Service identity, mesh config',
            ],
            ['See also', 'This page', 'API Gateway', 'Service Mesh / Sidecar / Ambassador'],
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Typical composition',
          body: 'Internet → **CDN** → **API Gateway / L7 LB** → services. Inside the cluster, **kube-proxy / NLB / mesh** load-balances pod-to-pod. You often have *both* an edge balancer and internal balancing — they are not alternatives.',
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
              question: 'L4 vs L7 load balancing — when do you choose each?',
              answer:
                '**L4** for raw TCP/UDP, max throughput, or when you must not terminate TLS at the LB. **L7** when you need path/host routing, header-based canaries, or HTTP retries. Many designs use L4 at the edge VIP and L7 closer to apps.',
            },
            {
              question: 'Round-robin vs least connections?',
              answer:
                '**RR** assumes similar request cost and capacity. **Least connections** adapts when some requests are long-lived (uploads, WebSockets) so busy hosts get fewer new connections.',
            },
            {
              question: 'How does consistent hashing help load balancing?',
              answer:
                'Hashing a key (user id, cache key) onto a ring keeps most mappings stable when nodes join/leave — ideal for **cache affinity** and **shard stickiness**. Use **virtual nodes** to reduce imbalance.',
            },
            {
              question: 'What are sticky sessions and why avoid them?',
              answer:
                'Affinity pins a client to one backend (cookie/IP hash). They break **even load**, complicate **deploys/draining**, and fail behind **NAT**. Prefer shared session storage and sticky-free apps.',
            },
            {
              question: 'Explain connection draining.',
              answer:
                'Before terminating an instance, **stop sending new traffic** and wait for in-flight requests to finish (or timeout). Prevents 502s during rolling deploys.',
            },
            {
              question: 'ALB vs NLB on AWS?',
              answer:
                '**ALB**: L7 HTTP/HTTPS, path rules, target groups. **NLB**: L4, ultra-low latency, static IPs, TCP/UDP/TLS passthrough — better for extreme connection counts or non-HTTP protocols.',
            },
            {
              question: 'How do health checks interact with cascading failure?',
              answer:
                'If every readiness probe depends on a shared DB, a DB blip marks all backends unhealthy and the LB has nowhere to send traffic. Keep probes local; use separate **deep checks** for alerting, not traffic removal.',
            },
            {
              question: 'Load balancer vs API Gateway vs service mesh?',
              answer:
                '**LB** spreads load. **API Gateway** adds edge concerns (auth, throttling, BFF aggregation). **Mesh** applies uniform **east-west** security and resilience without app code. They stack; they do not replace each other one-for-one.',
            },
            {
              question: 'How would you load-balance gRPC?',
              answer:
                'Prefer L7 proxies that understand HTTP/2 (Envoy, modern ALB). Client-side load balancing with a resolver is common in gRPC ecosystems. Avoid naive L4 RR that pins all streams of one long-lived connection to one backend forever without careful connection management.',
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
          body: '1. **L4** = speed and protocols; **L7** = smart HTTP routing.\n2. Algorithms: **RR, weighted RR, least connections, consistent hashing, IP hash** — justify the pick.\n3. **Health checks + draining** make deploys safe; sticky sessions are a last resort.\n4. Software (Nginx, Envoy, ALB/NLB) dominates; compose with **API Gateway** and **mesh**, do not confuse them.',
        },
      ],
    },
  ],
};

export default content;
