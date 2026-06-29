import { DesignContent } from '../../../shared/models';
import { NOTIFICATION_SYSTEM_META } from './notification-system.meta';

/**
 * Flagship-depth example (peer of the Netflix, Amazon, etc. designs). An
 * infrastructure design: a multi-channel notification platform that delivers
 * push, SMS, email, and in-app messages at scale — with preferences,
 * templating, deduplication/idempotency, rate limiting, retries, and
 * third-party provider reliability.
 */
const content: DesignContent = {
  meta: NOTIFICATION_SYSTEM_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'A **notification system** is the shared platform that every other service calls to reach a user — "your order shipped", "you have a new follower", an OTP code, a marketing blast. It abstracts away **channels** (push, SMS, email, in-app), **user preferences**, **templating**, and the messy reality of **unreliable third-party providers**, exposing one clean "send a notification" API to the rest of the company.',
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'The big idea',
          body: 'A notification system is a **pipeline**, not a request/response service: accept fast and durably, then process asynchronously through queues to absorb spikes and survive provider outages. The hard parts are not "calling APNs" — they are **idempotency** (never send twice), **preferences/opt-outs** (compliance), **rate limiting** (do not spam), and **graceful degradation** when a provider is down.',
        },
        {
          type: 'image',
          src: 'assets/diagrams/notification-system-architecture.svg',
          alt: 'Notification pipeline: services call the Notification API which validates, dedupes and rate-limits, publishes to Kafka, workers apply preferences and render templates, then per-channel queues feed push/SMS/email senders that deliver to user devices.',
          caption:
            'Ingest → process (preferences, templating) → per-channel fan-out → provider senders → user devices.',
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
            '**Send a notification** to a user across one or more channels (push, SMS, email, in-app).',
            '**Multiple triggers**: transactional (OTP, receipts), scheduled (reminders), and bulk/marketing campaigns.',
            '**User preferences**: per-channel opt-in/opt-out, categories, quiet hours, frequency caps.',
            '**Templating** with variables and **internationalization (i18n)**.',
            '**Deduplication / idempotency**: the same logical event must not notify twice.',
            '**Delivery tracking**: sent, delivered, opened, failed.',
          ],
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Out of scope (state explicitly)',
          body: 'Composing notification *content/copy*, the marketing campaign UI, and advanced analytics/attribution. We focus on the **delivery platform**: accept a request and reliably get it to the right channel honoring preferences.',
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
            'High availability: the send API must accept requests even when downstream providers wobble.',
            'Scalability: absorb bursts of millions of notifications (a campaign, a viral event).',
            'Reliability: at-least-once delivery with idempotency to make it effectively exactly-once for the user.',
            'Low latency for transactional sends (OTP must arrive in seconds).',
            'Extensibility: adding a new channel or provider should be isolated.',
          ],
          cons: [
            'Strict ordering across notifications is NOT required (mostly independent events).',
            'Hard real-time guarantees are NOT required for bulk/marketing (seconds-to-minutes is fine).',
            'Exactly-once *transport* is impossible; we achieve it at the application layer via idempotency.',
          ],
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Two traffic classes, one platform',
          body: "Separate **transactional** (low-volume, latency-critical, must-deliver: OTP, receipts) from **bulk/marketing** (high-volume, latency-tolerant, throttleable). Route them through **separate queues/priorities** so a 10M-recipient campaign never delays someone's login OTP.",
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
            'Assume **500M** users and **2B notifications/day** across all channels, with peaks (a big campaign or breaking-news event) at **10×** the average rate.',
        },
        {
          type: 'metrics',
          items: [
            { label: 'Users', value: '500M', hint: 'addressable' },
            { label: 'Notifications/day', value: '~2B', hint: 'all channels' },
            { label: 'Average rate', value: '~23k/s', hint: '2B / 86,400s' },
            { label: 'Peak rate', value: '~230k/s', hint: '10× burst' },
            { label: 'Avg payload', value: '~1 KB', hint: 'metadata + rendered body' },
            { label: 'Delivery receipts/day', value: '~6B', hint: 'sent+delivered+opened' },
          ],
        },
        {
          type: 'math',
          display: true,
          tex: 'QPS_{avg} = \\frac{2\\times10^{9}}{86{,}400} \\approx 23{,}000/s \\quad\\Rightarrow\\quad QPS_{peak} \\approx 230{,}000/s',
          caption:
            'The queue must buffer the gap between peak arrival (~230k/s) and provider send throughput, which is bounded by provider rate limits.',
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Providers are the bottleneck',
          body: "You cannot push 230k/s straight at SMS/email providers — they enforce **rate limits** (and you pay per message). The queue exists precisely to **decouple ingest rate from send rate**, smoothing bursts and letting workers drain at the provider's allowed pace.",
        },
      ],
    },
    {
      id: 'high-level-architecture',
      title: 'High-Level Architecture',
      blocks: [
        {
          type: 'markdown',
          value:
            'The system is a staged pipeline. The **Notification API** accepts and validates requests, deduplicates, and publishes to a durable log (**Kafka**). **Processing workers** enrich each message: resolve user preferences, drop opted-out channels, render templates, and route to **per-channel queues**. **Channel senders** consume those queues and call the right provider (APNs/FCM, Twilio, SES), handling retries and recording delivery status.',
        },
        {
          type: 'mermaid',
          caption: 'End-to-end notification pipeline.',
          definition: `flowchart TD
  Svc["Producing services / events"] --> API["Notification API\\n(validate, dedupe, rate-limit)"]
  API --> K[("Kafka: notifications")]
  K --> W["Processing workers\\n(preferences, templating, routing)"]
  Pref[("Preferences DB")] -.-> W
  Tpl[("Template store")] -.-> W
  W --> PQ[("Push queue")]
  W --> SQ[("SMS queue")]
  W --> EQ[("Email queue")]
  PQ --> PS["Push sender → APNs/FCM"]
  SQ --> SS["SMS sender → Twilio"]
  EQ --> ES["Email sender → SES"]
  PS --> Dev["Devices / inboxes"]
  SS --> Dev
  ES --> Dev
  PS -.delivery receipt.-> Track[("Tracking store")]
  SS -.-> Track
  ES -.-> Track`,
        },
        {
          type: 'architectureCard',
          title: 'Notification API',
          description:
            'Stateless ingress. Validates the request, enforces idempotency (rejects duplicate dedupe keys), applies coarse rate limits, and publishes durably to Kafka. Returns fast — all heavy work is async.',
          icon: 'server',
          tags: ['stateless', 'idempotency', 'ingest'],
        },
        {
          type: 'architectureCard',
          title: 'Processing Workers',
          description:
            'Consume the Kafka log, hydrate user preferences and device tokens, apply quiet hours / frequency caps, render the localized template, and split into per-channel messages routed to channel queues.',
          icon: 'workflow',
          tags: ['preferences', 'templating', 'routing'],
        },
        {
          type: 'architectureCard',
          title: 'Channel Senders',
          description:
            "One worker pool per channel, each tuned to its provider's rate limits and retry semantics. Translates the canonical message to the provider format, sends, retries with backoff, and emits delivery receipts.",
          icon: 'send',
          tags: ['providers', 'retries', 'rate-limit'],
        },
      ],
    },
    {
      id: 'api-design',
      title: 'API Design',
      blocks: [
        {
          type: 'apiTable',
          title: 'Notification platform API',
          endpoints: [
            {
              method: 'POST',
              path: '/v1/notifications',
              description: 'Send a notification (idempotent via key)',
              auth: true,
            },
            {
              method: 'POST',
              path: '/v1/notifications/batch',
              description: 'Bulk send for a campaign',
              auth: true,
            },
            {
              method: 'GET',
              path: '/v1/notifications/{id}',
              description: 'Status: sent/delivered/opened/failed',
              auth: true,
            },
            {
              method: 'GET',
              path: '/v1/users/{id}/preferences',
              description: "Get a user's channel preferences",
              auth: true,
            },
            {
              method: 'PUT',
              path: '/v1/users/{id}/preferences',
              description: 'Update opt-in/opt-out, quiet hours',
              auth: true,
            },
            {
              method: 'POST',
              path: '/v1/devices',
              description: 'Register a device push token',
              auth: true,
            },
          ],
        },
        {
          type: 'code',
          language: 'json',
          filename: 'send-request.json',
          code: `POST /v1/notifications
{
  "userId": "u_12345",
  "category": "order_updates",
  "templateId": "order_shipped",
  "data": { "orderId": "A-99", "eta": "Jun 30" },
  "channels": ["push", "email"],        // preference order; platform filters by opt-in
  "priority": "transactional",          // or "bulk"
  "dedupeKey": "order_shipped:A-99:u_12345"   // idempotency key
}`,
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'The dedupe key is the contract',
          body: 'Callers pass a **deterministic dedupeKey** derived from the logical event (here `order_shipped:A-99:u_12345`). The platform stores it; a retry with the same key is a no-op. This is what turns an unreliable at-least-once pipeline into "the user sees it once".',
        },
      ],
    },
    {
      id: 'data-model',
      title: 'Data Model',
      blocks: [
        {
          type: 'markdown',
          value:
            'Three core data sets: **user preferences/devices**, **templates**, and **notification records** (for tracking + idempotency). Preferences and templates are read-heavy and cacheable; notification records are append-heavy and time-series-like.',
        },
        {
          type: 'code',
          language: 'sql',
          filename: 'schema.sql',
          highlightLines: [3, 4, 13, 22],
          code: `-- Per-user, per-category channel preferences
CREATE TABLE preferences (
  user_id      BIGINT,
  category     TEXT,             -- order_updates, social, marketing...
  channel      TEXT,             -- push | sms | email | in_app
  enabled      BOOLEAN,
  quiet_start  TIME, quiet_end TIME,
  PRIMARY KEY (user_id, category, channel)
);

CREATE TABLE devices (
  device_id    UUID PRIMARY KEY,
  user_id      BIGINT,
  platform     TEXT,             -- ios | android | web
  push_token   TEXT,             -- APNs/FCM token
  last_seen    TIMESTAMPTZ
);

-- Notification record: tracking + idempotency
CREATE TABLE notifications (
  id           UUID PRIMARY KEY,
  dedupe_key   TEXT UNIQUE,      -- enforces idempotency at the DB
  user_id      BIGINT,
  channel      TEXT,
  status       TEXT,             -- queued|sent|delivered|opened|failed
  created_at   TIMESTAMPTZ,
  updated_at   TIMESTAMPTZ
);`,
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Storage choices',
          body: 'Preferences/devices → a relational or document store (consistency matters for opt-out). Notification records → a wide-column / time-series store (Cassandra) given the append-heavy, high-volume, TTL-able nature. The `dedupe_key` fast path lives in **Redis** (with a DB unique constraint as the durable backstop).',
        },
      ],
    },
    {
      id: 'idempotency',
      title: 'Deduplication & Idempotency',
      blocks: [
        {
          type: 'markdown',
          value:
            'Because every stage is at-least-once (Kafka redelivery, worker crash-and-retry, provider timeouts that actually succeeded), duplicates are inevitable *unless* we deduplicate explicitly. The defense is an **idempotency key** checked at the boundary and again before the actual provider send.',
        },
        {
          type: 'code',
          language: 'python',
          filename: 'dedupe.py',
          highlightLines: [3, 4, 5],
          code: `def accept(req):
    # SET NX: succeeds only if the key does not already exist (atomic).
    first_time = redis.set(f"dedupe:{req.dedupe_key}", "1",
                           nx=True, ex=DEDUPE_TTL)   # e.g. 24h window
    if not first_time:
        return Result.DUPLICATE          # idempotent no-op
    publish_to_kafka(req)
    return Result.ACCEPTED`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Dedupe again before sending',
          body: 'A boundary check is not enough — a worker can crash *after* sending but *before* committing its Kafka offset, then reprocess. Mark a record `sent` atomically (compare-and-set on status) so a redelivered message that was already sent becomes a no-op. Layered dedupe (ingest + pre-send) is what makes it safe.',
        },
      ],
    },
    {
      id: 'preferences-routing',
      title: 'Preferences, Quiet Hours & Routing',
      blocks: [
        {
          type: 'markdown',
          value:
            "Before sending, workers apply the user's rules: is this category opted-in for this channel? Is it currently quiet hours in the user's timezone? Has the frequency cap been hit? Channels are tried in **preference order** with optional fallback (e.g. push fails → email).",
        },
        {
          type: 'mermaid',
          caption: 'Decision flow for a single notification.',
          definition: `flowchart TD
  Start["Notification for user"] --> Opt{Opted in for\\nthis category+channel?}
  Opt -- no --> Drop["Skip channel"]
  Opt -- yes --> Quiet{Quiet hours?}
  Quiet -- yes (and not transactional) --> Defer["Defer until window opens"]
  Quiet -- no --> Cap{Frequency cap hit?}
  Cap -- yes --> Drop2["Suppress (or digest)"]
  Cap -- no --> Send["Enqueue to channel"]`,
        },
        {
          type: 'bestPractices',
          title: 'Routing rules',
          practices: [
            '**Transactional bypasses** quiet hours and most caps (an OTP must go through).',
            '**Channel fallback**: if the highest-priority channel fails or is opted-out, try the next.',
            '**Frequency capping / digesting**: collapse many low-priority events into one digest.',
            '**Compliance**: never send marketing to an opted-out user — opt-out is absolute and audited.',
          ],
        },
      ],
    },
    {
      id: 'templating',
      title: 'Templating & Internationalization',
      blocks: [
        {
          type: 'markdown',
          value:
            "Notifications are rendered from **versioned templates** with variable substitution, localized to the user's language. Keeping content in templates (not in caller code) lets non-engineers iterate on copy and lets the platform A/B test and translate centrally.",
        },
        {
          type: 'code',
          language: 'json',
          filename: 'template.json',
          code: `{
  "id": "order_shipped",
  "version": 7,
  "locales": {
    "en": { "title": "Your order is on the way!",
            "body": "Order {{orderId}} arrives {{eta}}." },
    "es": { "title": "¡Tu pedido está en camino!",
            "body": "El pedido {{orderId}} llega {{eta}}." }
  },
  "channels": { "push": true, "email": true, "sms": false }
}`,
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Render late, cache hard',
          body: 'Resolve the template and locale at the **worker** stage (close to send) so a template fix applies to in-flight notifications. Templates are immutable-versioned and aggressively cached — a template lookup must never be a per-send DB hit at 230k/s.',
        },
      ],
    },
    {
      id: 'channels',
      title: 'Channels & Providers',
      blocks: [
        {
          type: 'markdown',
          value:
            "Each channel has its own provider quirks, latency, cost, and reliability profile. The platform isolates these behind a common sender interface so one channel's outage cannot stall the others.",
        },
        {
          type: 'featureComparison',
          caption: 'Channel characteristics.',
          columns: ['Push', 'SMS', 'Email', 'In-app'],
          rows: [
            { feature: 'Latency', values: ['Seconds', 'Seconds', 'Seconds–min', 'Instant'] },
            { feature: 'Cost per message', values: ['~Free', 'High', 'Low', 'Free'] },
            { feature: 'Needs device token', values: [true, false, false, false] },
            { feature: 'Delivery receipts', values: [true, true, false, true] },
            { feature: 'Third-party provider', values: ['APNs/FCM', 'Twilio', 'SES', 'None'] },
          ],
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Provider abstraction + failover',
          body: 'Wrap each provider behind an adapter and keep **multiple providers per channel** (e.g. two SMS vendors). On elevated error rates, a **circuit breaker** trips and traffic fails over to the backup provider — vendors do have outages, and an OTP system cannot wait for them to recover.',
        },
      ],
    },
    {
      id: 'reliability',
      title: 'Reliability: Retries, DLQ & Backpressure',
      blocks: [
        {
          type: 'markdown',
          value:
            'Sends fail transiently all the time (provider 5xx, timeouts, throttling). The senders retry with **exponential backoff + jitter**, give up after N attempts to a **dead-letter queue (DLQ)**, and respect provider rate limits with a token bucket so we are never throttled into a worse spiral.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'ChannelSender.java',
          highlightLines: [4, 8, 9, 14],
          code: `void send(Message m) {
    for (int attempt = 0; attempt < MAX_RETRIES; attempt++) {
        rateLimiter.acquire();                 // honor provider limit
        try {
            Response r = provider.send(m);
            if (r.isSuccess()) { markSent(m); return; }
            if (!r.isRetryable()) break;       // hard failure → stop
        } catch (TimeoutException e) { /* retry */ }
        sleep(backoffWithJitter(attempt));      // exp backoff + jitter
    }
    deadLetterQueue.publish(m);                  // park for inspection/replay
    markFailed(m);
}`,
        },
        {
          type: 'callout',
          variant: 'warning',
          title: 'Backpressure protects everyone',
          body: 'When a provider slows, do **not** keep piling on — the durable Kafka/queue buffer naturally absorbs the backlog while senders drain at a safe rate. Pair this with a circuit breaker so a dead provider sheds load instead of burning retries, and so transactional traffic on other channels stays healthy.',
        },
        {
          type: 'expandable',
          title: 'Example: DLQ replay',
          blocks: [
            {
              type: 'markdown',
              value:
                'Messages in the DLQ are inspected (bad token? template error? provider down?). Transient causes are **replayed** after the provider recovers; permanent causes (e.g. unregistered device token) trigger **token cleanup** so we stop trying. Always carry the original `dedupeKey` so replays stay idempotent.',
            },
          ],
        },
      ],
    },
    {
      id: 'rate-limiting',
      title: 'Rate Limiting & Throttling',
      blocks: [
        {
          type: 'markdown',
          value:
            'Two distinct concerns: **provider-side** limits (do not exceed Twilio/SES allowances) and **user-side** limits (do not spam one user). Both use **token-bucket** counters, typically in Redis for the distributed case.',
        },
        {
          type: 'bestPractices',
          practices: [
            '**Per-provider** token bucket so total send rate stays under contractual limits.',
            '**Per-user frequency cap** (e.g. max N marketing messages/day) to prevent fatigue.',
            '**Per-category** caps so one chatty feature cannot drown out the rest.',
            '**Priority lanes**: transactional traffic gets dedicated capacity, isolated from bulk.',
          ],
        },
        {
          type: 'math',
          display: true,
          tex: '\\text{tokens}(t) = \\min\\big(B,\\ \\text{tokens}(t_0) + r\\,(t - t_0)\\big)',
          caption:
            'Token bucket: refill at rate r up to burst capacity B; a send is allowed only if a token is available — smoothing bursts to the provider.',
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
            '**Stateless API + workers** scale horizontally behind autoscaling on queue depth.',
            '**Partition Kafka** by user (or category) so a hot campaign spreads across partitions.',
            '**Separate pipelines/priorities** for transactional vs bulk so big campaigns never delay OTPs.',
            '**Cache preferences/templates/device tokens** to keep per-send DB hits near zero.',
            '**Per-channel scaling**: scale email senders independently of push senders.',
            '**Batch where providers allow** (SES/FCM multicast) to cut overhead and cost.',
          ],
        },
        {
          type: 'callout',
          variant: 'info',
          title: 'Queue depth is the scaling signal',
          body: 'Autoscale workers on **consumer lag / queue depth**, not CPU. Rising lag means arrival outpaces send capacity — add workers (up to provider limits). When a provider caps you, lag is expected and the buffer is doing its job; alarm on *sustained* unbounded growth, not transient spikes.',
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
            'The ingest path must stay up even when everything downstream is degraded. As long as the API can validate and durably enqueue, no notification is lost — workers and senders catch up later. This "accept durably, process later" design is what makes the platform resilient.',
        },
        {
          type: 'callout',
          variant: 'summary',
          title: 'Degrade gracefully',
          body: 'A provider outage degrades *one channel*, not the platform: traffic fails over to a backup provider or falls back to another channel, and worst case parks in the buffer/DLQ for replay. The user might get an email instead of an SMS — but the notification is never silently dropped.',
        },
        {
          type: 'youtube',
          videoId: 'bBTPZ9NdSk8',
          title: 'Designing a notification system (illustrative embed)',
        },
      ],
    },
    {
      id: 'tracking',
      title: 'Delivery Tracking & Analytics',
      blocks: [
        {
          type: 'markdown',
          value:
            'Each notification moves through a status lifecycle. Providers send **delivery receipts** (and webhooks for opens/clicks) that update the record asynchronously. This powers debugging ("did my OTP send?"), provider SLA monitoring, and engagement analytics.',
        },
        {
          type: 'mermaid',
          caption: 'Notification status lifecycle.',
          definition: `stateDiagram-v2
  [*] --> Queued
  Queued --> Sent: handed to provider
  Sent --> Delivered: provider receipt
  Sent --> Failed: hard error / no token
  Delivered --> Opened: user engagement
  Failed --> [*]
  Opened --> [*]`,
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Receipts are asynchronous + lossy',
          body: '"Sent" means handed to the provider, not seen by the user. Delivered/opened arrive later via webhooks and some channels (email) never confirm delivery. Treat tracking as **best-effort eventual** data, and reconcile via provider webhooks rather than blocking the send path on receipts.',
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
            '**Durable queue (Kafka)** so a worker/provider crash never loses an accepted notification.',
            '**At-least-once + idempotency keys** = effectively exactly-once for the user.',
            '**Retries with backoff + DLQ** for transient provider failures; replay after recovery.',
            '**Circuit breakers + multi-provider failover** per channel.',
            '**Priority isolation** so a campaign or a dead provider cannot starve transactional sends.',
            '**Dead token cleanup** so permanent failures stop wasting send attempts.',
          ],
        },
        {
          type: 'callout',
          variant: 'danger',
          title: 'The duplicate-OTP nightmare',
          body: 'Without layered idempotency, a single retried event can send a user five identical OTP SMS (each costing money and eroding trust) or, worse, five "your account was charged" alerts. Idempotency is not a nice-to-have here — it is the core correctness guarantee of the whole platform.',
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
              'Async queue pipeline',
              'Absorbs bursts, survives outages',
              'Eventual delivery, more moving parts',
            ],
            [
              'At-least-once + dedupe',
              'No lost or duplicate sends',
              'Dedupe store + careful CAS logic',
            ],
            ['Per-channel queues', 'Isolation, independent scaling', 'More infra to operate'],
            [
              'Transactional/bulk split',
              'OTPs never blocked by campaigns',
              'Duplicated pipeline config',
            ],
            [
              'Multi-provider failover',
              'Survives vendor outages',
              'Integration + reconciliation complexity',
            ],
            [
              'Render templates at worker',
              'Late fixes, central i18n',
              'Hot template cache required',
            ],
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
            ['Durable queue / log', 'Apache Kafka'],
            ['Per-channel queues', 'Kafka topics / SQS'],
            ['Dedupe + rate limit', 'Redis (SET NX, token bucket)'],
            ['Preferences / devices', 'PostgreSQL / DynamoDB'],
            ['Notification records', 'Cassandra (append-heavy, TTL)'],
            ['Push', 'APNs (iOS), FCM (Android/web)'],
            ['SMS', 'Twilio / SNS'],
            ['Email', 'Amazon SES / SendGrid'],
            ['Circuit breaking', 'Resilience4j / Envoy'],
          ],
        },
        {
          type: 'code',
          language: 'yaml',
          filename: 'pipelines.yaml',
          code: `pipelines:
  transactional:
    kafka: notif.txn          # dedicated topic + worker pool
    priority: high
    quietHoursBypass: true
    providers: { sms: [twilio, sns], push: [apns, fcm] }
  bulk:
    kafka: notif.bulk
    priority: low
    rateLimit: { perUserPerDay: 5 }
    providers: { email: [ses, sendgrid] }
dlq: notif.dlq
dedupe: { store: redis, ttl: 24h }`,
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
              question: 'How do you guarantee a user is not notified twice?',
              answer:
                'Use a **deterministic idempotency/dedupe key** per logical event. Check it atomically at ingest (`SET NX` in Redis, with a DB unique constraint as backstop) and **again before the provider send** via a compare-and-set on status. Layered dedupe turns an at-least-once pipeline into effectively exactly-once for the user.',
            },
            {
              question: 'How do you keep a 10M-recipient campaign from delaying OTPs?',
              answer:
                '**Separate the pipelines**: distinct Kafka topics/queues and worker pools for transactional vs bulk, with transactional given priority and dedicated capacity. Bulk is rate-limited and latency-tolerant; transactional bypasses quiet hours and frequency caps. Physical isolation prevents head-of-line blocking.',
            },
            {
              question: 'How do you handle an unreliable third-party provider?',
              answer:
                'Wrap each provider behind an adapter, retry transient failures with **exponential backoff + jitter**, park exhausted messages in a **DLQ** for replay, and run a **circuit breaker** that fails over to a **backup provider** when error rates spike. The durable buffer absorbs the backlog meanwhile.',
            },
            {
              question: 'Why async/queue-based instead of synchronous sends?',
              answer:
                'Providers are slow, rate-limited, and flaky, and traffic is bursty (10× peaks). A durable queue **decouples ingest from send**, absorbs spikes, smooths to provider limits, survives downstream outages, and enables retries/DLQ. The API can accept in milliseconds while delivery happens in the background.',
            },
            {
              question: 'How do you respect user preferences and quiet hours?',
              answer:
                "Workers resolve per-user, per-category, per-channel opt-in, **quiet hours in the user's timezone**, and **frequency caps** before enqueuing to a channel. Transactional messages bypass quiet hours/caps; marketing strictly honors opt-out (audited for compliance). Low-priority events can be collapsed into a digest.",
            },
            {
              question: 'What does "delivered" actually mean, and how do you track it?',
              answer:
                '"Sent" = handed to the provider; "delivered/opened" come later via provider **webhooks/receipts** and update the record asynchronously. Some channels (email) never confirm delivery. Treat tracking as **best-effort eventual** data; never block the send path waiting on a receipt.',
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
              label: 'Apple Push Notification service (APNs)',
              url: 'https://developer.apple.com/documentation/usernotifications',
              source: 'Apple',
            },
            {
              label: 'Firebase Cloud Messaging (FCM)',
              url: 'https://firebase.google.com/docs/cloud-messaging',
              source: 'Google',
            },
            {
              label: 'Amazon SES — sending at scale',
              url: 'https://docs.aws.amazon.com/ses/latest/dg/Welcome.html',
              source: 'AWS',
            },
            {
              label: 'Pinterest: building a scalable notification system',
              url: 'https://medium.com/pinterest-engineering/building-a-real-time-user-action-counting-system-for-ads-88a60d9c9a',
              source: 'Pinterest Engineering',
            },
            {
              label: 'Uber: how Uber sends push notifications',
              url: 'https://www.uber.com/en-IN/blog/real-time-push-platform/',
              source: 'Uber Engineering',
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
          body: '1. **It is a pipeline, not a service**: accept durably to a queue (Kafka), then process and deliver asynchronously to absorb bursts and survive provider outages.\n2. **Idempotency is the core guarantee**: deterministic dedupe keys, checked at ingest and again before send, make an at-least-once system feel exactly-once.\n3. **Honor the user**: preferences, quiet hours, frequency caps, and absolute opt-out — with transactional traffic bypassing where appropriate.\n4. **Isolate everything**: per-channel queues, transactional/bulk separation, and multi-provider failover so one failure never cascades.\n5. **Providers are the bottleneck**: rate-limit with token buckets, retry with backoff + DLQ, and let the durable buffer smooth traffic to what providers can accept.',
        },
      ],
    },
  ],
};

export default content;
