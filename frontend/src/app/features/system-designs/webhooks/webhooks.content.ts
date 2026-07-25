import { DesignContent } from '../../../shared/models';
import { WEBHOOKS_META } from './webhooks.meta';

const content: DesignContent = {
  meta: WEBHOOKS_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'A **webhook** is how one system (**provider**) notifies another (**receiver**) in near real time that an event happened—by sending an **HTTP POST** to a registered URL. Instead of your app polling Stripe every few seconds asking “has this payment succeeded?”, Stripe pushes `payment_intent.succeeded` to your endpoint when it does.\n\nPolling does not scale for every order on a large marketplace. Webhooks invert the control: the source of truth pushes; you react.',
        },
        {
          type: 'image',
          src: 'assets/article-images/webhooks/01-polling-vs-webhook.png',
          alt: 'Sequence diagram of an application repeatedly polling Stripe for payment status and getting not yet answers',
          caption:
            'Polling wastes requests while status is unchanged. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'image',
          src: 'assets/article-images/webhooks/02-restaurant-analogy.png',
          alt: 'Restaurant host texts you when a table is ready instead of you asking every two minutes',
          caption:
            'Restaurant analogy: leave your number; they notify you when ready—same idea as webhooks. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
      ],
    },
    {
      id: 'how-it-works',
      title: 'How webhooks work',
      blocks: [
        {
          type: 'markdown',
          value:
            'At a high level: **register** → **event occurs** → **provider POSTs** → **receiver verifies and processes** → **ACK with 2xx**.',
        },
        {
          type: 'image',
          src: 'assets/article-images/webhooks/03-webhook-delivery-flow.png',
          alt: 'Webhook delivery flow from provider event to signed POST and receiver acknowledgement',
          caption:
            'Provider monitors events and POSTs a signed payload to your URL. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'markdown',
          value:
            '**Example: GitHub → your CI app**\n\n1. Register `https://myapp.com/github-webhook` and subscribe to `pull_request`, `push`, etc.\n2. Someone opens a PR; GitHub builds a JSON payload.\n3. GitHub POSTs to your URL with signature headers.\n4. You verify HMAC, enqueue work, return **200 OK**.',
        },
      ],
    },
    {
      id: 'anatomy',
      title: 'Anatomy of a webhook request',
      blocks: [
        {
          type: 'markdown',
          value:
            '**Method:** almost always **POST** (body carries structured JSON). Rarely GET/PUT/PATCH.\n\n**Common headers:**\n\n- `Content-Type: application/json`\n- `User-Agent` — e.g. `Stripe/1.0`, `GitHub-Hookshot`\n- Event type — `X-GitHub-Event`, Stripe `type` in body, etc.\n- **Signature** — `X-Hub-Signature-256`, `Stripe-Signature` (HMAC over raw body + secret)\n- `X-Request-ID` / delivery id — for logging and dedupe\n\n**Bodies (examples):**',
        },
        {
          type: 'code',
          language: 'json',
          filename: 'github-pull-request.json',
          code: `{
  "action": "opened",
  "number": 42,
  "pull_request": {
    "id": 11223344,
    "title": "Add login validation",
    "user": { "login": "octocat" },
    "created_at": "2025-04-21T12:00:00Z"
  },
  "repository": { "full_name": "octocat/awesome-project" },
  "sender": { "login": "octocat" }
}`,
        },
        {
          type: 'code',
          language: 'json',
          filename: 'stripe-payment-intent-succeeded.json',
          code: `{
  "id": "evt_1PoJkD2eZvKYlo2CmOJbvwD9",
  "object": "event",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_3JhdNe2eZvKYlo2C1IqojYg9",
      "amount": 2000,
      "currency": "usd",
      "status": "succeeded"
    }
  }
}`,
        },
      ],
    },
    {
      id: 'receiver-setup',
      title: 'Setting up a webhook receiver',
      blocks: [
        {
          type: 'markdown',
          value:
            'Production receivers must assume **at-least-once** delivery, out-of-order events, brief downtime, and spoofed POSTs.\n\n**Basics**\n\n- Dedicated path: `POST /webhooks/...` over **HTTPS** only\n- Accept JSON; reject wrong methods/content types\n- **Idempotency:** store provider event IDs (`evt_…`, GitHub `X-GitHub-Delivery`); if already processed, return **200** without re-applying effects\n- Status codes: **200** after durable accept; **400** for bad payload; avoid **5xx** unless you truly want a retry (providers retry on 5xx)\n\n**Security**\n\n- Verify **HMAC** signature against the configured secret on the **raw body**\n- Optional IP allowlists (fragile if provider IPs change)\n- Do not log full payloads with PII/secrets; do not return stack traces',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'HmacVerifier.java',
          code: `String expected = hmacSha256(secret, rawBody);
if (!MessageDigest.isEqual(
    expected.getBytes(UTF_8),
    signatureFromHeader.getBytes(UTF_8))) {
  return ResponseEntity.status(403).build();
}`,
        },
      ],
    },
    {
      id: 'scalable-infrastructure',
      title: 'Scalable webhook infrastructure',
      blocks: [
        {
          type: 'markdown',
          value:
            'Do not run heavy business logic inside the HTTP handler. Acknowledge fast; process async.',
        },
        {
          type: 'image',
          src: 'assets/article-images/webhooks/04-scalable-pipeline.png',
          alt: 'Webhook endpoint writing to an event store and Kafka, then background workers updating DB and calling downstream services',
          caption:
            'Validate → persist/enqueue → workers → DB/downstream; keep the HTTP path thin. Diagram adapted from Ashish Pratap Singh / AlgoMaster.',
        },
        {
          type: 'markdown',
          value:
            '1. **Queue** — after signature + schema checks, publish to Kafka / RabbitMQ / SQS; return 200.\n2. **Event store** — persist raw payload, event id, type, status, timestamps for audit and replay.\n3. **Workers** — dedupe by event id, apply domain updates, call downstream APIs.\n4. **Retries** — exponential backoff + jitter; cap attempts.\n5. **DLQ** — poison events after max retries; alert and reprocess manually.\n6. **Observability** — receive rate, success/fail, lag, queue depth, DLQ count; alert on spikes or silent drops.\n\nPayment-domain depth (signed merchant webhooks, outbox): [Payment Gateway](/designs/payment-gateway). Inbox/dedupe patterns: [Inbox](/designs/inbox-pattern), [Idempotent Consumer](/designs/idempotent-consumer).',
        },
      ],
    },
    {
      id: 'java-setup',
      title: 'Java / Spring Boot receiver',
      blocks: [
        {
          type: 'markdown',
          value:
            'Read the **raw body** for HMAC (do not re-serialize JSON before verifying). Persist the event id under a unique constraint, then enqueue.',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'StripeWebhookController.java',
          showLineNumbers: true,
          code: `@RestController
@RequestMapping("/webhooks/stripe")
@RequiredArgsConstructor
public class StripeWebhookController {
  private final WebhookVerifier verifier;
  private final ProcessedEventRepository processed;
  private final ApplicationEventPublisher bus;

  @PostMapping
  public ResponseEntity<Void> receive(
      @RequestHeader("Stripe-Signature") String signature,
      @RequestBody byte[] rawBody) {

    if (!verifier.verifyStripe(rawBody, signature)) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    JsonNode event = objectMapper.readTree(rawBody);
    String eventId = event.get("id").asText();
    String type = event.get("type").asText();

    try {
      processed.insert(eventId, type); // UNIQUE(event_id)
    } catch (DuplicateKeyException ex) {
      return ResponseEntity.ok().build(); // already handled
    }

    bus.publishEvent(new WebhookReceived(eventId, type, rawBody));
    return ResponseEntity.ok().build();
  }
}

// @TransactionalEventListener(phase = AFTER_COMMIT) or queue publisher
// enqueues to Kafka/SQS; workers apply order paid / invoice / packing`,
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'Spring tips',
          body: 'Disable automatic JSON filtering of the body before verify, or use a `ContentCachingRequestWrapper` / `@RequestBody byte[]`. Prefer returning 200 only after the event id is durably stored (same transaction as inbox insert). Process business effects in a worker so provider timeouts do not cause duplicate side effects under retry.',
        },
      ],
    },
    {
      id: 'summary',
      title: 'Summary',
      blocks: [
        {
          type: 'markdown',
          value:
            'Webhooks replace polling with signed HTTP push. Register an HTTPS endpoint, verify HMAC, dedupe by event id, ACK quickly, and process asynchronously with retries, a DLQ, and full observability. In Java, Spring Controllers plus an inbox table and a queue give you a production-grade receiver.',
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Source',
          body: 'Summarized and expanded from Ashish Pratap Singh’s AlgoMaster article “What are Webhooks?” with Spring Boot receiver and pipeline notes for this platform.',
        },
      ],
    },
  ],
};

export default content;
