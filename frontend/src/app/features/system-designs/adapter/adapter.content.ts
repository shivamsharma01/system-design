import { DesignContent } from '../../../shared/models';
import { ADAPTER_META } from './adapter.meta';

const content: DesignContent = {
  meta: ADAPTER_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'The **Adapter** pattern converts one interface into another that clients expect. It lets classes work together that could not otherwise because of incompatible APIs — without rewriting either side.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Structural idea',
          body: 'Wrap an existing class (`Adaptee`) behind a target interface your code already uses. Clients talk only to the **Target**; the adapter translates calls.',
        },
        {
          type: 'table',
          caption: 'Roles.',
          headers: ['Role', 'Responsibility'],
          rows: [
            ['Target', 'Interface the client depends on'],
            ['Adaptee', 'Existing class with a different API'],
            ['Adapter', 'Implements Target; delegates to Adaptee'],
            ['Client', 'Uses Target only'],
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
          body: 'A **travel plug adapter**: your laptop expects a US plug; the hotel wall is EU. The adapter does not change the laptop or the wall — it translates the shape so power flows.',
        },
        {
          type: 'mermaid',
          caption: 'Object adapter (composition).',
          definition: `classDiagram
  class PaymentGateway {
    <<interface>>
    +charge(amount, currency)
  }
  class StripeSdk {
    +createCharge(cents, isoCode)
  }
  class StripeAdapter {
    -stripe: StripeSdk
    +charge(amount, currency)
  }
  class CheckoutService
  PaymentGateway <|.. StripeAdapter
  StripeAdapter --> StripeSdk : wraps
  CheckoutService --> PaymentGateway`,
        },
        {
          type: 'markdown',
          value:
            '**Object adapter** (composition) is preferred in Java. **Class adapter** (multiple inheritance) is rare outside languages that allow it cleanly.',
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
            ['Payments', 'Wrap Stripe / Razorpay / PayPal SDKs behind `PaymentGateway`'],
            ['Legacy systems', 'Expose old SOAP or XML APIs as modern REST DTOs'],
            ['Logging', 'Adapt `java.util.logging` to SLF4J-style interfaces'],
            ['Collections', 'Early Java `Enumeration` → `Iterator` adapters'],
            ['Media / codecs', 'Third-party player API behind your `MediaPlayer` interface'],
            ['Cloud SDKs', 'Normalize S3 vs GCS client calls for upload/download'],
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
            'Checkout depends on `PaymentGateway`. Stripe speaks a different method and uses cents — the adapter translates.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'StripePaymentAdapter.java',
          code: `public interface PaymentGateway {
  PaymentResult charge(Money amount, String customerId);
}

/** Third-party SDK we cannot change. */
public class StripeSdk {
  public StripeCharge createCharge(long amountCents, String currency, String customer) {
    // HTTP call to Stripe...
    return new StripeCharge("ch_123", "succeeded");
  }
}

public class StripeAdapter implements PaymentGateway {
  private final StripeSdk stripe;

  public StripeAdapter(StripeSdk stripe) {
    this.stripe = stripe;
  }

  @Override
  public PaymentResult charge(Money amount, String customerId) {
    StripeCharge raw = stripe.createCharge(
        amount.toCents(),
        amount.currency(),
        customerId
    );
    return new PaymentResult(raw.id(), raw.status().equals("succeeded"));
  }
}

// client
PaymentGateway gateway = new StripeAdapter(new StripeSdk());
gateway.charge(Money.of("INR", 49900), "cus_42");`,
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Integrates third-party / legacy code without rewriting clients.',
            'Keeps domain code free of vendor-specific types.',
            'Easy to swap vendors (new adapter, same Target).',
          ],
          cons: [
            'Extra class per adaptee; can proliferate if overused.',
            'Does not fix a bad adaptee API — only translates it.',
            'Two-way adapters (both directions) get complex fast.',
          ],
        },
      ],
    },
    {
      id: 'vs-related',
      title: 'Adapter vs related patterns',
      blocks: [
        {
          type: 'featureComparison',
          columns: ['Adapter', 'Facade', 'Decorator', 'Bridge'],
          rows: [
            {
              feature: 'Primary goal',
              values: [
                'Make interfaces compatible',
                'Simplify a subsystem',
                'Add behavior',
                'Split abstraction from impl',
              ],
            },
            {
              feature: 'Changes interface?',
              values: ['Yes (to Target)', 'Usually yes (simpler)', 'No (same interface)', 'Separates two hierarchies'],
            },
            {
              feature: 'Typical trigger',
              values: ['Third-party / legacy', 'Too many moving parts', 'Cross-cutting extras', 'Independent variation'],
            },
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
              question: 'What problem does Adapter solve?',
              answer:
                'Two existing types need to collaborate but their **interfaces do not match**. Adapter implements the client’s expected interface and **delegates** to the incompatible class, translating calls and data.',
            },
            {
              question: 'Object adapter vs class adapter?',
              answer:
                '**Object adapter** uses composition (wraps an instance) — preferred in Java. **Class adapter** inherits from both Target and Adaptee — needs multiple inheritance and is uncommon in Java.',
            },
            {
              question: 'Adapter vs Facade?',
              answer:
                'Adapter **converts** an existing interface to another. Facade **simplifies** access to a whole subsystem. Facade is about ease of use; Adapter is about compatibility.',
            },
            {
              question: 'Adapter vs Decorator?',
              answer:
                'Decorator implements the **same** interface and adds behavior. Adapter implements a **different** (target) interface to make an adaptee usable.',
            },
            {
              question: 'Give an LLD example (e-commerce / parking).',
              answer:
                'E-commerce: `StripeAdapter` / `RazorpayAdapter` behind `PaymentGateway`. Parking lot: adapt a third-party ANPR camera SDK to your `VehicleDetector` interface so the entry gate code stays vendor-agnostic.',
            },
            {
              question: 'When would you avoid Adapter?',
              answer:
                'When you **own** both sides and can change the API directly, or when a thin mapping DTO / mapper library is enough without a full pattern ceremony.',
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
          body: '1. Adapter = **interface translation** for incompatible APIs.\n2. Real uses: **payment SDKs, legacy systems, logging bridges**.\n3. Prefer **object adapters** (composition).\n4. Distinguish clearly from Facade, Decorator, and Bridge in interviews.',
        },
      ],
    },
  ],
};

export default content;
