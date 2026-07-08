import { DesignContent } from '../../../shared/models';
import { ABSTRACT_FACTORY_META } from './abstract-factory.meta';

/**
 * Abstract Factory — families of related products (UI themes / cloud providers).
 */
const content: DesignContent = {
  meta: ABSTRACT_FACTORY_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Abstract Factory** provides an interface for creating **families of related objects** without specifying their concrete classes. Clients depend on abstract products; a concrete factory guarantees the family stays consistent (e.g. all “dark theme” widgets).',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'One-line difference',
          body: 'Factory Method → “make **a** notifier.” Abstract Factory → “make a matching **set**: button + input + dialog for this theme.”',
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
          body: 'A **furniture store** sells Modern or Victorian *sets*. If you pick Modern, you get a Modern chair, sofa, and coffee table that match. You do not mix a Victorian chair with a Modern sofa. The “Modern factory” produces the whole matching family.',
        },
        {
          type: 'mermaid',
          caption: 'Client uses abstract factory + abstract products.',
          definition: `flowchart TB
  Client --> AF[UIThemeFactory]
  AF --> B[Button]
  AF --> I[TextField]
  LightFactory --> LightButton
  LightFactory --> LightTextField
  DarkFactory --> DarkButton
  DarkFactory --> DarkTextField
  AF -.-> LightFactory
  AF -.-> DarkFactory`,
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
            ['UI / theming', 'Light vs Dark (or iOS vs Android) widget families'],
            ['Cloud multi-vendor', 'AWS vs GCP factories for storage + queue + secrets clients'],
            ['Databases', 'SQL vs NoSQL “toolkit” factories in demo apps'],
            ['Games', 'Fantasy vs Sci-fi asset packs (enemy + weapon + UI skin)'],
            ['Document suites', 'PDF vs HTML renderers that produce header/body/footer consistently'],
            ['Dependency injection', 'Guice/`@Module` or Spring config that wires a consistent stack'],
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
            'Example: a checkout UI that must stay visually consistent for Light vs Dark themes.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'UiThemeFactory.java',
          code: `public interface Button {
  void render();
}

public interface TextField {
  void render();
}

public interface UIThemeFactory {
  Button createButton();
  TextField createTextField();
}

public class LightThemeFactory implements UIThemeFactory {
  public Button createButton() { return new LightButton(); }
  public TextField createTextField() { return new LightTextField(); }
}

public class DarkThemeFactory implements UIThemeFactory {
  public Button createButton() { return new DarkButton(); }
  public TextField createTextField() { return new DarkTextField(); }
}

public class CheckoutForm {
  private final Button payButton;
  private final TextField cardField;

  public CheckoutForm(UIThemeFactory factory) {
    this.payButton = factory.createButton();
    this.cardField = factory.createTextField();
  }

  public void show() {
    cardField.render();
    payButton.render();
  }
}

// wiring
CheckoutForm form = new CheckoutForm(new DarkThemeFactory());`,
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Keeps product families consistent (no mixed themes/vendors).',
            'Client code is closed to concrete product classes.',
            'Easy to swap an entire stack (theme, cloud provider) at composition root.',
          ],
          cons: [
            'Adding a new product type means updating the factory interface and all concrete factories.',
            'More types than a single Factory Method; overkill for one product.',
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
              question: 'What is Abstract Factory?',
              answer:
                'An interface that creates a **family of related products**. Concrete factories implement that interface for a specific variant (theme, platform, vendor) so clients never mix incompatible concretes.',
            },
            {
              question: 'Abstract Factory vs Factory Method?',
              answer:
                'Factory Method focuses on **one** product via a creator method. Abstract Factory groups **multiple** factory methods for related products and is often implemented *using* Factory Methods inside.',
            },
            {
              question: 'Abstract Factory vs Builder?',
              answer:
                'Abstract Factory returns ready-made product families. **Builder** constructs **one complex object** step by step (optional parts, fluent API). Different problems.',
            },
            {
              question: 'Where have you seen this in production?',
              answer:
                'UI theme packs, multi-cloud SDK wrappers, and “environment kits” (dev vs prod factories that supply matching queue, storage, and secret clients). Spring `@Configuration` classes often play a similar role.',
            },
            {
              question: 'What is the main pain point of Abstract Factory?',
              answer:
                '**Interface evolution:** a new product method forces every concrete factory to change. Mitigate with careful interface design or composition of smaller factories.',
            },
            {
              question: 'Sketch an LLD example in 30 seconds.',
              answer:
                '`PaymentStackFactory` with `createGateway()`, `createFraudChecker()`, `createReceiptPrinter()`. `StripeStackFactory` vs `RazorpayStackFactory` keep the stack consistent while `CheckoutService` depends only on the abstract factory.',
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
          body: '1. Create **matching families** of objects behind one factory interface.\n2. Real uses: **themes, platforms, cloud vendors, game asset packs**.\n3. Strong consistency; weaker when product types change often.\n4. Compare clearly with Factory Method and Builder in interviews.',
        },
      ],
    },
  ],
};

export default content;
