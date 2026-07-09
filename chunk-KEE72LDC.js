import{a as e}from"./chunk-QAF3KHPS.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"**Hexagonal Architecture** (Ports and Adapters) places the **domain/application core** at the center. **Ports** are interfaces the core needs or exposes; **adapters** implement those ports for HTTP, databases, message buses, and UIs. The core never imports Spring/JDBC/UI frameworks."},{type:"callout",variant:"info",title:"Related names",body:"Closely related to **Clean Architecture** and **Onion Architecture**. Same idea: dependencies point toward the domain; infrastructure is replaceable."}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"A **power tool with interchangeable batteries and bits**: the motor (domain) exposes a standard mount (port). Different batteries and drill bits (adapters) plug in without redesigning the motor."},{type:"mermaid",caption:"Driving and driven adapters around the core.",definition:`flowchart TB
  REST[REST Adapter] --> IP[Inbound Port - PlaceOrder]
  IP --> Core[Domain / Application]
  Core --> OP[Outbound Port - PaymentGateway]
  OP --> Stripe[Stripe Adapter]
  Core --> OP2[Outbound Port - OrderRepository]
  OP2 --> JPA[JPA Adapter]`},{type:"table",headers:["Port type","Meaning","Example"],rows:[["Inbound (driving)","How the outside drives the app","`PlaceOrderUseCase`"],["Outbound (driven)","What the app needs from outside","`PaymentPort`, `OrderRepository`"]]}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["Complex domains","Orders, billing, insurance underwriting"],["Multi-channel apps","Same core behind REST, gRPC, and CLI"],["Testability","In-memory adapters in unit/integration tests"],["Cloud swaps","Replace Postgres adapter with Dynamo later"],["Microservices","Keep domain pure; adapters for Kafka/HTTP"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"code",language:"java",filename:"HexagonalOrder.java",code:`// --- core (no Spring imports) ---
public interface PlaceOrderUseCase { // inbound port
  OrderId place(PlaceOrderCommand cmd);
}

public interface PaymentPort { // outbound port
  PaymentReceipt charge(Money amount, CustomerId customerId);
}

public interface OrderRepository { // outbound port
  void save(Order order);
}

public class PlaceOrderService implements PlaceOrderUseCase {
  private final PaymentPort payments;
  private final OrderRepository orders;

  public PlaceOrderService(PaymentPort payments, OrderRepository orders) {
    this.payments = payments;
    this.orders = orders;
  }

  public OrderId place(PlaceOrderCommand cmd) {
    Order order = Order.create(cmd);
    PaymentReceipt receipt = payments.charge(order.total(), cmd.customerId());
    order.markPaid(receipt.id());
    orders.save(order);
    return order.id();
  }
}

// --- adapters live in infrastructure ---
// StripePaymentAdapter implements PaymentPort
// JpaOrderRepository implements OrderRepository
// OrderController calls PlaceOrderUseCase`},{type:"prosCons",title:"Trade-offs",pros:["Domain stays free of framework lock-in.","Easy to fake outbound ports in tests.","Swap UI/DB/messaging without rewriting rules."],cons:["More interfaces and packaging upfront.","Overkill for tiny CRUD apps.","Teams must enforce the dependency rule in reviews."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"Explain hexagonal architecture in one minute.",answer:"Domain/application sits in the center. It exposes **inbound ports** (use cases) and depends on **outbound ports** (interfaces). Adapters implement those ports for HTTP, DB, queues, etc., so infrastructure is replaceable."},{question:"Inbound vs outbound port?",answer:"Inbound: something outside **calls into** the app (`PlaceOrder`). Outbound: the app **calls out** (`PaymentPort.charge`)."},{question:"Hexagonal vs layered?",answer:"Layered stacks UI \u2192 service \u2192 DB. Hexagonal centers the domain and treats UI and DB as **peer adapters**. Same app can have many adapters without a rigid top-to-bottom cake."},{question:"How do you test the core?",answer:"Unit-test use cases with **in-memory** or mock outbound ports \u2014 no Spring context or database required for domain rules."},{question:"Is Spring Data JPA allowed in the domain package?",answer:"No. Define a repository **interface** in the core; put the JPA implementation in an adapter module/package."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Core domain + **ports**; outside world = **adapters**.
2. Dependencies point **toward the center**.
3. Real uses: **complex domains, multi-channel, testable cores**.
4. Cousin of Clean/Onion \u2014 same dependency rule.`}]}]},a=t;export{a as default};
