import { DesignContent } from '../../../shared/models';
import { NULL_OBJECT_META } from './null-object.meta';

const content: DesignContent = {
  meta: NULL_OBJECT_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Null Object** provides a do-nothing (or default) implementation of an interface so clients can call methods without null checks. Instead of `if (logger != null) logger.info(...)`, you always have a logger — sometimes a silent one.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Related ideas',
          body: 'Optional empty, default strategies, and no-op metrics recorders are Null Object cousins. Prefer Null Object when polymorphism beats scattered null tests.',
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
          body: 'A **muted TV remote volume**: pressing volume still “works,” but sound does nothing. You do not need a special case for “no speakers attached” on every button press.',
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
            ['Logging', '`NullLogger` when logging is disabled'],
            ['Discounts', '`NoDiscount` strategy returning 0 off'],
            ['Metrics', 'No-op `MeterRegistry` in unit tests'],
            ['UI', 'Empty view / placeholder presenters'],
            ['Callbacks', 'Empty listener instead of null listener fields'],
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
          filename: 'NullDiscount.java',
          code: `public interface DiscountPolicy {
  Money apply(Money subtotal);
}

public class PercentDiscount implements DiscountPolicy {
  private final int percent;
  public PercentDiscount(int percent) { this.percent = percent; }
  public Money apply(Money subtotal) { return subtotal.percentOff(percent); }
}

public class NoDiscount implements DiscountPolicy {
  public static final NoDiscount INSTANCE = new NoDiscount();
  private NoDiscount() {}
  public Money apply(Money subtotal) { return subtotal; }
}

public class CartPricer {
  private final DiscountPolicy discount;

  public CartPricer(DiscountPolicy discount) {
    this.discount = discount == null ? NoDiscount.INSTANCE : discount;
  }

  public Money total(Money subtotal) {
    return discount.apply(subtotal); // no null check at call site
  }
}`,
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Removes repetitive null checks.',
            'Keeps call sites polymorphic and clean.',
            'Great defaults for optional collaborators.',
          ],
          cons: [
            'Can hide the fact that a real dependency is missing.',
            'Not a substitute for Optional when absence must be explicit.',
            'Overuse creates many empty classes.',
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
              question: 'What is a Null Object?',
              answer:
                'A concrete class implementing an interface with **neutral/no-op behavior**, used instead of a null reference so clients always have a valid collaborator.',
            },
            {
              question: 'Null Object vs Optional?',
              answer:
                'Optional forces callers to confront absence. Null Object **pretends** presence with harmless behavior. Use Optional when absence is meaningful; Null Object when a default is fine.',
            },
            {
              question: 'Null Object vs Strategy?',
              answer:
                'A null object is often a **special strategy** (e.g. no discount). Strategy is the broader pattern; Null Object is the “do nothing” variant.',
            },
            {
              question: 'LLD example?',
              answer:
                'Customer without a loyalty program gets `NoDiscount`; disabled notifications use `NullNotifier`; tests inject `NullMetrics`.',
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
          body: '1. Replace null with a **safe default object**.\n2. Real uses: **loggers, discounts, metrics, listeners**.\n3. Do not hide errors that should be explicit.\n4. Often a no-op Strategy.',
        },
      ],
    },
  ],
};

export default content;
