import { DesignContent } from '../../../shared/models';
import { SAGA_META } from './saga.meta';

const content: DesignContent = {
  meta: SAGA_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'The **Saga** pattern manages a **long-running business transaction** across multiple services without a single distributed lock or two-phase commit (2PC). Each step performs a **local transaction** and publishes an event; if a later step fails, earlier steps run **compensating transactions** to undo their effects.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Why not 2PC?',
          body: 'Two-phase commit blocks resources, does not scale across heterogeneous stores, and creates a single point of failure. Sagas accept **eventual consistency** and explicit rollback via compensation.',
        },
        {
          type: 'table',
          caption: 'Saga styles compared.',
          headers: ['Style', 'Who coordinates?', 'Best when'],
          rows: [
            ['Choreography', 'Each service reacts to events', 'Few steps, loose coupling, simple flows'],
            ['Orchestration', 'Central saga coordinator', 'Many steps, complex branching, visibility needed'],
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
          body: 'Placing a **food delivery order**: the app reserves your meal (kitchen), assigns a rider (dispatch), and charges your card (payment). If payment fails, the kitchen **cancels the prep** and dispatch **releases the rider** — each team acts locally, and failures trigger undo steps instead of one giant locked transaction.',
        },
        {
          type: 'mermaid',
          caption: 'Orchestrated e-commerce saga: order → payment → inventory.',
          definition: `sequenceDiagram
  participant C as Saga Orchestrator
  participant O as Order Service
  participant P as Payment Service
  participant I as Inventory Service

  C->>O: CreateOrder (local TX)
  O-->>C: OrderCreated
  C->>P: ChargePayment (local TX)
  alt payment OK
    P-->>C: PaymentCaptured
    C->>I: ReserveStock (local TX)
    alt inventory OK
      I-->>C: StockReserved
      C->>O: ConfirmOrder
    else inventory fail
      I-->>C: StockFailed
      C->>P: RefundPayment (compensate)
      C->>O: CancelOrder (compensate)
    end
  else payment fail
    P-->>C: PaymentFailed
    C->>O: CancelOrder (compensate)
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
            ['E-commerce checkout', 'Order → payment → inventory → shipping label'],
            ['Food delivery', 'Restaurant confirm → rider assign → payment capture → notify customer'],
            ['Banking transfers', 'Debit source → credit destination → fee ledger → notification'],
            ['Travel booking', 'Flight hold → hotel hold → charge card; release holds on failure'],
            ['Subscription billing', 'Create invoice → charge → provision access; revoke on chargeback'],
            ['Microservice migrations', 'Replace monolith 2PC with choreographed domain events'],
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
            'Design **compensating actions** that are semantically undo — not always literal deletes (e.g. `RefundPayment` instead of erasing a row). Persist saga state (step, status, correlation ID). Pair event publication with the **Transactional Outbox** pattern so saga steps do not lose messages on crash.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'OrderSagaOrchestrator.java',
          code: `@Service
public class OrderSagaOrchestrator {
  private final SagaRepository sagas;
  private final OrderClient orders;
  private final PaymentClient payments;
  private final InventoryClient inventory;

  @Transactional
  public void startCheckout(CheckoutRequest req) {
    SagaState saga = sagas.save(SagaState.pending(req.orderId()));
    orders.createPending(req.orderId(), req.items());
    outbox.publish(new OrderCreatedEvent(req.orderId(), saga.id()));
  }

  @EventListener
  public void onPaymentCaptured(PaymentCapturedEvent e) {
    SagaState saga = sagas.findByOrderId(e.orderId());
    try {
      inventory.reserve(e.orderId(), e.items());
      outbox.publish(new StockReservedEvent(e.orderId()));
    } catch (InsufficientStockException ex) {
      compensate(saga, "INVENTORY_FAILED");
    }
  }

  private void compensate(SagaState saga, String reason) {
    payments.refund(saga.orderId());   // compensating TX
    orders.cancel(saga.orderId());     // compensating TX
    saga.markFailed(reason);
    sagas.save(saga);
  }
}`,
        },
        {
          type: 'code',
          language: 'sql',
          filename: 'saga_state.sql',
          code: `CREATE TABLE saga_instance (
  id            UUID PRIMARY KEY,
  order_id      UUID NOT NULL UNIQUE,
  current_step  VARCHAR(40) NOT NULL,
  status        VARCHAR(20) NOT NULL, -- PENDING, COMPLETED, COMPENSATING, FAILED
  payload       JSONB NOT NULL,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_saga_status ON saga_instance (status, updated_at);`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Compensation pitfalls',
          body: 'Compensations can **fail** or arrive **out of order**. Make them **idempotent** (use the Inbox pattern on consumers), log irreversible steps, and alert when manual reconciliation is required — common in banking when a debit succeeded but credit compensation stalls.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Avoids 2PC locks and single coordinator bottleneck at the database layer.',
            'Fits microservices with independent databases.',
            'Clear business-level rollback via compensating transactions.',
          ],
          cons: [
            'No isolation — other transactions may see intermediate saga states.',
            'Compensation logic is harder to design than all-or-nothing 2PC.',
            'Debugging distributed flows requires correlation IDs and tracing.',
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
              question: 'Choreography vs orchestration — when do you pick each?',
              answer:
                '**Choreography**: services publish/subscribe to events; good for 2–4 steps and teams that want decoupling. **Orchestration**: a coordinator owns the script; better for complex branching, timeouts, and operational visibility (e.g. Temporal workflows).',
            },
            {
              question: 'What is a compensating transaction?',
              answer:
                'A **semantic undo** of a completed local step — e.g. `RefundPayment`, `ReleaseInventory`, `CancelOrder`. It must be **idempotent** because retries and duplicate events happen in async systems.',
            },
            {
              question: 'How does Saga differ from 2PC?',
              answer:
                '**2PC** holds locks until all participants vote commit — strong consistency, poor availability. **Saga** commits each step locally immediately and rolls forward or compensates — **eventual consistency**, better for microservices.',
            },
            {
              question: 'Design a saga for e-commerce: order, payment, inventory.',
              answer:
                'Happy path: create pending order → capture payment → reserve stock → confirm order. Failures: payment fail → cancel order; inventory fail → refund payment + cancel order. Persist saga state; publish events via **Transactional Outbox**.',
            },
            {
              question: 'What happens if a compensation fails?',
              answer:
                'The saga enters **FAILED / needs intervention**. Retry with backoff, alert ops, and use a **reconciliation job** — especially in banking where money movement may require manual review.',
            },
            {
              question: 'How do sagas relate to the Outbox pattern?',
              answer:
                'Each saga step should atomically update local state **and** write an outbox event in one DB transaction. A relay publishes to Kafka so downstream saga participants never miss a step after a crash.',
            },
            {
              question: 'Forward recovery vs compensate — when do you choose each?',
              answer:
                '**Forward recovery** retries/continues toward the happy path when the failed step is **idempotent and still desirable** (e.g. payment captured, inventory briefly unavailable — retry reserve). **Compensate** when a later step fails and earlier commits must be **semantically undone** (refund, release stock). Prefer forward when safe; compensate when business invariants require rollback.',
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
          body: '1. Sagas replace **2PC** with local commits + **compensating transactions**.\n2. Choose **choreography** (event-driven) or **orchestration** (central coordinator) based on complexity.\n3. Real flows: **e-commerce checkout, food delivery, bank transfers**.\n4. Pair with **Transactional Outbox** and **idempotent/Inbox** consumers for reliability.',
        },
      ],
    },
  ],
};

export default content;
