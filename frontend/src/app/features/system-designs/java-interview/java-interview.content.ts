import { DesignContent } from '../../../shared/models';
import { JAVA_INTERVIEW_META } from './java-interview.meta';

const content: DesignContent = {
  meta: JAVA_INTERVIEW_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'Java interview prep with **detailed answers** in sketchnote style — handwritten fonts on a notebook board. Expand each question: definition, internals, pitfalls, and how you’d talk about it in an interview.',
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'How to practise',
          body: 'For each answer: **define → explain mechanism → name a failure mode → give a production/debug angle**. Prefer concrete tools (`jcmd`, JFR, MAT) over vague “check logs.”',
        },
      ],
    },
    {
      id: 'jvm-internals',
      title: 'JVM Internals',
      blocks: [
        {
          type: 'interviewQa',
          variant: 'sketch',
          title: 'JVM Internals Q&A',
          items: [
            {
              question: 'What is the difference between Heap and Stack memory?',
              answer:
                '**Stack** stores per-thread frames: local variables, operand stack, return addresses. Each method call pushes a frame; return pops it. Stack memory is small, fast, and automatically reclaimed \u2014 no GC. Deep recursion or huge locals \u2192 `StackOverflowError`.\n\n**Heap** stores objects and arrays shared by all threads. Allocation is via `new`; reclamation is by **Garbage Collection**. Heap is larger and tunable (`-Xms`/`-Xmx`). Exhaustion \u2192 `OutOfMemoryError: Java heap space`.\n\n**Mental model:** primitives and references live on the stack; the objects those references point to live on the heap (unless Escape Analysis scalar-replaces them). Thread stacks are private; the heap is shared \u2014 so races happen on heap objects, not on local primitives.',
            },
            {
              question: 'How does the JVM memory model work?',
              answer:
                "The **Java Memory Model (JMM)** defines how threads interact through memory: when a write by one thread becomes visible to another, and what reorderings compilers/CPUs may perform.\n\nWithout synchronization, threads may see **stale** values (CPU caches, compiler hoisting). The JMM provides **happens-before** rules: unlock\u2192lock on same monitor, volatile write\u2192read, thread start/join, etc. If A happens-before B, B sees A's writes.\n\n**Practical tools:** `synchronized`, `volatile`, `java.util.concurrent` atomics/locks, immutable publication. Wrong mental model (\u201cit\u2019s just shared RAM\u201d) causes Heisenbugs that never reproduce locally.\n\nAlso distinguish **JMM** (concurrency visibility) from **JVM runtime memory regions** (heap, metaspace, stacks, code cache) \u2014 interviewers use \u201cmemory model\u201d for both; clarify which.",
            },
            {
              question: 'Explain the class-loading lifecycle.',
              answer:
                'A class goes through:\n\n1. **Loading** \u2014 bytes fetched by a ClassLoader; creates a Class object.\n2. **Linking**\n   - *Verification* \u2014 bytecode safety (stack maps, type checks).\n   - *Preparation* \u2014 static fields get default values.\n   - *Resolution* \u2014 symbolic refs \u2192 direct refs (can be lazy).\n3. **Initialization** \u2014 run `<clinit>` (static initializers / static field assignments) under class-init lock. Happens-before all uses.\n\nTriggered by first active use: `new`, static access, reflection, main class, etc. Errors surface as `ExceptionInInitializerError`, `NoClassDefFoundError`, `ClassNotFoundException` (different failure modes \u2014 know the difference).\n\n**Interview tip:** Class loading is hierarchical and cached; the same binary name can exist once per ClassLoader \u2014 classic \u201cClassCastException between same-named classes\u201d in app servers.',
            },
            {
              question: 'What are Bootstrap, Platform, and Application ClassLoaders?',
              answer:
                'Modern (JPMS-era) hierarchy:\n\n- **Bootstrap** \u2014 native, loads core `java.base` etc. from the JDK modules; usually shows as `null` parent.\n- **Platform (Extension)** \u2014 loads supported platform modules / extensions.\n- **Application (System)** \u2014 loads classpath / module path of your app (`ClassLoader.getSystemClassLoader()`).\n\nDelegation is typically **parent-first**: ask parent before loading locally (except special loaders like servlet webapps that are child-first for `/WEB-INF`).\n\n**Why it matters:** classpath hell, version conflicts, \u201cworks in IDE, fails in fat jar,\u201d and SPI loading (`ServiceLoader`) all hang on which loader sees which JAR.',
            },
            {
              question: 'How does Garbage Collection work internally?',
              answer:
                'GC reclaims objects that are **unreachable** from GC roots (thread stacks, statics, JNI refs). Generational hypothesis: most objects die young.\n\nTypical HotSpot flow:\n1. **Allocate** in Eden (TLAB for thread-local bump allocation).\n2. **Minor/Young GC** \u2014 copy live young objects to Survivor / promote to Old.\n3. **Old gen** collected less often (Mixed GC in G1, Concurrent Mark in CMS legacy, concurrent cycles in ZGC/Shenandoah).\n4. Collectors differ on **pause model**: stop-the-world vs concurrent marking/relocation.\n\nCosts: CPU, pauses, fragmentation, allocation stalls. Tuning is about **pause goals vs throughput**, not \u201cmaking GC disappear.\u201d Prefer fixing allocation rate and leaks before exotic flags.',
            },
            {
              question: 'G1 GC vs ZGC vs Serial GC?',
              answer:
                '- **Serial GC** \u2014 single-threaded STW; tiny heaps / containers, simplest. Rare in multi-core prod.\n- **G1 (default many releases)** \u2014 regions, concurrent marking, mixed collections; aims for **predictable pause targets** (`MaxGCPauseMillis`). Good general-purpose for medium/large heaps.\n- **ZGC / Shenandoah** \u2014 concurrent compaction, **ultra-low pauses** (ms) even on large heaps; more concurrent CPU trade-off. Excellent when tail latency matters.\n\n**Choose:** Serial for tiny tools; G1 default for most services; ZGC/Shenandoah when p99 GC pauses dominate SLOs. Always validate with production-like load and GC logs.',
            },
            {
              question: 'What triggers a Full GC?',
              answer:
                '\u201cFull GC\u201d usually means a collection that includes the old generation and often Metaspace, with longer STW (exact meaning varies by collector).\n\nCommon triggers:\n- Old gen / humongous allocation pressure (G1).\n- `System.gc()` (disable explicit GC in prod if unwanted).\n- Metaspace exhaustion / certain class unloading paths.\n- Promotion failure / concurrent mode failure (older collectors).\n- Heap dump / diagnostic operations in some setups.\n\n**Investigate:** GC logs (`-Xlog:gc*`), allocation rate, live-set size, fragmentation, finalizer/cleaner misuse, big caches without bounds.',
            },
            {
              question: 'How do you identify memory leaks in production?',
              answer:
                'Symptoms: heap usage ratchets up across GC cycles; Full GCs increase; eventually OOM or thrashing.\n\nApproach:\n1. Confirm with metrics: heap after GC (live set) trending up; GC frequency/pause.\n2. Capture **heap dump** on OOM (`-XX:+HeapDumpOnOutOfMemoryError`) or jcmd.\n3. Analyze in Eclipse MAT / VisualVM: dominator tree, duplicate strings, retainer paths (e.g. static Map, ThreadLocal, listener lists, unbounded caches).\n4. Correlate with deploys / traffic features.\n5. Fix: bounds, weak/soft refs carefully, clear ThreadLocals, close resources, size caches with eviction.\n\n**Not every rising heap is a leak** \u2014 it might be a growing legitimate cache or a memory leak in native/Metaspace.',
            },
            {
              question: 'What is a heap dump and when would you analyze it?',
              answer:
                'A **heap dump** is a snapshot of live objects on the heap (HPROF). Use when:\n- OOM or suspected leak.\n- Unexplained retained memory after GC.\n- Comparing two dumps (before/after) to see growth.\n\nTools: `jcmd GC.heap_dump`, `-XX:+HeapDumpOnOutOfMemoryError`, MAT (leak suspects, dominators), async-profiler alloc mode as lighter alternative.\n\n**Cautions:** dumps are large; taking them pauses or stresses the JVM; scrub sensitive data; prefer sampling in prod. For latency issues prefer JFR/GC logs first \u2014 dumps are for *retention* problems.',
            },
            {
              question: 'How does the JIT compiler improve performance?',
              answer:
                'HotSpot starts by **interpreting** bytecode, profiles hot methods, then **JIT-compiles** them to native code (C1 client / C2 server / Graal). Optimizations: inlining, escape analysis, loop unrolling, speculative types with deoptimization if assumptions fail.\n\nWarm-up matters: cold JVMs are slower until hot paths compile. Tiered compilation balances startup vs peak.\n\n**Implications:** microbenchmarks need JMH; \u201cfirst request slow\u201d may be JIT/GC/class-init; don\u2019t confuse interpreted vs compiled performance in reviews.',
            },
            {
              question: 'What is Escape Analysis?',
              answer:
                'JIT analysis deciding whether an object **escapes** the allocating method/thread. If it doesn\u2019t:\n- **Stack allocation / scalar replacement** \u2014 explode object into registers/locals; no heap alloc.\n- **Lock elision** \u2014 remove sync on non-escaping objects.\n- **Eliminated allocations** \u2014 huge win for short-lived iterators, wrappers.\n\nYou don\u2019t invoke it directly; write small scoped objects and the JIT may erase them. Escape analysis failures (object stored in field, returned, published) keep real allocations.',
            },
            {
              question: 'What is Metaspace and how is it different from PermGen?',
              answer:
                '**PermGen** (\u22647) held class metadata in a fixed heap-like space \u2192 frequent `PermGen OOM` with many classes.\n\n**Metaspace** (8+) stores class metadata in **native memory**, grows dynamically (bounded by `MaxMetaspaceSize`). Classloaders that load/unload dynamically (hot deploy, groovy, proxies) can still leak Metaspace if loaders aren\u2019t GC\u2019d.\n\n**Difference:** Metaspace isn\u2019t part of the Java heap; tune separately; leaks show as `OutOfMemoryError: Metaspace` with many loaded classes / loaders.',
            },
            {
              question: 'How do you troubleshoot OutOfMemoryError?',
              answer:
                'Read the **subtype**:\n- `Java heap space` \u2014 live set too big or leak; dump + MAT; raise `-Xmx` only after understanding.\n- `Metaspace` \u2014 classloader leak / too many classes; `MaxMetaspaceSize`, unload loaders.\n- `Unable to create native thread` \u2014 OS thread limits / too many threads; use pools / virtual threads carefully.\n- `Direct buffer memory` \u2014 NIO direct buffers; netty/max direct memory.\n- `GC overhead limit exceeded` \u2014 thrashing GC; heap too small for live set.\n\nAlways capture dump/flags/GC log; reproduce traffic; fix root cause before blind size bumps.',
            },
            {
              question: 'How do you troubleshoot high CPU usage in JVM applications?',
              answer:
                '1. Confirm process CPU vs system (noisy neighbor, steal time).\n2. **Thread dump** or async-profiler / JFR: which methods burn CPU?\n3. Distinguish: busy loops, hot crypto, excessive JSON, regex, GC threads, tight spin locks, runaway logging.\n4. Correlate with traffic, GC pauses (CPU from GC), JIT compilation spikes.\n5. Fix algorithm/allocations; cache wisely; reduce lock contention; bound thread pools.\n\nHigh CPU + low throughput often means lock contention or GC thrashing, not \u201cneed more CPU limits.\u201d',
            },
            {
              question: 'What tools do you use for JVM performance analysis?',
              answer:
                '- **JFR / async-profiler** \u2014 CPU, alloc, lock profiling with low overhead.\n- **GC logs / GCViewer / JDK Mission Control** \u2014 pause & heap behavior.\n- **jcmd / jstack / jmap** \u2014 dumps, flags, flight recordings.\n- **MAT / VisualVM** \u2014 heap analysis.\n- **Micrometer / Prometheus / APM** \u2014 runtime golden signals.\n- **JMH** \u2014 microbenchmarks done right.\n\nPrefer continuous profiling in staging/prod over guessing from logs alone.',
            },
          ],
        },
      ],
    },
    {
      id: 'design-patterns',
      title: 'Java Design Patterns',
      blocks: [
        {
          type: 'interviewQa',
          variant: 'sketch',
          title: 'Design Patterns Q&A',
          items: [
            {
              question: 'What problem does the Factory Pattern solve?',
              answer:
                '**Problem:** clients shouldn\u2019t hard-code concrete classes (`new PaypalClient()` everywhere). Creation logic (which impl, config, caching) gets duplicated and rigid.\n\n**Factory Method** lets a creator subclass / method decide the concrete product. Clients depend on an interface.\n\n**Benefits:** loose coupling, single place for construction, easier testing with fakes. **Cost:** more types; overkill for one obvious concrete class.\n\n**Spring example:** `PaymentService` interface with `CardPaymentService` / `UpiPaymentService` chosen by config \u2014 factory or DI replaces manual `new`.',
            },
            {
              question: 'Factory Pattern vs Abstract Factory Pattern?',
              answer:
                '- **Factory Method:** one product type; subclasses/methods choose *which* concrete product.\n- **Abstract Factory:** a family of related products (Button + Checkbox + Dialog for Light/Dark). Guarantees products match.\n\nUse Abstract Factory when objects must be consistent as a set (theme, cloud vendor kit). Use Factory Method for a single variation axis.\n\n**Interview line:** \u201cFactory Method creates A; Abstract Factory creates a matching kit of A+B+C.\u201d',
            },
            {
              question: 'When should you use the Builder Pattern?',
              answer:
                'Use Builder when constructors explode with optional params (telescoping constructors), or when building immutable objects step-by-step with validation.\n\nExamples: HTTP requests, query objects, domain aggregates with many fields.\n\n**API shape:** fluent `builder().x().y().build()`; `build()` validates invariants once.\n\nAvoid Builder for 2\u20133 clear required fields \u2014 a constructor is clearer.',
            },
            {
              question: 'Why is Builder preferred for immutable objects?',
              answer:
                'Immutable objects need all fields set at construction. Many optional fields \u2192 messy constructors or mutable setters that break immutability.\n\nBuilder accumulates state in a **mutable draft**, then `build()` creates the final immutable instance (often a record / final fields copy). You get readable construction + immutability + one validation point.\n\nAlso enables copying: `obj.toBuilder().fix(x).build()` for wither-style updates.',
            },
            {
              question: 'How do you implement a thread-safe Singleton?',
              answer:
                'Options (best \u2192 acceptable):\n\n1. **Enum singleton** \u2014 `INSTANCE`; JVM guarantees safe init; serialization-safe.\n2. **Initialization-on-demand holder** \u2014 nested static class; lazy + thread-safe without explicit locks.\n3. **Double-checked locking** with `volatile` field (pre-enum legacy interviews).\n4. **Static final field** \u2014 eager, simple, thread-safe.\n\nAvoid synchronized getInstance on every call (coarse). In Spring, prefer **container-managed** singleton beans over hand-rolled singletons.\n\n```java\npublic enum Services { INSTANCE; public void go() {} }\n```',
            },
            {
              question: 'What are the drawbacks of Singleton?',
              answer:
                '- **Hidden global state** \u2014 hard to test; order-dependent bugs.\n- **Concurrency** \u2014 mutable singletons need careful sync.\n- **Lifecycle** \u2014 unclear init/destroy; ClassLoader duplicates in app servers.\n- **API rigidity** \u2014 callers bake in `getInstance()`.\n- **Violates SRP** sometimes (creation + behavior).\n\nPrefer DI: one instance *by configuration*, not by hard-coded global. Singletons are fine for true process-wide stateless services when injected.',
            },
            {
              question: 'Explain the Strategy Pattern with a real-world example.',
              answer:
                '**Strategy** encapsulates interchangeable algorithms behind an interface; clients depend on the interface and swap strategies at runtime.\n\n**Example:** shipping cost \u2014 `ShippingStrategy` with `FedExStrategy`, `UpsStrategy`, `StorePickupStrategy`. Checkout calls `strategy.quote(cart)` without `if/else` chains.\n\n**Vs switch:** open for extension (new strategy) without editing callers (OCP). Spring injects a `Map<String, Strategy>` keyed by type.\n\nAlso common: auth mechanisms, payment rails, sorting/compression codecs.',
            },
            {
              question: 'When would you use the Observer Pattern?',
              answer:
                'When many listeners must react to state changes without the subject knowing concrete listeners \u2014 UI events, domain events, metrics hooks.\n\n**Structure:** Subject maintains a list of Observers; on change, `notify()`. Careful with: listener leaks, notification order, re-entrancy, async dispatch.\n\nIn modern Java: `PropertyChangeSupport`, RxJava/reactive streams, message buses. Prefer explicit domain events over sprawling listener lists.',
            },
            {
              question: 'How is Observer used in event-driven systems?',
              answer:
                'Producers publish events; consumers subscribe (Observer at scale). Kafka/Rabbit consumers are observers of a log/topic. In-process: Spring `ApplicationEventPublisher` / `@EventListener`.\n\n**Differences from classic Observer:** durability, fan-out across services, at-least-once delivery, schema evolution, idempotent handlers. The pattern idea (decouple producer from consumers) remains; the reliability model changes.',
            },
            {
              question: 'Adapter Pattern vs Decorator Pattern?',
              answer:
                '- **Adapter:** convert *incompatible interfaces* so an existing class can be used where another interface is required (wrap legacy SDK as `PaymentGateway`).\n- **Decorator:** add *behavior* while keeping the same interface (`BufferedInputStream` wrapping `FileInputStream`). Stackable.\n\nAdapter changes shape (I\u2192I2); Decorator extends responsibility (I\u2192I). Both use composition; don\u2019t confuse with inheritance for reuse.',
            },
            {
              question: 'How is Template Method different from Strategy?',
              answer:
                '**Template Method** (inheritance): abstract base defines algorithm skeleton; subclasses override steps (`final` template method calls `hook()`).\n\n**Strategy** (composition): algorithm object injected/replaced at runtime.\n\nTemplate Method couples via subclassing; Strategy is more flexible and testable. Prefer Strategy when you need runtime swap or multiple combinations; Template Method for fixed workflows with small variation points (e.g. ETL stages).',
            },
            {
              question: 'What is Dependency Injection and which pattern does it use?',
              answer:
                '**DI** supplies a class\u2019s dependencies from the outside instead of `new`ing them. It\u2019s an application of **Inversion of Control** and aligns with the **Strategy** idea (depend on abstractions) plus **Factory**/container for wiring.\n\nForms: constructor (best), setter, field. Benefits: testability, swappable impls, centralized lifecycle. Spring\u2019s IoC container is DI at scale.\n\nDI is not itself a GoF pattern name, but uses Factory + Strategy principles heavily.',
            },
            {
              question: 'Which design patterns are commonly used in Spring Framework?',
              answer:
                '- **DI / IoC** \u2014 container wiring.\n- **Proxy** \u2014 `@Transactional`, `@Async`, AOP, `@Cacheable`.\n- **Template Method** \u2014 `JdbcTemplate`, `RestTemplate` execute callbacks.\n- **Factory** \u2014 `BeanFactory`, FactoryBeans.\n- **Singleton** (scoped) \u2014 default bean scope.\n- **Observer** \u2014 Application events.\n- **Front Controller** \u2014 `DispatcherServlet`.\n- **Adapter** \u2014 HandlerAdapter MVC.\n\nMentioning Proxy + Template Method in interviews shows you understand Spring beyond annotations.',
            },
            {
              question: 'Which design patterns are most commonly used in microservices?',
              answer:
                '- **API Gateway** / **BFF**\n- **Service Discovery**\n- **Circuit Breaker**, **Retry**, **Bulkhead**\n- **Saga** / **Outbox** / **Inbox** (consistency)\n- **CQRS** / **Event Sourcing** (selectively)\n- **Sidecar** / **Ambassador**\n- **Strangler Fig**, **Anti-Corruption Layer**\n\nThese are distributed-systems patterns more than classic GoF \u2014 say that explicitly. Internally each service still uses DI, Strategy, Repository, etc.',
            },
          ],
        },
      ],
    },
    {
      id: 'core-java',
      title: 'Core Java',
      blocks: [
        {
          type: 'interviewQa',
          variant: 'sketch',
          title: 'Core Java Q&A',
          items: [
            {
              question: 'What is the Java Memory Model (JMM)?',
              answer:
                "The JMM specifies **visibility, ordering, and atomicity** rules for multithreaded programs. Without synchronization, compilers and CPUs may reorder instructions; threads may cache values.\n\n**Happens-before** is the key relation: if HB(A,B), then B sees A's effects. Established by locks, volatiles, concurrent utilities, thread start/join.\n\n**Atomicity:** writes to references and most primitives \u226432-bit are atomic; `long`/`double` may tear without volatile/atomic APIs on some platforms historically \u2014 use `volatile` or `AtomicLong`.\n\nInterview distinction: JMM \u2260 heap layout. JMM is about concurrent correctness.",
            },
            {
              question: 'Difference between final, finally, and finalize()?',
              answer:
                '- **`final`:** can\u2019t reassign variable / override method / extend class. For fields, safe publication nuances with JMM (immutable objects).\n- **`finally`:** block always run after try/catch (except JVM kill / infinite block). Used for cleanup when try-with-resources isn\u2019t enough.\n- **`finalize()`:** deprecated legacy GC cleanup hook \u2014 unpredictable, slow, never rely on it. Use `Cleaner`, try-with-resources, or explicit close.\n\nSaying \u201cnever use finalize\u201d is the expected senior answer.',
            },
            {
              question: 'How do you prevent OutOfMemoryError?',
              answer:
                'Prevention layers:\n1. **Right-size heap** from load tests; leave headroom for spikes.\n2. **Bound caches** (Caffeine/Guava with max size/TTL); no unbounded `HashMap` \u201ccache.\u201d\n3. **Stream large data**; don\u2019t load entire files/results into lists.\n4. **Close resources**; avoid native/direct buffer leaks.\n5. **Limit thread/connection pools** (each consumes memory).\n6. **Profile allocation**; cut chattiness (JSON, logging).\n7. Guard Metaspace (classloader leaks).\n\nOOM prevention is capacity + discipline, not only `-Xmx`.',
            },
            {
              question: 'What is polymorphism?',
              answer:
                'Ability to treat objects of different types uniformly through a common interface/base type \u2014 **runtime** method dispatch (overriding) or **compile-time** (overloading).\n\nExample: `Shape.area()` implemented by `Circle`/`Rectangle`; callers use `Shape`. Enables OCP and Strategy.\n\nInterview: polymorphism \u2260 inheritance alone; interfaces provide polymorphism without implementation inheritance.',
            },
            {
              question: 'What is inheritance?',
              answer:
                'A type derives state/behavior from a parent (`extends`). Promotes reuse but creates **tight coupling**. Prefer composition when sharing behavior without \u201cis-a.\u201d\n\nRules: single class inheritance; multiple interfaces. Overriding must honor LSP (subtypes usable as base types).\n\nModern style: inherit sparingly; favor interfaces + composition + records.',
            },
            {
              question: 'Method overloading vs method overriding?',
              answer:
                '- **Overloading:** same name, different parameter lists; resolved at **compile time** (static). Return type alone isn\u2019t enough.\n- **Overriding:** subclass redefines instance method of parent; resolved at **runtime** (dynamic dispatch). Same signature; covariant returns allowed; use `@Override`.\n\nPitfall: overloading with autoboxing/`null` can surprise. Overriding vs hiding static methods \u2014 statics don\u2019t override.',
            },
            {
              question: 'Difference between == and equals()?',
              answer:
                '`==` compares **references** for objects (identity) and values for primitives. `equals()` compares **logical equality** if overridden (`String`, records, value objects).\n\nContract: reflexive, symmetric, transitive, consistent; `a.equals(b)` \u21d2 same `hashCode`. Break the contract \u2192 `HashMap`/`HashSet` bugs.\n\nAlways override `hashCode` with `equals`. For identity maps use `IdentityHashMap` deliberately.',
            },
            {
              question: 'HashMap vs ConcurrentHashMap?',
              answer:
                '**HashMap:** not thread-safe; concurrent modification \u2192 corruption / infinite loops historically; fail-fast iterators.\n\n**ConcurrentHashMap:** thread-safe concurrent reads/writes; segments/CAS bins (impl evolved); iterators weakly consistent (no CME). `null` keys/values forbidden.\n\n**Caveat:** compound actions (`if (!contains) put`) still race \u2014 use `putIfAbsent`, `compute`, `merge`. CHM \u2260 \u201call business races fixed.\u201d',
            },
            {
              question: 'What are checked and unchecked exceptions?',
              answer:
                '- **Checked** (`Exception` except RuntimeException): must declare/handle; represent recoverable conditions (IOException).\n- **Unchecked** (`RuntimeException`, `Error`): not required to declare; bugs (NPE) or irrecoverable (`OutOfMemoryError`).\n\nDesign trend: prefer unchecked for most domain errors; use checked sparingly where callers *must* decide. Don\u2019t swallow exceptions; wrap with context.',
            },
            {
              question: 'What does volatile guarantee?',
              answer:
                '`volatile` guarantees:\n1. **Visibility** \u2014 writes flush to main memory; reads see latest write.\n2. **Ordering** \u2014 no reordering of volatile R/W with other accesses in ways that break happens-before (volatile write HB subsequent volatile read).\n\nDoes **not** make `i++` atomic \u2014 use `AtomicInteger` / sync. Use for flags, safe publication of immutable configs, simple status.\n\nPattern: `volatile boolean shutdown;` workers see stop signal.',
            },
            {
              question: 'Explain the synchronized keyword.',
              answer:
                '`synchronized` on method/block acquires the **intrinsic lock** (monitor) of an object. Provides mutual exclusion + happens-before (unlock HB next lock).\n\nSemantics: only one thread executes the critical section per lock. Reentrant (same thread can re-enter). Prefer private final lock objects over `this` to avoid external lock-ins.\n\nCosts: contention kills throughput. Alternatives: concurrent collections, ReadWriteLock, striped locks, lock-free atomics, actor/queue designs.',
            },
            {
              question: 'ArrayList vs LinkedList?',
              answer:
                '**ArrayList:** contiguous array; O(1) amortized add at end; O(1) random access; costly mid inserts (shift). Default choice.\n\n**LinkedList:** doubly linked nodes; O(1) insert/remove given node; O(n) access by index; more memory/pointer chasing \u2014 usually **worse** in practice on modern CPUs.\n\nInterview truth: prefer ArrayList unless profiling proves otherwise; `Deque`/`ArrayDeque` for queues/stacks.',
            },
            {
              question: 'Create a Singleton class.',
              answer:
                'Prefer enum:\n\n```java\npublic enum Config {\n  INSTANCE;\n  public String region() { return "ap-south-1"; }\n}\n```\n\nOr holder idiom:\n\n```java\npublic final class Config {\n  private Config() {}\n  private static class H { static final Config I = new Config(); }\n  public static Config get() { return H.I; }\n}\n```\n\nDiscuss thread safety, reflection/serialization attacks (enum wins), and why Spring `@Component` often replaces this.',
            },
            {
              question: 'Implement a stack using queues.',
              answer:
                'Classic exercise: two queues (or one deque). Approach \u2014 push costly:\n\n- `push(x)`: enqueue to q2, move all from q1\u2192q2, swap names. Pop/peek from front of q1 \u2014 O(1).\n- Or pop costly: push to q1 O(1); pop rotates n-1 elements.\n\nExplain complexity trade-off. In real Java use `ArrayDeque` as stack (`push`/`pop`), not `Stack` class (legacy synchronized).',
            },
            {
              question: 'Which Java 8 features matter most?',
              answer:
                '**Must-know:** lambdas, method references, Stream API, Optional, `java.time`, default methods on interfaces, CompletableFuture.\n\nThese changed APIs ecosystem-wide. Be ready to write a stream pipeline, explain Optional pitfalls, and convert `Date` to `Instant`/`ZonedDateTime`.',
            },
            {
              question: 'Which Java 17 features matter most?',
              answer:
                '**Sealed classes** (final), records (from 16, used heavily by 17), pattern matching for instanceof, text blocks, switch expressions (14+), strong encapsulation of JDK internals.\n\nLTS talking point: why teams move 11\u219217 \u2014 language expressiveness + long support + performance/GC improvements.',
            },
            {
              question: 'Java 8 vs Java 17?',
              answer:
                '**Language:** 17 adds records, sealed types, text blocks, switch expressions, pattern instanceof \u2014 less boilerplate, better domain modeling.\n\n**Platform:** modules (9+), removed Java EE modules from JDK, stronger encapsulation, modern G1 defaults, HTTP Client (11).\n\n**Ops:** 6-month release train; 17 is LTS vs 8 legacy LTS. Migration pain: reflection, removed APIs, illegal access.\n\nFrame answer as language + library + runtime + migration risk.',
            },
            {
              question: 'What is the Stream API?',
              answer:
                'An abstraction for processing sequences with declarative pipelines: intermediate ops (lazy) + terminal ops (eager). Supports filter/map/flatMap/reduce/collect, parallel optionally.\n\n**Not** a data structure \u2014 doesn\u2019t store elements. Avoid side effects in ops; prefer pure functions. Parallel streams need meaningful size + CPU-bound work + no shared mutable state.\n\nCommon collect: `Collectors.toMap`, groupingBy, joining.',
            },
            {
              question: 'What are lambda expressions?',
              answer:
                'Concise implementation of **functional interfaces** (SAM types): `(a,b) -> a+b`. Enable treating behavior as data.\n\nCaptured variables must be final/effectively final. Prefer method references when they read clearer. Lambdas + streams = expressive collection processing; overuse can hurt debuggability.',
            },
            {
              question: 'What is Optional and when should it be avoided?',
              answer:
                '`Optional<T>` communicates \u201cvalue may be absent\u201d in **return types**. Use `map`/`flatMap`/`orElseGet`/`orElseThrow`; avoid `get()` without check.\n\n**Avoid:** fields, parameters, collections of Optional, Optional everywhere as null replacement. Don\u2019t serialize Optional carelessly. Empty Optional \u2260 error \u2014 use exceptions for exceptional cases.\n\nRule: return Optional; accept nullable params only at boundaries if needed.',
            },
          ],
        },
      ],
    },
    {
      id: 'production-scenarios',
      title: 'Concurrency and Production Scenarios',
      blocks: [
        {
          type: 'interviewQa',
          variant: 'sketch',
          title: 'Production Scenarios Q&A',
          items: [
            {
              question: 'An API works for 100 users but times out at 10K while CPU is 40%. Why?',
              answer:
                'CPU headroom means you\u2019re likely **waiting**, not compute-bound:\n- Thread pool / Tomcat threads exhausted waiting on DB/HTTP.\n- Connection pool too small \u2192 threads block borrowing.\n- Lock contention (not burning CPU).\n- Downstream latency amplified by fan-out.\n- Queueing delay (Little\u2019s law): latency \u2248 in-flight / throughput.\n\n**Debug:** thread dump (BLOCKED/WAITING), pool metrics, DB time vs app time, timeouts. Fix: bound pools, timeouts, cache, async where safe, scale the real bottleneck (often DB).',
            },
            {
              question: 'HashMap.get() returns null for an inserted object. Why?',
              answer:
                'Common causes:\n1. **equals/hashCode** broken or mutated key fields after insert.\n2. Key is different instance with unequal equals.\n3. Accidentally used different map instance.\n4. Concurrent modification of non-concurrent map (corruption).\n5. Key type mismatch (Integer vs String \u201c1\u201d).\n6. Stored value was null (get can\u2019t distinguish \u2014 use `containsKey`).\n\nWalk through equals/hashCode contract; prefer immutable keys.',
            },
            {
              question: 'Heap keeps growing even after Full GC. How do you debug it?',
              answer:
                'If live set after GC grows \u2192 retained objects (leak or unbounded cache).\n\n1. Graph heap after-GC metric over time.\n2. Take dumps hours apart; compare dominators.\n3. Look for: static collections, ThreadLocal, listeners, sessions, Hibernate sessions, unbounded queues.\n4. Check Metaspace separately if classes grow.\n5. Verify not just higher legitimate traffic/cache warm-up.\n\nFix retainers; add bounds; don\u2019t only increase `-Xmx` (delays OOM).',
            },
            {
              question: 'Two threads corrupt inventory count. How do you fix it?',
              answer:
                'Classic lost update on read-modify-write.\n\nFixes by layer:\n- **JVM:** `AtomicInteger`, synchronized, locks.\n- **DB (correct for inventory):** transactional update `SET qty = qty - 1 WHERE id=? AND qty>=1`, optimistic `@Version`, or `SELECT FOR UPDATE`.\n\nDistributed systems: single writer / DB as source of truth \u2014 not \u201csynchronize in two app nodes.\u201d Idempotent decrement with conditional update prevents oversell.',
            },
            {
              question: 'Long GC pauses hit production. What do you investigate?',
              answer:
                '1. GC logs: pause duration, which collector, heap occupancy before/after.\n2. Live set size vs heap \u2014 too full \u2192 frequent/long GC.\n3. Allocation rate / object churn.\n4. Humongous objects (G1), fragmentation.\n5. Explicit `System.gc`, heap dumps, toomany finalizers.\n6. CPU starvation lengthening STW.\n7. Consider ZGC/Shenandoah if pause SLO tight and heap large.\n\nReduce allocations & live data first; collector swap second.',
            },
            {
              question: 'Java 21 virtual threads reduce performance. Why?',
              answer:
                'Possible causes:\n- **Pinning** (historically synchronized/JNI) reducing carrier utilization \u2014 improved in newer JDKs but still profile.\n- Using VT like platform threads with **huge pools of pools**.\n- CPU-bound work on millions of VTs \u2192 thrashing.\n- Thread-local heavy frameworks bloating memory per VT.\n- Blocking in ways that still monopolize carriers incorrectly.\n- Measuring wrong (overhead of creating too many tasks for tiny work).\n\nVTs shine for high-count blocking I/O; not magic for CPU-bound tasks. Profile carriers, pinning, allocations.',
            },
            {
              question: 'A CompletableFuture chain fails midway. How do you recover?',
              answer:
                'Use `handle` / `exceptionally` / `whenComplete` to transform exceptions; `exceptionallyCompose` for async recovery. Don\u2019t ignore `get()` exceptions.\n\nEnsure executor for async stages; otherwise callbacks run on ForkJoinPool.commonPool or completing thread \u2014 starvation risks.\n\nFor multi-stage sagas: compensate prior successes; retry idempotent stages; circuit-break downstream. Log exceptional completion with correlation IDs.',
            },
            {
              question: 'ConcurrentHashMap is thread-safe, yet race conditions exist. Why?',
              answer:
                'Thread-safe structure \u2260 atomic **business** transactions. Example:\n\n```java\nif (!map.containsKey(k)) map.put(k, create()); // race\n```\n\nTwo threads both create. Use `computeIfAbsent`, `putIfAbsent`, `merge`. Multi-map invariants still need external sync or higher-level concurrency design.\n\nAlso: iterating and mutating elsewhere needs clear semantics (weakly consistent iterators).',
            },
            {
              question: 'Spring @Transactional self-invocation does not roll back. Why?',
              answer:
                '`@Transactional` works via **proxy**. `this.method()` bypasses the proxy \u2192 no transaction advice \u2192 no rollback semantics from Spring.\n\nFixes: move method to another bean; inject self; AspectJ mode; call through facade. Also check exception types (`rollbackFor`) and that the caller is outside the class.\n\nThis is a classic Spring + Java interview crossover.',
            },
            {
              question: 'JPA executes 1 + 500 queries. How do you fix it?',
              answer:
                '**N+1:** one query for parents, N for lazy children.\n\nFixes: `JOIN FETCH` / `@EntityGraph`; `@BatchSize`; DTO projections/`@Query`; avoid EAGER everywhere (can explode cartesian products). Detect with statistics / p6spy.\n\nDesign APIs to return DTOs shaped for the use case, not deep entity graphs.',
            },
            {
              question: 'DB connections are exhausted, but DB CPU is normal. Why?',
              answer:
                'Connections held waiting **outside** heavy SQL:\n- App threads hold connections during remote HTTP calls inside `@Transactional`.\n- Pool too small vs thread concurrency.\n- Connection leak (not closed).\n- Slow queries waiting on locks (DB CPU idle, sessions blocked).\n- Network latency to DB.\n\nCheck `active/pending` pool metrics, `pg_stat_activity` wait events, transaction boundaries. Shorten transactions; never call HTTP while holding a connection.',
            },
            {
              question: 'How does a retry storm make an outage worse?',
              answer:
                'Clients/services retry aggressively on timeout \u2192 multiply traffic to a struggling dependency \u2192 longer queues \u2192 more timeouts \u2192 more retries.\n\nMitigate: exponential backoff + jitter, max attempts, **circuit breakers**, bulkheads, retry only idempotent ops, load shedding, deadlines. Prefer fail fast over synchronized retry stampedes.',
            },
            {
              question: 'Payment succeeds, but Order Service crashes. How do you recover safely?',
              answer:
                'Dual-write failure. Patterns:\n1. **Idempotent** payment + order creation with same business key.\n2. **Transactional outbox** on payment side; order consumes event.\n3. Reconciliation job comparing payment ledger vs orders.\n4. Saga compensating steps if order can\u2019t be created.\n\nNever \u201ccharge then hope.\u201d Design for at-least-once with dedupe.',
            },
            {
              question: 'Redis returns stale data. How do you handle cache invalidation?',
              answer:
                'Strategies:\n- **TTL** as safety net.\n- **Write-through / write-behind** carefully.\n- **Cache-aside:** update DB then delete/invalidate key (not set-then-forget).\n- Versioned keys / event-driven invalidation across nodes.\n- Accept eventual consistency where OK; bypass cache on strong-read paths.\n\nMulti-instance: local caches need pub/sub invalidation or use Redis as the shared cache only.',
            },
            {
              question:
                'One microservice succeeds and another fails. How do you maintain consistency?',
              answer:
                'Avoid 2PC across services. Use:\n- **Saga** (choreography/orchestration) with compensations.\n- **Outbox + events** for reliable messaging.\n- Idempotent consumers.\n- Workflow state machine persisted.\n\nDefine business-acceptable eventual consistency; show user-visible status (\u201cpayment captured, fulfillment pending\u201d).',
            },
            {
              question: 'Production throws OutOfMemoryError: Metaspace. What could cause it?',
              answer:
                'Class metadata native memory exhausted \u2014 often **ClassLoader leaks**: hot redeploy, generating proxies/bytecode per request, scripting engines, unbounded dynamic classes.\n\nCheck loaded class count / loader count (JFR, jcmd). Fix leaks; set `MaxMetaspaceSize` to fail fast; avoid per-request class generation.',
            },
            {
              question:
                'synchronized fixes correctness but kills throughput. What alternatives exist?',
              answer:
                '- Narrow critical sections; lock striping.\n- `ReadWriteLock` / StampedLock for read-heavy.\n- Concurrent collections / atomics / LongAdder.\n- Queue + single writer (actor style).\n- Partition data by key (thread confinement).\n- Optimistic concurrency at DB.\n- Lock-free algorithms carefully.\n\nMeasure contention (JFR lock profiling) before redesigning.',
            },
            {
              question:
                'Average latency is 200 ms, but p99 is 8 seconds. What is the real problem?',
              answer:
                'Tail latency \u2014 averages hide outliers. Causes: GC pauses, noisy neighbors, lock convoy, slow disk, cold caches, retry amplification, queueing at saturation, JVM safepoints, dependency latency spikes.\n\nInstrument **histograms** (p95/p99/p999), correlate with GC/dep metrics, use latency SLOs. Optimize the tail, not the mean.',
            },
            {
              question: 'How do you process a 5 GB CSV without an OutOfMemoryError?',
              answer:
                'Stream it:\n- Read line-by-line / use streaming CSV parsers.\n- Process & write in chunks; flush periodically.\n- Don\u2019t build a 5GB `List<Row>`.\n- Optionally split files; parallelize by shard with bounded memory.\n- Off-heap only if you know what you\u2019re doing.\n\nSame idea for JSON: streaming parsers, not `readTree` of entire file.',
            },
            {
              question:
                'The application becomes slow after hours. Which JVM metrics do you analyze?',
              answer:
                '- Heap after GC / old gen occupancy trend (leak).\n- GC pause frequency & duration.\n- Allocation rate.\n- Thread count / blocked threads.\n- Connection pool pending.\n- Metaspace / direct memory.\n- CPU + context switches.\n- Cache hit rates / queue depths.\n\nCompare \u201cfresh after deploy\u201d vs \u201cafter 8h\u201d dashboards; dump if live set grows.',
            },
            {
              question: 'A ThreadPoolExecutor queue keeps growing. What does it indicate?',
              answer:
                'Submission rate > processing rate. Workers saturated or blocked (IO/locks). Queue growth \u2192 latency explosion \u2192 eventual rejection/`OutOfMemoryError` if unbounded.\n\nActions: bound queue + rejection policy, scale workers (if CPU allows), fix slow dependencies, shed load, break work differently. Unbounded `LinkedBlockingQueue` hides incidents until death.',
            },
            {
              question: 'One downstream API becomes slow. How do you prevent thread exhaustion?',
              answer:
                '- **Timeouts** on HTTP clients (connect + read).\n- Separate **bulkhead** pools per dependency.\n- Circuit breaker + fallback.\n- Limit in-flight requests (semaphores).\n- Async / messaging for non-critical paths.\n- Virtual threads help density but still need timeouts & bounds.\n\nNever share one infinite pool across all downstreams.',
            },
          ],
        },
      ],
    },
  ],
};

export default content;
