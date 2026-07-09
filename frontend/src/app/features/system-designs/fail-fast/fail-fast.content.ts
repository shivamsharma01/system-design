import { DesignContent } from '../../../shared/models';
import { FAIL_FAST_META } from './fail-fast.meta';

const content: DesignContent = {
  meta: FAIL_FAST_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Fail Fast** means detecting that an operation cannot succeed and **returning an error immediately** instead of waiting, retrying, or partially doing expensive work. It protects resources and gives callers quicker, clearer feedback.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Where it shows up',
          body: 'Input validation, “circuit open” short-circuits, refusing work when a pool is exhausted, and aborting a saga step when a precondition is already false.',
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
          body: 'A **sold-out concert**: the ticket booth tells you immediately instead of making you queue for an hour. Failing fast saves everyone’s time and keeps the line moving for people who can still buy.',
        },
        {
          type: 'mermaid',
          caption: 'Guard early; skip hopeless work.',
          definition: `flowchart TD
  R[Request] --> V{Valid?}
  V -->|no| E[400 / fail fast]
  V -->|yes| C{Circuit closed?}
  C -->|no| F[503 fail fast]
  C -->|yes| W[Do work]`,
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
            ['APIs', 'Validate payload before hitting DB or payment'],
            ['Resilience', 'Circuit breaker open → immediate error/fallback'],
            ['Capacity', 'Reject when queue full (load shedding)'],
            ['Startup', 'Crash if required config/secrets missing'],
            ['Distributed tx', 'Abort early if inventory already insufficient'],
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
          filename: 'CheckoutFailFast.java',
          code: `public class CheckoutService {
  private final InventoryPort inventory;
  private final PaymentPort payments;
  private final CircuitBreaker paymentBreaker;

  public Order place(PlaceOrderCommand cmd) {
    // 1) validate — fail before any I/O
    if (cmd.items().isEmpty()) {
      throw new ValidationException("cart empty");
    }

    // 2) precondition — fail before payment
    if (!inventory.hasStock(cmd.items())) {
      throw new OutOfStockException();
    }

    // 3) circuit open — do not wait on a known-bad dependency
    if (!paymentBreaker.allowRequest()) {
      throw new PaymentUnavailableException("circuit open");
    }

    return payments.chargeAndConfirm(cmd);
  }
}`,
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Saves latency and capacity on doomed requests.',
            'Clearer errors for clients and operators.',
            'Reduces retry amplification during outages.',
          ],
          cons: [
            'Over-aggressive checks can reject recoverable cases.',
            'Must distinguish transient vs permanent failures.',
            'Callers need good error contracts (retryable or not).',
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
              question: 'What does fail fast mean in distributed systems?',
              answer:
                'Detect that success is unlikely (invalid input, open circuit, no capacity) and **error out immediately** instead of blocking or retrying hopeless work.',
            },
            {
              question: 'Fail fast vs retry?',
              answer:
                'Retry helps **transient** faults. Fail fast applies to **permanent** or **known-bad** conditions. Retrying those creates storms.',
            },
            {
              question: 'How does a circuit breaker implement fail fast?',
              answer:
                'When open, calls short-circuit without waiting for a timeout — failing fast (or invoking a fallback) until a trial request succeeds.',
            },
            {
              question: 'Is failing at startup fail fast?',
              answer:
                'Yes — refusing to boot without required config/DB is fail fast for the process lifecycle, avoiding a half-running broken service.',
            },
            {
              question: 'LLD / HLD example?',
              answer:
                'Checkout: validate cart → check stock → if payment circuit open return 503 with Retry-After, else charge. Do not call payment “just in case.”',
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
          body: '1. Fail fast = **early exit** on hopeless paths.\n2. Validate and short-circuit before expensive I/O.\n3. Real uses: **APIs, circuits, load shedding, boot checks**.\n4. Pair with clear retryability in error responses.',
        },
      ],
    },
  ],
};

export default content;
