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
          body: 'The gateway faces **north-south** traffic (clients → system). A service mesh handles **east-west** traffic (service → service). Many platforms use both: gateway at the perimeter, mesh inside the cluster.',
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
            ['E-commerce checkout', 'Single `/checkout` aggregates cart, tax, inventory, and payment authorization'],
            ['Food delivery', 'Gateway routes order placement, rider tracking, and restaurant menus per region'],
            ['Payments', 'PCI scope reduction — only the gateway tier handles card tokens at the edge'],
            ['Netflix-style microservices', 'Zuul / Envoy edge proxy with auth and routing to hundreds of services'],
            ['Kong / AWS API Gateway', 'Managed plugins for OAuth, WAF, and usage plans per API key'],
            ['Spring Cloud Gateway', 'Reactive filters for JWT, circuit breaking, and path predicates in JVM stacks'],
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
      id: 'interview-questions',
      title: 'Interview Questions',
      blocks: [
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
          body: '1. API Gateway is the **edge front door** for routing, auth, and throttling.\n2. Real uses: **checkout aggregation, payment edge, Kong/AWS/Spring Cloud Gateway**.\n3. Keep it **thin** — pair with BFFs for client-specific APIs.\n4. HA, timeouts, and circuit breakers prevent the edge from amplifying outages.',
        },
      ],
    },
  ],
};

export default content;
