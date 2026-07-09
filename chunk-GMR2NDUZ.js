import{a as e}from"./chunk-REY3YA5N.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"A **Service Locator** is a central **registry** that returns service implementations on demand (`ServiceLocator.get(PaymentGateway.class)`). Callers pull dependencies instead of receiving them. Modern guidance prefers **Dependency Injection**; locator is taught mainly so you can recognize and avoid its pitfalls."},{type:"callout",variant:"warning",title:"Often an anti-pattern",body:"Hidden dependencies, harder testing, and temporal coupling to \u201Cwhen the locator was configured.\u201D Prefer constructor injection in new code."}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"A **hotel front desk**: whenever you need something, you ask the desk to fetch it. Convenient \u2014 but nobody looking at your room knows what you depend on, and the desk becomes a bottleneck and a secret dependency."},{type:"mermaid",caption:"Caller pulls from a global registry.",definition:`flowchart LR
  C[OrderService] -->|get PaymentGateway| L[(Service Locator)]
  L --> P[StripeGateway]
  L --> N[Notifier]`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["Legacy frameworks","Older plugin hosts and game engines"],["JNDI / EE","Looking up DataSource by name"],["Plugin systems","Runtime discovery of extensions"],["Anti-pattern reviews","Codebases with `AppContext.getBean` everywhere"],["Rare valid niches","Very dynamic plugin loading at the composition root edge"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"code",language:"java",filename:"ServiceLocator.java",code:`import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public final class ServiceLocator {
  private static final Map<Class<?>, Object> SERVICES = new ConcurrentHashMap<>();

  private ServiceLocator() {}

  public static <T> void register(Class<T> type, T instance) {
    SERVICES.put(type, instance);
  }

  @SuppressWarnings("unchecked")
  public static <T> T get(Class<T> type) {
    T service = (T) SERVICES.get(type);
    if (service == null) {
      throw new IllegalStateException("No service for " + type.getName());
    }
    return service;
  }
}

// anti-pattern usage \u2014 dependencies are invisible in the constructor
public class OrderService {
  public void place(Order order) {
    PaymentGateway pay = ServiceLocator.get(PaymentGateway.class);
    pay.charge(order.total());
  }
}

// prefer instead:
// public OrderService(PaymentGateway pay) { this.pay = pay; }`},{type:"prosCons",title:"Trade-offs",pros:["Simple runtime lookup for plugins.","Can reduce constructor parameter lists in legacy code.","Familiar in older enterprise Java (JNDI)."],cons:["Dependencies are hidden \u2014 hard to see what a class needs.","Unit tests must configure a global registry.","Encourages ambient context and tight coupling to the locator."]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"What is Service Locator?",answer:"A registry that provides services to callers via **lookup**. Classes ask the locator for dependencies instead of receiving them through constructors."},{question:"Service Locator vs Dependency Injection?",answer:"DI **pushes** dependencies in (inversion of control). Locator lets classes **pull** them. DI makes dependencies explicit and testable; locator hides them."},{question:"Why do many consider it an anti-pattern?",answer:"It creates **hidden global dependencies**, complicates testing, and can mask design problems (classes that need too many services)."},{question:"Is Spring ApplicationContext a Service Locator?",answer:"Using `context.getBean()` inside business code is locator-style. Prefer injecting beans. The container itself is fine as the **composition root**."},{question:"Any acceptable use?",answer:"Dynamic plugin loading at the edges, or bridging legacy APIs \u2014 not as the default way application services obtain collaborators."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Locator = **pull** dependencies from a registry.
2. Prefer **constructor DI** in modern code.
3. Real sightings: **JNDI, legacy plugins, getBean abuse**.
4. In interviews, explain why DI wins for testability.`}]}]},n=t;export{n as default};
