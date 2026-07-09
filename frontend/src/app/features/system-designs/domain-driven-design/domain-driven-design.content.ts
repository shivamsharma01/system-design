import { DesignContent } from '../../../shared/models';
import { DOMAIN_DRIVEN_DESIGN_META } from './domain-driven-design.meta';

const content: DesignContent = {
  meta: DOMAIN_DRIVEN_DESIGN_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Domain-Driven Design (DDD)** is an approach to modeling complex business software. This page focuses on the **building blocks** interviewers expect: **entities**, **value objects**, **aggregates**, **repositories**, **domain services**, and **bounded contexts** — tied together by a **ubiquitous language** shared with domain experts.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Not only patterns',
          body: 'DDD is strategic (bounded contexts, context maps) and tactical (aggregates, VOs). Use tactical patterns where the domain is complex — not for every CRUD screen.',
        },
        {
          type: 'table',
          caption: 'Tactical building blocks.',
          headers: ['Building block', 'One-line idea'],
          rows: [
            ['Entity', 'Identity that persists over time (`OrderId`)'],
            ['Value Object', 'Defined by attributes; immutable (`Money`)'],
            ['Aggregate', 'Cluster of entities/VOs with a root and invariants'],
            ['Repository', 'Collection-like access to aggregate roots'],
            ['Domain Service', 'Domain operation that does not fit one entity'],
            ['Bounded Context', 'Explicit model boundary with its own language'],
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
          body: 'A **hospital**: “Patient,” “Bed,” and “Prescription” mean precise things to clinicians (ubiquitous language). The ER and the billing department may both say “account,” but they mean different models — separate **bounded contexts**.',
        },
        {
          type: 'mermaid',
          caption: 'Order aggregate (simplified).',
          definition: `flowchart TB
  Root[Order - Aggregate Root]
  Root --> Lines[OrderLine VOs/Entities]
  Root --> Money[Money VO]
  Root --> Status[OrderStatus VO]`,
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
            ['E-commerce', 'Order, Cart, Inventory bounded contexts'],
            ['FinTech', 'Account, Ledger entries as strict aggregates'],
            ['Insurance / healthcare', 'Policies, claims with heavy invariants'],
            ['Microservices', 'One service ≈ one bounded context'],
            ['Monolith modularization', 'Package-by-context inside a modular monolith'],
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
          value: 'Food-delivery **Order** aggregate sketch — invariants live on the root:',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'OrderAggregate.java',
          code: `public record Money(long cents, String currency) {
  public Money {
    if (cents < 0) throw new IllegalArgumentException("negative");
  }
  public Money add(Money other) {
    if (!currency.equals(other.currency)) throw new IllegalArgumentException();
    return new Money(cents + other.cents, currency);
  }
}

public class Order {
  private final OrderId id;
  private final List<OrderLine> lines = new ArrayList<>();
  private OrderStatus status = OrderStatus.OPEN;

  public static Order create(OrderId id) {
    return new Order(id);
  }

  private Order(OrderId id) { this.id = id; }

  public void addItem(Sku sku, int qty, Money unitPrice) {
    ensureOpen();
    if (qty <= 0) throw new IllegalArgumentException("qty");
    lines.add(new OrderLine(sku, qty, unitPrice));
  }

  public void cancel() {
    ensureOpen();
    status = OrderStatus.CANCELLED;
  }

  public Money total() {
    return lines.stream()
        .map(OrderLine::lineTotal)
        .reduce(new Money(0, "INR"), Money::add);
  }

  private void ensureOpen() {
    if (status != OrderStatus.OPEN) {
      throw new IllegalStateException("order not open");
    }
  }
}

// Persist only via OrderRepository — do not update OrderLine rows ad hoc.`,
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Bounded context example',
          body: 'In **Catalog**, `Product` has nutrition and photos. In **Inventory**, `Product` is a SKU with stock levels. Do not force one global `Product` class — split contexts and translate at boundaries (anti-corruption layer).',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Models real business rules and language.',
            'Clear consistency boundaries via aggregates.',
            'Guides microservice / modular cuts (bounded contexts).',
          ],
          cons: [
            'Overhead for simple CRUD systems.',
            'Easy to over-engineer aggregates and events.',
            'Requires collaboration with domain experts — not only coders.',
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
              question: 'Entity vs Value Object?',
              answer:
                '**Entity**: has identity (`Order` #123 remains the same order as it changes). **Value Object**: defined by values (`Money(500, "INR")`); replace instead of mutate; equality by attributes.',
            },
            {
              question: 'What is an Aggregate?',
              answer:
                'A cluster of domain objects treated as **one consistency boundary**, with an **aggregate root** as the only entry point. Invariants are enforced on the root; external objects reference the root by id.',
            },
            {
              question: 'Why one repository per aggregate root?',
              answer:
                'So you load/save the whole consistency boundary together and do not bypass invariants by updating child rows directly.',
            },
            {
              question: 'What is a Bounded Context?',
              answer:
                'A boundary within which a particular model and ubiquitous language are valid. “Customer” in Billing may differ from “Customer” in Support.',
            },
            {
              question: 'When should you apply DDD?',
              answer:
                'When business rules are complex and change often. Skip heavy DDD for straightforward CRUD admin tools.',
            },
            {
              question: 'How does DDD relate to microservices?',
              answer:
                'Bounded contexts are a primary guide for service boundaries. A service that spans two languages/models often becomes a distributed monolith.',
            },
            {
              question: 'LLD example for food delivery?',
              answer:
                '`Order` aggregate with lines and status transitions; `Money` as VO; `OrderRepository`; separate Catalog vs Delivery contexts so restaurant menus and rider assignment do not share one tangled model.',
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
          body: '1. DDD building blocks: **Entity, VO, Aggregate, Repository, Domain Service, Bounded Context**.\n2. Speak the **ubiquitous language** of the domain.\n3. Real uses: **complex business domains and service boundaries**.\n4. Do not force full DDD onto simple CRUD.',
        },
      ],
    },
  ],
};

export default content;
