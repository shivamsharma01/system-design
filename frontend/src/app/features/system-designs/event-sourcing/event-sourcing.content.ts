import { DesignContent } from '../../../shared/models';
import { EVENT_SOURCING_META } from './event-sourcing.meta';

const content: DesignContent = {
  meta: EVENT_SOURCING_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Event Sourcing** stores application state as an **append-only log of domain events** instead of overwriting rows in place. Current state is **rebuilt by replaying events** (or loading a snapshot plus recent events). Every change is auditable — you can answer “what was the balance at 3pm?” from history.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Events as source of truth',
          body: 'The event stream **is** the database of record. Materialized views, read models (**CQRS**), and snapshots are derived and disposable — rebuild them by replaying events.',
        },
        {
          type: 'table',
          caption: 'Core building blocks.',
          headers: ['Concept', 'Role'],
          rows: [
            ['Event store', 'Append-only persistence per aggregate stream'],
            ['Aggregate', 'Consistency boundary — replay events to current state'],
            ['Snapshot', 'Periodic checkpoint to avoid replaying thousands of events'],
            ['Projection', 'Read model built by consuming events (often CQRS query side)'],
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
          body: 'A **bank passbook** lists every deposit and withdrawal in order — it never erases past lines. Your balance is the **sum of entries**. If the passbook is long, the teller uses a **monthly snapshot sticker** (snapshot) and only adds recent transactions.',
        },
        {
          type: 'mermaid',
          caption: 'Append events; rebuild aggregate; optional snapshot accelerates load.',
          definition: `flowchart LR
  CMD[TransferFunds command]
  CMD --> AGG[BankAccount aggregate]
  AGG -->|append| ES[(Event Store)]
  ES --> E1[AccountOpened]
  ES --> E2[FundsDeposited]
  ES --> E3[FundsWithdrawn]
  ES --> SN[Snapshot every N events]
  SN --> AGG2[Fast reload: snapshot + tail events]
  ES --> PROJ[Balance projection / CQRS read model]`,
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
            ['Banking & ledger', 'Every debit/credit as immutable event — audit and regulatory replay'],
            ['E-commerce orders', 'OrderPlaced → Paid → Shipped → Delivered event timeline'],
            ['Food delivery', 'Order lifecycle events power customer tracking and dispute resolution'],
            ['Payment wallets', 'Append-only transaction log; balance derived from events'],
            ['Collaborative editing', 'Event log enables undo, history, and conflict analysis'],
            ['With CQRS', 'Single event stream feeds search index, analytics, and admin dashboards'],
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
            'Model **past-tense domain events** (`OrderPlaced`, not `PlaceOrder`). Enforce **optimistic concurrency** with expected version on append. Publish to message bus via **Transactional Outbox** if the event store shares a DB. Use **snapshots** when replay exceeds ~100–500 events per load.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'BankAccountAggregate.java',
          code: `public class BankAccountAggregate {
  private UUID id;
  private long balanceCents;
  private long version;

  public static BankAccountAggregate open(UUID id, UUID ownerId) {
    var agg = new BankAccountAggregate();
    agg.raise(new AccountOpened(id, ownerId, Instant.now()));
    return agg;
  }

  public void withdraw(long amountCents, String reference) {
    if (amountCents <= 0) throw new IllegalArgumentException("amount");
    if (balanceCents < amountCents) throw new InsufficientFundsException();
    raise(new FundsWithdrawn(id, amountCents, reference, Instant.now()));
  }

  private void raise(DomainEvent event) {
    apply(event);
    uncommittedEvents.add(event);
    version++;
  }

  private void apply(DomainEvent event) {
    switch (event) {
      case AccountOpened e -> { id = e.accountId(); balanceCents = 0; }
      case FundsDeposited e -> balanceCents += e.amountCents();
      case FundsWithdrawn e -> balanceCents -= e.amountCents();
      default -> throw new IllegalStateException("unknown event");
    }
  }

  public static BankAccountAggregate fromHistory(List<DomainEvent> events) {
    var agg = new BankAccountAggregate();
    events.forEach(agg::apply);
    agg.version = events.size();
    return agg;
  }
}`,
        },
        {
          type: 'code',
          language: 'sql',
          filename: 'event_store.sql',
          code: `CREATE TABLE event_store (
  stream_id     UUID NOT NULL,
  version       BIGINT NOT NULL,
  event_type    VARCHAR(80) NOT NULL,
  payload       JSONB NOT NULL,
  occurred_at   TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (stream_id, version)
);

CREATE TABLE aggregate_snapshots (
  stream_id     UUID PRIMARY KEY,
  version       BIGINT NOT NULL,
  state_json    JSONB NOT NULL,
  taken_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Event schema evolution',
          body: 'Events live **forever**. Use **upcasting**, versioned payloads, or tolerant readers when fields change. Never mutate historical rows — append corrective events (`AccountCorrectionApplied`) instead.',
        },
        {
          type: 'prosCons',
          title: 'Trade-offs',
          pros: [
            'Complete audit trail and temporal queries (“state at time T”).',
            'Natural integration — new projections without migrating write schema.',
            'Debugging: replay production events in a sandbox.',
          ],
          cons: [
            'Steep learning curve and operational overhead (snapshots, replays).',
            'Delete/GDPR requires compensating events or crypto-shredding strategies.',
            'Not ideal for high-volume ephemeral data with no audit need.',
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
              question: 'How do you get current state without replaying all events?',
              answer:
                'Store periodic **snapshots** of aggregate state at version N. Load snapshot, then replay only events **after N**. Tune snapshot frequency by replay cost.',
            },
            {
              question: 'Event Sourcing vs audit log?',
              answer:
                'An **audit log** is a side record; the primary table is still updated in place. In **Event Sourcing**, events **are** the primary state — tables are projections.',
            },
            {
              question: 'How does Event Sourcing pair with CQRS?',
              answer:
                'ES on the **write side** appends domain events. **CQRS read models** subscribe and build query-optimized views (order timeline, search index) — see **CQRS** pattern.',
            },
            {
              question: 'Design event sourcing for a bank transfer.',
              answer:
                'Stream per account: `AccountOpened`, `FundsReserved`, `TransferInitiated`, `TransferCompleted` or `TransferFailed`. Never delete — append failure/compensation events. Balance = fold over events.',
            },
            {
              question: 'What is optimistic concurrency in the event store?',
              answer:
                'Append only if **expected version** matches stream tail. Prevents lost updates when two commands race on the same aggregate.',
            },
            {
              question: 'When would you avoid Event Sourcing?',
              answer:
                'Simple CRUD, heavy delete/personal-data erasure without upcasting strategy, or teams lacking ops maturity for snapshots, replays, and schema migration.',
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
          body: '1. Persist **append-only domain events** — rebuild state by replay.\n2. Use **snapshots** for performance; **projections** for reads (often with **CQRS**).\n3. Real uses: **banking ledgers, order timelines, payment wallets**.\n4. Plan for **schema evolution**, audit, and integration via **Transactional Outbox**.',
        },
      ],
    },
  ],
};

export default content;
