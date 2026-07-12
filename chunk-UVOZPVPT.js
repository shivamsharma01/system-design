import{a as e}from"./chunk-FP2LNRFE.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"**Event-Driven Architecture (EDA)** is a system style where **state changes are communicated as events** and downstream components **react asynchronously**. Instead of Service A calling Service B synchronously, A publishes `OrderPlaced`; B, C, and D each decide how to respond. EDA favors **loose coupling**, **scalability**, and **resilience** at the cost of distributed complexity."},{type:"callout",variant:"info",title:"EDA vs request-response",body:"Request-response: caller waits, tight temporal coupling. EDA: caller fires-and-forgets; consumers process on their timeline. Better for long workflows, but harder to debug and reason about consistency."},{type:"table",caption:"Common EDA building blocks.",headers:["Building block","Role"],rows:[["Event","Immutable fact: something happened (past tense)"],["Event broker","Kafka, EventBridge \u2014 durable transport"],["Event producer","Emits domain events after state change"],["Event consumer","Reacts: update read model, send email, call external API"],["Event catalog","Schema registry, versioning, ownership"]]}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"**Banking wire transfers**: you do not call every department when money moves. The core posts a `FundsTransferred` event; fraud, statements, tax reporting, and customer notifications each subscribe and act independently \u2014 like a newspaper everyone reads at their own pace."},{type:"mermaid",caption:"Choreography: services react to events without a central orchestrator.",definition:`flowchart TB
  subgraph sync [Request-Response \u2014 avoided for side effects]
    A1[Checkout API] -->|POST /charge| B1[Payment API]
  end
  subgraph eda [Event-Driven]
    A2[Checkout] -->|OrderPlaced| EB[(Event Bus)]
    EB --> C2[Payment Handler]
    EB --> D2[Inventory Handler]
    EB --> E2[Email Handler]
  end`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["E-commerce","Order lifecycle: placed \u2192 paid \u2192 shipped \u2192 delivered as events"],["Banking","Transaction events drive ledger, fraud, compliance, notifications"],["Ride-sharing","TripStarted, TripCompleted \u2192 billing, driver payout, ratings"],["Food delivery","OrderAccepted, DriverAssigned, Delivered \u2014 each triggers workflows"],["Analytics","Clickstream events \u2192 real-time dashboards and ML features"],["Microservices","Domain events between bounded contexts (DDD)"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"Start with **domain events** (past tense, rich payload). Use **choreography** for simple flows (each service listens and emits the next event) or **orchestration** (Step Functions / Temporal) when you need a visible saga with compensations. Publish reliably with **Transactional Outbox** when the event must reflect a committed DB change."},{type:"code",language:"java",filename:"OrderService.java",code:`@Service
@Transactional
public class OrderService {
  private final OrderRepository orders;
  private final OutboxRepository outbox;

  public UUID placeOrder(PlaceOrderCommand cmd) {
    Order order = orders.save(Order.from(cmd));
    // Same transaction: business row + outbox row
    outbox.save(OutboxEntry.of("OrderPlaced", order.toEvent()));
    return order.getId();
  }
}

@Component
public class PaymentEventHandler {
  @KafkaListener(topics = "OrderPlaced")
  public void handle(OrderPlacedEvent event) {
    paymentService.charge(event.orderId(), event.amount());
    eventPublisher.publish(new PaymentCapturedEvent(event.orderId()));
  }
}`},{type:"callout",variant:"warning",title:"Distributed pitfalls",body:'No global transaction across services. Use **sagas** (choreography or orchestration) for multi-step workflows. Expect **eventual consistency** \u2014 UI may show "processing" until read models catch up. Pure choreography hides multi-step workflows and makes timeouts/compensations unclear \u2014 prefer **orchestration** once a flow has >3 steps, and put contracts in a **schema registry** so producers can evolve without breaking consumers.'},{type:"prosCons",title:"Trade-offs",pros:["Loose coupling \u2014 add consumers without changing producers.","Natural async scaling and buffering under spikes.","Audit trail from immutable event log."],cons:["Harder debugging and distributed tracing requirements.","Eventual consistency complicates UX and testing.","Schema evolution and ordering need governance."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"When would you choose EDA over REST?",answer:'When multiple services must react to a change, processing can be **async**, and you want **decoupling** and **buffering**. Avoid EDA when you need an immediate synchronous answer (e.g. "is this username available?").'},{question:"Choreography vs orchestration in sagas?",answer:"**Choreography**: services listen and emit next events \u2014 simple, decentralized, hard to see the full flow. **Orchestration**: central coordinator (Step Functions) drives steps and compensations \u2014 clearer for complex sagas."},{question:"How do you avoid losing events on DB failure?",answer:"**Transactional Outbox**: persist event in the same DB transaction as business data; relay publishes to the broker. Never write DB then fire-and-forget to Kafka without coordination."},{question:"Command vs event \u2014 what is the difference?",answer:'A **command** is an intent ("ChargeCard") directed at one handler. An **event** is a fact ("PaymentCaptured") that any interested party may consume. EDA centers on events; commands often stay synchronous or use a dedicated queue.'},{question:"How do you version events?",answer:"Schema registry (Avro/Protobuf), **additive** changes only when possible, `eventType` + `version` in envelope, and consumers that tolerate unknown fields. Never break old consumers in place."},{question:"EDA and CQRS \u2014 how do they relate?",answer:"Events often **update read models** (projections) while the write model stays normalized. CQRS separates reads and writes; EDA is a common way to propagate writes to read sides asynchronously."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. EDA uses **events** to decouple services asynchronously.
2. Contrast with **request-response** for side effects and fan-out.
3. Use **outbox**, **sagas**, and **idempotency** in production.
4. Real uses: **orders, banking, analytics pipelines** on Kafka/EventBridge.`}]}]},a=t;export{a as default};
