import{a as e}from"./chunk-HWRPDHQ5.js";import"./chunk-IFGU66OU.js";var a={meta:e,sections:[{id:"overview",title:"Overview",blocks:[{type:"markdown",value:"The **Proxy** pattern provides a **surrogate or placeholder** for another object to control access to it. The proxy implements the same interface as the real subject so clients do not know (or care) they are talking to a stand-in."},{type:"callout",variant:"info",title:"Common proxy flavors",body:"**Virtual** (lazy create), **Protection** (authz), **Remote** (local stub for a remote object), **Caching**, **Logging / smart reference**."}]},{id:"concept",title:"Concept and analogy",blocks:[{type:"callout",variant:"tip",title:"Real-world analogy",body:"A **credit card** is a proxy for cash in your bank account. You pay with the card; the bank controls access, limits, and settlement. You do not carry the vault around."},{type:"mermaid",caption:"Client \u2192 Proxy \u2192 RealSubject.",definition:`sequenceDiagram
  participant C as Client
  participant P as ImageProxy
  participant R as HighResImage
  C->>P: display()
  alt not loaded
    P->>R: load from disk/CDN
  end
  P->>R: display()
  R-->>C: pixels`}]},{id:"where-used",title:"Where it is used",blocks:[{type:"table",headers:["Domain","Example"],rows:[["Lazy loading","ORM lazy entity proxies; image thumbnails before full load"],["Security","Protection proxy checking roles before service calls"],["Remoting","gRPC/Java RMI stubs \u2014 local proxy to remote service"],["Caching","Read-through cache proxy in front of a repository"],["API gateways","Edge proxy controlling rate limits / auth (infra cousin)"],["Hibernate / Spring","AOP proxies for transactions and security"]]}]},{id:"implementation",title:"Implementation",blocks:[{type:"markdown",value:"**Virtual proxy:** load a heavy product image only on first display."},{type:"code",language:"java",filename:"ImageProxy.java",code:`public interface ProductImage {
  void display();
}

public class HighResImage implements ProductImage {
  private final String url;

  public HighResImage(String url) {
    this.url = url;
    loadFromCdn(); // expensive
  }

  private void loadFromCdn() {
    System.out.println("Loading " + url + " ...");
  }

  public void display() {
    System.out.println("Showing " + url);
  }
}

public class ImageProxy implements ProductImage {
  private final String url;
  private HighResImage real;

  public ImageProxy(String url) {
    this.url = url;
  }

  public void display() {
    if (real == null) {
      real = new HighResImage(url); // lazy
    }
    real.display();
  }
}

// gallery holds proxies \u2014 CDN hit only when user opens an image
ProductImage img = new ImageProxy("https://cdn/p/42.jpg");
img.display();`},{type:"markdown",value:"**Protection proxy:** gate access by role."},{type:"code",language:"java",filename:"SecureDocumentProxy.java",code:`public interface DocumentService {
  String read(String docId);
}

public class DocumentServiceImpl implements DocumentService {
  public String read(String docId) {
    return "contents of " + docId;
  }
}

public class SecureDocumentProxy implements DocumentService {
  private final DocumentService real;
  private final User currentUser;

  public SecureDocumentProxy(DocumentService real, User currentUser) {
    this.real = real;
    this.currentUser = currentUser;
  }

  public String read(String docId) {
    if (!currentUser.canRead(docId)) {
      throw new SecurityException("forbidden");
    }
    return real.read(docId);
  }
}`},{type:"prosCons",title:"Trade-offs",pros:["Controls access, lifetime, and location without changing clients.","Enables lazy loading and caching cleanly.","Same interface \u2192 drop-in replacement for the real subject."],cons:["Extra indirection and sometimes latency.","Easy to confuse with Decorator if intent is unclear.","Lifecycle bugs (when to create/destroy the real subject)."]}]},{id:"vs-related",title:"Proxy vs Decorator vs Adapter",blocks:[{type:"featureComparison",columns:["Proxy","Decorator","Adapter"],rows:[{feature:"Interface",values:["Same as subject","Same as component","Different target"]},{feature:"Intent",values:["Control access / lifecycle","Add responsibilities","Convert API"]},{feature:"Usually",values:["One proxy layer","Stack of decorators","One adapter"]}]}]},{id:"interview-questions",title:"Interview Questions",blocks:[{type:"interviewQa",items:[{question:"What is the Proxy pattern?",answer:"A stand-in that implements the **same interface** as a real object and controls **when/how** the real object is used \u2014 lazy creation, security, remoting, caching, etc."},{question:"Name three types of proxies.",answer:"**Virtual** (lazy), **Protection** (authorization), **Remote** (local representative of a remote object). Bonus: caching and logging/smart-reference proxies."},{question:"Proxy vs Decorator?",answer:"Both wrap and share an interface. Proxy\u2019s job is **access control / lifecycle / location**. Decorator\u2019s job is **adding features**. A caching layer can be argued either way \u2014 state the intent."},{question:"Where do you see proxies in Spring?",answer:"Spring AOP often creates **JDK dynamic proxies** or CGLIB subclasses around beans for `@Transactional`, security, and metrics \u2014 classic proxy usage."},{question:"Give an LLD example.",answer:"Document management: `SecureDocumentProxy` checks ACLs before `read`/`write`. Or product gallery: `ImageProxy` delays CDN download until `display()`."},{question:"What can go wrong with a virtual proxy?",answer:"Thread races on first load (need sync), memory leaks if proxies hold large subjects forever, and surprising latency on first use. Mention synchronization and eviction in strong answers."}]}]},{id:"summary",title:"Summary",blocks:[{type:"callout",variant:"summary",title:"Key takeaways",body:`1. Proxy = **same interface**, controlled access to a real subject.
2. Flavors: **virtual, protection, remote, caching**.
3. Real uses: **lazy images, ACL gates, RMI/gRPC stubs, Spring AOP**.
4. Separate clearly from Decorator (add behavior) and Adapter (change interface).`}]}]},r=a;export{r as default};
