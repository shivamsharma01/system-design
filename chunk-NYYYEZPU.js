import{a as e}from"./chunk-KMGJ4U3J.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"The **Dead Letter Channel (DLQ)** is a dedicated destination for messages that **cannot be processed successfully** after retries \u2014 poison payloads, schema mismatches, or persistent downstream failures. Instead of blocking the queue or losing data, failed messages land in the DLQ for **inspection, fix, and replay**."},{type:"callout",variant:"info",title:"Core idea",body:"Main queue keeps moving; bad messages are **quarantined**. Operators or tooling replay to the primary channel after fixing code or data."},{type:"table",caption:"Failure categories.",headers:["Category","Example DLQ candidate"],rows:[["Poison message","JSON that always throws on parse"],["Business rejection","Unknown SKU \u2014 retry will never succeed"],["Transient exhausted","Downstream DB down after max retries"],["Validation","Missing required correlation ID"]]}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"**Returned mail at the post office**: letters that cannot be delivered go to a **dead letter office** instead of blocking the whole delivery truck. Clerks investigate, update addresses, and resend \u2014 the main route keeps running."},{type:"mermaid",caption:"Failed messages route to DLQ after retries.",definition:`flowchart LR
  Q[Main Queue] --> C[Consumer]
  C -->|success| OK[Ack / Commit]
  C -->|fail + retries left| Q
  C -->|fail + max retries| DLQ[Dead Letter Queue]
  DLQ --> Ops[Inspect / Fix / Replay]`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["AWS SQS","Redrive policy sends to DLQ after N receives"],["Kafka","Manual DLQ topic + consumer error handler, or Kafka Connect errors"],["RabbitMQ","Dead-letter exchange with TTL and retry queues"],["Payment processing","Failed captures quarantined for manual reconciliation"],["Order fulfillment","Invalid address orders in DLQ for support fix"],["Event ingestion","Schema validation failures to quarantine topic"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"Configure **max retries** with exponential backoff for transient errors. Send **only non-retryable** or **exhausted** messages to DLQ. Enrich DLQ payloads with **error reason, stack trace, original headers**, and timestamp for debugging."},{type:"code",language:"java",filename:"DlqConsumer.java",code:`@Component
public class OrderConsumer {
  private static final int MAX_ATTEMPTS = 5;
  private final SqsClient sqs;

  public void handle(Message msg) {
    int attempt = Integer.parseInt(msg.attributes().get("ApproximateReceiveCount"));
    try {
      process(parse(msg.body()));
      sqs.deleteMessage(deleteRequest(msg));
    } catch (NonRetryableException e) {
      sendToDlq(msg, e, "NON_RETRYABLE");
      sqs.deleteMessage(deleteRequest(msg));
    } catch (Exception e) {
      if (attempt >= MAX_ATTEMPTS) {
        sendToDlq(msg, e, "MAX_RETRIES");
        sqs.deleteMessage(deleteRequest(msg));
      }
      // else: visibility timeout \u2192 automatic retry
    }
  }

  private void sendToDlq(Message msg, Exception e, String reason) {
    DlqEnvelope envelope = new DlqEnvelope(msg.body(), reason, e.getMessage(), Instant.now());
    sqs.sendMessage(SendMessageRequest.builder()
        .queueUrl(dlqUrl).messageBody(toJson(envelope)).build());
  }
}`},{type:"callout",variant:"warning",title:"DLQ is not a junk drawer",body:"Alert on **DLQ depth**. Unbounded growth means silent business loss. Define replay runbooks and idempotent consumers before re-driving traffic."},{type:"prosCons",title:"Trade-offs",pros:["Protects main queue throughput from poison messages.","Preserves failed payloads for forensic analysis.","Enables controlled replay after fixes."],cons:["Requires operational discipline \u2014 DLQs need owners.","Replay can duplicate if not idempotent.","Kafka lacks native DLQ \u2014 you implement it."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"When should a message go to DLQ vs retry?",answer:"**Retry** transient failures (network, 503). **DLQ** when success is impossible (bad schema) or retries are **exhausted**."},{question:"How does SQS DLQ work?",answer:"Set **maxReceiveCount** on source queue; redrive policy points to DLQ. After N failed receives, message moves automatically."},{question:"Kafka DLQ pattern?",answer:"Consumer catches exception \u2192 publish to `<topic>.dlq` with error metadata \u2192 commit offset on main partition. Some use separate retry topics with delay."},{question:"How do you replay safely?",answer:"Fix root cause, **drain DLQ** to main topic with rate limit, ensure **idempotent** handlers (dedupe by message ID), monitor error rate."},{question:"DLQ vs parking lot?",answer:"Similar \u2014 **parking lot** often implies manual triage queue. DLQ is the integration pattern name; both quarantine problematic messages."},{question:"What metrics matter?",answer:"DLQ **depth**, **ingress rate**, age of oldest message, replay success rate, ratio of DLQ to main queue volume."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. **Quarantine** failed messages after retries \u2014 do not block the main flow.
2. Real uses: **SQS DLQ, Kafka error topics, payment exceptions**.
3. Alert, investigate, **idempotent replay**.
4. Distinguish **transient** (retry) vs **poison** (DLQ).`}]}]},s=t;export{s as default};
