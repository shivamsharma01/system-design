import { DesignContent } from '../../../shared/models';
import { PAYMENT_GATEWAY_META } from './payment-gateway.meta';

/**
 * Flagship-depth example (peer of the Netflix, Amazon, etc. designs). A
 * payment gateway: the system that sits between merchants and the card
 * networks/banks, turning "charge this card" into a reliable, auditable,
 * money-moving operation. Emphasis on correctness over raw scale —
 * idempotency, the double-entry ledger, the authorize/capture/settle
 * lifecycle, PCI tokenization, reconciliation, and effectively-once semantics
 * over fundamentally unreliable downstream networks.
 */
const content: DesignContent = {
  meta: PAYMENT_GATEWAY_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'A **payment gateway** is the system a merchant calls to take money from a customer. It abstracts the messy world of **card networks**, **acquiring/issuing banks**, **alternative payment methods**, fraud, and compliance behind one clean API: "charge this customer $X." Think **Stripe** or **Razorpay** — the value is not throughput, it is **never losing or double-moving money**, and being able to **prove** what happened to the cent.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'The big idea',
          body: 'A payment gateway is a **correctness and trust system**, not a high-scale-for-its-own-sake system. The defining concerns are **idempotency** (a retried "charge" must never double-charge), a **double-entry ledger** as the immutable source of truth, the **authorize→capture→settle** lifecycle, **PCI compliance** (never touch raw card numbers carelessly), and **reconciliation** against banks that are slow, asynchronous, and occasionally wrong.',
        },
        {
          type: 'image',
          src: 'assets/diagrams/payment-gateway-architecture.svg',
          alt: 'Merchant calls the Payment Service which tokenizes the card in a PCI vault, runs risk/fraud and 3DS, orchestrates a saga writing to a double-entry ledger, and talks to PSP connectors that reach acquiring banks, card networks, and issuing banks; settlement and status flow back asynchronously via webhooks.',
          caption:
            'Merchant → Payment Service (idempotency, ledger, saga) → PSP connectors → banks/card networks; settlement & status return asynchronously via webhooks.',
        },
      ],
    },
    {
      id: 'functional-requirements',
      title: 'Functional Requirements',
      blocks: [
        {
          type: 'bestPractices',
          title: 'In scope',
          practices: [
            '**Accept payments**: card, wallet, bank transfer, UPI — via one API.',
            '**Authorize & capture**: hold funds, then capture (immediately or later).',
            '**Refunds & reversals**: full or partial, idempotently.',
            '**Idempotency**: safe retries that never double-charge.',
            '**Ledger**: an immutable, auditable record of every money movement.',
            '**Webhooks**: notify merchants of asynchronous status changes.',
            '**Reconciliation**: match internal records against bank settlement files.',
          ],
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Out of scope (state explicitly)',
          body: 'Becoming a card network or a bank, the deep internals of issuer authorization, full KYC/onboarding flows, and tax/invoicing. We focus on the **gateway/processor** layer: reliably orchestrating and recording money movement between merchants and the financial networks.',
        },
      ],
    },
    {
      id: 'non-functional-requirements',
      title: 'Non-Functional Requirements',
      blocks: [
        {
          type: 'prosCons',
          title: 'Prioritizing the qualities',
          pros: [
            'Correctness above all: no lost, duplicated, or incorrect money movements — ever.',
            'Durability & auditability: every state change is persisted and provable.',
            'Strong consistency for the ledger (this is where CP > AP).',
            'High availability: merchants lose revenue when the gateway is down.',
            'Security & compliance: PCI-DSS, encryption, least-privilege access to card data.',
          ],
          cons: [
            'Ultra-low latency is NOT the priority (a few hundred ms is fine; correctness wins).',
            'Massive horizontal scale is NOT the hard part (10k TPS is modest).',
            'Eventual consistency is NOT acceptable for the ledger itself.',
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'This is a CP system, deliberately',
          body: 'Most systems in this catalog lean **AP** (stay available, tolerate staleness). A payment ledger is the opposite: when forced to choose, it favors **consistency and correctness over availability**. It is better to reject a payment (and have the client retry) than to record money incorrectly. Get this framing right and the rest of the design follows.',
        },
      ],
    },
    {
      id: 'capacity-estimation',
      title: 'Capacity Estimation',
      blocks: [
        {
          type: 'markdown',
          value:
            'Assume **10,000 transactions/sec** at peak (a large processor on a sale day), average ticket **$50**, with reads (status checks, dashboards) far outnumbering writes.',
        },
        {
          type: 'metrics',
          items: [
            { label: 'Peak TPS', value: '~10k/s', hint: 'payment writes' },
            { label: 'Transactions/day', value: '~500M', hint: 'across the day' },
            { label: 'Ledger entries/txn', value: '≥2', hint: 'double-entry (debit+credit)' },
            { label: 'Ledger writes/day', value: '~1B+', hint: 'entries, append-only' },
            { label: 'Retention', value: 'years', hint: 'legal/audit requirement' },
            { label: 'Read:write', value: '~10:1', hint: 'status, reporting' },
          ],
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Scale is modest; correctness is not',
          body: '10k TPS is comfortably within reach of modern databases — this is **not** a "shard to a million QPS" problem. The hard part is doing each of those 10k writes **exactly once**, **durably**, **consistently**, and **auditably**, while talking to downstream banks that may time out after they already succeeded.',
        },
      ],
    },
    {
      id: 'payment-flow',
      title: 'The Payment Lifecycle',
      blocks: [
        {
          type: 'markdown',
          value:
            "A card payment is not one step — it is **authorize → capture → settle**, often spread over days. **Authorization** checks the card has funds and places a hold. **Capture** tells the bank to actually move the held funds (can be immediate or later, e.g. when goods ship). **Settlement** is the batch process where money actually lands in the merchant's account, confirmed via bank files.",
        },
        {
          type: 'mermaid',
          caption: 'Authorize → capture → settle (with the players).',
          definition: `sequenceDiagram
  participant M as Merchant
  participant G as Gateway
  participant A as Acquirer/PSP
  participant N as Card Network
  participant I as Issuing Bank
  M->>G: charge(card, amount, idempotencyKey)
  G->>A: authorize
  A->>N: route auth
  N->>I: auth request
  I-->>N: approved (hold funds)
  N-->>A: approved
  A-->>G: auth code
  G-->>M: authorized
  M->>G: capture (now or later)
  G->>A: capture -> settlement batch
  Note over A,I: Settlement (T+1..T+2): funds move, bank files generated
  A-->>G: settlement report (async)
  G-->>M: webhook: settled`,
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Auth and capture are separate for a reason',
          body: "Splitting authorize from capture lets merchants **hold** funds before fulfilling (hotels, pre-orders, shipping) and capture the **final** amount later. It also means the gateway must track a payment's state over time — a perfect fit for an explicit **state machine** rather than a single synchronous call.",
        },
      ],
    },
    {
      id: 'state-machine',
      title: 'Payment State Machine',
      blocks: [
        {
          type: 'markdown',
          value:
            'Every payment is an explicit state machine. Modeling it this way makes transitions auditable, makes retries/recovery deterministic, and prevents illegal moves (you cannot refund an uncaptured payment).',
        },
        {
          type: 'mermaid',
          caption: 'Payment state machine.',
          definition: `stateDiagram-v2
  [*] --> Created
  Created --> Authorized: auth approved
  Created --> Failed: auth declined
  Authorized --> Captured: capture
  Authorized --> Voided: cancel before capture
  Authorized --> Expired: hold expires
  Captured --> Settled: settlement confirmed
  Captured --> Refunded: refund
  Settled --> Refunded: refund
  Refunded --> [*]
  Settled --> [*]
  Failed --> [*]
  Voided --> [*]`,
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Every transition is a ledger event',
          body: 'State transitions are not just status flags — each one emits **immutable ledger entries**. "Captured" writes a debit/credit pair; "Refunded" writes the reversing pair. The status column is a convenience; the **ledger is the truth**, and the status can always be re-derived from it.',
        },
      ],
    },
    {
      id: 'idempotency',
      title: 'Idempotency',
      blocks: [
        {
          type: 'markdown',
          value:
            'The single most important property. Networks time out, clients retry, and a "charge" request may arrive two, three, or ten times. Without idempotency, a customer gets charged repeatedly. The defense: the merchant supplies an **idempotency key** with each operation; the gateway guarantees that key executes **at most once**.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'IdempotentCharge.java',
          highlightLines: [3, 4, 9, 10, 14],
          code: `Payment charge(ChargeRequest req) {
    // 1) Reserve the idempotency key atomically (unique constraint).
    var existing = idempotencyStore.putIfAbsent(
        req.idempotencyKey(), req.fingerprint());

    if (existing != null) {
        if (!existing.fingerprint().equals(req.fingerprint()))
            throw new IdempotencyConflict();  // same key, different body
        return existing.result();             // replay the stored result
    }

    // 2) First time: run the payment exactly once, persist the outcome.
    Payment p = orchestrate(req);             // auth + ledger (one txn)
    idempotencyStore.complete(req.idempotencyKey(), p);
    return p;
}`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'The "timed out but succeeded" trap',
          body: 'The nastiest case: the gateway sends an auth to the bank, the bank approves, but the **response is lost** to a timeout. The client retries. If the gateway naively re-authorizes, the customer is charged twice. Idempotency keys (plus querying the PSP by the original reference before retrying) make the retry return the **original** result instead of creating a new charge.',
        },
      ],
    },
    {
      id: 'ledger',
      title: 'The Double-Entry Ledger',
      blocks: [
        {
          type: 'markdown',
          value:
            'The ledger is the heart of the system: an **append-only, immutable** record where every money movement is recorded as balanced **double-entry** bookkeeping — every debit has an equal and opposite credit, so the books always balance. You never update or delete an entry; you write a **new** reversing entry. This is what makes the system auditable and what auditors/regulators require.',
        },
        {
          type: 'code',
          language: 'sql',
          filename: 'ledger.sql',
          highlightLines: [2, 9, 10, 11],
          code: `-- Append-only. Entries are never updated or deleted.
CREATE TABLE ledger_entries (
  id             BIGINT PRIMARY KEY,      -- monotonic
  transaction_id UUID NOT NULL,           -- groups the balanced set
  account_id     BIGINT NOT NULL,         -- merchant, customer, fees, settlement
  direction      CHAR(1) NOT NULL,        -- 'D' debit | 'C' credit
  amount_minor   BIGINT NOT NULL,         -- integer minor units (cents) — never float
  currency       CHAR(3) NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL
);
-- Invariant enforced per transaction_id:
--   SUM(debits) = SUM(credits)   (the books always balance)`,
        },
        {
          type: 'bestPractices',
          title: 'Ledger rules',
          practices: [
            '**Integer minor units** (cents), never floating point — floats lose money.',
            '**Append-only**: corrections are reversing entries, not edits.',
            '**Balanced per transaction**: Σ debits = Σ credits, enforced atomically.',
            '**Idempotent writes**: the same transaction id never posts twice.',
            '**Status is derived**; the ledger is the single source of truth.',
            '**Immutable + retained for years** for audit and dispute resolution.',
          ],
        },
        {
          type: 'math',
          display: true,
          tex: '\\sum_{e \\in T} debit(e) \\;=\\; \\sum_{e \\in T} credit(e) \\quad \\forall\\, \\text{transactions } T',
          caption:
            'The fundamental invariant: within every transaction, total debits equal total credits — the ledger never goes out of balance.',
        },
      ],
    },
    {
      id: 'orchestration',
      title: 'Orchestration: Saga & Money Movement',
      blocks: [
        {
          type: 'markdown',
          value:
            'A payment spans multiple systems (risk, PSP, ledger, notifications) that cannot share one ACID transaction. The gateway orchestrates them as a **saga**: a sequence of steps, each with a **compensating action** if a later step fails. The local ledger write is ACID; the cross-system flow is a saga with compensations (e.g. auth succeeded but ledger write failed → void the auth).',
        },
        {
          type: 'mermaid',
          caption: 'Charge saga with compensation.',
          definition: `flowchart TD
  Start["charge()"] --> Risk{Risk/fraud check}
  Risk -- decline --> Failed["Mark Failed"]
  Risk -- ok --> Auth["Authorize via PSP"]
  Auth -- declined --> Failed
  Auth -- approved --> Ledger["Write ledger (ACID)"]
  Ledger -- ok --> Notify["Emit webhook + return"]
  Ledger -- fails --> Comp["Compensate: void authorization"]
  Comp --> Failed`,
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Local ledger = ACID; the world = saga',
          body: 'Keep the money-correctness boundary **inside a single ACID transaction** (status + ledger entries commit together). Everything that crosses a process boundary (PSP calls, webhooks) is **eventually consistent** and made safe with retries, idempotency, and compensation. Do not try to two-phase-commit across a bank.',
        },
      ],
    },
    {
      id: 'security',
      title: 'Security & PCI Compliance',
      blocks: [
        {
          type: 'markdown',
          value:
            'Handling card data brings **PCI-DSS** obligations. The golden rule: **minimize the systems that ever see a raw PAN** (card number). The gateway **tokenizes** cards in an isolated **vault** the moment they arrive; the rest of the platform works with **tokens**, never the real number — shrinking PCI scope dramatically.',
        },
        {
          type: 'bestPractices',
          title: 'Security controls',
          practices: [
            '**Tokenization**: replace the PAN with a token at ingress; store the PAN only in an isolated, encrypted vault.',
            '**Encryption** in transit (TLS) and at rest (KMS-managed keys, regular rotation).',
            '**Network segmentation**: the cardholder-data environment (CDE) is isolated and minimal.',
            '**3-D Secure (3DS)**: shift liability and add cardholder authentication for risky transactions.',
            '**Least privilege + audit logging**: every access to sensitive data is logged.',
            '**No card data in logs** — a classic, costly compliance failure.',
          ],
        },
        {
          type: 'callout',
          variant: 'danger',
          title: 'Tokenization shrinks your blast radius',
          body: 'If the main application database is breached but only holds **tokens**, the attacker gets nothing chargeable. The PAN lives solely in the vault, behind separate keys and access controls. This separation is both a security best practice and the cheapest way to stay PCI-compliant.',
        },
      ],
    },
    {
      id: 'reliability',
      title: 'Reliability: PSPs, Retries & Smart Routing',
      blocks: [
        {
          type: 'markdown',
          value:
            'Downstream PSPs/acquirers fail, slow down, and have regional outages. The gateway wraps each behind a **connector** with a normalized interface, retries transient failures carefully, and can **smart-route** a transaction to a backup acquirer to maximize the **authorization success rate** (a key business metric).',
        },
        {
          type: 'code',
          language: 'python',
          filename: 'psp_route.py',
          highlightLines: [2, 6, 7, 8],
          code: `def authorize(txn):
    for psp in routing_policy(txn):          # ordered by cost/success/region
        if breaker[psp].is_open():           # skip a failing acquirer
            continue
        try:
            # Carry the SAME network reference so a retry is idempotent
            # at the PSP, never a second authorization.
            return psp.authorize(txn, ref=txn.network_ref, timeout=8)
        except Retryable:
            breaker[psp].record_failure()
            continue
    raise NoAcquirerAvailable()              # all routes exhausted`,
        },
        {
          type: 'bestPractices',
          title: 'Reliability tactics',
          practices: [
            '**Idempotent PSP calls**: reuse the original network reference on retry.',
            '**Exponential backoff + jitter** for transient errors; never hammer a struggling acquirer.',
            '**Circuit breakers** per PSP to fail over fast when one is down.',
            '**Smart routing** by cost, region, and historical success rate.',
            '**Timeouts + reconciliation**: on an ambiguous timeout, query status rather than blindly retry.',
            '**Outbox pattern** so webhooks/events are never lost even if the process crashes.',
          ],
        },
      ],
    },
    {
      id: 'reconciliation',
      title: 'Reconciliation',
      blocks: [
        {
          type: 'markdown',
          value:
            "Banks confirm what *actually* happened **asynchronously**, via daily **settlement files**. Reconciliation matches every internal ledger transaction against the bank's record to catch discrepancies: a charge we think succeeded that the bank dropped, a settlement amount that differs (fees), or a transaction the bank has that we do not. This is the safety net that guarantees the books reflect reality.",
        },
        {
          type: 'mermaid',
          caption: 'Daily reconciliation loop.',
          definition: `flowchart LR
  Bank[("Bank settlement file (T+1)")] --> Match["Reconciliation job"]
  Ledger[("Internal ledger")] --> Match
  Match -->|matched| OK["Mark settled"]
  Match -->|amount mismatch| Adj["Post adjusting entry"]
  Match -->|missing internally| Invest["Investigate / exception queue"]
  Match -->|missing at bank| Retry["Re-query / re-submit"]`,
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Reconciliation is non-negotiable',
          body: 'No matter how careful the live path is, distributed money movement drifts: timeouts, partial failures, fee deductions, FX rounding. A robust **automated reconciliation** process (with a human exception queue for the unmatched tail) is what lets a payments company actually trust its own numbers.',
        },
      ],
    },
    {
      id: 'api-design',
      title: 'API Design',
      blocks: [
        {
          type: 'apiTable',
          title: 'Payments API',
          endpoints: [
            {
              method: 'POST',
              path: '/v1/payment_intents',
              description: 'Create/confirm a payment (Idempotency-Key header)',
              auth: true,
            },
            {
              method: 'POST',
              path: '/v1/payment_intents/{id}/capture',
              description: 'Capture an authorized payment',
              auth: true,
            },
            {
              method: 'POST',
              path: '/v1/payment_intents/{id}/cancel',
              description: 'Void before capture',
              auth: true,
            },
            {
              method: 'POST',
              path: '/v1/refunds',
              description: 'Refund (full/partial), idempotent',
              auth: true,
            },
            {
              method: 'GET',
              path: '/v1/payment_intents/{id}',
              description: 'Fetch current status',
              auth: true,
            },
            {
              method: 'POST',
              path: '/v1/webhooks',
              description: 'Register a webhook endpoint',
              auth: true,
            },
          ],
        },
        {
          type: 'code',
          language: 'json',
          filename: 'create-payment.json',
          code: `POST /v1/payment_intents
Idempotency-Key: 5f3a-merchant-order-9912
{
  "amount": 4999,                 // integer minor units (= $49.99)
  "currency": "usd",
  "payment_method": "tok_visa_xxx",   // token, never the raw PAN
  "capture_method": "automatic",      // or "manual" (auth now, capture later)
  "confirm": true
}`,
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'The Idempotency-Key header is the contract',
          body: 'Every mutating request carries an `Idempotency-Key`. Amounts are always **integer minor units** to avoid float errors. Status is fetched via GET or pushed via **signed webhooks** — clients must verify the webhook signature and treat delivery as at-least-once (dedupe by event id).',
        },
      ],
    },
    {
      id: 'consistency',
      title: 'Consistency',
      blocks: [
        {
          type: 'markdown',
          value:
            'The ledger demands **strong consistency**: status and balanced entries commit in a single ACID transaction on a relational database (PostgreSQL/Spanner-class). Everything outside that boundary — PSP results, webhooks, reconciliation, reporting replicas — is **eventually consistent** and reconciled back to the ledger truth.',
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Never use floats for money',
          body: 'Floating-point cannot represent many decimal values exactly ($0.10 + $0.20 ≠ $0.30 in float). Always store and compute money as **integer minor units** (cents) or fixed-precision decimals. This is a real, money-losing bug, not a theoretical nicety.',
        },
        {
          type: 'callout',
          variant: 'summary',
          title: 'Strong where it counts, eventual elsewhere',
          body: 'Draw a bright line: the **ledger transaction** is strongly consistent and ACID; PSP calls, notifications, and analytics are async and eventually consistent, made safe by idempotency and reconciliation. This keeps correctness airtight without trying to make the whole world synchronous.',
        },
      ],
    },
    {
      id: 'scaling-strategy',
      title: 'Scaling Strategy',
      blocks: [
        {
          type: 'bestPractices',
          practices: [
            '**Partition the ledger by merchant/account** so writes scale horizontally while staying ACID per partition.',
            '**Stateless payment services** behind a load balancer; state lives in the DB.',
            '**Read replicas** for status checks, dashboards, and reporting (the 10:1 read load).',
            '**Async everything non-critical** (webhooks, emails, analytics) via a durable queue + outbox.',
            '**Keep the hot path short**: risk + auth + ledger; defer the rest.',
            '**Archive old ledger data** to cheaper storage while retaining queryability for audits.',
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Authorization rate is the business metric',
          body: 'Beyond uptime, payments teams obsess over the **authorization success rate** — the percentage of legitimate transactions that get approved. Smart routing, retries on soft declines, and retrying across acquirers can move this by points, which is enormous revenue. Engineering choices here are directly financial.',
        },
      ],
    },
    {
      id: 'availability',
      title: 'Availability',
      blocks: [
        {
          type: 'markdown',
          value:
            "Downtime is lost revenue for every merchant on the platform, so the gateway must be highly available — but **never at the cost of correctness**. Multi-AZ replication, fast failover, and graceful degradation (queue and retry rather than drop) keep it up; the ledger's consistency is preserved through synchronous replication on the critical write.",
        },
        {
          type: 'callout',
          variant: 'summary',
          title: 'Degrade safely',
          body: 'If a PSP is down, fail over to another. If risk scoring is slow, fall back to conservative rules. If a non-critical service (email) is down, queue it. The one thing you never do is record money movement you are unsure about — when in doubt, **reject and let the client retry idempotently**.',
        },
        {
          type: 'youtube',
          videoId: 'olfaWUcyfRA',
          title: 'Designing a payment system (illustrative embed)',
        },
      ],
    },
    {
      id: 'fault-tolerance',
      title: 'Fault Tolerance',
      blocks: [
        {
          type: 'bestPractices',
          practices: [
            '**Idempotency keys** end-to-end so any retry is safe.',
            '**ACID ledger + synchronous replication** so a node loss never loses or corrupts money records.',
            '**Outbox pattern** for events/webhooks so nothing is lost on a crash mid-flow.',
            '**Sagas with compensation** for cross-system failures (void on partial failure).',
            '**Reconciliation** as the ultimate backstop against drift.',
            '**Circuit breakers + multi-acquirer failover** for PSP outages.',
          ],
        },
        {
          type: 'expandable',
          title: 'Example: the outbox pattern for reliable webhooks',
          blocks: [
            {
              type: 'markdown',
              value:
                'Within the **same DB transaction** that writes the ledger, also insert the outbound event into an `outbox` table. A separate publisher polls the outbox and delivers to the webhook/queue, marking rows sent. Because the event and the ledger commit atomically, you can never end up with money moved but the notification lost (or vice versa) — even if the process crashes the instant after commit.',
            },
            {
              type: 'code',
              language: 'sql',
              filename: 'outbox.sql',
              code: `BEGIN;
  INSERT INTO ledger_entries (...) VALUES (...);   -- debit
  INSERT INTO ledger_entries (...) VALUES (...);   -- credit
  UPDATE payments SET status = 'Captured' WHERE id = :id;
  INSERT INTO outbox (event_type, payload, status)
    VALUES ('payment.captured', :json, 'pending'); -- same txn!
COMMIT;
-- A separate publisher delivers pending outbox rows, then marks them sent.`,
            },
          ],
        },
      ],
    },
    {
      id: 'trade-offs',
      title: 'Trade-offs',
      blocks: [
        {
          type: 'table',
          caption: 'Key decisions and what they cost.',
          headers: ['Decision', 'Gain', 'Cost'],
          rows: [
            [
              'CP over AP',
              'Correct, auditable money records',
              'Reject rather than risk on partition',
            ],
            [
              'Double-entry ledger',
              'Provable, balanced, auditable',
              'More writes; rigid discipline',
            ],
            [
              'Idempotency keys',
              'Safe retries, no double-charge',
              'Idempotency store + careful conflict logic',
            ],
            [
              'Saga + compensation',
              'Cross-system consistency',
              'Complex flows, compensations to maintain',
            ],
            [
              'Tokenization/vault',
              'Tiny PCI scope, breach-resilient',
              'Vault infra + key management',
            ],
            ['Reconciliation', 'Catches all drift', 'Batch infra + human exception handling'],
          ],
        },
      ],
    },
    {
      id: 'technology-choices',
      title: 'Technology Choices',
      blocks: [
        {
          type: 'table',
          headers: ['Concern', 'Real-world example'],
          rows: [
            ['Ledger / transactions', 'PostgreSQL / CockroachDB / Spanner'],
            ['Idempotency store', 'Postgres unique key / Redis'],
            ['Async events / outbox', 'Kafka + transactional outbox'],
            ['Card vault / secrets', 'HSM / KMS-backed token vault'],
            ['Orchestration', 'Saga / workflow engine (Temporal)'],
            ['PSP integration', 'Per-acquirer connectors'],
            ['Reporting', 'Read replicas / warehouse'],
          ],
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Why relational, not NoSQL, for the ledger',
          body: "The ledger needs **multi-row ACID transactions** (balanced debit/credit + status, atomically) and strong consistency — exactly what relational databases do best. NoSQL's eventual consistency is a poor fit for money. Use NoSQL/queues for the *peripheral* eventually-consistent parts, not the ledger core.",
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
              question: 'Design a Payment or NEFT processing system.',
              answer:
                'Expose an idempotent transfer API that accepts a client request ID, source/destination, amount, and metadata. Authenticate/authorize, validate limits/beneficiary, reserve or debit funds in a strongly consistent **double-entry ledger**, and persist both state plus an outbox event atomically. A workflow/orchestrator submits to the bank/NEFT connector and tracks `RECEIVED → VALIDATED → SUBMITTED → SETTLED/FAILED/RETURNED`; clients poll status or receive signed webhooks.\n\nUse immutable ledger entries rather than updating balances as the source of truth, unique constraints for idempotency, per-account sequencing/locking to prevent overspend, encrypted PII, maker-checker/risk controls, and complete audit trails. External bank responses are asynchronous and ambiguous, so retry submission only with a stable bank reference, reconcile against acknowledgements/settlement files, and compensate/reverse through new ledger entries—never delete financial history.',
            },
            {
              question: 'How would you handle more than one million transactions per day?',
              answer:
                'One million/day averages only about 12 TPS, so design for the measured peak, bursts, and bank cut-off batches—not the daily total. Keep stateless API instances behind a load balancer, partition workflow/queue processing by account or transfer key where ordering matters, and scale consumers with lag while preserving idempotency.\n\nUse an ACID ledger database with proper indexes and partition/archive strategy, connection-pool limits, outbox/CDC, asynchronous bank connectors, backpressure, and separate read models for dashboards. Define SLOs, load test peak plus retry/reconciliation traffic, monitor queue lag and settlement age, and plan multi-zone failover, RPO/RTO, and replay from durable events.',
            },
            {
              question: 'How do you guarantee a customer is never double-charged?',
              answer:
                'End-to-end **idempotency keys**: the merchant sends a key per operation; the gateway atomically reserves it (unique constraint) and, on any retry with the same key, **replays the stored result** instead of re-executing. For the "timed out but actually succeeded" case, the gateway **queries the PSP by the original network reference** before ever retrying an authorization.',
            },
            {
              question: 'Why a double-entry ledger instead of a balance column?',
              answer:
                'A mutable balance column is unauditable and easy to corrupt. A **double-entry, append-only ledger** records every movement as balanced debits and credits (Σdebits = Σcredits), is **immutable** (corrections are reversing entries), and lets you re-derive any balance or status from history — which is what auditors and regulators require.',
            },
            {
              question: 'CAP: is a payment system AP or CP?',
              answer:
                'Deliberately **CP**. Money correctness outranks availability: during a partition it is better to **reject** a payment (client retries idempotently) than to record an uncertain or duplicate movement. The ledger commits with strong consistency/ACID; only the peripheral concerns (webhooks, reporting) are eventually consistent.',
            },
            {
              question:
                'How do you keep money correct across multiple systems (PSP, ledger, notifications)?',
              answer:
                'Keep the money-critical write (status + balanced ledger entries) in **one ACID transaction**, and coordinate the rest as a **saga** with **compensating actions** (e.g. auth succeeded but ledger failed → void the auth). Use the **transactional outbox** so events/webhooks commit atomically with the ledger and are never lost.',
            },
            {
              question: 'How do you handle PCI compliance and card data?',
              answer:
                '**Tokenize** the PAN at ingress into an isolated, encrypted **vault**; the rest of the platform only ever sees tokens, shrinking PCI scope. Add TLS in transit, KMS encryption at rest, network segmentation of the cardholder-data environment, 3-D Secure for risky payments, least-privilege access, and **never log card data**.',
            },
            {
              question: 'What is reconciliation and why is it essential?',
              answer:
                "Banks confirm reality **asynchronously** via daily settlement files. **Reconciliation** matches every internal ledger transaction against the bank's record, posting adjustments for fee/FX differences and routing unmatched items to an exception queue. It is the backstop that catches the inevitable drift from timeouts and partial failures, so the books truly reflect the money that moved.",
            },
            {
              question: 'How does partial capture work (hotels)?',
              answer:
                'Authorize an **estimated hold** (e.g. room rate × nights + incidentals), then **capture ≤ authorized** amount at checkout for the final bill. Release/void the unused authorization remainder. Ledger: auth creates a hold; each capture posts a settlement entry; remaining auth is reversed so available credit returns to the cardholder.',
            },
            {
              question: 'Chargeback flow and ledger entries?',
              answer:
                'Issuer/network opens a dispute → gateway marks the payment **CHARGEBACK** and posts reversing ledger entries (debit merchant, credit liability/suspense). Representment may re-debit if won; if lost, fees post as separate entries. Never mutate the original capture row — append compensating entries for auditability.',
            },
            {
              question: 'FX conversion and rounding?',
              answer:
                'Convert using a locked rate at auth/capture time, store **both** currencies and the rate on the payment, and compute in **integer minor units** with an explicit rounding mode (usually banker’s or half-up per scheme rules). Post any FX fee as its own ledger line so settlement reconciliation can explain residuals.',
            },
            {
              question: 'Webhook replay attack prevention?',
              answer:
                'Sign payloads with an HMAC (shared secret) or asymmetric signature, include a **timestamp + nonce/event id**, reject stale timestamps, and **dedupe event ids** so replays are no-ops. Always verify signatures before mutating state; serve webhooks only over TLS.',
            },
            {
              question: 'Difference between payment processor, acquirer, issuer, network?',
              answer:
                '**Issuer** is the cardholder’s bank; **acquirer** is the merchant’s bank; **network** (Visa/Mastercard) routes auth/clearing between them; **processor/gateway** is the tech layer merchants call to talk to acquirers/PSPs. One company may wear multiple hats, but the roles are distinct in the money path.',
            },
          ],
        },
      ],
    },
    {
      id: 'references',
      title: 'References',
      blocks: [
        {
          type: 'references',
          items: [
            {
              label: 'Stripe API — idempotent requests',
              url: 'https://docs.stripe.com/api/idempotent_requests',
              source: 'Stripe',
            },
            {
              label: 'Stripe: Payment Intents lifecycle',
              url: 'https://docs.stripe.com/payments/paymentintents/lifecycle',
              source: 'Stripe',
            },
            {
              label: 'Square: Books that balance (double-entry ledger)',
              url: 'https://developer.squareup.com/blog/books-an-immutable-double-entry-accounting-database-service/',
              source: 'Square Engineering',
            },
            {
              label: 'Uber: Money movement and ledger (LedgerStore)',
              url: 'https://www.uber.com/en-IN/blog/money-scale-strong-data-consistency/',
              source: 'Uber Engineering',
            },
            {
              label: 'PCI DSS Quick Reference Guide',
              url: 'https://www.pcisecuritystandards.org/',
              source: 'PCI SSC',
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
          body: '1. **Correctness over scale**: a payment gateway is a CP, trust-first system — never lose, duplicate, or misrecord money.\n2. **Idempotency everywhere**: keys make every retry safe, defeating the "timed out but succeeded" double-charge trap.\n3. **The double-entry ledger is the source of truth**: append-only, balanced, integer minor units, status derived from it.\n4. **ACID locally, saga globally**: commit the ledger atomically; coordinate PSPs/webhooks with sagas, compensation, and the outbox pattern.\n5. **Secure and reconcile**: tokenize card data to shrink PCI scope, and reconcile against bank settlement files to catch the inevitable drift.',
        },
      ],
    },
  ],
};

export default content;
