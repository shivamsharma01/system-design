import{a as e}from"./chunk-BO3XIHMO.js";import"./chunk-IFGU66OU.js";var r={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"The **Repository** pattern mediates between the domain and data mapping layers. It offers a **collection-like interface** for accessing aggregates (`findById`, `save`, `delete`) so domain code stays free of SQL, JDBC, or document-API details."},{type:"callout",variant:"info",title:"DDD framing",body:"Repositories usually sit behind **aggregate roots**. One repository per aggregate type \u2014 not one per table \u2014 keeps transactional boundaries clear."}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"A **library catalog desk**: you ask for a book by ISBN (domain language). Staff fetch it from stacks, warehouses, or digital archives (persistence). You do not walk the warehouse aisles yourself."},{type:"mermaid",caption:"Domain depends on repository interface.",definition:`flowchart LR
  S[OrderService] --> R[OrderRepository interface]
  R --> JPA[JpaOrderRepository]
  R --> MEM[InMemoryOrderRepository]`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["Spring apps","Spring Data interfaces as repositories"],["DDD projects","One repo per aggregate root"],["Testing","Fake in-memory repositories"],["Hexagonal apps","Outbound port implemented by DB adapter"],["Multi-store","Same interface over SQL and cache-aside"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"code",language:"java",filename:"OrderRepository.java",code:`public interface OrderRepository {
  Optional<Order> findById(OrderId id);
  List<Order> findOpenByCustomer(CustomerId customerId);
  void save(Order order);
  void delete(OrderId id);
}

public class OrderService {
  private final OrderRepository orders;

  public OrderService(OrderRepository orders) {
    this.orders = orders;
  }

  public void cancel(OrderId id) {
    Order order = orders.findById(id)
        .orElseThrow(() -> new NotFoundException(id));
    order.cancel();          // domain rule
    orders.save(order);      // persistence
  }
}

// Infrastructure
public class JpaOrderRepository implements OrderRepository {
  private final OrderJpaRepository springData;
  // map Entity <-> domain Order
}`},{type:"prosCons",title:"Trade-offs",pros:["Domain code reads like a collection of aggregates.","Persistence technology is swappable/fakeable.","Central place for query methods and mapping."],cons:["Generic repositories can become dump yards of queries.","Leaky abstractions if SQL concepts creep into the interface.","Overkill for trivial one-table scripts."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"What problem does Repository solve?",answer:"It decouples domain logic from persistence details by providing a **collection-like API** over aggregates, so services do not embed SQL/ORM code."},{question:"Repository vs DAO?",answer:"DAO is often table/data-access oriented. Repository is **domain-oriented** (aggregates, ubiquitous language). In practice Spring \u201Crepositories\u201D blur the line \u2014 explain the intent."},{question:"One repository per table?",answer:"Prefer **one per aggregate root**. Child entities are loaded/saved through the root to protect invariants."},{question:"Repository vs Active Record?",answer:"Repository: persistence outside the domain object. Active Record: the domain object **is** the row and saves itself. Repository scales better for complex domains."},{question:"How do you test with repositories?",answer:"Inject an in-memory fake implementing the same interface, or use `@DataJpaTest` for adapter-level tests separately from domain unit tests."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Repository = **collection facade** for aggregates.
2. Domain depends on an **interface**, not SQL.
3. Real uses: **Spring Data, DDD, hexagonal ports**.
4. Contrast with DAO and Active Record in interviews.`}]}]},o=r;export{o as default};
