import { DesignContent } from '../../../shared/models';
import { CHAIN_OF_RESPONSIBILITY_META } from './chain-of-responsibility.meta';

const content: DesignContent = {
  meta: CHAIN_OF_RESPONSIBILITY_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Chain of Responsibility** passes a request along a chain of handlers. Each handler either processes the request, partially processes it and forwards, or passes it on. The sender does not know which handler will ultimately handle the request.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Middleware cousin',
          body: 'Servlet filters, Spring Security filter chains, and Express/Nest middleware are everyday Chain of Responsibility — each link can short-circuit or call `next()`.',
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
          body: 'Customer support tiers: L1 tries first, escalates to L2, then L3. The customer opens one ticket; the chain decides who resolves it.',
        },
        {
          type: 'mermaid',
          caption: 'Request flows through handlers.',
          definition: `flowchart LR
  R[Request] --> A[AuthHandler]
  A --> B[RateLimitHandler]
  B --> C[LoggingHandler]
  C --> D[BusinessHandler]`,
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
            ['HTTP stacks', 'Filters / middleware pipelines'],
            ['Approvals', 'Expense: manager → finance → director'],
            ['Logging', 'Logger levels forwarding to parent loggers'],
            ['GUI', 'Event bubbling through widget parents'],
            ['Support / helpdesk', 'Tiered ticket routing'],
            ['Validation', 'Sequential validators that can stop early'],
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
          filename: 'SupportChain.java',
          code: `public abstract class SupportHandler {
  private SupportHandler next;

  public SupportHandler linkWith(SupportHandler next) {
    this.next = next;
    return next;
  }

  public final void handle(Ticket ticket) {
    if (canHandle(ticket)) {
      doHandle(ticket);
    } else if (next != null) {
      next.handle(ticket);
    } else {
      throw new IllegalStateException("unhandled: " + ticket.type());
    }
  }

  protected abstract boolean canHandle(Ticket ticket);
  protected abstract void doHandle(Ticket ticket);
}

public class BillingHandler extends SupportHandler {
  protected boolean canHandle(Ticket t) { return t.type() == TicketType.BILLING; }
  protected void doHandle(Ticket t) { /* refund / invoice help */ }
}

public class TechHandler extends SupportHandler {
  protected boolean canHandle(Ticket t) { return t.type() == TicketType.TECH; }
  protected void doHandle(Ticket t) { /* debug account */ }
}

// wire: billing.linkWith(tech).linkWith(general);`,
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Decouples sender from concrete receiver.',
            'Easy to reorder or insert handlers.',
            'Natural fit for cross-cutting request pipelines.',
          ],
          cons: [
            'Request may go unhandled if chain is incomplete.',
            'Debugging long chains can be hard.',
            'Performance cost if every request walks many links.',
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
              question: 'What is Chain of Responsibility?',
              answer:
                'A pipeline of handlers where each may process a request or pass it to the next. The client sends to the head of the chain without knowing who handles it.',
            },
            {
              question: 'Chain vs Decorator?',
              answer:
                'Decorator always wraps and usually adds behavior while keeping the same interface. Chain handlers decide whether to handle or forward; not every link must process.',
            },
            {
              question: 'Where have you seen it in frameworks?',
              answer:
                'Servlet `Filter`, Spring Security filter chain, Netty/Channel pipelines, Express middleware.',
            },
            {
              question: 'How do you guarantee something handles the request?',
              answer:
                'Add a terminal handler that rejects/logs, or require the chain builder to validate coverage for all request types.',
            },
            {
              question: 'LLD example?',
              answer:
                'Leave approval: team lead → HR → director based on days requested; or ATM cash dispenser trying note denominations.',
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
          body: '1. Pass requests along a **handler chain**.\n2. Real uses: **middleware, approvals, logging, GUI events**.\n3. Decouples sender from receiver.\n4. Contrast with Decorator; ensure a terminal handler.',
        },
      ],
    },
  ],
};

export default content;
