import{a as e}from"./chunk-Z2TT7ZTL.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"The **Idempotent Consumer** pattern designs message handlers so **processing the same message twice** (or N times) leaves the system in the **same state** as processing it once. Kafka, SQS, and most brokers guarantee **at-least-once delivery** \u2014 consumers crash after handling but before ack, brokers redeliver, and network retries duplicate. Idempotency turns \u201Cduplicate delivery\u201D from a bug into a **no-op**."},{type:"callout",variant:"info",title:"Idempotency vs Inbox",body:"**Idempotent consumer** is the **design goal** \u2014 handlers safe to retry. The **Inbox pattern** is one **implementation**: record `message_id` in the same DB transaction as the business write. Natural keys (`order_id + event_type`) and external **idempotency keys** (Stripe-style) are other approaches."},{type:"table",caption:"Idempotency strategies.",headers:["Strategy","Key source","Best when"],rows:[["Natural key upsert","Business ID in payload","State transitions with clear entity key"],["Idempotency-Key header","Producer-supplied UUID","Payment APIs, REST webhooks"],["Inbox table","Broker message ID or event ID","DB-backed consumers, saga steps"],["Redis SETNX dedupe","Short-TTL message fingerprint","High-throughput, loss-tolerant dedupe window"]]}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"A **bank ATM transfer**: submitting the same confirmation code twice does not debit your account twice \u2014 the core system keys on the **transfer reference number**. Whether the request arrives once or three times from a flaky mobile network, the ledger shows **one** movement."},{type:"mermaid",caption:"Duplicate Kafka delivery: second invocation is a no-op.",definition:`sequenceDiagram
  participant K as Kafka
  participant C as Payment Consumer
  participant DB as Ledger DB

  K->>C: PaymentCaptured (idempotency_key=pay-42)
  C->>DB: INSERT processed_keys (pay-42) + credit merchant
  C->>K: commit offset

  Note over K,C: redelivery after consumer crash
  K->>C: PaymentCaptured (idempotency_key=pay-42)
  C->>DB: INSERT processed_keys (pay-42) \u2014 conflict
  C-->>C: skip business logic, ack offset`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["Payment processing","Stripe `Idempotency-Key` \u2014 duplicate POST returns same charge"],["E-commerce inventory","Kafka `StockReserved` handler keyed by `order_id`"],["Banking transfers","Clearing events processed once per `transfer_ref` despite broker retries"],["Food delivery","Rider-assigned event deduped so one rider per order"],["Saga compensations","`RefundPayment` idempotent on `saga_step_id`"],["Webhook ingestion","Store external event ID before side effects (PayPal, Adyen)"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"Choose a **stable idempotency key** per side effect: broker message ID, business correlation ID, or producer header. Persist the key **atomically** with the mutation (Inbox table) or use **conditional writes** (`UPDATE ... WHERE status = PENDING`). Pair with **Transactional Outbox** on the producer so downstream consumers receive events reliably."},{type:"code",language:"java",filename:"IdempotentPaymentConsumer.java",code:`@Service
public class PaymentCapturedConsumer {
  private final ProcessedMessageRepository processed;
  private final LedgerService ledger;

  @Transactional
  public void onPaymentCaptured(PaymentCapturedEvent event) {
    String key = event.idempotencyKey(); // e.g. payment_id from producer

    boolean firstTime = processed.tryInsert(key, event.type());
    if (!firstTime) {
      log.info("Duplicate delivery ignored: {}", key);
      return;
    }

    ledger.creditMerchant(event.merchantId(), event.amount());
  }
}`},{type:"code",language:"sql",filename:"processed_messages.sql",code:`CREATE TABLE processed_messages (
  idempotency_key VARCHAR(128) PRIMARY KEY,
  event_type      VARCHAR(64) NOT NULL,
  processed_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inbox-style: same TX as business update
-- INSERT processed_messages + UPDATE ledger in one transaction`},{type:"callout",variant:"warning",title:"Not everything is naturally idempotent",body:"**Increment counter** or **send email** are not idempotent without design. Use **dedupe keys**, **outbox-to-inbox** pairing, or move side effects behind idempotent APIs. Saga compensations **must** be idempotent \u2014 pair with the **Inbox pattern** on every consumer."},{type:"prosCons",title:"Trade-offs",pros:["Safe under at-least-once delivery \u2014 the default broker guarantee.","Enables confident retries without double-charging customers.","Works with Kafka consumer groups and competing workers."],cons:["Requires storage for processed keys (growth, retention policy).","Key design mistakes allow duplicates or block legitimate retries.","Non-idempotent side effects (email, SMS) need separate dedupe strategy."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"What makes a consumer idempotent?",answer:"Calling `handle(message)` multiple times with the same logical event produces the **same final state** as once \u2014 typically via **dedupe keys**, upserts, or state checks (`IF status == PENDING THEN ...`)."},{question:"Idempotent consumer vs Inbox pattern?",answer:"**Idempotent consumer** is the **requirement**. **Inbox** is a **table-based implementation** \u2014 insert message ID in the same DB TX as the business update. You can also use Redis dedupe or natural-key upserts without a formal inbox table."},{question:"Where does the idempotency key come from?",answer:"Prefer **producer-assigned** stable IDs (`payment_id`, `Idempotency-Key` header). Fallback: broker **message ID** or hash of `(topic, partition, offset)` \u2014 but offset changes on replay, so business keys are safer."},{question:"Why do Kafka consumers need idempotency?",answer:"Kafka guarantees **at-least-once** with manual commits. Crash after processing but before `commitSync` \u2192 **redelivery**. Consumer groups rebalance and replay. Without idempotency, **duplicate inventory deduction** or **double charges** occur."},{question:"Design idempotent handler for OrderCreated \u2192 reserve stock.",answer:'Key = `order_id + "STOCK_RESERVED"`. In one TX: insert into `processed_messages`, call `inventory.reserve(order_id)` only if order status allows. Duplicate event hits unique constraint \u2192 return without re-reserving.'},{question:"How does this relate to Saga and 2PC?",answer:"**Saga** compensations are async messages \u2014 each consumer must be idempotent. **2PC** avoids duplicate application via locks but does not replace consumer idempotency in event-driven systems after you move to Saga."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Idempotent consumer = **duplicate delivery, same result**.
2. Implement via **idempotency keys**, natural upserts, or **Inbox table**.
3. Essential for **Kafka consumers, payments, saga steps**.
4. Pair with **Transactional Outbox** on producers for end-to-end reliability.`}]}]},a=t;export{a as default};
