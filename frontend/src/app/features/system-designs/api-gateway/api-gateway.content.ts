import { DesignContent } from '../../../shared/models';
import { API_GATEWAY_META } from './api-gateway.meta';

const content: DesignContent = {
  meta: API_GATEWAY_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'The **API Gateway** is a single **edge entry point** for client traffic into a microservices mesh. It handles **routing**, **authentication**, **rate limiting**, **TLS termination**, and often **request/response aggregation** — so backends stay focused on domain logic instead of cross-cutting edge concerns.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Edge vs service mesh',
          body: 'The gateway faces **north-south** traffic (clients → system). A service mesh handles **east-west** traffic (service → service). Many platforms use both: gateway at the perimeter, mesh inside the cluster. Edge JWT validation is covered in depth on [JWT](/designs/jwt); coarse edge quotas on [Rate Limiter](/designs/rate-limiter).',
        },
        {
          type: 'table',
          caption: 'Typical gateway responsibilities.',
          headers: ['Concern', 'Gateway role'],
          rows: [
            ['Routing', 'Path `/orders/*` → order-service, `/payments/*` → payment-service'],
            ['Auth', 'Validate JWT/API key before traffic reaches backends'],
            ['Rate limiting', 'Per-tenant or per-IP throttling at the edge'],
            ['Aggregation', 'One checkout call fans out to cart, inventory, pricing'],
            ['Observability', 'Central request IDs, access logs, metrics'],
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
          body: 'A **hotel concierge**: guests do not wander into the kitchen, laundry, and accounting. They speak to one desk that checks ID (auth), enforces visiting hours (rate limits), and coordinates multiple departments (aggregation) for a single request.',
        },
        {
          type: 'mermaid',
          caption: 'Clients hit the gateway; it routes and protects downstream services.',
          definition: `flowchart LR
  Web[Web App] --> GW[API Gateway]
  Mobile[Mobile App] --> GW
  GW -->|JWT valid| Auth[Auth check]
  GW -->|throttle| RL[Rate limiter]
  GW --> Order[Order Service]
  GW --> Pay[Payment Service]
  GW --> Inv[Inventory Service]`,
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
            [
              'E-commerce checkout',
              'Single `/checkout` aggregates cart, tax, inventory, and payment authorization',
            ],
            [
              'Food delivery',
              'Gateway routes order placement, rider tracking, and restaurant menus per region',
            ],
            [
              'Payments',
              'PCI scope reduction — only the gateway tier handles card tokens at the edge',
            ],
            [
              'Netflix-style microservices',
              'Zuul / Envoy edge proxy with auth and routing to hundreds of services',
            ],
            [
              'Kong / AWS API Gateway',
              'Managed plugins for OAuth, WAF, and usage plans per API key',
            ],
            [
              'Spring Cloud Gateway',
              'Reactive filters for JWT, circuit breaking, and path predicates in JVM stacks',
            ],
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
            'Keep gateways **stateless** where possible; push session state to tokens or Redis. Avoid heavy business logic — aggregation is fine, but domain rules belong in services. Use **timeouts and circuit breakers** on upstream calls so a slow inventory service does not block checkout.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'CheckoutAggregationFilter.java',
          code: `@Component
public class CheckoutAggregationFilter implements GatewayFilter {
  private final WebClient orderClient;
  private final WebClient inventoryClient;
  private final WebClient pricingClient;

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    if (!exchange.getRequest().getPath().value().equals("/api/checkout")) {
      return chain.filter(exchange);
    }
    String cartId = exchange.getRequest().getHeaders().getFirst("X-Cart-Id");
    return Mono.zip(
        orderClient.get().uri("/carts/{id}", cartId).retrieve().bodyToMono(Cart.class),
        inventoryClient.get().uri("/availability?cart={id}", cartId).retrieve().bodyToMono(Stock.class),
        pricingClient.post().uri("/quote").bodyValue(cartId).retrieve().bodyToMono(Quote.class)
      )
      .map(tuple -> new CheckoutView(tuple.getT1(), tuple.getT2(), tuple.getT3()))
      .flatMap(view -> writeJson(exchange, view))
      .onErrorResume(e -> writeError(exchange, 503, "CHECKOUT_UNAVAILABLE"));
  }
}`,
        },
        {
          type: 'code',
          language: 'yaml',
          filename: 'spring-cloud-gateway-routes.yaml',
          code: `spring:
  cloud:
    gateway:
      routes:
        - id: orders
          uri: lb://order-service
          predicates:
            - Path=/api/orders/**
          filters:
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 100
                redis-rate-limiter.burstCapacity: 200
            - JwtAuth=
        - id: payments
          uri: lb://payment-service
          predicates:
            - Path=/api/payments/**
          filters:
            - name: CircuitBreaker
              args:
                name: paymentCb
                fallbackUri: forward:/fallback/payments`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Gateway as a god object',
          body: 'When every new feature lands in the gateway, it becomes a **monolith at the edge**. Split client-specific shaping into **BFFs**; keep the gateway thin for cross-cutting policies only.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Single place for auth, TLS, and throttling.',
            'Hides internal topology from clients.',
            'Enables response aggregation and protocol translation.',
          ],
          cons: [
            'Can become a bottleneck or SPOF without HA.',
            'Extra network hop adds latency.',
            'Tempting to overload with business logic.',
          ],
        },
      ],
    },
    {
      id: 'why-api-gateway',
      title: 'Why an API Gateway?',
      blocks: [
        {
          type: 'markdown',
          value:
            'As applications grow into microservices—accounts, inventory, payments—clients would otherwise need every service URL and would re-implement auth, rate limits, and TLS on each path. An API Gateway sits between clients and backends as the **single entry point**: it routes, enforces policy, and forwards to the right service.',
        },
        {
          type: 'image',
          src: 'assets/article-images/api-gateway/01-without-api-gateway.png',
          alt: 'Client connecting directly to Accounts, Inventory, and Payments services without a gateway',
          caption:
            'Without a gateway: the client talks to every microservice and owns cross-cutting concerns. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'image',
          src: 'assets/article-images/api-gateway/02-with-api-gateway.png',
          alt: 'Client sending all requests through an API Gateway that routes to backend microservices',
          caption:
            'With a gateway: one place for routing, authentication, security, and operational policy. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
      ],
    },
    {
      id: 'core-features',
      title: 'Core features',
      blocks: [
        {
          type: 'image',
          src: 'assets/article-images/api-gateway/03-core-features.png',
          alt: 'API Gateway core features: authentication, rate limiting, load balancing, caching, transformation, service discovery, circuit breaking, monitoring',
          caption:
            'Typical gateway capabilities centered on one edge hop. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'markdown',
          value:
            '1. **Authentication and authorization** — verify JWT/OAuth/API keys/certificates; check permissions before traffic reaches services.\n2. **Rate limiting** — cap requests per user/IP/key (e.g. 100/min); return **429** when exceeded; blunt DoS and abuse.\n3. **Load balancing** — distribute to healthy instances (round-robin, least connections, weighted).\n4. **Caching** — store hot GET responses (catalogs, metadata) to cut latency and backend load.\n5. **Request/response transformation** — reshape payloads (XML→JSON, add headers, address→coordinates).\n6. **Service discovery** — resolve logical service names to current instances as they scale.\n7. **Circuit breaking** — stop calling persistently failing or slow upstreams; fail fast.\n8. **Logging and monitoring** — access logs, latency/error metrics; integrate Prometheus, Grafana, CloudWatch.',
        },
      ],
    },
    {
      id: 'request-lifecycle',
      title: 'Request lifecycle: Place Order',
      blocks: [
        {
          type: 'markdown',
          value:
            'Walk through a food-delivery “Place Order” call. The app never hits inventory or payment services directly—only the gateway.',
        },
        {
          type: 'markdown',
          value:
            '**1. Reception.** Client POSTs order payload (user, restaurant, items, address, payment method, auth token) to `/api/v1/orders`.\n\n**2. Validation.** Reject bad `Content-Type`, missing fields, or schema violations with **400** before any backend work.\n\n**3. Auth.** Extract Bearer JWT; verify signature and claims; ensure `place_orders` permission. Fail with **401**/**403**. See [JWT](/designs/jwt).\n\n**4. Rate limiting.** e.g. Redis counter ≤ 10 order attempts per user per minute; else **429**.\n\n**5. Transformation (optional).** Plain-text address → GPS coordinates for Delivery Service.\n\n**6. Routing.** Discover healthy Order / Inventory / Payment / Delivery instances; load-balance and forward.\n\n**7. Response handling.** Map internal fields to a client DTO; optionally cache.\n\n**8. Logging.** Record path, method, status, latency, userId for ops.',
        },
        {
          type: 'code',
          language: 'javascript',
          filename: 'gateway-pipeline-sketch.js',
          showLineNumbers: true,
          code: `// Illustrative edge pipeline (language-agnostic ideas)
app.post('/api/v1/orders', async (req, res) => {
  if (!req.headers['content-type']?.includes('application/json')) {
    return res.status(400).send('Invalid content type');
  }
  const token = req.headers.authorization?.split(' ')[1];
  const user = await verifyToken(token);
  if (!user?.permissions.includes('place_orders')) {
    return res.status(403).send('Forbidden');
  }
  const key = \`rate_limit:order:\${user.id}\`;
  const current = await redis.incr(key);
  if (current === 1) await redis.expire(key, 60);
  if (current > 10) return res.status(429).send('Too Many Requests');

  const body = await transformAddressToGps(req.body);
  const services = await serviceDiscovery.getServices('order');
  const target = selectServiceInstance(services);
  const upstream = await axios.post(\`\${target.url}/api/orders\`, body);
  return res.json({
    orderId: upstream.data.order_reference,
    estimatedDelivery: upstream.data.eta,
    status: upstream.data.current_status,
  });
});`,
        },
      ],
    },
    {
      id: 'java-spring-cloud-gateway',
      title: 'Java: Spring Cloud Gateway setup',
      blocks: [
        {
          type: 'markdown',
          value:
            'In a JVM stack, **Spring Cloud Gateway** (WebFlux/Netty) is the usual edge. Keep filters **non-blocking**. Prefer route YAML for path predicates and Redis rate limits; put JWT verification in a global `WebFilter` or gateway filter that validates against JWKS and strips spoofable identity headers before forwarding trusted ones (`X-User-Id`, `X-Roles`).',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'JwtAuthGlobalFilter.java',
          showLineNumbers: true,
          code: `@Component
@Order(-100)
public class JwtAuthGlobalFilter implements GlobalFilter {
  private final ReactiveJwtDecoder jwtDecoder;

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    String path = exchange.getRequest().getPath().value();
    if (path.startsWith("/public/")) {
      return chain.filter(exchange);
    }
    String auth = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
    if (auth == null || !auth.startsWith("Bearer ")) {
      exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
      return exchange.getResponse().setComplete();
    }
    String token = auth.substring(7);
    return jwtDecoder.decode(token)
        .flatMap(jwt -> {
          ServerHttpRequest mutated = exchange.getRequest().mutate()
              .headers(h -> {
                h.remove("X-User-Id");
                h.set("X-User-Id", jwt.getSubject());
              })
              .build();
          return chain.filter(exchange.mutate().request(mutated).build());
        })
        .onErrorResume(e -> {
          exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
          return exchange.getResponse().setComplete();
        });
  }
}`,
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Gateway vs BFF in Java',
          body: 'Put shared policies (JWT, coarse rate limits, TLS, WAF) on Spring Cloud Gateway. Put **client-specific aggregation** (mobile checkout DTO) in a BFF service. Do not grow `CheckoutAggregationFilter` until the edge owns the domain.',
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Source',
          body: 'Why/features/lifecycle diagrams and the Place Order walkthrough are summarized from Ashish Pratap Singh’s AlgoMaster article “What is an API Gateway?” and expanded with Spring Cloud Gateway notes for this platform.',
        },
      ],
    },
    {
      id: 'interview-questions',
      title: 'Interview Questions',
      blocks: [
        {
          type: 'sketchnote',
          title: 'API Gateway Interview Board',
          intro:
            'The gateway is the highly available policy-enforcement and routing layer for north-south traffic—not the home of domain logic.',
          items: [
            {
              code: 'GW-1',
              glyph: '🚪',
              title: 'What and why?',
              subtitle: 'One controlled front door',
              points: [
                'Hides internal service topology from clients',
                'Centralizes routing, TLS, auth, quotas, and edge observability',
                'Reduces duplicated cross-cutting code in every service',
              ],
              tip: 'Useful, not mandatory: a small system may only need a reverse proxy/load balancer.',
            },
            {
              code: 'GW-2',
              glyph: '⇄',
              title: 'Gateway vs load balancer',
              subtitle: 'Layer-7 policy vs traffic distribution',
              points: [
                'Load balancer spreads traffic among equivalent instances',
                'Gateway routes different APIs/services and applies client policy',
                'Typical path: public LB → gateway replicas → service LB',
              ],
              tip: 'Products can combine both roles; explain responsibilities rather than brand names.',
            },
            {
              code: 'GW-3',
              glyph: '✓',
              title: 'Right responsibilities',
              subtitle: 'Keep the edge thin',
              points: [
                'Routing, auth validation, rate limits, WAF, CORS, TLS, logging',
                'Optional protocol translation and small response aggregation',
                'Business invariants and service authorization remain downstream',
              ],
              tip: 'Too much business logic creates a distributed monolith at the edge.',
            },
            {
              code: 'GW-4',
              glyph: '↪',
              title: 'Routing internals',
              subtitle: 'Predicate → filters → upstream',
              points: [
                'Match host, path, method, headers, version, or weighted rule',
                'Run ordered pre-filters, proxy request, then post-filters',
                'Resolve upstream through discovery and use timeout/circuit breaker',
              ],
              tip: 'Use normalized route definitions and version configuration as code.',
            },
            {
              code: 'GW-5',
              glyph: 'JWT',
              title: 'JWT authentication',
              subtitle: 'Reject invalid identity at the edge',
              points: [
                'Extract Bearer token; validate signature with cached JWKS',
                'Check iss, aud, exp/nbf, scopes, and key rotation',
                'Forward trusted identity context; services still authorize actions',
              ],
              tip: 'Strip spoofable identity headers before adding gateway-owned ones.',
            },
            {
              code: 'GW-6',
              glyph: '🛡',
              title: 'Security improvement',
              subtitle: 'Smaller exposed surface',
              points: [
                'WAF, request-size/schema limits, threat rules, bot/IP controls',
                'mTLS to services, secret isolation, access logs, and redaction',
                'Internal services stay private and accept traffic only from trusted paths',
              ],
              tip: 'The gateway is defense in depth—not a replacement for service-level security.',
            },
            {
              code: 'GW-7',
              glyph: '↓',
              title: 'Protect one service',
              subtitle: 'Limit before forwarding',
              points: [
                'Per-route/tenant rate limit and concurrency limit',
                'Circuit breaker, bounded queue, timeout, and load shedding',
                'Retry only idempotent calls with backoff, jitter, and a retry budget',
              ],
              tip: 'Blind gateway retries can amplify an overloaded service.',
            },
            {
              code: 'GW-8',
              glyph: 'HA',
              title: 'Gateway failure',
              subtitle: 'Treat the edge as critical infrastructure',
              points: [
                'Run stateless replicas across zones behind a load balancer',
                'Use health checks, autoscaling, config rollback, and graceful drain',
                'Degrade optional policies safely; monitor saturation and config errors',
              ],
              tip: 'A single gateway instance is a system-wide single point of failure.',
            },
            {
              code: 'GW-9',
              glyph: 'SCG',
              title: 'Spring Cloud Gateway',
              subtitle: 'Reactive route + filter pipeline',
              points: [
                'Route predicates select path/host/method and lb:// service URI',
                'Global/per-route filters implement JWT, headers, limits, and resilience',
                'WebFlux/Netty requires non-blocking filters and clients',
              ],
              tip: 'In interviews, describe what you measured/configured; never invent personal experience.',
            },
            {
              code: 'GW-10',
              glyph: 'DNS',
              title: 'Service discovery',
              subtitle: 'Logical service name → healthy endpoints',
              points: [
                'Eureka: gateway watches registry and load-balances lb://service-name',
                'Kubernetes: route through Service DNS or EndpointSlice-aware discovery',
                'Discovery handles endpoint churn; readiness prevents routing too early',
              ],
              tip: 'Cache discovery briefly, but remove unhealthy/stale endpoints quickly.',
            },
          ],
        },
        {
          type: 'interviewQa',
          items: [
            {
              question: 'What problems does an API gateway solve?',
              answer:
                '**Cross-cutting edge concerns**: routing to the right microservice, **JWT validation**, **rate limiting**, TLS, logging, and sometimes **aggregating** multiple backend calls into one client response.',
            },
            {
              question: 'API Gateway vs BFF — when do you use each?',
              answer:
                '**Gateway**: shared policies for all clients (auth, throttle, routing). **BFF**: **client-specific** API shapes (mobile needs fewer fields, TV needs richer payloads). Often gateway → BFF → services.',
            },
            {
              question: 'How do you prevent the gateway from becoming a bottleneck?',
              answer:
                'Run **multiple HA instances** behind a load balancer, keep logic stateless, use **async/reactive** I/O for aggregation, cache read-heavy paths, and enforce **timeouts** on upstream calls.',
            },
            {
              question: 'Where does rate limiting belong — gateway or service?',
              answer:
                '**Both layers**: gateway for coarse per-tenant/IP limits at the edge; services for fine-grained domain quotas (e.g. max refunds per hour). Defense in depth.',
            },
            {
              question: 'How does an API gateway help with PCI in payments?',
              answer:
                'Card data hits a **controlled edge tier**; internal microservices receive tokens only. Shrinks PCI scope and centralizes WAF, mTLS, and audit logging.',
            },
            {
              question: 'Gateway vs service mesh?',
              answer:
                'Gateway = **north-south** (external clients). Mesh = **east-west** (service-to-service mTLS, retries, outlier detection). Complementary, not interchangeable.',
            },
            {
              question: 'How should an API gateway handle WebSockets?',
              answer:
                'Terminate or **proxy the upgrade** (HTTP → WS), stick the connection to one gateway instance, and forward frames to the right backend (or a connection service). Keep auth on the handshake; avoid heavy per-frame business logic on the gateway — it should route and enforce policy, not own chat/state fan-out.',
            },
            {
              question:
                'An API Gateway returns 504 Gateway Timeout, but backend logs show successful responses. Where is the bottleneck?',
              answer:
                'A 504 means the gateway did not receive a usable upstream response before its deadline; backend “success” only proves the handler eventually completed. Align timestamps and one trace/request ID across client → CDN/LB → gateway → mesh/proxy → service. Compare gateway connect, TLS, response-header, idle/read, and total route timeouts with service duration. A request can finish milliseconds after the gateway has already closed the upstream connection.\n\nCheck queue time before the backend handler (gateway event-loop/thread saturation, upstream connection-pool acquisition, DNS/service discovery, retries, circuit-breaker queue), network/TLS latency, service-mesh sidecar timeout, response streaming/first-byte delay, and large/slow response transfer. Confirm clocks and that the logged success belongs to the same retry/attempt; a gateway retry may time out one attempt while another succeeds and wastes backend work.\n\nUse distributed spans for gateway queue/connect/TTFB/body phases, gateway upstream timing fields, pool metrics, packet/TCP resets when needed, and backend access-log response-write errors. Fix the actual queue/timeout mismatch and propagate one end-to-end deadline/cancellation signal; blindly increasing the gateway timeout can amplify resource exhaustion.',
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
          body: '1. API Gateway is the **edge front door** for routing, auth, and throttling.\n2. Core features: authz, rate limits, LB, cache, transform, discovery, circuit breakers, observability.\n3. Real uses: **checkout aggregation, payment edge, Kong/AWS/Spring Cloud Gateway**.\n4. Keep it **thin** — pair with BFFs for client-specific APIs; use reactive JWT filters in Java.\n5. HA, timeouts, and circuit breakers prevent the edge from amplifying outages.',
        },
      ],
    },
  ],
};

export default content;
