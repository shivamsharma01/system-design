import{a as e}from"./chunk-E2SRKBAC.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"**Factory Method** defines an interface for creating an object, but lets **subclasses decide** which concrete class to instantiate. Client code depends on a product interface \u2014 not on `new ConcreteThing()`."},{type:"callout",variant:"info",title:"Creational family",body:"Factory Method creates **one** product type via a creator hierarchy. **Abstract Factory** creates **families** of related products. Simple \u201Cstatic factory\u201D helpers are related but are not the full GoF pattern."},{type:"table",caption:"Roles.",headers:["Role","Responsibility"],rows:[["Product","Interface of the object being created (e.g. `Notifier`)"],["ConcreteProduct","Email, SMS, Push implementations"],["Creator","Declares `createNotifier()` (factory method)"],["ConcreteCreator","Returns a specific product"]]}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"markdown",value:"**Idea:** The *when* and *how* of using an object stays in shared code; the *which class* decision is deferred to a subclass or specialized creator."},{type:"callout",variant:"tip",title:"Real-world analogy",body:"A **logistics company** has a standard \u201Cship package\u201D workflow. A road division creates **trucks**; a sea division creates **ships**. The shipping steps are the same \u2014 only the vehicle factory method changes."},{type:"mermaid",caption:"Creator delegates construction.",definition:`classDiagram
  class Notifier {
    <<interface>>
    +send(message)
  }
  class EmailNotifier
  class SmsNotifier
  class NotificationService {
    <<abstract>>
    +notify(user, msg)
    +createNotifier()* Notifier
  }
  class EmailNotificationService
  class SmsNotificationService
  Notifier <|.. EmailNotifier
  Notifier <|.. SmsNotifier
  NotificationService <|-- EmailNotificationService
  NotificationService <|-- SmsNotificationService
  EmailNotificationService ..> EmailNotifier : creates
  SmsNotificationService ..> SmsNotifier : creates`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["Notifications","Email / SMS / push creators in an order system"],["Payments","`PaymentProcessor` factory per method (card, UPI, wallet)"],["Documents","Export as PDF vs CSV via `createExporter()`"],["Frameworks","Java `Iterator`, Spring `FactoryBean`, JDBC `Connection` factories"],["Games","Enemy spawners that create goblins vs dragons by level type"],["UI toolkits","Framework creates platform-specific buttons via factory methods"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"**Without the pattern:** every new channel forces edits to the service (`if/else` soup \u2014 OCP smell):"},{type:"code",language:"java",filename:"NotifyBad.java",highlightLines:[3,4,5,6],code:`public class OrderNotifier {
  public void notify(String channel, String message) {
    if (channel.equals("email")) { /* new EmailClient()... */ }
    else if (channel.equals("sms")) { /* new SmsClient()... */ }
    else if (channel.equals("push")) { /* another edit */ }
  }
}`},{type:"markdown",value:"**With Factory Method:** shared workflow; subclasses supply the product:"},{type:"code",language:"java",filename:"NotificationService.java",code:`public interface Notifier {
  void send(String to, String message);
}

public class EmailNotifier implements Notifier {
  public void send(String to, String message) {
    // SMTP / SES call
  }
}

public class SmsNotifier implements Notifier {
  public void send(String to, String message) {
    // Twilio / SNS call
  }
}

public abstract class NotificationService {
  // factory method
  protected abstract Notifier createNotifier();

  public void notifyUser(String to, String message) {
    Notifier notifier = createNotifier();
    notifier.send(to, message);
  }
}

public class EmailNotificationService extends NotificationService {
  protected Notifier createNotifier() {
    return new EmailNotifier();
  }
}

public class SmsNotificationService extends NotificationService {
  protected Notifier createNotifier() {
    return new SmsNotifier();
  }
}`},{type:"callout",variant:"tip",title:"Modern variant",body:"In interviews you can also show a **registry / map of suppliers** (`Map<String, Supplier<Notifier>>`) injected via DI \u2014 same idea (defer creation), less inheritance."},{type:"prosCons",title:"Trade-offs",pros:["Open for extension: new products = new creator/product classes.","Client code talks to interfaces, not concrete classes.","Centralizes creation rules (defaults, wiring, validation)."],cons:["Extra classes/hierarchy can feel heavy for one or two products.","Classic GoF form relies on inheritance; composition + DI is often cleaner."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"Explain Factory Method in one minute.",answer:"A creator defines a **factory method** that returns a **product interface**. Subclasses (or specialized creators) choose the concrete class. Clients use the product without calling `new` on concretes."},{question:"How is Factory Method different from a simple static factory?",answer:'A static `NotifierFactory.create("email")` is a convenience helper. **Factory Method** (GoF) ties creation to a **creator hierarchy** so the *same* business method can work with different products via polymorphism.'},{question:"How does it support the Open/Closed Principle?",answer:"You add a new product + creator without modifying existing notification workflow code. The abstract `notifyUser` stays closed; extension happens via new subclasses."},{question:"Factory Method vs Abstract Factory?",answer:"Factory Method: create **one** product. Abstract Factory: create a **family** of related products (button + checkbox + dialog for the same theme) that must stay consistent."},{question:"Give a parking-lot or e-commerce LLD use case.",answer:"E-commerce: `PaymentGateway.createProcessor()` returns Card/UPI/Wallet processors. Parking lot: `TicketFactory` / `VehicleFactory` creates car vs bike tickets with different pricing rules while the entry flow stays shared."},{question:"When would you avoid Factory Method?",answer:"When there is only one product forever, or creation is trivial. Prefer plain constructors or DI. Do not invent hierarchies for a single `new`."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Defer **which class** to create to a factory method / creator.
2. Real uses: **notifications, payments, exporters, framework hooks**.
3. Pairs with **OCP** and Strategy-like product interfaces.
4. Contrast with **Abstract Factory** (families) and simple static factories.`}]}]},o=t;export{o as default};
