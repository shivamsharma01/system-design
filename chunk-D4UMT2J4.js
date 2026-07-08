import{a as e}from"./chunk-FVPMU6MT.js";import"./chunk-IFGU66OU.js";var t={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"The **Decorator** pattern attaches **additional responsibilities** to an object **dynamically**. Decorators implement the same interface as the component they wrap, so clients keep using the original type while behavior is stacked."},{type:"callout",variant:"info",title:"OCP in action",body:"Extend behavior by wrapping \u2014 not by editing the core class or exploding subclasses (`LoggedCompressedEncryptedStream`)."}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"Ordering coffee: start with espresso, then **decorate** with milk, then caramel. Each add-on wraps the drink you already have. You still \u201Cdrink\u201D the same cup interface \u2014 extras stack."},{type:"mermaid",caption:"Nested wrappers share one interface.",definition:`flowchart LR
  Client --> Log[LoggingNotifier]
  Log --> Retry[RetryNotifier]
  Retry --> Core[EmailNotifier]`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["Java I/O","`BufferedInputStream(new FileInputStream(...))`"],["HTTP / middleware","Auth, logging, metrics filters around a handler"],["Notifications","Retry + logging wrappers around a base notifier"],["UI","Scrollbars / borders wrapping a window or widget"],["Caching","Cache-aside decorator around a repository"],["Security","Encryption decorator around a data stream or service"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"Stack logging and retry around a base email notifier without changing it."},{type:"code",language:"java",filename:"NotifierDecorator.java",code:`public interface Notifier {
  void send(String to, String message);
}

public class EmailNotifier implements Notifier {
  public void send(String to, String message) {
    System.out.println("Email to " + to + ": " + message);
  }
}

public abstract class NotifierDecorator implements Notifier {
  protected final Notifier wrappee;

  protected NotifierDecorator(Notifier wrappee) {
    this.wrappee = wrappee;
  }

  public void send(String to, String message) {
    wrappee.send(to, message);
  }
}

public class LoggingNotifier extends NotifierDecorator {
  public LoggingNotifier(Notifier wrappee) { super(wrappee); }

  public void send(String to, String message) {
    System.out.println("LOG send -> " + to);
    super.send(to, message);
  }
}

public class RetryNotifier extends NotifierDecorator {
  private final int attempts;

  public RetryNotifier(Notifier wrappee, int attempts) {
    super(wrappee);
    this.attempts = attempts;
  }

  public void send(String to, String message) {
    RuntimeException last = null;
    for (int i = 0; i < attempts; i++) {
      try {
        super.send(to, message);
        return;
      } catch (RuntimeException ex) {
        last = ex;
      }
    }
    throw last;
  }
}

// stack: log then retry then email
Notifier notifier = new LoggingNotifier(
    new RetryNotifier(new EmailNotifier(), 3)
);
notifier.send("user@shop.com", "Order shipped");`},{type:"prosCons",title:"Trade-offs",pros:["Mix features at runtime without subclass explosion.","Follows Open/Closed \u2014 extend by wrapping.","Same interface keeps clients stable."],cons:["Many small classes; debugging wrapper stacks can be hard.","Identity/`equals` across wrappers is tricky.","Order of decoration matters (compress-then-encrypt \u2260 reverse)."]}]},{id:"vs-related",title:"Decorator vs Proxy / Adapter",blocks:[{type:"featureComparison",columns:["Decorator","Proxy","Adapter"],rows:[{feature:"Interface",values:["Same as component","Same as subject","Different (target)"]},{feature:"Intent",values:["Add responsibilities","Control access","Convert interface"]},{feature:"Typical stack",values:["Many nested decorators","Usually one proxy","One adapter"]}]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"Explain Decorator with a Java example.",answer:"Java I/O: `new BufferedInputStream(new FileInputStream(file))` \u2014 buffering decorates the file stream. Both are `InputStream`. Same idea for custom service wrappers (logging, retry, metrics)."},{question:"How does Decorator support OCP?",answer:"You add behavior in **new decorator classes** without modifying the original component. Clients still depend on the shared interface."},{question:"Decorator vs Inheritance?",answer:"Inheritance bakes combinations at compile time and multiplies subclasses. Decorator composes features at runtime and keeps a single core class."},{question:"Decorator vs Proxy?",answer:"Both wrap and share an interface. **Decorator** emphasizes adding behavior; **Proxy** emphasizes access control, laziness, or remoteness. A caching proxy is often discussed as either \u2014 clarify intent."},{question:"Does decoration order matter?",answer:"Yes. Encrypt-then-compress differs from compress-then-encrypt. Logging outside vs inside retry changes what gets logged. Call this out in design discussions."},{question:"LLD prompt: add features to a pizza or coffee order.",answer:"Classic: `Pizza` interface; `BasePizza`; decorators `Cheese`, `Olives` each wrap a pizza and add cost/description. Shows dynamic stacking interviewers love."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Decorator = **wrap same interface** to add behavior.
2. Real uses: **Java I/O, middleware, retry/logging, UI chrome**.
3. Prefer over combinatorial subclasses.
4. Distinguish from Proxy (access) and Adapter (different interface).`}]}]},i=t;export{i as default};
