import { DesignContent } from '../../../shared/models';
import { BACKEND_FOR_FRONTEND_META } from './backend-for-frontend.meta';

const content: DesignContent = {
  meta: BACKEND_FOR_FRONTEND_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'The **Backend for Frontend (BFF)** pattern gives each client type — web, mobile, smart TV — its own **tailored backend** that aggregates and shapes microservice APIs for that UX. Instead of forcing every client to consume a generic API, the BFF optimizes payloads, call patterns, and error handling per surface.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'BFF vs API Gateway',
          body: '**Gateway**: cross-cutting edge policies (auth, rate limits, routing) shared by all clients. **BFF**: **client-specific** orchestration and DTO shaping. Typical flow: Client → Gateway → BFF → microservices.',
        },
        {
          type: 'table',
          caption: 'Why separate BFFs exist.',
          headers: ['Client', 'BFF optimization'],
          rows: [
            ['Mobile', 'Smaller JSON, fewer round trips, offline-friendly summaries'],
            ['Web', 'Richer product pages with parallel aggregation'],
            ['Partner API', 'Stable contract versioned separately from consumer apps'],
            ['Admin console', 'Heavy joins and bulk operations not exposed to public APIs'],
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
          body: 'A **personal shopper** per customer type: one prepares a compact bag for someone on a bike (mobile), another lays out a full fitting-room experience in-store (web). The warehouse (microservices) is the same — the presentation layer differs.',
        },
        {
          type: 'mermaid',
          caption: 'Each client type talks to its own BFF, not directly to every microservice.',
          definition: `flowchart TB
  Web[Web Browser] --> WebBFF[Web BFF]
  Mobile[Mobile App] --> MobileBFF[Mobile BFF]
  TV[Smart TV] --> TvBFF[TV BFF]
  WebBFF --> Catalog[Catalog Service]
  WebBFF --> Recs[Recommendations]
  MobileBFF --> Catalog
  MobileBFF --> Account[Account Service]
  TvBFF --> Catalog
  TvBFF --> Playback[Playback Service]`,
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
            ['E-commerce checkout', 'Web BFF aggregates cart + shipping options; mobile BFF returns a minimal 3-field summary'],
            ['Food delivery', 'Rider app BFF batches order, map, and ETA; restaurant tablet BFF exposes kitchen ticket layout'],
            ['Payments', 'Merchant dashboard BFF joins settlements and disputes; consumer wallet app BFF hides internal ledger IDs'],
            ['Netflix-style microservices', 'Per-device BFFs (iOS, Android, TV) shaping browse rows and playback metadata'],
            ['GraphQL BFF', 'Single GraphQL layer per client team with resolvers fanning out to REST microservices'],
            ['SoundCloud / Spotify-style', 'Team-owned BFF repos aligned to frontend squads (colocated evolution)'],
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
            'Assign **ownership** to the client team (or a paired full-stack squad). The BFF should only contain **orchestration and presentation logic** — no shared database. Version BFFs with their clients; never break mobile v2 because web v3 changed.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'MobileCheckoutBffController.java',
          code: `@RestController
@RequestMapping("/mobile/v1/checkout")
public class MobileCheckoutBffController {
  private final OrderClient orders;
  private final PaymentClient payments;
  private final DeliveryClient delivery;

  @GetMapping("/summary")
  public MobileCheckoutSummary summary(@RequestHeader("X-User-Id") String userId) {
    Cart cart = orders.getActiveCart(userId);
    DeliverySlot slot = delivery.nextAvailableSlot(cart.getAddressId());
    Money total = payments.estimateTotal(cart.getId());
    // Mobile-optimized: 4 fields instead of full cart graph
    return new MobileCheckoutSummary(
        cart.getItemCount(),
        total,
        slot.getEtaMinutes(),
        cart.isReadyToPay()
    );
  }
}`,
        },
        {
          type: 'code',
          language: 'yaml',
          filename: 'bff-deployment.yaml',
          code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: mobile-bff
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: mobile-bff
          image: platform/mobile-bff:2.4.1
          env:
            - name: ORDER_SERVICE_URL
              value: http://order-service.internal
            - name: PAYMENT_SERVICE_URL
              value: http://payment-service.internal
          resources:
            limits:
              cpu: "500m"
              memory: "512Mi"`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Anti-pattern: one BFF for everything',
          body: 'A single “universal BFF” regresses into a **distributed monolith** with `if (mobile)` branches everywhere. Split by client or by bounded context.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'APIs optimized per client UX and network constraints.',
            'Client teams can ship without coordinating every microservice change.',
            'Isolates breaking changes to one client surface.',
          ],
          cons: [
            'Duplicated orchestration logic across BFFs.',
            'More deployables to operate and monitor.',
            'Risk of business logic creeping into BFFs.',
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
              question: 'What is a BFF and why not call microservices directly?',
              answer:
                'A **client-specific backend** that aggregates microservices into the shape that client needs. Avoids chatty mobile apps, oversized payloads, and coupling every client to internal service topology.',
            },
            {
              question: 'BFF vs API Gateway?',
              answer:
                '**Gateway** = shared edge (auth, rate limit, routing). **BFF** = per-client API design and aggregation. Gateway is horizontal; BFF is vertical per UX.',
            },
            {
              question: 'Should the BFF have its own database?',
              answer:
                'Usually **no** — it is an orchestration tier. Exception: ephemeral cache or read models owned by the client squad, but avoid duplicating domain state.',
            },
            {
              question: 'How do you handle duplicate logic across web and mobile BFFs?',
              answer:
                'Extract shared **domain clients/libraries** for HTTP/gRPC calls; keep DTO shaping in each BFF. Or introduce a shared “experience service” only when duplication hurts consistency.',
            },
            {
              question: 'GraphQL as a BFF?',
              answer:
                'Common pattern: GraphQL server acts as BFF with resolvers calling microservices. Gives clients flexible queries while backend controls fan-out and auth.',
            },
            {
              question: 'Who owns the BFF in a food-delivery system?',
              answer:
                'Ideally the **client team** (rider app squad owns rider BFF). They evolve API and UI together without waiting on every backend service release.',
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
          body: '1. **One BFF per client type** — tailor APIs to web, mobile, or TV.\n2. Real uses: **checkout summaries, rider apps, Netflix device teams**.\n3. Pair with an **API gateway** for shared edge policies.\n4. Keep BFFs thin orchestrators — domain logic stays in microservices.',
        },
      ],
    },
  ],
};

export default content;
