import{a as e}from"./chunk-5QB2NJTR.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"**Retry with Exponential Backoff** re-attempts **transient failures** (network blips, 503, throttling) with **increasing delays** between tries. **Jitter** randomizes wait times so many clients do not retry in sync (**thundering herd**). Always cap **max attempts** and require **idempotency** for mutating operations."},{type:"callout",variant:"info",title:"Retry vs fail-fast",body:"**Retry**: worth it when errors are likely transient and the operation is **idempotent**. **Fail-fast**: permanent errors (400, validation) or when the dependency is known down (circuit open) \u2014 retrying amplifies load."},{type:"table",caption:"Backoff parameters.",headers:["Parameter","Purpose"],rows:[["Initial delay","First wait after failure (e.g. 100ms)"],["Multiplier","Exponential growth (\xD72 each attempt)"],["Max delay","Ceiling so waits do not reach minutes"],["Jitter","Random \xB1% spread to desynchronize clients"],["Max attempts","Stop after N tries \u2192 DLQ or error to user"]]}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"Calling a **busy restaurant** to book a table: you do not redial every second (hammering the line). You wait 1 minute, then 2, then 4 \u2014 and if many people call at once, everyone picks a **slightly different moment** (jitter) so the phone line can recover."},{type:"mermaid",caption:"Delays grow exponentially; jitter spreads retry waves.",definition:`sequenceDiagram
  participant C as Checkout Service
  participant P as Payment API
  C->>P: charge (attempt 1)
  P-->>C: 503 Service Unavailable
  Note over C: wait 200ms + jitter
  C->>P: charge (attempt 2)
  P-->>C: 503
  Note over C: wait 400ms + jitter
  C->>P: charge (attempt 3)
  P-->>C: 200 OK`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["E-commerce checkout","Retry payment auth on 503 with idempotency key \u2014 never double-charge"],["Food delivery","Retry dispatch assignment when rider-matching service times out"],["Payments","Stripe/AWS SDK built-in exponential backoff on rate limits and connection resets"],["Netflix-style microservices","Idempotent POST with `Idempotency-Key` header and bounded retries"],["Message consumers","SQS visibility timeout + backoff before re-processing transient DB errors"],["gRPC / Envoy","Retry policies on `UNAVAILABLE` with max attempts and per-try timeout"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"Only retry **idempotent** operations or those protected by an **idempotency key** stored server-side. Retry **timeouts and connect errors**; do not retry **4xx business failures**. Combine with **circuit breaker** so you do not retry into an open circuit."},{type:"code",language:"java",filename:"ExponentialBackoffRetry.java",code:`import io.github.resilience4j.retry.Retry;
import io.github.resilience4j.retry.RetryConfig;
import java.util.concurrent.ThreadLocalRandom;

public class PaymentClient {
  private final Retry retry;
  private final HttpClient http;

  public PaymentClient() {
    RetryConfig config = RetryConfig.custom()
        .maxAttempts(4)
        .intervalFunction(attempt ->
            (long) Math.min(200 * Math.pow(2, attempt - 1), 5000))
        .retryOnException(e -> e instanceof TransientPaymentException)
        .build();
    this.retry = Retry.of("payment-charge", config);
    this.http = HttpClient.newHttpClient();
  }

  public Receipt charge(String idempotencyKey, Money amount) {
    return Retry.decorateSupplier(retry, () -> {
      HttpRequest req = HttpRequest.newBuilder()
          .uri(URI.create("https://payments.internal/charge"))
          .header("Idempotency-Key", idempotencyKey)
          .timeout(Duration.ofMillis(800))
          .POST(HttpRequest.BodyPublishers.ofString(toJson(amount)))
          .build();
      HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
      if (res.statusCode() == 503 || res.statusCode() == 429) {
        throw new TransientPaymentException("retryable " + res.statusCode());
      }
      if (res.statusCode() >= 400) {
        throw new PermanentPaymentException("do not retry");
      }
      return Receipt.parse(res.body());
    }).get();
  }

  static long withJitter(long baseMs) {
    double factor = 0.5 + ThreadLocalRandom.current().nextDouble();
    return (long) (baseMs * factor);
  }
}`},{type:"code",language:"yaml",filename:"retry-policy.yaml",code:`resilience4j.retry:
  instances:
    payment-charge:
      maxAttempts: 4
      waitDuration: 200ms
      enableExponentialBackoff: true
      exponentialBackoffMultiplier: 2
      exponentialMaxWaitDuration: 5s
      enableRandomizedWait: true
      randomizedWaitFactor: 0.5
      retryExceptions:
        - java.net.SocketTimeoutException
        - com.example.TransientPaymentException`},{type:"callout",variant:"warning",title:"Retry without idempotency",body:"Retrying a **non-idempotent** `POST /transfer` can **double-charge** a customer. Use idempotency keys, dedupe tables, or move to at-least-once messaging with idempotent consumers."},{type:"prosCons",title:"Trade-offs",pros:["Smooths over brief network and dependency blips.","Improves success rate without user-visible errors.","Standard in cloud SDKs and resilient clients."],cons:["Increases tail latency (sum of backoff waits).","Uncapped retries worsen outages (retry storm).","Dangerous without idempotency on writes."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"Why exponential backoff instead of fixed intervals?",answer:"Fixed rapid retries **hammer** a recovering service. Exponential growth gives the dependency **breathing room** while still attempting again soon at first."},{question:"What is jitter and why add it?",answer:"**Random variation** on wait time. Without jitter, thousands of clients retry at the same instant after identical delays \u2014 a **thundering herd** that can re-overwhelm the service."},{question:"When should you NOT retry?",answer:"**4xx business errors** (invalid card), **circuit breaker open**, operations that are **not idempotent** without dedupe, and when total deadline budget is exhausted."},{question:"How do idempotency keys work in payments?",answer:"Client sends `Idempotency-Key: uuid` on charge. Server stores result keyed by that ID \u2014 duplicate retries return the **same receipt** without a second capture."},{question:"Retry vs fail-fast in checkout?",answer:"**Retry** transient 503 from payment gateway (2\u20134 attempts with backoff). **Fail-fast** on declined card or fraud block \u2014 user must fix input, not the system."},{question:"Max attempts \u2014 how do you choose?",answer:"Balance **user wait budget** (e.g. 3s total) against recovery time. Typical: 3\u20135 attempts with capped max delay. After exhaustion \u2192 error, DLQ, or async completion."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Retry **transient** failures with **exponential backoff + jitter**.
2. Always set **max attempts**; use **idempotency keys** for writes.
3. Real uses: **payment SDKs, SQS consumers, Resilience4j**.
4. Do not retry into an **open circuit** or on **permanent errors** \u2014 fail fast instead.`}]}]},i=t;export{i as default};
