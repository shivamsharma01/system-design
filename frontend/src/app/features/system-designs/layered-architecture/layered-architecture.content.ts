import { DesignContent } from '../../../shared/models';
import { LAYERED_ARCHITECTURE_META } from './layered-architecture.meta';

const content: DesignContent = {
  meta: LAYERED_ARCHITECTURE_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Layered (n-tier) Architecture** organizes code into horizontal layers — typically **presentation**, **application/domain**, and **infrastructure/data** — where dependencies point **inward/downward**. Upper layers call lower ones; lower layers must not depend on UI details.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Default enterprise shape',
          body: 'Most Spring Boot apps start layered: `controller` → `service` → `repository`. Interviews expect you to know the dependency rule and when to move to hexagonal/modular designs.',
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
          body: 'A **company org chart**: front desk (presentation) talks to specialists (domain), who use filing systems (data). The filing clerk should not decide marketing copy — dependencies flow one way.',
        },
        {
          type: 'mermaid',
          caption: 'Classic three layers.',
          definition: `flowchart TB
  P[Presentation - Controllers/UI]
  A[Application / Domain Services]
  D[Data / Infrastructure]
  P --> A --> D`,
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
            ['Monoliths', 'Spring Boot modular packages by layer'],
            ['Enterprise Java', 'Java EE / Jakarta layered apps'],
            ['.NET', 'Traditional N-tier solutions'],
            ['CRUD systems', 'Admin tools and internal line-of-business apps'],
            ['Interview LLDs', 'Standard package structure on a whiteboard'],
          ],
        },
      ],
    },
    {
      id: 'implementation',
      title: 'Implementation',
      blocks: [
        {
          type: 'code',
          language: 'java',
          filename: 'LayerSketch.java',
          code: `// presentation
@RestController
class PaymentController {
  private final PaymentService payments;
  PaymentController(PaymentService payments) { this.payments = payments; }

  @PostMapping("/payments")
  PaymentResponse pay(@RequestBody PaymentRequest req) {
    return PaymentResponse.from(payments.charge(req));
  }
}

// application / domain
class PaymentService {
  private final PaymentRepository repo;
  private final GatewayClient gateway;
  PaymentService(PaymentRepository repo, GatewayClient gateway) {
    this.repo = repo;
    this.gateway = gateway;
  }

  Payment charge(PaymentRequest req) {
    Payment p = Payment.create(req);
    gateway.charge(p);
    return repo.save(p);
  }
}

// data
interface PaymentRepository {
  Payment save(Payment payment);
}`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Layering traps',
          body: 'Anemic “pass-through” services, circular dependencies, and dumping all logic into one service layer. Also: skipping the domain layer so controllers talk straight to repositories.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Simple mental model; easy to teach and navigate.',
            'Enforces a basic dependency direction.',
            'Fits CRUD and modest domain complexity well.',
          ],
          cons: [
            'Can become rigid “layer cake” with low cohesion.',
            'Cross-cutting features touch every layer.',
            'Domain can get anemic; consider hexagonal for richer domains.',
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
              question: 'What is layered architecture?',
              answer:
                'Organizing the system into stacked layers (UI, business, data) where **upper layers depend on lower ones**, not the reverse.',
            },
            {
              question: 'What is the dependency rule?',
              answer:
                'Source-code dependencies point **inward/downward** toward more stable policies. Infrastructure details should not leak into domain types.',
            },
            {
              question: 'Layered vs Hexagonal?',
              answer:
                'Layered is horizontal slices. Hexagonal puts the **domain at the center** with ports/adapters for UI, DB, and messaging — better isolation of the core.',
            },
            {
              question: 'Is service → repository → DB enough?',
              answer:
                'For simple CRUD, yes. For complex business rules, keep a real domain model and avoid making services a thin wrapper with no invariants.',
            },
            {
              question: 'How do you show this in an LLD?',
              answer:
                'Draw three boxes, list key classes per layer, and state “controllers depend on services; services depend on repository interfaces.”',
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
          body: '1. Layers: **presentation → domain → data**.\n2. Dependencies point **downward**.\n3. Default for **Spring-style monoliths**.\n4. Know when to evolve toward **hexagonal / modular** designs.',
        },
      ],
    },
  ],
};

export default content;
