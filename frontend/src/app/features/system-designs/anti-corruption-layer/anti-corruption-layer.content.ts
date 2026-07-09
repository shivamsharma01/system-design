import { DesignContent } from '../../../shared/models';
import { ANTI_CORRUPTION_LAYER_META } from './anti-corruption-layer.meta';

const content: DesignContent = {
  meta: ANTI_CORRUPTION_LAYER_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'The **Anti-Corruption Layer (ACL)** is a **translation boundary** between your **domain model** and a **legacy or external system** whose concepts do not fit your design. The ACL converts foreign data structures, protocols, and semantics into your ubiquitous language — preventing “corruption” of your clean architecture by outside quirks.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'DDD context',
          body: 'From **Domain-Driven Design**: when integrating a **bounded context** with an external or legacy context, the ACL isolates translation in one place instead of scattering `if (legacyFormat)` across domain code.',
        },
        {
          type: 'table',
          caption: 'ACL vs related patterns.',
          headers: ['Pattern', 'Focus'],
          rows: [
            ['Anti-Corruption Layer', 'Semantic translation — protect domain model purity'],
            ['Adapter', 'Interface compatibility — make X look like Y'],
            ['Facade', 'Simplify a complex subsystem API surface'],
            ['Strangler Fig', 'Gradually replace legacy — ACL often sits at the boundary'],
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
          body: 'A **UN interpreter** at a treaty negotiation: each delegate speaks their own language and worldview. The interpreter (**ACL**) converts statements both ways without either side adopting the other’s legal vocabulary or cultural assumptions.',
        },
        {
          type: 'mermaid',
          caption: 'ACL shields the domain from legacy model leakage.',
          definition: `flowchart LR
  DOM["Order domain\\nOrder, LineItem, Money"]
  ACL["Anti-Corruption Layer\\ntranslators + adapters"]
  LEG["Legacy mainframe\\nORD_HDR, ORD_LN, AMT_CENTS"]

  DOM <-->|clean types| ACL
  ACL <-->|legacy schema| LEG

  subgraph protected["Protected bounded context"]
    DOM
  end`,
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
            ['E-commerce checkout', 'ACL maps modern `Cart` aggregate to 1990s COBOL order segments for fulfillment bridge'],
            ['Food delivery', 'ACL translates third-party restaurant POS menu format into internal `MenuItem` domain entities'],
            ['Payments', 'ACL converts processor webhook payloads (mixed cents/strings) into typed `PaymentSettled` domain events'],
            ['Netflix-style microservices', 'ACL at subscription boundary converts billing partner XML into internal gRPC contracts'],
            ['Legacy modernization', 'New order microservice uses ACL to read/write legacy DB until strangler retires the monolith schema'],
            ['Third-party SaaS', 'CRM sync ACL maps Salesforce custom objects to internal `CustomerProfile` — no Salesforce fields in domain'],
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
            'Place ACL in the **infrastructure layer** (or a dedicated `integration` module). Implement **translators** that map DTOs ↔ domain objects. Never let legacy field names (`ORD_STAT_CD`) appear in domain entities. Version the ACL when the external system changes — domain stays stable.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'LegacyOrderAntiCorruptionLayer.java',
          code: `// Domain — clean ubiquitous language
public record Order(OrderId id, List<LineItem> items, Money total, OrderStatus status) {}

// Legacy DTO — quarantined outside domain package
public record LegacyOrderHeader(String ordId, int amtCents, String statCd) {}

public class LegacyOrderTranslator {
  public Order toDomain(LegacyOrderHeader header, List<LegacyLineRow> lines) {
    return new Order(
        new OrderId(header.ordId()),
        lines.stream().map(this::toLineItem).toList(),
        Money.ofCents(header.amtCents(), Currency.USD),
        mapStatus(header.statCd())  // "A" -> CONFIRMED, not raw codes in domain
    );
  }

  public LegacyOrderHeader toLegacy(Order order) {
    return new LegacyOrderHeader(
        order.id().value(),
        order.total().toCents(),
        reverseStatus(order.status())
    );
  }

  private OrderStatus mapStatus(String statCd) {
    return switch (statCd) {
      case "A" -> OrderStatus.CONFIRMED;
      case "P" -> OrderStatus.PENDING;
      default -> throw new UnknownLegacyStatusException(statCd);
    };
  }
}`,
        },
        {
          type: 'code',
          language: 'yaml',
          filename: 'acl-module-structure.yaml',
          code: `# Suggested module layout (Gradle/Maven multi-module)
modules:
  - order-domain          # pure domain — no legacy imports
  - order-application     # use cases
  - order-infrastructure  # repositories
  - legacy-acl            # translators, legacy HTTP/DB clients
    depends_on:
      - order-domain
    forbidden_imports:
      - order-domain must NOT import legacy-acl

# ArchUnit test enforces boundary
rule: "domain.. should not depend on legacy.."`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'ACL is not a dumping ground',
          body: 'Resist putting **business rules** in the ACL — only **translation and protocol**. If you encode discount logic while mapping legacy fields, you have smuggled domain logic into the wrong layer.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Domain model stays clean and testable without legacy pollution.',
            'External changes are localized to one translation module.',
            'Teams can evolve new services while legacy contract remains frozen.',
          ],
          cons: [
            'Extra mapping code and maintenance when either side changes.',
            'Risk of **anemic ACL** that grows into a second monolith.',
            'Performance cost of transform on every cross-boundary call.',
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
              question: 'What is an Anti-Corruption Layer?',
              answer:
                'A **translation boundary** that converts between your **domain model** and an external/legacy model, preventing foreign concepts from leaking into your codebase.',
            },
            {
              question: 'ACL vs Adapter pattern?',
              answer:
                '**Adapter** makes one interface work with another. **ACL** is broader — **semantic translation** across bounded contexts, often bidirectional, with explicit protection of domain purity. ACL often uses adapters internally.',
            },
            {
              question: 'Where does ACL sit in layered architecture?',
              answer:
                'Typically **infrastructure/integration** layer at the system edge. Domain and application layers depend on **interfaces**; ACL implements those interfaces and talks to legacy.',
            },
            {
              question: 'How does ACL relate to Strangler Fig?',
              answer:
                'During **strangler migration**, the ACL wraps legacy so new services use clean models. As routes move to new implementations, the ACL shrinks until legacy is retired.',
            },
            {
              question: 'What goes wrong without an ACL?',
              answer:
                'Legacy field names, status codes, and quirks spread through the codebase. **Ubiquitous language** breaks; tests need legacy fixtures everywhere; refactors become risky.',
            },
            {
              question: 'Design ACL for a new payments service integrating a 20-year-old mainframe.',
              answer:
                'Define `Payment` domain events internally. Build **LegacyPaymentTranslator** + **mainframe client** in `legacy-acl` module. ArchUnit forbids domain imports of legacy types. All mainframe quirks (EBCDIC, packed decimals) stay in ACL.',
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
          body: '1. ACL = **translation boundary** protecting your domain from legacy/external models.\n2. From **DDD** — use at **bounded context** integration points.\n3. Real uses: **legacy mainframe bridges, SaaS sync, strangler migrations**.\n4. Keep **business logic in domain**; ACL only translates.',
        },
      ],
    },
  ],
};

export default content;
