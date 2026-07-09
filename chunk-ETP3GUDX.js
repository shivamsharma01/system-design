import{a as e}from"./chunk-I6JUJ25W.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"**Dependency Injection (DI)** supplies a class\u2019s collaborators **from the outside** rather than constructing them internally. It is the practical technique behind the **Dependency Inversion Principle** and the default style in Spring, Guice, and Angular."},{type:"callout",variant:"info",title:"Three common forms",body:"**Constructor** injection (preferred), **setter** injection, and **interface/method** injection. Constructor injection makes required dependencies obvious and enables immutability."}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"A **chef who is handed prepped ingredients** instead of running to the farm mid-service. The kitchen (composition root) decides suppliers; the chef focuses on cooking (business logic)."},{type:"mermaid",caption:"Composition root wires the graph.",definition:`flowchart TB
  CR[Composition Root / Spring Context]
  CR --> OS[OrderService]
  CR --> PG[PaymentGateway]
  CR --> OR[OrderRepository]
  OS --> PG
  OS --> OR`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["Spring / Jakarta","`@Component` + constructor injection"],["Android / mobile","Hilt, Dagger"],["Frontend","Angular DI hierarchy"],["Testing","Inject fakes/mocks in unit tests"],["Hexagonal apps","Wire adapters into port constructors"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"**Without DI** \u2014 hard to test, hidden coupling:"},{type:"code",language:"java",filename:"OrderServiceBad.java",code:`public class OrderService {
  private final PaymentGateway payments = new StripeGateway(); // hard-wired

  public void place(Order order) {
    payments.charge(order.total());
  }
}`},{type:"markdown",value:"**With constructor DI** \u2014 swap Stripe for a fake in tests:"},{type:"code",language:"java",filename:"OrderServiceGood.java",code:`public class OrderService {
  private final PaymentGateway payments;
  private final OrderRepository orders;

  public OrderService(PaymentGateway payments, OrderRepository orders) {
    this.payments = payments;
    this.orders = orders;
  }

  public Order place(PlaceOrderCommand cmd) {
    Order order = Order.create(cmd);
    payments.charge(order.total());
    orders.save(order);
    return order;
  }
}

// Spring
@RestController
class OrderController {
  private final OrderService orders;
  OrderController(OrderService orders) { this.orders = orders; }
}`},{type:"prosCons",title:"Trade-offs",pros:["Explicit dependencies \u2014 easy to read and review.","Trivial to substitute test doubles.","Enables DIP: depend on interfaces, inject implementations."],cons:["Constructor \u201Ctelescoping\u201D if a class needs too many deps (SRP smell).","Container magic can confuse beginners.","Over-injection of concrete infrastructure into domain types."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"What is Dependency Injection?",answer:"Providing an object\u2019s dependencies **from outside** (usually via constructor) instead of the object creating them itself \u2014 often done by an IoC container."},{question:"How does DI relate to DIP?",answer:"DIP says high-level modules should depend on **abstractions**. DI is how you **wire** those abstractions to concrete implementations at runtime."},{question:"Why prefer constructor injection?",answer:"Required deps are mandatory and visible; fields can be `final`; object is fully initialized after construction; easier testing."},{question:"DI vs Service Locator?",answer:"DI pushes dependencies in; locator pulls them from a registry. DI keeps dependencies explicit; locator hides them."},{question:"What is a composition root?",answer:"The single place (e.g. Spring context, `main`) that **builds the object graph**. Business logic should not new up infrastructure."},{question:"LLD tip?",answer:"Show interfaces for gateways/repositories and constructors that take them. Mention you would register beans in Spring \u2014 that scores architecture points."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. DI = **inject collaborators**, do not \`new\` them inside.
2. Prefer **constructor injection**.
3. Real uses: **Spring, Guice, Angular, tests**.
4. Pairs with DIP; opposite of Service Locator pull.`}]}]},i=t;export{i as default};
