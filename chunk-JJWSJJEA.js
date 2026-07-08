import{a as e}from"./chunk-3CB7WDAH.js";import"./chunk-IFGU66OU.js";var a={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"The **Facade** pattern provides a **simplified, unified interface** to a complex subsystem of classes, libraries, or services. Clients call one entry point instead of wiring many collaborators themselves."},{type:"callout",variant:"info",title:"Not a god object",body:"A good facade **orchestrates**; it does not absorb all business logic. Subsystems stay usable directly for advanced cases \u2014 the facade is the happy path."}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"A **hotel concierge**: you ask for a dinner reservation. Behind the scenes they call the restaurant, arrange a cab, and confirm timing. You do not dial each vendor yourself."},{type:"mermaid",caption:"One facade over many services.",definition:`flowchart TB
  Client --> F[CheckoutFacade]
  F --> Inv[InventoryService]
  F --> Pay[PaymentService]
  F --> Ship[ShippingService]
  F --> Notify[NotificationService]`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["E-commerce","`CheckoutFacade.placeOrder()` \u2014 stock, pay, ship, notify"],["Home / IoT","\u201CWatch movie\u201D turns on TV, AVR, dim lights"],["Libraries","SLF4J-style simple API over a logging framework"],["Microservices","BFF or application service orchestrating several APIs"],["Legacy","Modern API facade in front of a tangle of old modules"],["Multimedia","Media player facade over codecs, buffers, and devices"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"Checkout orchestration: clients call one method; the facade sequences inventory, payment, shipping, and notification."},{type:"code",language:"java",filename:"CheckoutFacade.java",code:`public class CheckoutFacade {
  private final InventoryService inventory;
  private final PaymentService payments;
  private final ShippingService shipping;
  private final NotificationService notifications;

  public CheckoutFacade(
      InventoryService inventory,
      PaymentService payments,
      ShippingService shipping,
      NotificationService notifications
  ) {
    this.inventory = inventory;
    this.payments = payments;
    this.shipping = shipping;
    this.notifications = notifications;
  }

  public OrderConfirmation placeOrder(Cart cart, Customer customer) {
    inventory.reserve(cart.lines());
    PaymentResult pay = payments.charge(customer.id(), cart.total());
    if (!pay.ok()) {
      inventory.release(cart.lines());
      throw new PaymentFailedException(pay.reason());
    }
    Shipment shipment = shipping.schedule(cart, customer.address());
    notifications.sendOrderPlaced(customer.email(), shipment.id());
    return new OrderConfirmation(pay.transactionId(), shipment.id());
  }
}

// client \u2014 one call instead of four services
CheckoutFacade checkout = new CheckoutFacade(inv, pay, ship, notify);
checkout.placeOrder(cart, customer);`},{type:"prosCons",title:"Trade-offs",pros:["Dramatically simpler client code.","Hides subsystem churn behind a stable API.","Good place for cross-cutting orchestration and error handling."],cons:["Risk of becoming a bloated god facade.","Can hide important failure modes if over-simplified.","Advanced clients may still need direct subsystem access."]}]},{id:"vs-related",title:"Facade vs Adapter / Mediator / API Gateway",blocks:[{type:"markdown",value:`- **Adapter:** make one incompatible interface fit another.
- **Facade:** simplify access to **many** classes in a subsystem.
- **Mediator:** centralize **peer-to-peer** communication among colleagues.
- **API Gateway:** network-edge routing/auth for microservices \u2014 related *idea* (single entry), different layer (infra vs in-process design).`}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"What is the Facade pattern?",answer:"A higher-level interface that makes a subsystem easier to use by **orchestrating** its parts behind a small set of methods."},{question:"Facade vs Adapter?",answer:"Adapter converts **one** interface to another for compatibility. Facade reduces complexity of **many** collaborating classes. Different intents."},{question:"Does Facade violate SRP?",answer:"It can if it grows forever. Keep the facade focused on **one use-case workflow** (e.g. checkout). Split facades per bounded context when it gets large."},{question:"Should subsystems only be reachable via the facade?",answer:"No. GoF allows clients to use subsystems directly when needed. The facade is a convenience layer, not a hard wall \u2014 unless you intentionally enforce a module boundary."},{question:"Give an LLD example.",answer:"Movie booking: `BookingFacade.book(showId, seats, user)` reserves seats, charges payment, generates ticket, sends email. Or home-theater `watchMovie()` sequencing devices."},{question:"How is this different from a Service class in Spring?",answer:"Application services often *are* facades: they orchestrate repositories and gateways. Naming \u201CFacade\u201D emphasizes the structural intent of simplifying a subsystem for clients."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Facade = **simple door** into a complex subsystem.
2. Real uses: **checkout, BFFs, library entry points, legacy wraps**.
3. Orchestrate \u2014 do not swallow all domain logic.
4. Contrast with Adapter (compatibility) and Mediator (colleague chat).`}]}]},i=a;export{i as default};
