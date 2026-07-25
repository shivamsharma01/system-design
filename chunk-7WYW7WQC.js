import{a as e}from"./chunk-HDWKAQGP.js";import"./chunk-IFGU66OU.js";var s={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:`A **message queue** is an intermediary that holds messages from **producers** until **consumers** retrieve them. Producers and consumers need not know each other or be online at the same time \u2014 that **decoupling** is the core value.

Deeper pattern pages: [Publish-Subscribe](/designs/publish-subscribe), [Competing Consumers](/designs/competing-consumers), [Delivery Semantics](/designs/delivery-semantics), [Dead Letter Channel](/designs/dead-letter-channel), [Kafka Interview](/designs/kafka-interview).`}]},{id:"components",title:"Core Components",blocks:[{type:"image",src:"assets/article-images/message-queues/01-core-components.png",alt:"Message queue core components: producer, queue/broker, consumer, and message",caption:"Producer, consumer, queue, broker, and message. Diagram adapted from Ashish Pratap Singh / AlgoMaster."},{type:"markdown",value:`1. **Producer / publisher** \u2014 sends messages without waiting on consumers.
2. **Consumer / subscriber** \u2014 pulls (or is pushed) messages and processes them.
3. **Queue** \u2014 stores messages until consumed.
4. **Broker / queue manager** \u2014 routes, persists, and delivers (RabbitMQ, Kafka, SQS, \u2026).
5. **Message** \u2014 payload plus metadata (headers, timestamp, priority, correlation id).`}]},{id:"workflow",title:"How Message Queues Work",blocks:[{type:"image",src:"assets/article-images/message-queues/02-workflow.png",alt:"Message queue workflow from enqueue through store, dequeue, ack, and delete",caption:"Create \u2192 enqueue \u2192 store \u2192 dequeue \u2192 ack \u2192 delete. Diagram adapted from Ashish Pratap Singh / AlgoMaster."},{type:"markdown",value:`1. **Create** \u2014 producer builds payload + metadata.
2. **Enqueue** \u2014 message lands on the broker.
3. **Store** \u2014 transient (memory) or durable (disk / replication).
4. **Dequeue** \u2014 consumer receives the message (ordered, priority, or parallel).
5. **Acknowledge** \u2014 consumer confirms successful processing.
6. **Delete** \u2014 broker removes the message so it is not redelivered (unless at-least-once retries).`}]},{id:"types",title:"Types of Queues",blocks:[{type:"image",src:"assets/article-images/message-queues/03-p2p-vs-pubsub.png",alt:"Point-to-point queue versus publish-subscribe topic with multiple subscribers",caption:"P2P (one consumer) vs Pub/Sub (many subscribers). Diagram adapted from Ashish Pratap Singh / AlgoMaster."},{type:"markdown",value:`- **Point-to-point (P2P)** \u2014 each message is processed by **one** consumer (task workers).
- **Publish/Subscribe** \u2014 publish to a **topic**; every subscriber gets a copy (notifications, events).
- **Priority queue** \u2014 higher-priority messages jump ahead.
- **Dead letter queue (DLQ)** \u2014 poison / exhausted-retry messages land here for inspection.`},{type:"image",src:"assets/article-images/message-queues/04-priority-dlq.png",alt:"Priority queue ordering and dead letter queue for failed messages",caption:"Priority ordering and DLQ for failed messages. Diagram adapted from Ashish Pratap Singh / AlgoMaster."}]},{id:"advantages",title:"Advantages",blocks:[{type:"bestPractices",title:"Why teams adopt queues",practices:["**Decoupling** \u2014 producers and consumers evolve independently.","**Async processing** \u2014 producers return immediately; work happens later.","**Load balancing** \u2014 competing consumers share work.","**Durability / retries** \u2014 persist + redelivery survive crashes.","**Scalability** \u2014 add consumers horizontally.","**Throttling / load leveling** \u2014 absorb spikes without melting the DB."]}]},{id:"when-to-use",title:"When to Use",blocks:[{type:"markdown",value:`| Scenario | Why a queue helps |
|---|---|
| **Microservices** | Async boundaries avoid cascading failures |
| **Background jobs** | Email, image resize, reports off the request path |
| **Event-driven systems** | Fan-out domain events to many handlers |
| **Load leveling** | Smooth bursty write traffic |
| **Reliable delivery** | At-least-once with retries + DLQ |

Skip queues when the call must be **synchronous** end-to-end, latency must be request-bound, or a simple DB outbox / cron is enough.`}]},{id:"best-practices",title:"Best Practices",blocks:[{type:"markdown",value:`- **Idempotent consumers** \u2014 at-least-once delivery will redeliver.
- **Durability** \u2014 persist messages you cannot afford to lose; use publisher confirms / Kafka acks.
- **Retries + DLQ** \u2014 bounded retries, then quarantine.
- **Security** \u2014 TLS, auth on brokers, least-privilege topics.
- **Lag metrics** \u2014 alert on consumer lag / oldest message age.
- **Visibility timeout / ack modes** \u2014 SQS visibility; Kafka consumer groups; Rabbit manual ack.`}]},{id:"java-spring",title:"Java / Spring Notes",blocks:[{type:"code",language:"java",filename:"RabbitPublishListen.java",showLineNumbers:!0,code:`// Publish
rabbitTemplate.convertAndSend("orders.exchange", "order.created", event);

// Consume (manual ack for control)
@RabbitListener(queues = "orders.q", ackMode = "MANUAL")
public void onOrder(OrderCreated event, Channel ch, @Header(AmqpHeaders.DELIVERY_TAG) long tag)
    throws IOException {
  try {
    process(event);           // must be idempotent
    ch.basicAck(tag, false);
  } catch (RetryableException e) {
    ch.basicNack(tag, false, true);  // requeue
  } catch (Exception e) {
    ch.basicNack(tag, false, false); // \u2192 DLQ if configured
  }
}`},{type:"code",language:"java",filename:"KafkaPublishListen.java",code:`@Autowired KafkaTemplate<String, OrderCreated> kafka;

public void publish(OrderCreated e) {
  kafka.send("orders", e.customerId(), e); // key \u2192 partition affinity
}

@KafkaListener(topics = "orders", groupId = "fulfillment")
public void onOrder(ConsumerRecord<String, OrderCreated> rec) {
  process(rec.value()); // commit offset after success (default AUTO can lose work)
}`},{type:"callout",variant:"tip",title:"Broker landscape",body:"**RabbitMQ** \u2014 flexible routing, classic queues. **Kafka** \u2014 log + consumer groups, high throughput. **SQS / Pub/Sub** \u2014 managed. **Redis Streams** \u2014 lightweight. **ActiveMQ** \u2014 JMS. Choose by ordering needs, fan-out model, and ops burden."}]},{id:"source",title:"Source",blocks:[{type:"callout",variant:"note",title:"Source",body:"Summarized from Ashish Pratap Singh\u2019s AlgoMaster article \u201CWhat are Message Queues and When to Use Them?,\u201D with Java/Spring notes for this platform."}]}]},r=s;export{r as default};
