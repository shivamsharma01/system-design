import { DesignContent } from '../../../shared/models';
import { BUILDER_META } from './builder.meta';

/**
 * Builder — stepwise construction of complex objects (HTTP / meal / query).
 */
const content: DesignContent = {
  meta: BUILDER_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'The **Builder** pattern separates the **construction** of a complex object from its **representation**. You build step by step (often with a fluent API), then call `build()` to get an immutable (or validated) result.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Smell it replaces',
          body: '**Telescoping constructors** — `new Request(url, method, headers, body, timeout, retries, …)` — and long parameter lists with many optional fields.',
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
          body: 'Ordering a **custom burger**: choose bun, patty, cheese, extras, then “build” the meal. The cashier follows the same steps whether you want a simple burger or a loaded one — optional parts are skipped, required parts are validated at the end.',
        },
        {
          type: 'mermaid',
          caption: 'Director optional; client often drives the builder directly.',
          definition: `sequenceDiagram
  participant C as Client
  participant B as HttpRequest.Builder
  participant R as HttpRequest
  C->>B: url(...)
  C->>B: header(...)
  C->>B: timeout(...)
  C->>B: build()
  B->>R: new HttpRequest(validated fields)
  B-->>C: HttpRequest`,
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
            ['HTTP clients', 'OkHttp `Request.Builder`, Java `HttpRequest.newBuilder()`'],
            ['SQL / queries', 'jOOQ, QueryDSL, Criteria API style builders'],
            ['Config objects', 'Immutable config with many optional knobs'],
            ['Test data', 'Object mothers / test data builders for entities'],
            ['UI / documents', 'PDF or email builders with optional sections'],
            ['String building', '`StringBuilder` (related idea: incremental construction)'],
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
            'Food-delivery style: build an order with required restaurant + items and optional tip / instructions.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'FoodOrder.java',
          code: `import java.util.ArrayList;
import java.util.List;

public final class FoodOrder {
  private final String restaurantId;
  private final List<String> items;
  private final Integer tipCents;
  private final String note;

  private FoodOrder(Builder b) {
    this.restaurantId = b.restaurantId;
    this.items = List.copyOf(b.items);
    this.tipCents = b.tipCents;
    this.note = b.note;
  }

  public static Builder builder() {
    return new Builder();
  }

  public static final class Builder {
    private String restaurantId;
    private final List<String> items = new ArrayList<>();
    private Integer tipCents;
    private String note;

    public Builder restaurantId(String id) {
      this.restaurantId = id;
      return this;
    }

    public Builder addItem(String item) {
      this.items.add(item);
      return this;
    }

    public Builder tipCents(int tip) {
      this.tipCents = tip;
      return this;
    }

    public Builder note(String note) {
      this.note = note;
      return this;
    }

    public FoodOrder build() {
      if (restaurantId == null || restaurantId.isBlank()) {
        throw new IllegalStateException("restaurantId is required");
      }
      if (items.isEmpty()) {
        throw new IllegalStateException("at least one item is required");
      }
      return new FoodOrder(this);
    }
  }
}

// usage
FoodOrder order = FoodOrder.builder()
    .restaurantId("r-42")
    .addItem("Paneer Wrap")
    .addItem("Mango Lassi")
    .tipCents(400)
    .note("No onions")
    .build();`,
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Readable construction for many optional fields.',
            'Validation can live in `build()` once.',
            'Encourages immutable products.',
          ],
          cons: [
            'Boilerplate (inner Builder class) unless generated (Lombok `@Builder`, records + helpers).',
            'Overkill for 1–2 required fields with no options.',
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
              question: 'When do you choose Builder over a constructor?',
              answer:
                'When an object has **many optional parameters**, needs **validation at the end**, or you want a **fluent, readable** construction story. Prefer constructors for simple types.',
            },
            {
              question: 'Builder vs Factory?',
              answer:
                'Factories **decide which class** (or return a ready object). Builders **assemble one complex object** step by step. You can combine them: a factory returns a preconfigured builder.',
            },
            {
              question: 'What is a telescoping constructor and how does Builder help?',
              answer:
                'Telescoping constructors are overloaded constructors with ever-longer parameter lists. Builder replaces them with named steps so call sites stay clear and optional fields stay optional.',
            },
            {
              question: 'Should the built object be immutable?',
              answer:
                'Usually **yes** for value-like objects (requests, configs, orders). Mutability after `build()` reintroduces the complexity Builder tried to remove.',
            },
            {
              question: 'Where is Builder used in JDK / popular libraries?',
              answer:
                '`StringBuilder`, `HttpRequest.Builder`, Lombok `@Builder`, Guava `ImmutableList.Builder`, OkHttp, and many test-data builders.',
            },
            {
              question: 'GoF Builder has a Director — do I need it?',
              answer:
                'Only if the **same construction recipe** is reused (e.g. “build standard report” vs “build detailed report”). In most Java APIs the **client is the director** and calls builder methods directly.',
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
          body: '1. Build complex objects **step by step**, validate in `build()`.\n2. Real uses: **HTTP, SQL, config, test data, custom orders**.\n3. Beats telescoping constructors for optional fields.\n4. Contrast with Factory (which type) vs Builder (how to assemble).',
        },
      ],
    },
  ],
};

export default content;
