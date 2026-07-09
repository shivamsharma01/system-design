import{a as e}from"./chunk-44YUCOJN.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"**Database per Service** gives each microservice **exclusive ownership** of its data store. No other service reads or writes that database directly \u2014 integration happens through **APIs** or **events**. This enforces **loose coupling**, lets teams pick the right datastore per domain, and enables **independent deployment**."},{type:"callout",variant:"info",title:"The hard rule",body:"If the Order service needs customer name, it calls the **Customer API** or consumes a **CustomerUpdated** event \u2014 it does **not** JOIN the `customers` table owned by Customer service."},{type:"table",caption:"Data sharing alternatives.",headers:["Approach","When"],rows:[["Synchronous API","Need fresh data for a single request (GET customer by id)"],["Event replication","Denormalized read models \u2014 order service stores customer snapshot"],["Saga / choreography","Cross-service transactions without shared DB"],["API composition","BFF aggregates multiple service calls for the UI"]]}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"Departments in a company each keep **their own filing cabinet**. HR does not walk into Finance\u2019s locked drawer \u2014 they request a **report** or receive a **memo** (API/event). Cabinets can be reorganized without breaking other departments."},{type:"mermaid",caption:"Each service owns a private database; no cross-DB access.",definition:`flowchart TB
  subgraph orderCtx["Order service"]
    OS["Order API"]
    ODB[("orders_db")]
    OS --> ODB
  end
  subgraph custCtx["Customer service"]
    CS["Customer API"]
    CDB[("customers_db")]
    CS --> CDB
  end
  subgraph payCtx["Payment service"]
    PS["Payment API"]
    PDB[("payments_db")]
    PS --> PDB
  end

  OS -->|"GET /customers/{id}"| CS
  OS -->|"PaymentAuthorized event"| PS
  note["No shared database \u2014 no cross-schema JOINs"]`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["E-commerce checkout","Order DB stores line items; inventory DB separate \u2014 reserve stock via inventory API"],["Food delivery","Rider location in Redis (dispatch); restaurant menu in Postgres (catalog) \u2014 no shared tables"],["Payments","Ledger DB owned by payments team; merchant config in separate merchant service DB"],["Netflix-style microservices","Each bounded context (billing, entitlement, viewing) has dedicated Cassandra/EV cache stores"],["Legacy modernization","Strangler extracts catalog to new Postgres; monolith DB shrinks as services claim tables"],["Polyglot persistence","Order service uses Postgres; recommendation service uses MongoDB \u2014 chosen per access pattern"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"Define **bounded contexts** first \u2014 one database per service, not per table. For cross-service queries, build **materialized views** updated by events (CDC/Debezium). Accept **eventual consistency** on denormalized copies. Use **Saga** for distributed writes."},{type:"code",language:"java",filename:"OrderServiceNoSharedDb.java",code:`@Service
public class OrderPlacementService {
  private final OrderRepository orderRepo;       // orders_db only
  private final CustomerClient customerClient;   // HTTP to customer service
  private final InventoryClient inventoryClient;
  private final OutboxPublisher outbox;

  @Transactional  // single-DB transaction
  public OrderId placeOrder(PlaceOrderCommand cmd) {
    CustomerSummary customer = customerClient.getSummary(cmd.customerId());
    if (!inventoryClient.reserve(cmd.sku(), cmd.quantity())) {
      throw new InsufficientStockException(cmd.sku());
    }
    Order order = Order.create(customer.id(), customer.displayName(), cmd.items());
    orderRepo.save(order);
    outbox.publish(new OrderPlacedEvent(order.id(), customer.id(), order.total()));
    return order.id();
  }
}

// CustomerClient \u2014 never touches customers_db directly
public class CustomerClient {
  public CustomerSummary getSummary(CustomerId id) {
    return rest.get("/api/customers/" + id.value(), CustomerSummary.class);
  }
}`},{type:"code",language:"yaml",filename:"database-per-service-deployment.yaml",code:`# Each service gets its own database instance / schema / credentials
services:
  order-service:
    database:
      host: order-postgres.internal
      name: orders_db
      credentials_secret: order-db-creds
  customer-service:
    database:
      host: customer-postgres.internal
      name: customers_db
      credentials_secret: customer-db-creds
  payment-service:
    database:
      host: payment-postgres.internal
      name: payments_db
      credentials_secret: payment-db-creds

# Network policy: order-service pods cannot reach customer-postgres
networkPolicies:
  - deny_cross_db_access: true`},{type:"callout",variant:"warning",title:"Distributed joins are an anti-pattern",body:"Reporting that needs cross-service data belongs in a **read model**, **data warehouse**, or **CQRS projection** \u2014 not live JOINs across microservice databases."},{type:"prosCons",title:"Trade-offs",pros:["Independent schema evolution and deployment per service.","Polyglot persistence \u2014 right DB for each workload.","Blast radius contained \u2014 one DB outage does not take all services down."],cons:["No ACID transactions across services \u2014 sagas and eventual consistency required.","Denormalized copies and event pipelines add complexity.","Reporting and ad-hoc queries need separate analytics path."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"What is Database per Service?",answer:"Each microservice has its **own private database** that no other service accesses directly. Cross-service data needs flow through **APIs or events**."},{question:"How do you query data spanning two services?",answer:"**API composition** for online requests, **event-sourced read models** for denormalized local copies, or **ETL to a warehouse** for analytics \u2014 never cross-DB JOINs in production paths."},{question:"Database per Service vs Shared Database anti-pattern?",answer:"**Shared DB** couples services through schema \u2014 one team\u2019s migration breaks others. **Per-service DB** enforces boundaries but requires distributed transaction patterns."},{question:"How to handle transactions across Order and Payment?",answer:"Use a **Saga**: place order (local TX) \u2192 call payment \u2192 on failure run **compensating** cancel order. Or **outbox + events** for async choreography."},{question:"Can two services share a database server?",answer:"They may share a **physical cluster** but should have **separate schemas/credentials** with network policies. Logical ownership must stay exclusive \u2014 shared schema defeats the pattern."},{question:"Design data model for food delivery with database per service.",answer:"**Restaurant** (menu DB), **Order** (orders DB with restaurant name snapshot), **Dispatch** (rider assignments DB), **Payment** (ledger DB). Order calls Restaurant API at placement; listens to **MenuUpdated** events for cache refresh."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Database per Service = **private datastore per microservice**.
2. Share data via **APIs, events, sagas** \u2014 not shared tables.
3. Accept **eventual consistency** on replicated read models.
4. Real uses: **e-commerce decomposition, Netflix bounded contexts**.`}]}]},s=t;export{s as default};
