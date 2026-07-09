import{a as e}from"./chunk-ZT2FUDSJ.js";import"./chunk-IFGU66OU.js";var s={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"The **Competing Consumers** pattern connects **multiple worker instances** to the **same message queue** so messages are distributed across the pool. Each message is processed by **exactly one** consumer at a time, enabling **horizontal scale-out** of CPU-bound or I/O-bound handlers without duplicate parallel work on the same item."},{type:"callout",variant:"info",title:"Queue vs pub/sub",body:"In a **queue**, one consumer wins each message (competing consumers). In **pub/sub**, every subscriber gets a copy. Use competing consumers when work items are **tasks to complete once** \u2014 order fulfillment, image resize, fraud scoring."},{type:"table",caption:"Platform mappings.",headers:["Platform","Competing consumer mechanism"],rows:[["Apache Kafka","Consumer group \u2014 partitions assigned one consumer each"],["Amazon SQS","Multiple pollers on one queue; visibility timeout locks message"],["RabbitMQ","Multiple subscribers on same queue name"],["Azure Service Bus","Competing receivers on queue or subscription"]]}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"A **food delivery kitchen ticket rail**: many cooks pull the next order ticket. Each ticket is handled by **one** cook \u2014 not every cook making the same burger. Adding cooks (**consumers**) speeds throughput until the ticket rail (**queue/partition count**) becomes the bottleneck."},{type:"mermaid",caption:"Three workers compete for messages from one queue.",definition:`flowchart LR
  Q[(Order Queue)]
  W1[Worker 1]
  W2[Worker 2]
  W3[Worker 3]

  Q -->|msg A| W1
  Q -->|msg B| W2
  Q -->|msg C| W3
  Q -->|msg D| W1

  subgraph group [Competing Consumer Group]
    W1
    W2
    W3
  end`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["E-commerce fulfillment","SQS workers scale pick-pack-ship tasks during flash sales"],["Kafka stream processing","Consumer group `fraud-scoring` with 12 instances across partitions"],["Food delivery","Dispatch workers consume `AssignRider` jobs from a shared queue"],["Banking notifications","Email/SMS senders pull from `notifications` queue with autoscaling"],["Image / ML pipelines","Resize workers compete on `media-jobs` SQS queue"],["Webhook delivery","Multiple deliverers retry outbound HTTP with per-message visibility lock"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"Scale consumers up to **partition count** (Kafka) or until queue depth stabilizes (SQS). Handlers **must be idempotent** \u2014 competing consumers plus at-least-once delivery means duplicates after crash or visibility timeout expiry. Use the **Idempotent Consumer** pattern or **Inbox** dedupe. Tune **prefetch**, **max poll records**, and **visibility timeout** to balance throughput vs duplicate risk."},{type:"code",language:"java",filename:"KafkaCompetingConsumers.java",code:`@KafkaListener(
    topics = "order-fulfillment",
    groupId = "fulfillment-workers",  // same groupId = competing consumers
    concurrency = "6"
)
public class FulfillmentConsumer {

  private final IdempotentHandler handler;

  public void onMessage(OrderFulfillmentEvent event,
                        @Header(KafkaHeaders.RECEIVED_KEY) String key) {
    handler.processOnce(event.idempotencyKey(), () -> {
      warehouse.pickAndPack(event.orderId());
      shipping.createLabel(event.orderId());
    });
  }
}`},{type:"code",language:"java",filename:"SqsCompetingPoller.java",code:`@Scheduled(fixedDelay = 100)
public void pollOrders() {
  ReceiveMessageResponse batch = sqs.receiveMessage(ReceiveMessageRequest.builder()
      .queueUrl(orderQueueUrl)
      .maxNumberOfMessages(10)
      .waitTimeSeconds(20)           // long polling
      .visibilityTimeout(60)         // lock while processing
      .build());

  for (Message msg : batch.messages()) {
    executor.submit(() -> {
      try {
        processOrder(msg.body());
        sqs.deleteMessage(orderQueueUrl, msg.receiptHandle());
      } catch (Exception ex) {
        // message becomes visible again for another competing consumer
        log.warn("Processing failed, will retry: {}", msg.messageId());
      }
    });
  }
}`},{type:"callout",variant:"warning",title:"Ordering and hotspots",body:"Competing consumers **lose global FIFO** unless you use **partition keys** (Kafka) or FIFO queues with message groups. One hot key (celebrity product drop) can saturate a single partition \u2014 design key sharding and **idempotent** handlers accordingly."},{type:"prosCons",title:"Trade-offs",pros:["Linear throughput scaling by adding worker instances.","Simple ops model \u2014 same code, more replicas.","Natural fit for bursty e-commerce and batch workloads."],cons:["Max parallelism bounded by partitions (Kafka) or broker limits.","At-least-once delivery requires idempotent consumers.","Harder to debug ordering across competing workers without key-based routing."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"What is the competing consumers pattern?",answer:"Multiple **worker instances** read from the **same queue**; each message goes to **one** worker. Scales processing horizontally \u2014 classic **work queue** pattern."},{question:"How do Kafka consumer groups implement competing consumers?",answer:"Consumers sharing a **`group.id`** coordinate partition assignment. Each partition is consumed by **at most one** consumer in the group at a time. Add consumers until you hit **partition count**."},{question:"SQS visibility timeout vs competing consumers?",answer:"When a consumer receives a message, it is **hidden** for the visibility timeout. If not deleted before expiry, **another competing poller** may receive it \u2014 hence **idempotent** handlers are mandatory."},{question:"Competing consumers vs pub/sub?",answer:"**Competing**: one winner per message \u2014 **task queue**. **Pub/sub**: all subscribers get a copy \u2014 **event notification**. Checkout emails might be pub/sub; packing a box is competing consumers."},{question:"How many consumers should you run for 24 Kafka partitions?",answer:"Up to **24 active consumers** in one group (one per partition). A 25th consumer **idles**. Need more parallelism? **Increase partitions** (with rebalancing trade-offs) or split into multiple topics."},{question:"Why pair competing consumers with idempotent consumer?",answer:"Workers crash, visibility timeouts expire, and offsets replay \u2014 the **same message** may be processed twice by **different** workers. **Idempotency keys** or the **Inbox pattern** prevent double side effects."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Competing consumers = **many workers, one queue**, each message handled once.
2. **Kafka consumer groups** and **SQS pollers** are the canonical implementations.
3. Scale for **e-commerce fulfillment, banking jobs, media pipelines**.
4. Always implement **idempotent consumers** \u2014 duplicates are inevitable at scale.`}]}]},t=s;export{t as default};
