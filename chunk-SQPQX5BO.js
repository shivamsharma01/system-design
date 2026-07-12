import{a as e}from"./chunk-E2TG4TU7.js";import"./chunk-IFGU66OU.js";var r={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"**Observer** defines a one-to-many dependency: when a **subject** changes state, all registered **observers** are notified automatically. It is the foundation of UI data-binding, event listeners, and in-process pub/sub."},{type:"callout",variant:"info",title:"Push vs pull",body:"**Push**: subject sends event data in `notify`. **Pull**: observers query the subject after being told \u201Csomething changed.\u201D Both are valid Observer variants."}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"A **YouTube channel**: subscribers (observers) get notified when the creator (subject) uploads. Subscribers do not poll endlessly; the channel pushes updates to the list."},{type:"mermaid",caption:"Subject notifies many observers.",definition:`flowchart LR
  S[OrderSubject] -->|notify| A[EmailObserver]
  S -->|notify| B[SmsObserver]
  S -->|notify| C[AnalyticsObserver]`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["UI frameworks","DOM/button click listeners; RxJS subjects in Angular; Vue watchers \u2014 React is not classical Observer"],["Reactive libs","RxJava / Reactive Streams subscribers"],["Domain events","In-process listeners after OrderPlaced"],["MVC classic","Views observing model changes"],["Monitoring","Metric publishers notifying dashboards"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"code",language:"java",filename:"OrderObservers.java",code:`import java.util.ArrayList;
import java.util.List;

public interface OrderObserver {
  void onOrderPaid(Order order);
}

public class OrderSubject {
  private final List<OrderObserver> observers = new ArrayList<>();

  public void subscribe(OrderObserver o) { observers.add(o); }
  public void unsubscribe(OrderObserver o) { observers.remove(o); }

  public void markPaid(Order order) {
    order.markPaid();
    for (OrderObserver o : List.copyOf(observers)) {
      o.onOrderPaid(order);
    }
  }
}

public class EmailObserver implements OrderObserver {
  public void onOrderPaid(Order order) {
    // send receipt email
  }
}

public class InventoryObserver implements OrderObserver {
  public void onOrderPaid(Order order) {
    // decrement stock
  }
}`},{type:"callout",variant:"warning",title:"Pitfalls",body:"Memory leaks from forgotten unsubscribes; observers throwing and aborting the notify loop; unexpected re-entrancy if an observer mutates the subject again."},{type:"prosCons",title:"Trade-offs",pros:["Loose coupling between publisher and subscribers.","Easy to add new listeners without editing the subject.","Natural event-driven design inside a process."],cons:["Notification order can be subtle.","Harder to debug cascading updates.","Distributed systems need a real message bus \u2014 not only in-memory Observer."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"What is the Observer pattern?",answer:"A subject maintains a list of dependents (observers) and **notifies** them of state changes, typically via a common listener interface."},{question:"Observer vs Pub/Sub?",answer:"Observer is often **in-process** with direct references. Pub/Sub usually goes through a **broker/topic** and can be distributed. Same idea; different scale and coupling."},{question:"Observer vs Mediator?",answer:"Observer: many listen to one subject. Mediator: colleagues talk through a **central hub** to avoid a web of pairwise links."},{question:"How do you avoid memory leaks?",answer:"Always **unsubscribe** when the observer\u2019s lifecycle ends (UI components, request scopes). Prefer weak references only with clear ownership rules."},{question:"LLD example?",answer:"Stock ticker updating multiple widgets; order service notifying email, SMS, and analytics listeners after payment."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Subject **notifies** many observers on change.
2. Real uses: **UI events, domain events, reactive streams**.
3. Mind unsubscribe, exceptions, and re-entrancy.
4. Scale out with brokers when you leave the process.`}]}]},t=r;export{t as default};
