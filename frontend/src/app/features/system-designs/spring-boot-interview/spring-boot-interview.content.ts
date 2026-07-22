import { DesignContent } from '../../../shared/models';
import { SPRING_BOOT_INTERVIEW_META } from './spring-boot-interview.meta';

const content: DesignContent = {
  meta: SPRING_BOOT_INTERVIEW_META,
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'markdown',
          value:
            'Spring Boot interview prep with **simple, clear answers** in sketchnote style — handwritten fonts on a notebook board. Expand each question to reveal the answer.',
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'How to practise',
          body: 'Say your answer out loud in four steps: **what it does → how it works underneath → how it can break → how you\u2019d notice that in production**. A strong answer names the actual thing involved — the proxy, the pool, the filter chain — not just the annotation.',
        },
      ],
    },
    {
      id: 'spring-core',
      title: 'Spring and Web Fundamentals',
      blocks: [
        {
          type: 'interviewQa',
          variant: 'sketch',
          title: 'Core Spring Boot Q&A',
          items: [
            {
              question: 'What happens internally when a REST API request reaches Spring Boot?',
              answer:
                'A request travels through several stops before you get a response.\n\n**The path:** client \u2192 embedded Tomcat (the web server) \u2192 a chain of filters (security, CORS, etc.) \u2192 `DispatcherServlet` \u2192 it finds the right controller method \u2192 arguments are read/validated \u2192 your business logic runs \u2192 the return value is converted (usually to JSON) \u2192 response goes back to the client.\n\n**Behind the scenes:** Boot starts an embedded server for you and registers one `DispatcherServlet` that handles every request at `/`. Filters run *before* the servlet gets involved. Your controllers are just Spring beans, and JSON conversion is usually done by `MappingJackson2HttpMessageConverter`.\n\n**Say in the interview:** "Filters run first, then `DispatcherServlet` routes to the matching controller, binds and validates the input, runs the method, then converts the return value to JSON."',
            },
            {
              question: 'Explain the DispatcherServlet flow.',
              answer:
                '`DispatcherServlet` is the single **front door** for every request in Spring MVC. Think of it as a traffic controller that decides where each request goes.\n\n1. `HandlerMapping` figures out which controller method matches the URL.\n2. `HandlerAdapter` actually calls that method.\n3. Any `HandlerInterceptor`s run before and after (e.g. logging, auth checks).\n4. The return value gets turned into a response (JSON body, or a view name).\n5. If something throws, it goes to `HandlerExceptionResolver` or `@ControllerAdvice`.\n\n**Simple picture:** one servlet in front, many controllers behind it. The mapping and adapter layers are what let Spring MVC support many styles of controller without hardcoding anything.',
            },
            {
              question: 'What is the difference between @Component, @Service, and @Repository?',
              answer:
                'All three do the same basic thing: they tell Spring "this class is a bean, please manage it." The difference is mostly about **naming intent**, with one real behavioral extra.\n\n- **`@Component`**: the generic, "this is a Spring-managed class" label.\n- **`@Service`**: same as `@Component`, just says "this holds business logic." Purely for readability.\n- **`@Repository`**: also marks a class for scanning, but Spring adds one real feature — it automatically converts low-level database errors (like a raw JDBC or JPA exception) into Spring\u2019s own `DataAccessException` family, so your code doesn\u2019t need to know which database driver threw the error.\n\n**Interview tip:** use the specific stereotype that matches the class\u2019s job — it makes code easier to read and lets Spring\u2019s tooling apply the right behavior. The one difference that actually matters technically is `@Repository`\u2019s exception translation.',
            },
            {
              question: '@Autowired vs constructor injection?',
              answer:
                'Both are ways to give a class its dependencies, but they behave very differently.\n\n**Constructor injection (the preferred way):** dependencies are passed in through the constructor, can be marked `final`, must exist before the object is usable, and are very easy to test — just call `new MyService(fakeDependency)`. If a required bean is missing, the app fails immediately at startup instead of later at runtime. Spring is smart enough to skip the `@Autowired` annotation entirely if there\u2019s only one constructor.\n\n**Field injection (`@Autowired` on a field):** dependencies are set behind the scenes by reflection. It looks simple but hides what the class actually needs, makes unit testing harder (you often need a Spring context just to set the field), and lets you accidentally end up with a half-built object.\n\n**Setter injection:** used rarely, mainly for optional dependencies you might change later.\n\n**Simple rule:** use constructor injection for anything the class truly needs to work. Avoid field injection in real production code.',
            },
            {
              question: 'What is bean scope? Explain Singleton vs Prototype.',
              answer:
                '**Bean scope** just answers: how many copies of this object does Spring create, and how long does each one live?\n\n- **Singleton (the default):** Spring creates exactly **one instance** and hands out the same object everywhere it\u2019s injected. Because it\u2019s shared, it must be **thread-safe** — don\u2019t store per-request data in a singleton\u2019s fields.\n- **Prototype:** Spring creates a **brand-new instance every time** it\u2019s requested. Careful: Spring does not fully manage the cleanup (destruction) of prototype beans for you — you\u2019re on your own there.\n\nOther scopes exist for web apps too: `request`, `session`, `application`.\n\n**A common trap:** if you inject a prototype bean into a singleton, Spring only creates the prototype **once** — at the moment the singleton is built — not fresh each time you use it. To get a truly new instance on every use, inject an `ObjectFactory`, `Provider`, or use `@Lookup` instead.',
            },
            {
              question: 'What is Spring AOP? Where have you used it?',
              answer:
                '**AOP (Aspect-Oriented Programming)** lets you add behavior that cuts across many classes — like logging, security checks, or transactions — without writing that code in every method by hand.\n\nHow it works: Spring wraps your bean in a **proxy** (a stand-in object). When you call a method, the call actually hits the proxy first, which can run extra logic before/after your real method.\n\n**Where you\u2019ll see it used:** `@Transactional` (start/commit a database transaction), `@Async` (run a method on another thread), `@Cacheable` (skip the method if the result is already cached), a custom `@Around` aspect (e.g. to time methods or write audit logs), and method-level security like `@PreAuthorize`.\n\n**Important gotcha:** the proxy only kicks in when the call comes from **outside** the class. If a method calls another method on `this` inside the same class, it skips the proxy entirely — so the AOP behavior (transaction, cache, etc.) silently doesn\u2019t run. This is called self-invocation, and it trips up a lot of people.',
            },
            {
              question: 'How does @Transactional work internally?',
              answer:
                'Spring wraps the bean in a **proxy**, just like with AOP in general. Here\u2019s what happens on a call to an `@Transactional` method:\n\n1. The proxy asks `PlatformTransactionManager` to either start a new transaction or join an existing one, based on the propagation setting.\n2. It attaches transactional resources (like the database `EntityManager`) to the current thread, using `TransactionSynchronizationManager`.\n3. Your actual method runs.\n4. If it finishes normally, the transaction **commits** (unless something explicitly marked it "rollback-only"). If it throws a **runtime (unchecked) exception**, Spring **rolls back** by default.\n5. Any registered "run after commit/completion" callbacks fire (e.g. flushing changes, sending an event).\n\n**What this requires to actually work:** the call must go through the proxy (no self-invocation), you need the correct transaction manager configured for your data layer (JPA vs plain JDBC), and the method usually needs to be `public` for proxy-based AOP to apply.',
            },
            {
              question: 'What causes LazyInitializationException?',
              answer:
                'This happens when you try to read a **lazily loaded** piece of data from a database entity, but the database connection that would fetch it is already closed.\n\n**Classic example:** a `@Transactional` service method loads a `Parent` entity and returns it. The transaction ends (connection closes) as soon as the method returns. Later, when the controller tries to serialize `parent.getChildren()` into JSON, Spring tries to lazily fetch the children — but there\u2019s no open connection anymore, so it throws.\n\n**How to fix it:**\n- Fetch everything you need up front with a **join fetch** or an entity graph.\n- Use `@Transactional(readOnly = true)` at the layer where you actually read the data.\n- Return DTOs (plain data objects) instead of raw entities, so there\u2019s nothing left to lazily load later.\n- As a last resort, "Open Session in View" keeps the connection open longer — but it\u2019s usually best avoided in APIs since it hides the real problem.\n- Or just load the data you need explicitly, while the transaction is still open.',
            },
            {
              question: 'How do you implement pagination and sorting?',
              answer:
                'Spring Data makes this easy: repository methods can accept a `Pageable` or `Sort` parameter, and return `Page<T>` (with total count) or `Slice<T>` (without it, cheaper).\n\nIn the controller, Spring automatically builds a `Pageable` from query params like `?page=0&size=20&sort=name` — you don\u2019t have to parse them yourself.\n\n**Practical tips:**\n- Always cap the max page size so nobody can request `size=1000000`.\n- For very deep pages (page 5000 of a huge table), regular offset pagination gets slow — use **keyset/seek pagination** instead (e.g. "give me rows after this ID").\n- `Page` (which counts total rows) is expensive on huge tables — use `Slice` if you don\u2019t truly need the total.\n- Return DTOs, not full entity graphs, to avoid pulling in unnecessary related data.',
            },
            {
              question: 'How do you validate request payloads?',
              answer:
                'Use **Bean Validation** (the `jakarta.validation` annotations): put things like `@NotNull`, `@Size`, `@Email`, or your own custom constraint directly on your DTO fields.\n\nThen add `@Valid` (or `@Validated`) on the controller method\u2019s parameter so Spring actually runs those checks before your method body executes. If validation fails, Spring throws `MethodArgumentNotValidException` — catch that in a `@ControllerAdvice` and turn it into a clean **400 Bad Request** response with the list of field errors.\n\n**Good practice:** validate input right at the boundary (the DTO), but also keep important business rules enforced inside the domain layer itself — don\u2019t rely on annotations alone for things that really matter. For query/path parameters, you can validate those too by adding `@Validated` on the whole controller class.',
            },
          ],
        },
      ],
    },
    {
      id: 'advanced-container-internals',
      title: 'Advanced Container, Proxy, and Auto-Configuration Internals',
      blocks: [
        {
          type: 'interviewQa',
          variant: 'sketch',
          title: 'Advanced Container, Proxy & Auto-Configuration Failures',
          items: [
            {
              question:
                'Why can returning a new object from a custom BeanPostProcessor silently remove @Transactional, @Cacheable, and @Secured proxies?',
              answer:
                'Spring chains `BeanPostProcessor`s: each processor must pass its result to the next. Infrastructure auto-proxy creators wrap eligible beans with proxies that carry transaction, cache, and method-security interceptors. If a later custom processor ignores the `bean` argument and returns a fresh raw object, it discards the proxy and all advice already attached to it. If it runs earlier, the replacement may still be proxied, but it may have lost injected state, identity, annotations/type metadata, and lifecycle callbacks.\n\nThe failure is silent because the replacement still implements the expected API and methods still run—just without advice. Never instantiate a replacement casually inside `postProcessAfterInitialization`; normally mutate/decorate and return the supplied bean. If replacement is intentional, preserve ordering, delegate to the original/proxy, and test with `AopUtils.isAopProxy`, transaction/cache/security integration tests, and startup logs. `Ordered` controls sequence, but relying on order to replace managed identity is fragile.',
            },
            {
              question:
                'Why does declaring a BeanFactoryPostProcessor as a non-static @Bean sometimes break @Value placeholder injection?',
              answer:
                '`BeanFactoryPostProcessor` runs after bean definitions are loaded but **before ordinary beans and BeanPostProcessors are created**. To invoke a non-static `@Bean` method, Spring must instantiate its containing `@Configuration` class early. That instance is created before normal annotation injection is fully available, so `@Autowired`, `@Value`, and other post-processor-driven features on the configuration class may be skipped or see unresolved placeholders. Spring logs warnings about non-static post-processor factory methods for this reason.\n\nDeclare infrastructure post-processors as `static @Bean`; Spring can invoke the factory method without prematurely creating the configuration instance. Prefer constructor/factory-method parameters or `Environment` for values needed during this phase, and keep BFPP creation independent of application beans—requesting regular beans from it can trigger more premature initialization.',
            },
            {
              question:
                'How can a custom FactoryBean accidentally bypass Spring AOP proxy creation?',
              answer:
                'A correctly used `FactoryBean` does **not** inherently bypass AOP: when callers obtain the product through `ApplicationContext.getBean(...)`/dependency injection, Spring obtains `getObject()` and post-processes the product. Bypass happens when application code injects the factory itself (`&beanName`) and calls `getObject()` directly, when the factory publishes/caches a manually created product outside the container, or when it creates products during infrastructure startup before auto-proxy creators are ready. Those raw instances never traverse the normal post-processor chain.\n\nLet consumers request the product type, not the factory; do not expose raw products through static holders; declare accurate `getObjectType()` and singleton semantics; and use normal `@Bean`/component construction where possible. Verify the injected product—not merely the factory—with `AopUtils.isAopProxy` and an integration test proving advice executes.',
            },
            {
              question:
                'Why does a manually instantiated bean (new MyService()) never receive dependency injection or AOP advice?',
              answer:
                '`new MyService()` creates a plain Java object outside the `ApplicationContext`. Spring never sees its bean definition, does not run dependency injection, aware callbacks, `@PostConstruct`, destruction callbacks, BeanPostProcessors, or auto-proxy creators. Therefore `@Autowired` fields remain unset and `@Transactional`, `@Async`, `@Cacheable`, and `@Secured` are just metadata with no runtime interceptor.\n\nInject the Spring-managed service through constructor injection, expose third-party objects with `@Bean`, or ask an `ObjectProvider` for scoped/lazy instances. `AutowireCapableBeanFactory` can initialize external objects for framework-integration edge cases, but it increases lifecycle ambiguity and should not replace normal container ownership.',
            },
            {
              question:
                'How does Spring decide between JDK Dynamic Proxy and CGLIB, and what production issues can that choice introduce?',
              answer:
                'In core Spring AOP, an interface-based target can use a **JDK dynamic proxy**; a class without suitable interfaces needs a **CGLIB subclass**. `proxyTargetClass=true` forces class-based proxying; Spring Boot’s AOP auto-configuration commonly defaults that property to true, so verify the effective configuration rather than assuming.\n\nJDK proxies expose only proxied interfaces: injecting/casting to the concrete class or advising a method absent from the interface can fail. CGLIB proxies subclass the target, so final classes/methods and private methods cannot be overridden/advised; Kotlin classes are final unless opened, and module/native-image constraints may matter. Both approaches still have self-invocation bypass, proxy identity/`equals` surprises, and advice only on eligible method calls.\n\nProgram to interfaces where practical, avoid final advised methods, use constructor injection, inspect the runtime class/AOP logs, and test the chosen packaging/runtime. Do not cast a proxied bean to an implementation unless class-based proxying is an explicit contract.',
            },
            {
              question:
                'Why can SmartInitializingSingleton trigger expensive database calls before your application is actually ready?',
              answer:
                '`afterSingletonsInstantiated()` runs near the end of `ApplicationContext.refresh()`, after regular non-lazy singletons have been created—but before refresh completes, the web server/application readiness lifecycle fully settles, and `ApplicationReadyEvent` is published. A database scan, cache warm-up, remote call, or migration there blocks startup, holds the context refresh thread, can exceed orchestration startup probes, and may run before downstream infrastructure is ready.\n\nUse it only for fast in-memory validation/wiring that genuinely must happen before the context is usable. Put schema migrations in Flyway/Liquibase; move optional warm-up to an `ApplicationRunner`, `ApplicationReadyEvent`, controlled `SmartLifecycle`, or background job; expose readiness as false until mandatory warm-up completes. Add timeouts, idempotency, metrics, and a policy for partial failure.',
            },
            {
              question:
                'What happens when two auto-configurations define the same bean with conflicting conditions?',
              answer:
                'Well-designed auto-configurations use `@ConditionalOnMissingBean`, ordering (`@AutoConfigureBefore/@AutoConfigureAfter`), class/property conditions, and distinct names so one backs off deterministically. If both definitions share a name and bean-definition overriding is disabled (Boot’s safe default), startup fails with `BeanDefinitionOverrideException`. If names differ but types are identical, startup may succeed until injection raises `NoUniqueBeanDefinitionException`. If conditions are sensitive to processing order, the first registered bean may make the second back off.\n\nInspect the `ConditionEvaluationReport` (`--debug` or Actuator conditions), bean-definition origins, auto-configuration imports, and ordering. Fix by making conditions mutually exclusive, ordering explicitly, using `@Primary/@Qualifier` only when both beans are intentional, or excluding/replacing one auto-configuration. Enabling global bean overriding hides ambiguity and makes upgrades order-dependent.',
            },
            {
              question:
                'Why can overriding an auto-configured bean unintentionally disable metrics, tracing, or health checks?',
              answer:
                'Boot auto-configuration is a graph of conditional beans. Supplying a custom `DataSource`, HTTP client, executor, cache manager, or connection factory makes `@ConditionalOnMissingBean` back off. The replacement may omit observation interceptors, Micrometer customizers, tracing propagation, health contributors, pool metadata, lifecycle hooks, or properties that the auto-configured builder would have applied. Sometimes a downstream observation configuration is conditional on the auto-configured type/name itself.\n\nBefore overriding, inspect the conditions report and source of the relevant auto-configuration. Prefer a supported `Customizer`, builder callback, properties, or decorator so Boot retains instrumentation. If replacement is necessary, apply the framework’s customizers/observation registry and register health/metrics deliberately. Compare `/actuator/metrics`, traces, `/health`, bean inventory, and integration tests before and after the override.',
            },
            {
              question:
                'How do ApplicationContextInitializer, BeanFactoryPostProcessor, and BeanPostProcessor execute during the Spring lifecycle?',
              answer:
                'The simplified order is:\n\n1. Boot creates the `ApplicationContext` and applies **`ApplicationContextInitializer`** instances before refresh; they can alter the environment/context and register definitions/property sources, but ordinary beans do not exist.\n2. During refresh, Spring loads bean definitions, then invokes **`BeanDefinitionRegistryPostProcessor`** and **`BeanFactoryPostProcessor`** instances. They modify metadata/definitions—not normal bean instances. Placeholder configuration is prepared in this phase.\n3. Spring registers **`BeanPostProcessor`** instances.\n4. Each ordinary bean is instantiated, dependencies populated, aware callbacks invoked, then BPP before-initialization → `@PostConstruct`/init → BPP after-initialization. Auto-proxy creators commonly return proxies in the after step.\n5. `SmartInitializingSingleton`, lifecycle start, context-refreshed/ready events, and runners follow according to their contracts.\n\nCreating application beans during phases 1–2 can bypass later processing. Use the earliest extension point that actually matches the job and keep infrastructure callbacks lightweight.',
            },
            {
              question:
                'How does @Configuration(proxyBeanMethods = false) improve startup performance, and what trade-offs does it introduce?',
              answer:
                'Full `@Configuration` classes (`proxyBeanMethods=true`) are enhanced with a CGLIB subclass. Calls from one `@Bean` method to another are intercepted and redirected to the container, preserving singleton/scoped semantics. Enhancement adds class generation, proxying, and method interception at startup/runtime.\n\nWith `proxyBeanMethods=false`, Spring treats it as “lite” configuration and skips that CGLIB enhancement, reducing startup work and native-image/proxy complexity. The trade-off: a direct Java call such as `dataSource()` from another `@Bean` method invokes the method normally and creates a new unmanaged instance instead of retrieving the container bean.\n\nUse false when `@Bean` methods are independent and receive dependencies as method parameters—`service(DataSource dataSource)`—rather than calling each other. Keep true only when inter-bean method calls intentionally rely on interception, or refactor those calls first.',
            },
          ],
        },
      ],
    },
    {
      id: 'servlet-filter-internals',
      title: 'Servlet Filter Internals',
      blocks: [
        {
          type: 'interviewQa',
          variant: 'sketch',
          title: 'OncePerRequestFilter Production Traps',
          items: [
            {
              question:
                'Why can a poorly written OncePerRequestFilter execute multiple times for a single request?',
              answer:
                '`OncePerRequestFilter` means once per **configured dispatch**, enforced by a request attribute based on the filter name—not magically once across every possible registration and dispatch. It can run more than expected when the same filter is registered twice (for example `@Component` servlet auto-registration **and** `http.addFilter...` in Spring Security), when two filter instances/names use different already-filtered attributes, or when a request performs `ASYNC`, `ERROR`, or forward dispatches and the filter opts into those dispatch types. Multiple matching `SecurityFilterChain`s or manual delegation can also duplicate custom logic.\n\nKeep one registration path. If the filter belongs inside Spring Security, create it as a bean, disable standalone servlet registration with `FilterRegistrationBean#setEnabled(false)`, and add it once at a deliberate security-chain position. Put logic only in `doFilterInternal`, call `filterChain.doFilter` exactly once on allowed paths, and override `shouldNotFilterAsyncDispatch`, `shouldNotFilterErrorDispatch`, and `shouldNotFilter` explicitly for the intended semantics. Log dispatcher type, filter instance/name, and correlation ID when diagnosing duplicates; test REQUEST, ERROR, ASYNC, and forwarded flows.',
            },
          ],
        },
      ],
    },
    {
      id: 'data-production',
      title: 'Data Access and Production',
      blocks: [
        {
          type: 'interviewQa',
          variant: 'sketch',
          title: 'Data, APIs & Production Q&A',
          items: [
            {
              question: 'How would you trace a request across multiple Spring Boot microservices?',
              answer:
                'The trick is to attach one shared ID to a request and carry it through **every service** it touches, so you can follow its whole journey later.\n\n**How it\u2019s usually done:** use a standard format for passing trace info between services (W3C Trace Context, or B3). In Spring, that means **Micrometer Tracing** paired with OpenTelemetry or Brave. Each service logs the `traceId`/`spanId` (via MDC, so it shows up automatically in every log line) and sends span data to a tool like Zipkin, Jaeger, or Tempo. The very first service (often an API gateway) creates the trace ID, and every downstream call — HTTP or messaging — continues that same trace.\n\n**Extra tip:** even if you\u2019re not capturing a full trace for every request (sampling), still log a simple `requestId` on every request so support/on-call folks can search logs by it.',
            },
            {
              question: 'What are the most common causes of connection-pool exhaustion?',
              answer:
                'This happens when all the database connections in your pool are "checked out" and none are free for new requests. Common causes:\n\n1. Slow queries or database locks holding a connection for a long time.\n2. Code that borrows a connection and never returns it — usually a missing try-with-resources, or a transaction that doesn\u2019t close properly.\n3. The pool is simply too small for how much traffic you get (`HikariCP maximumPoolSize` set too low).\n4. Long `@Transactional` methods that make slow network/HTTP calls **while holding** a database connection open.\n5. Leaks from mishandling large binary data (BLOBs) or streaming results.\n6. A pile-up of threads waiting because some downstream dependency got slow.\n\n**How to debug:** check HikariCP\u2019s own metrics (`pending`, `active`, `usage`), look at the database\u2019s active session view (e.g. Postgres `pg_stat_activity`), take a thread dump, and check the slow-query log.',
            },
            {
              question: "What's the difference between @PathVariable and @RequestParam?",
              answer:
                '- **`@PathVariable`**: pulls a value out of the URL path itself, and represents **which resource** you\u2019re talking about — e.g. `/orders/{id}`.\n- **`@RequestParam`**: reads values from the query string or form data — e.g. `?status=OPEN&page=0`. Good for filters, optional flags, and pagination info.\n\n**Simple way to remember it:** the path tells you *which* resource; the query params tell you *how* you want to view or filter it.',
            },
            {
              question: 'How would you handle duplicate API requests in a payment service?',
              answer:
                'The key idea is to make the payment operation **idempotent** — calling it twice with the same intent should only charge the customer once.\n\n1. The client generates a unique `Idempotency-Key` (usually a UUID) and sends it with the request.\n2. The server saves that key together with a hash of the request and the eventual result, and enforces that the key is **unique** in storage.\n3. If the same key comes in again: return the previously stored result instead of processing again. If the same key comes in with a **different** request body, that\u2019s a conflict — return **409**.\n4. If two requests with the same key arrive at almost the same time, make sure only one actually processes (a unique database constraint or row lock handles this).\n5. Use an outbox pattern for anything that has side effects (like sending a confirmation email), so retries don\u2019t double-send those either.\n\nDon\u2019t forget: webhook handlers (e.g. from a payment provider) need the same idempotency treatment, since providers often retry webhook deliveries.',
            },
            {
              question: 'What is the N+1 query problem, and how do you fix it?',
              answer:
                'This happens when you load a list of N "parent" records, and then for **each one separately**, the code fires another query to load its related "child" data. So instead of 1 or 2 queries, you end up making **1 + N** queries — which gets slow fast as N grows.\n\n**How to fix it:**\n- Use `JOIN FETCH` (or `@EntityGraph`) to pull the related data in the same query.\n- Turn on batch fetching (`@BatchSize` or `default_batch_fetch_size`) so Hibernate groups the lookups instead of doing them one by one.\n- Use DTO projections or a custom `@Query` to fetch exactly the shape of data you need.\n- Avoid accidentally triggering lazy-loading during JSON serialization.\n\n**How to spot it:** turn on `spring.jpa.show-sql` in a dev environment, use a tool like p6spy, or watch your datasource\u2019s query-count metrics.',
            },
            {
              question:
                "What's the purpose of Spring Boot Actuator, and which endpoints do you use most?",
              answer:
                '**Actuator** is a set of built-in endpoints that expose the "operations" side of your app — things ops teams and monitoring tools care about, separate from your actual business API.\n\n**The ones people use most:** `/health` (used by Kubernetes to know if a pod is alive/ready), `/metrics` combined with a **Prometheus** exporter (for dashboards and alerts), `/info` (basic build/version info), and `/loggers` (change log levels at runtime without redeploying — great for debugging live issues).\n\n**Important:** lock these endpoints down with security, and never expose sensitive ones like `/env` or `/heapdump` to the public internet — they can leak secrets or app internals.',
            },
            {
              question: 'What happens if two users update the same record simultaneously?',
              answer:
                'Without any protection, it\u2019s "last write wins" — whichever update saves last silently overwrites the other one\u2019s changes. To guard against that, you use locking:\n\n- **Optimistic locking:** add a `@Version` column. Whoever commits second gets an `OptimisticLockException` because the version number no longer matches — then your app can retry or ask the user to review the conflict.\n- **Pessimistic locking:** use `LockModeType.PESSIMISTIC_WRITE` to actually lock the row in the database while you work on it. This is stronger, but be careful — it can cause deadlocks or slow things down under load.\n\n**In your API:** when a conflict happens, return **409 Conflict** with a clear message about what to do next (e.g. "refresh and try again").',
            },
            {
              question: 'How would you upload large files without causing memory issues?',
              answer:
                'The main rule is: **never load the whole file into memory at once** — stream it in small chunks instead.\n\n- Configure multipart uploads to spill to disk once they pass a size threshold, or work directly with the raw `InputStream` (or use `StreamingResponseBody` for downloads).\n- Send the file straight to object storage (like S3) using multipart upload, rather than buffering it fully in your app first.\n- Avoid calling things like `multipartFile.getBytes()` on large files — that loads the entire file as a `byte[]` in memory.\n- Enforce a max file size and only allow expected content types.\n\nFor downloads, the same idea applies in reverse: stream bytes from storage directly into the HTTP response instead of loading the whole file first.',
            },
            {
              question: 'Why might @Transactional not roll back a transaction?',
              answer:
                'A few common reasons your rollback silently doesn\u2019t happen:\n\n1. **Checked exception thrown** — by default, Spring only rolls back on **unchecked** exceptions. A checked exception commits unless you explicitly set `rollbackFor`.\n2. **Self-invocation** — the transactional method was called from inside the same class (`this.method()`), so it skipped the proxy entirely.\n3. The class isn\u2019t actually a Spring bean, or the method\u2019s visibility blocks proxy-based AOP (e.g. `private`).\n4. Your code **catches the exception and swallows it** — Spring never even sees that anything went wrong.\n5. Wrong transaction manager is wired up, or `readOnly` is misconfigured.\n6. Some databases auto-commit certain DDL statements regardless of your transaction.\n\n**How to check:** turn on debug logging for Spring transactions, and confirm the call is actually going through the proxy (not a direct internal call).',
            },
            {
              question: 'How does Spring Boot manage database connections using HikariCP?',
              answer:
                'By default, Spring Boot sets up **HikariCP** as your `DataSource` automatically — you usually don\u2019t configure it from scratch. You control its behavior with `spring.datasource.hikari.*` properties: pool size, timeouts, leak detection, and so on.\n\n**How it works in practice:** whenever your code needs a database connection (through JDBC or JPA), it "borrows" one from the pool. When the current logical unit of work finishes (usually when the transaction completes), the connection goes back to the pool for reuse — it isn\u2019t closed and reopened each time, which would be slow.\n\n**Tuning tip:** watch Hikari\u2019s own metrics. Set `maximumPoolSize` based on how much concurrency your **database** can actually handle — it\u2019s not about matching your app\u2019s thread count.',
            },
            {
              question: 'How would you secure REST APIs using Spring Security and JWT?',
              answer:
                'A typical stateless setup using JWT (JSON Web Tokens) looks like this:\n\n1. The user logs in through your service or an external identity provider, which issues a signed JWT with a short expiry, plus a way to refresh it later.\n2. You configure a `SecurityFilterChain` that turns off CSRF protection (not needed for pure token-based APIs) and defines which endpoints require authentication.\n3. A custom JWT filter checks the token\u2019s signature, expiry, and issuer, then builds an `Authentication` object Spring Security understands.\n4. You can add method-level security (like `@PreAuthorize with a role check`) for finer-grained rules.\n5. Rotate your signing keys using a JWKS endpoint, and never put anything secret inside a JWT — its contents are readable by anyone who has the token, even without the signing key.\n\nIf you need the ability to instantly revoke access (not just wait for expiry), consider opaque tokens with a server-side introspection check instead of pure JWTs.',
            },
            {
              question:
                "If a production issue is reported but there are no exceptions in the logs, what's your debugging approach?",
              answer:
                'No exceptions usually means the app "worked" but did something wrong or slow — not that it crashed. Approach it like this:\n\n1. Narrow it down using a request ID, user ID, or a specific time window.\n2. Look at **latency** metrics and resource saturation — CPU, connection pool usage, thread counts, GC pauses.\n3. Double-check your logging level and sampling — maybe the relevant log line simply wasn\u2019t captured, or the app returned a "successful" but wrong result.\n4. Check distributed traces for any downstream call that got stuck or timed out.\n5. Take a thread dump if requests seem to hang, or a heap dump if memory usage keeps climbing.\n6. Check the database for slow queries or locks around that time.\n7. Look at recent deploys, config changes, or feature flag flips — a lot of "silent" bugs come from something that changed recently.\n\nThe absence of a stack trace usually points to timeouts, wrong (but "valid-looking") results, or an error that got caught and quietly ignored.',
            },
            {
              question: 'How would you improve a slow Spring Data JPA query?',
              answer:
                '1. Look at the query\u2019s execution plan and add missing indexes.\n2. Select only the columns you actually need (a DTO projection instead of a full entity).\n3. Eliminate any N+1 query problem, and tune the fetch strategy.\n4. Add pagination, and avoid queries with huge `IN (...)` lists.\n5. Cache data that\u2019s read often but rarely changes.\n6. If the ORM overhead itself is the bottleneck, consider writing that one query as native SQL.\n7. Confirm the slowness is really the query and not just time spent waiting for a free connection from the pool.\n\nAlways measure before and after with real metrics — don\u2019t guess at what "should" be slow.',
            },
            {
              question:
                "What's the difference between synchronous and asynchronous processing in Spring Boot?",
              answer:
                '**Synchronous:** the calling thread waits for the work to finish before moving on. This is the normal way a typical Spring MVC request works. It\u2019s simple to reason about and errors are easy to catch, but it ties up one of your limited request-handling threads the whole time.\n\n**Asynchronous:** the work happens later or on a different thread, using tools like `@Async`, `CompletableFuture`, message queues, or reactive stacks like WebFlux. This frees up the request thread immediately, but now you need a dedicated thread pool, proper error handling, and (if retries are possible) idempotency to avoid doing the work twice.\n\n**When to use async:** things like sending an email, fanning out work to many services, or long-running background jobs. Don\u2019t reach for async for every simple database read — it adds complexity you don\u2019t need there.',
            },
            {
              question: 'How does Spring Boot auto-configuration work internally?',
              answer:
                'On startup, Boot scans a list of candidate auto-configuration classes (listed in a file at `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`, or the older `spring.factories` file) using `AutoConfigurationImportSelector`.\n\nEach of these classes is guarded by **condition annotations** — things like `@ConditionalOnClass` (only apply if a certain library is on the classpath), `@ConditionalOnMissingBean` (only apply if you haven\u2019t already defined this bean yourself), or `@ConditionalOnProperty` (only apply if a certain config property is set). If the conditions match, Boot registers the beans it defines — a `DataSource`, `DispatcherServlet`, and so on.\n\n**Key idea:** your own beans always win over auto-configuration, because most auto-config uses `@ConditionalOnMissingBean` — meaning "only create this if the user hasn\u2019t already."\n\nThis whole mechanism gets kicked off by `@SpringBootApplication`, which includes `@EnableAutoConfiguration`.',
            },
            {
              question: 'What steps would you take before scaling a Spring Boot application?',
              answer:
                '1. Use real metrics to confirm **what** is actually the bottleneck — CPU/memory/GC, or a connection pool, or the database — don\u2019t guess.\n2. Make sure the app is **stateless** (move sessions/caches to something external like Redis) so you can safely run multiple copies.\n3. Tune your pools — Tomcat threads, HikariCP, HTTP client pools.\n4. Add caching, and move safe work to async processing.\n5. Check the **database\u2019s** capacity and indexes first — adding more app instances won\u2019t help if the database itself is maxed out.\n6. Load test, and set autoscaling (HPA) based on the metric that actually reflects load (CPU, requests-per-second, or latency — not something arbitrary).\n7. Make sure new instances properly signal "ready" before traffic is sent to them, and old ones shut down gracefully.',
            },
            {
              question: "What's the difference between BeanFactory and ApplicationContext?",
              answer:
                '`BeanFactory` is the minimal Spring container: it creates beans, resolves dependencies, and manages scopes/lifecycle. It commonly creates a bean only when requested.\n\n`ApplicationContext` extends `BeanFactory` and adds application events, internationalization, resource loading, environment/profiles, annotation post-processors, easier AOP integration, and eager creation of non-lazy singleton beans by default. Eager startup exposes broken wiring/configuration before the app receives traffic.\n\n**Why Boot prefers it:** auto-configuration, `@ConfigurationProperties`, web-server lifecycle, Actuator, events, profiles, and enterprise post-processors all need the richer context. Boot creates a suitable servlet, reactive, or non-web `ApplicationContext`; you still access beans through the inherited BeanFactory API.\n\n**Memory aid:** BeanFactory is the DI engine; ApplicationContext is the production application container.',
            },
            {
              question:
                "How would you debug a Spring Boot application that's slow only in production?",
              answer:
                'Things that are different in production and can cause "it\u2019s slow only there" bugs: much bigger data volume, real concurrent traffic, real (not mocked) downstream services, cold vs. warm caches, different config or JVM/GC settings, and "noisy neighbor" servers sharing the same infrastructure.\n\n**Approach:**\n- Compare production config against staging/dev line by line.\n- Turn on percentile-based latency metrics (p95/p99, not just averages).\n- Use a profiler (async-profiler, or Java Flight Recorder) to see where time is actually going.\n- Check the database\u2019s query plan against production-sized data (a query that\u2019s fast on 100 rows can be terrible on 10 million).\n- Look at connection pool wait times, GC pause times, and any chatty calls between services.\n- Check if a feature flag behaves differently in prod.\n\nAvoid turning on `show-sql` globally in production — it\u2019s noisy and can hurt performance. Instead, sample traces for a short window when investigating.',
            },
          ],
        },
      ],
    },
    {
      id: 'sql-jpa-rest',
      title: 'SQL Optimization, Spring Data JPA, and REST APIs',
      blocks: [
        {
          type: 'interviewQa',
          variant: 'sketch',
          title: 'SQL, JPA & API Q&A',
          items: [
            {
              question: 'What query-optimization techniques do you use?',
              answer:
                'Start with evidence from the real execution plan, not guesses. Reduce work by filtering early, selecting only needed columns/rows, using the right join order, and avoiding functions/type casts on indexed filter columns. Add selective indexes that match equality, range, join, and ordering predicates; use composite-index left-prefix rules and consider covering/partial indexes where supported.\n\nFix N+1 queries, paginate large results (keyset pagination for deep pages), batch writes, keep transactions short, and maintain table statistics. Partition only when pruning/maintenance justifies the complexity. Cache stable hot reads, precompute expensive aggregates/materialized views when freshness permits, and archive old data. Re-run the plan and load test after every change—an index can speed reads but slow writes and consume memory/storage.',
            },
            {
              question: 'How do you identify slow SQL queries?',
              answer:
                'Use database slow-query logs or statement statistics (`pg_stat_statements`, MySQL Performance Schema), APM traces, and application/query latency histograms. Rank by **total time**, p95/p99, frequency, rows scanned versus returned, lock wait, and I/O—not just one unusually slow sample.\n\nRun `EXPLAIN` first and `EXPLAIN ANALYZE` only where safely permitted. Look for full scans on large tables, bad cardinality estimates, repeated nested loops, sort/hash spills, missing indexes, implicit casts, lock waits, and plan changes caused by stale statistics or parameter sensitivity. Reproduce with production-like row counts and bind values, then compare before/after plans.',
            },
            {
              question: 'Why should SELECT * be avoided in production queries?',
              answer:
                '`SELECT *` transfers and materializes columns the caller does not need, increasing network, database buffer, JVM heap, and serialization work. It can prevent a covering-index-only plan, accidentally fetch large JSON/BLOB columns, and makes API behavior change when a schema adds/reorders a column.\n\nExplicit columns document the contract and make projections stable. `SELECT *` is acceptable for ad-hoc inspection or truly small internal queries where every column is required; it is not automatically slow, but it creates avoidable risk in long-lived production code.',
            },
            {
              question: 'Explain JPA Repository and how Spring Data JPA works internally.',
              answer:
                '`Repository<T, ID>` is the marker abstraction. `CrudRepository` adds `save`, `findById`, `findAll`, `existsById`, `count`, and delete methods. `ListCrudRepository` returns lists; `PagingAndSortingRepository` adds `findAll(Pageable/Sort)`; `JpaRepository` adds JPA-specific methods such as `flush`, `saveAndFlush`, batch deletes, and reference access.\n\nAt startup, `@EnableJpaRepositories`/Boot scans repository interfaces and creates proxy beans, commonly backed by `SimpleJpaRepository`. A call is intercepted, repository metadata is resolved, and Spring either executes the base implementation, derives JPQL from a method name, uses `@Query`/named query, or invokes a custom fragment. JPA’s `EntityManager` translates operations into persistence-context changes; Hibernate generates SQL and flushes at transaction boundaries.\n\n`save` chooses `persist` for a new entity and `merge` otherwise—it is not always an immediate SQL statement. Put transaction boundaries in the service layer, use DTO projections/entity graphs deliberately, and inspect generated SQL to catch N+1 behavior.',
            },
            {
              question:
                'How would you update a user email with validation, exception handling, and JPA?',
              answer:
                'Use a request DTO with `@NotBlank`/`@Email`, validate at the controller boundary, load and update the entity inside a service transaction, enforce a database unique constraint, and map known failures to stable HTTP responses. Do not accept an entire `User` entity from the client. Return 404 when the user is absent, 409 when the email is already owned, and 400 for malformed input. The sketchnote and code below show the complete flow.',
            },
          ],
        },
        {
          type: 'sketchnote',
          title: 'Update Email API — One Safe Request',
          intro:
            'PATCH the field, validate twice, and let the database enforce the final invariant.',
          items: [
            {
              code: '01',
              glyph: '→',
              title: 'Boundary',
              subtitle: 'PATCH /api/users/{id}/email',
              points: [
                '@Valid checks @NotBlank + @Email',
                'DTO exposes only the editable field',
                'Invalid payload becomes HTTP 400',
              ],
              tip: 'Never bind a public request directly to a JPA entity.',
            },
            {
              code: '02',
              glyph: 'Tx',
              title: 'Service transaction',
              subtitle: 'Load → check → mutate',
              points: [
                'findById or throw UserNotFound',
                'Normalize email consistently',
                'Check ownership, then update entity',
              ],
              tip: 'Dirty checking writes at flush/commit; save() is optional for a managed entity.',
            },
            {
              code: '03',
              glyph: 'DB',
              title: 'Database invariant',
              subtitle: 'Unique index is authoritative',
              points: [
                'Pre-check gives a friendly 409',
                'Unique constraint closes the race',
                'Translate integrity violation to 409',
              ],
              tip: 'Application checks alone cannot prevent concurrent duplicates.',
            },
            {
              code: '04',
              glyph: '!',
              title: 'Stable errors',
              subtitle: '@RestControllerAdvice',
              points: ['400 validation', '404 missing user', '409 duplicate email'],
              tip: 'Return ProblemDetail; never leak SQL or stack traces.',
            },
          ],
        },
        {
          type: 'code',
          language: 'java',
          filename: 'UserEmailApi.java',
          showLineNumbers: true,
          code: `// DTO
public record UpdateEmailRequest(
    @NotBlank @Email @Size(max = 254) String email) {}

public record UserResponse(Long id, String email) {
  static UserResponse from(User user) {
    return new UserResponse(user.getId(), user.getEmail());
  }
}

// Repository
public interface UserRepository extends JpaRepository<User, Long> {
  boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);
}

// Service
@Service
@RequiredArgsConstructor
public class UserService {
  private final UserRepository users;

  @Transactional
  public UserResponse updateEmail(Long id, String rawEmail) {
    String email = rawEmail.strip().toLowerCase(Locale.ROOT);
    User user = users.findById(id)
        .orElseThrow(() -> new UserNotFoundException(id));

    if (users.existsByEmailIgnoreCaseAndIdNot(email, id)) {
      throw new EmailAlreadyUsedException(email);
    }

    user.setEmail(email); // managed entity: JPA dirty checking persists it
    return UserResponse.from(user);
  }
}

// Controller
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
  private final UserService service;

  @PatchMapping("/{id}/email")
  public UserResponse updateEmail(
      @PathVariable @Positive Long id,
      @Valid @RequestBody UpdateEmailRequest request) {
    return service.updateEmail(id, request.email());
  }
}

// Error mapping (database must also have UNIQUE(lower(email)) or equivalent)
@RestControllerAdvice
public class ApiExceptionHandler {
  @ExceptionHandler(UserNotFoundException.class)
  ResponseEntity<ProblemDetail> notFound(UserNotFoundException ex) {
    ProblemDetail p = ProblemDetail.forStatusAndDetail(
        HttpStatus.NOT_FOUND, ex.getMessage());
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(p);
  }

  @ExceptionHandler({
      EmailAlreadyUsedException.class,
      DataIntegrityViolationException.class
  })
  ResponseEntity<ProblemDetail> conflict(Exception ex) {
    ProblemDetail p = ProblemDetail.forStatusAndDetail(
        HttpStatus.CONFLICT, "Email is already in use");
    return ResponseEntity.status(HttpStatus.CONFLICT).body(p);
  }
}`,
        },
      ],
    },
    {
      id: 'jpa-api-production-traps',
      title: 'JPA and REST Production Traps',
      blocks: [
        {
          type: 'interviewQa',
          variant: 'sketch',
          title: 'Entity Serialization and Open Session in View',
          items: [
            {
              question:
                'Why does exposing JPA entities directly from REST APIs eventually become a production problem?',
              answer:
                'A persistence entity models database identity, relationships, dirty checking, and ORM lifecycle—not a stable public API contract. Jackson serialization can traverse lazy associations and trigger N+1 queries, throw `LazyInitializationException` after the session closes, recurse through bidirectional relationships, load huge graphs/BLOBs, or expose internal/sensitive columns. Hibernate proxy types and entity annotations leak into the wire format, and schema/refactoring changes become accidental breaking API changes.\n\nAccepting entities as request bodies is worse: clients can bind fields they should not control, relationships become difficult to validate, and detached entities/`merge` can overwrite data unexpectedly. `@JsonIgnore` and disabling lazy serialization treat symptoms while coupling remains.\n\nUse request/response DTOs or records, explicit mapping, validation at the boundary, and query-specific DTO/interface projections. Fetch exactly the required graph with joins/entity graphs inside a transaction. Version the API independently of persistence and keep domain invariants in services/entities rather than in JSON shape.',
            },
            {
              question:
                'How can Open Session in View hide performance bottlenecks until the database connection pool gets exhausted?',
              answer:
                'OSIV binds a JPA `EntityManager`/Hibernate `Session` to the web request after the service transaction ends. Controllers, mappers, or Jackson can therefore initialize lazy relationships successfully, making missing fetch design look harmless in development. In production, serializing N parents may issue N extra queries—often outside the original transaction and in auto-commit mode—so query count and connection borrowing scale with response size.\n\nThe session does not necessarily hold one physical connection for the entire request in every configuration, but each hidden lazy load needs a connection; slow serialization, database waits, and concurrent large responses create sustained pool pressure. The service layer’s query metrics may miss work executed later, so teams increase pool size instead of fixing access patterns.\n\nDisable `spring.jpa.open-in-view` for APIs, return DTOs, map/fetch required data inside explicit read-only transactions, use projections/entity graphs/batch fetching deliberately, and monitor SQL count plus pool active/pending time per endpoint. Add integration tests that fail on unexpected query counts; do not “fix” it by making every association EAGER.',
            },
          ],
        },
      ],
    },
    {
      id: 'crud-rate-limiter',
      title: 'Build a CRUD API with an In-Memory Rate Limiter',
      blocks: [
        {
          type: 'markdown',
          value:
            'Build a Spring Boot CRUD API and allow at most **10 requests in any rolling 60-second window per user**. The limiter belongs in a `OncePerRequestFilter`, before controllers, so every protected endpoint follows the same policy. The example uses an authenticated principal as the identity and falls back to client IP only for anonymous traffic.',
        },
        {
          type: 'mermaid',
          caption:
            'Authentication establishes identity before the rate-limit filter; rejected requests never consume controller, service, or database capacity.',
          definition: `flowchart LR
  C[Client] --> S[Spring Security filters]
  S -->|principal| R[RateLimitFilter]
  R -->|1..10 in rolling minute| D[DispatcherServlet]
  R -->|11th request| X[429 + Retry-After]
  D --> V[UserController]
  V --> B[UserService]
  B --> J[JpaRepository]
  J --> DB[(H2 / production DB)]`,
        },
        {
          type: 'interviewQa',
          variant: 'sketch',
          title: 'Design Decisions Before Writing Code',
          items: [
            {
              question: 'What exactly does “10 requests per minute on any endpoint” mean?',
              answer:
                'State the contract before coding. This solution enforces **10 requests per rolling minute per authenticated user across all protected endpoints**. Request 11 receives 429 until the oldest accepted request leaves the 60-second window.\n\nIf the requirement instead means 10 per endpoint, use a key such as `userId + HTTP method + normalized route pattern`. Do not use a raw URI such as `/users/123`, because IDs create unbounded keys and let callers evade limits by changing paths. Decide whether failed requests count; this example counts every request that passes the limiter, regardless of the controller result.',
            },
            {
              question: 'Why use a sliding-window log instead of fixed window or token bucket?',
              answer:
                '**Fixed window** is simple but permits 20 calls around a minute boundary—10 at `12:00:59` and 10 at `12:01:00`. **Token bucket** is efficient and supports controlled bursts, but “10 per minute” must be translated into capacity and refill semantics. **Sliding-window log** stores accepted timestamps and exactly enforces this small limit.\n\nIts cost is O(limit) memory per active identity and cleanup work. With a limit of only 10, that is reasonable for an interview in-memory implementation. For large limits use a sliding-window counter or token bucket.',
            },
            {
              question: 'Why is ConcurrentHashMap alone not enough for thread safety?',
              answer:
                'The business operation is compound: remove expired timestamps → check size → append timestamp. A thread-safe map protects map structure, but it does not make that sequence atomic. Two concurrent requests could both observe size 9 and both become request 10.\n\nThe implementation uses `ConcurrentHashMap.compute` so each user’s complete state transition is atomic, including cleanup. Requests for different users can still proceed independently. A per-key lock or atomic immutable state replacement are alternatives; a global synchronized method would serialize every user and hurt throughput.',
            },
            {
              question: 'Where should the limiter run and how is a user identified?',
              answer:
                'Run it as a filter/interceptor, not inside controllers. Place it **after authentication** so `request.getUserPrincipal()` is available, but before MVC/controller work. An API key or trusted tenant/user claim is also valid. Never trust a caller-supplied `X-User-Id` header unless a trusted gateway strips and recreates it.\n\nIP fallback is imperfect: NAT can make many people share one address, proxies can hide the real address, and forwarded headers are spoofable unless accepted only from trusted proxies. Exclude health probes and usually CORS `OPTIONS` requests from application-user quotas.',
            },
            {
              question: 'What should a correct 429 response contain?',
              answer:
                'Return **429 Too Many Requests**, a machine-readable `ProblemDetail` JSON body, and `Retry-After` in seconds. Also expose quota headers such as `RateLimit-Limit`, `RateLimit-Remaining`, and `RateLimit-Reset` if that is your API convention. Do not return 403: the identity is allowed to use the endpoint, just not at the current rate.\n\nThe retry time must come from the same clock/window calculation as the decision. Clients should wait, add jitter, and avoid immediate retries that amplify load.',
            },
            {
              question: 'What are the limitations of an in-memory limiter?',
              answer:
                'The limit applies **per application instance**, state disappears on restart, and users can receive a larger effective quota when a load balancer sends requests to multiple instances. Sticky sessions reduce but do not solve correctness or failover. The map also needs expiry cleanup or one-time callers accumulate forever.\n\nFor distributed enforcement use an API gateway or Redis-backed atomic algorithm/Lua script, with a documented fail-open/fail-closed policy. Keep local limiting as a fast protective layer, but do not claim it enforces a cluster-wide commercial quota.',
            },
          ],
        },
        {
          type: 'heading',
          level: 3,
          text: '1. Dependencies and configuration',
        },
        {
          type: 'code',
          language: 'xml',
          filename: 'pom.xml (dependencies)',
          code: `<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
  </dependency>
  <dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
  </dependency>
</dependencies>`,
        },
        {
          type: 'code',
          language: 'yaml',
          filename: 'application.yml',
          code: `spring:
  datasource:
    url: jdbc:h2:mem:users;DB_CLOSE_DELAY=-1
    username: sa
    password:
  jpa:
    hibernate:
      ddl-auto: create-drop
    open-in-view: false

rate-limit:
  requests: 10
  window: 60s`,
        },
        {
          type: 'heading',
          level: 3,
          text: '2. Entity, DTOs, and repository',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'User.java',
          showLineNumbers: true,
          code: `@Entity
@Table(
    name = "users",
    uniqueConstraints = @UniqueConstraint(name = "uk_user_email", columnNames = "email")
)
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 100)
  private String name;

  @Column(nullable = false, length = 254)
  private String email;

  @Version
  private long version;

  protected User() {}

  public User(String name, String email) {
    this.name = name;
    this.email = email;
  }

  public Long getId() { return id; }
  public String getName() { return name; }
  public String getEmail() { return email; }
  public long getVersion() { return version; }
  public void setName(String name) { this.name = name; }
  public void setEmail(String email) { this.email = email; }
}`,
        },
        {
          type: 'code',
          language: 'java',
          filename: 'UserContracts.java',
          code: `public record UserRequest(
    @NotBlank @Size(max = 100) String name,
    @NotBlank @Email @Size(max = 254) String email) {}

public record UserResponse(Long id, String name, String email, long version) {
  static UserResponse from(User user) {
    return new UserResponse(
        user.getId(), user.getName(), user.getEmail(), user.getVersion());
  }
}

public interface UserRepository extends JpaRepository<User, Long> {
  boolean existsByEmailIgnoreCase(String email);
  boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);
}`,
        },
        {
          type: 'heading',
          level: 3,
          text: '3. Transactional service and REST controller',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'UserService.java',
          showLineNumbers: true,
          code: `@Service
@Transactional(readOnly = true)
public class UserService {
  private final UserRepository users;

  public UserService(UserRepository users) {
    this.users = users;
  }

  public List<UserResponse> findAll() {
    return users.findAll().stream().map(UserResponse::from).toList();
  }

  public UserResponse findById(Long id) {
    return UserResponse.from(findEntity(id));
  }

  @Transactional
  public UserResponse create(UserRequest request) {
    String email = normalize(request.email());
    if (users.existsByEmailIgnoreCase(email)) {
      throw new DuplicateEmailException(email);
    }
    return UserResponse.from(users.save(new User(request.name().strip(), email)));
  }

  @Transactional
  public UserResponse update(Long id, UserRequest request) {
    User user = findEntity(id);
    String email = normalize(request.email());
    if (users.existsByEmailIgnoreCaseAndIdNot(email, id)) {
      throw new DuplicateEmailException(email);
    }
    user.setName(request.name().strip());
    user.setEmail(email); // managed entity: dirty checking persists at commit
    return UserResponse.from(user);
  }

  @Transactional
  public void delete(Long id) {
    users.delete(findEntity(id));
  }

  private User findEntity(Long id) {
    return users.findById(id).orElseThrow(() -> new UserNotFoundException(id));
  }

  private String normalize(String email) {
    return email.strip().toLowerCase(Locale.ROOT);
  }
}`,
        },
        {
          type: 'code',
          language: 'java',
          filename: 'UserController.java',
          showLineNumbers: true,
          code: `@RestController
@RequestMapping("/api/users")
public class UserController {
  private final UserService service;

  public UserController(UserService service) {
    this.service = service;
  }

  @PostMapping
  public ResponseEntity<UserResponse> create(@Valid @RequestBody UserRequest request) {
    UserResponse created = service.create(request);
    URI location = ServletUriComponentsBuilder.fromCurrentRequest()
        .path("/{id}").buildAndExpand(created.id()).toUri();
    return ResponseEntity.created(location).body(created); // 201
  }

  @GetMapping
  public List<UserResponse> findAll() {
    return service.findAll(); // 200
  }

  @GetMapping("/{id}")
  public UserResponse findOne(@PathVariable @Positive Long id) {
    return service.findById(id); // 200 or 404
  }

  @PutMapping("/{id}")
  public UserResponse update(
      @PathVariable @Positive Long id,
      @Valid @RequestBody UserRequest request) {
    return service.update(id, request); // 200
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable @Positive Long id) {
    service.delete(id); // 204
  }
}`,
        },
        {
          type: 'heading',
          level: 3,
          text: '4. Exact, thread-safe sliding-window limiter',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'SlidingWindowRateLimiter.java',
          showLineNumbers: true,
          code: `@Component
public class SlidingWindowRateLimiter {
  public record Decision(boolean allowed, int remaining, long retryAfterSeconds) {}

  private static final class Window {
    private final ArrayDeque<Long> acceptedAt = new ArrayDeque<>();
  }

  private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();
  private final int limit;
  private final long windowMillis;
  private final Clock clock;

  public SlidingWindowRateLimiter(
      @Value("\${rate-limit.requests:10}") int limit,
      @Value("\${rate-limit.window:60s}") Duration window,
      Clock clock) {
    if (limit < 1 || window.isZero() || window.isNegative()) {
      throw new IllegalArgumentException("Rate limit and window must be positive");
    }
    this.limit = limit;
    this.windowMillis = window.toMillis();
    this.clock = clock;
  }

  public Decision tryAcquire(String key) {
    long now = clock.millis();
    long cutoff = now - windowMillis;
    AtomicReference<Decision> result = new AtomicReference<>();

    windows.compute(key, (ignored, existing) -> {
      Window window = existing == null ? new Window() : existing;
      removeExpired(window, cutoff);
      if (window.acceptedAt.size() >= limit) {
        long waitMillis = window.acceptedAt.peekFirst() + windowMillis - now;
        long retryAfter = Math.max(1, (waitMillis + 999) / 1000);
        result.set(new Decision(false, 0, retryAfter));
        return window;
      }

      window.acceptedAt.addLast(now);
      result.set(new Decision(true, limit - window.acceptedAt.size(), 0));
      return window;
    });

    return result.get();
  }

  @Scheduled(fixedDelayString = "\${rate-limit.cleanup-delay:60s}")
  void removeInactiveKeys() {
    long cutoff = clock.millis() - windowMillis;
    windows.keySet().forEach(key -> {
      windows.computeIfPresent(key, (ignored, window) -> {
        removeExpired(window, cutoff);
        return window.acceptedAt.isEmpty() ? null : window;
      });
    });
  }

  private void removeExpired(Window window, long cutoff) {
    while (!window.acceptedAt.isEmpty()
        && window.acceptedAt.peekFirst() <= cutoff) {
      window.acceptedAt.removeFirst();
    }
  }
}`,
        },
        {
          type: 'heading',
          level: 3,
          text: '5. Filter, identity, and 429 response',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'RateLimitFilter.java',
          showLineNumbers: true,
          code: `public class RateLimitFilter extends OncePerRequestFilter {
  private final SlidingWindowRateLimiter limiter;
  private final ObjectMapper objectMapper;

  public RateLimitFilter(SlidingWindowRateLimiter limiter, ObjectMapper objectMapper) {
    this.limiter = limiter;
    this.objectMapper = objectMapper;
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    return request.getMethod().equals("OPTIONS")
        || request.getRequestURI().equals("/actuator/health");
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain chain) throws ServletException, IOException {

    String key = identity(request); // global per-user limit
    SlidingWindowRateLimiter.Decision decision = limiter.tryAcquire(key);

    response.setHeader("RateLimit-Limit", "10");
    response.setHeader("RateLimit-Remaining", String.valueOf(decision.remaining()));

    if (!decision.allowed()) {
      response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
      response.setHeader("Retry-After", String.valueOf(decision.retryAfterSeconds()));
      response.setHeader("RateLimit-Reset", String.valueOf(decision.retryAfterSeconds()));
      response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);

      ProblemDetail problem = ProblemDetail.forStatusAndDetail(
          HttpStatus.TOO_MANY_REQUESTS,
          "Maximum 10 requests are allowed in any rolling 60-second window");
      problem.setTitle("Rate limit exceeded");
      objectMapper.writeValue(response.getOutputStream(), problem);
      return;
    }

    chain.doFilter(request, response);
  }

  private String identity(HttpServletRequest request) {
    Principal principal = request.getUserPrincipal();
    return principal != null
        ? "user:" + principal.getName()
        : "ip:" + request.getRemoteAddr();
  }
}`,
        },
        {
          type: 'code',
          language: 'java',
          filename: 'SecurityAndApplicationConfig.java',
          code: `@Configuration
@EnableScheduling
public class ApplicationConfig {
  @Bean
  Clock clock() {
    return Clock.systemUTC();
  }
}

@Configuration
public class SecurityConfig {
  @Bean
  RateLimitFilter rateLimitFilter(
      SlidingWindowRateLimiter limiter, ObjectMapper objectMapper) {
    return new RateLimitFilter(limiter, objectMapper);
  }

  // Prevent Boot from also registering it as a standalone servlet filter.
  @Bean
  FilterRegistrationBean<RateLimitFilter> rateLimitFilterRegistration(
      RateLimitFilter filter) {
    FilterRegistrationBean<RateLimitFilter> registration =
        new FilterRegistrationBean<>(filter);
    registration.setEnabled(false);
    return registration;
  }

  @Bean
  SecurityFilterChain security(HttpSecurity http, RateLimitFilter filter)
      throws Exception {
    return http
        .csrf(AbstractHttpConfigurer::disable) // stateless non-browser API
        .sessionManagement(session ->
            session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/actuator/health").permitAll()
            .anyRequest().authenticated())
        .httpBasic(Customizer.withDefaults()) // demo only; prefer OIDC/JWT in production
        .addFilterAfter(filter, BasicAuthenticationFilter.class)
        .build();
  }

  @Bean
  PasswordEncoder passwordEncoder() {
    return PasswordEncoderFactories.createDelegatingPasswordEncoder();
  }

  @Bean
  UserDetailsService demoUsers(PasswordEncoder encoder) {
    UserDetails demo = org.springframework.security.core.userdetails.User
        .withUsername("demo")
        .password(encoder.encode("change-me"))
        .roles("USER")
        .build();
    return new InMemoryUserDetailsManager(demo);
  }
}`,
        },
        {
          type: 'heading',
          level: 3,
          text: '6. Consistent API errors',
        },
        {
          type: 'code',
          language: 'java',
          filename: 'ApiExceptionHandler.java',
          code: `@RestControllerAdvice
public class ApiExceptionHandler {
  @ExceptionHandler(UserNotFoundException.class)
  ProblemDetail notFound(UserNotFoundException ex) {
    return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
  }

  @ExceptionHandler({
      DuplicateEmailException.class,
      DataIntegrityViolationException.class,
      ObjectOptimisticLockingFailureException.class
  })
  ProblemDetail conflict(Exception ex) {
    return ProblemDetail.forStatusAndDetail(
        HttpStatus.CONFLICT, "The resource conflicts with current data");
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ProblemDetail invalid(MethodArgumentNotValidException ex) {
    ProblemDetail problem = ProblemDetail.forStatusAndDetail(
        HttpStatus.BAD_REQUEST, "Request validation failed");
    problem.setProperty(
        "errors",
        ex.getBindingResult().getFieldErrors().stream()
            .collect(Collectors.toMap(
                FieldError::getField,
                error -> Objects.requireNonNullElse(
                    error.getDefaultMessage(), "Invalid value"),
                (first, ignored) -> first)));
    return problem;
  }
}`,
        },
        {
          type: 'interviewQa',
          variant: 'sketch',
          title: 'Verification and Production Hardening',
          items: [
            {
              question: 'How would you test this solution?',
              answer:
                'Inject a controllable `Clock`; never wait a real minute in tests. Unit-test that requests 1–10 succeed, request 11 is rejected, `Retry-After` is rounded up correctly, and a request succeeds once the oldest timestamp expires. Run many threads against one identity and assert exactly 10 successes; run different identities and confirm they do not block one another.\n\nWith MockMvc, call mixed CRUD endpoints 11 times as the same principal and verify the 11th response is 429 with JSON and headers. Also test validation (400), missing user (404), duplicate/optimistic conflict (409), create (201 + `Location`), delete (204), health exclusion, and cleanup of inactive keys.',
            },
            {
              question: 'What would you change for production?',
              answer:
                'Move cluster-wide quota enforcement to a gateway or Redis atomic script; keep keys bounded and privacy-safe; derive identity from verified authentication; trust forwarded IP headers only from known proxies; make limits configurable per plan/tenant/route; and emit allowed/rejected counters plus active-key and limiter-latency metrics.\n\nDefine behavior when the distributed limiter is unavailable, protect the limiter itself from key-cardinality attacks, use pagination instead of unbounded `findAll`, database migrations instead of `ddl-auto`, and real authentication/authorization. Load-test boundary bursts and multi-instance behavior before claiming the quota is correct.',
            },
          ],
        },
      ],
    },
    {
      id: 'integration-production-scenarios',
      title: 'Microservice Integration and Production Scenarios',
      blocks: [
        {
          type: 'interviewQa',
          variant: 'sketch',
          title: 'Integration, Data & Reliability Q&A',
          items: [
            {
              question: 'OAuth 2.0 vs JWT?',
              answer:
                '**OAuth 2.0 is an authorization framework** describing how a client obtains delegated access through flows and roles such as resource owner, client, authorization server, and resource server. **JWT is a token format**: a signed set of claims. They are not alternatives.\n\nOAuth can issue JWT access tokens or opaque random tokens. JWTs allow local validation and horizontal scaling but are difficult to revoke immediately and expose readable claims; opaque tokens support centralized introspection/revocation but add a network/cache dependency. For user login, use OpenID Connect on top of OAuth 2.0. Validate issuer, audience, signature, expiry, and key rotation—never trust a token merely because it parses.',
            },
            {
              question: 'RestTemplate vs WebClient?',
              answer:
                '`RestTemplate` is the older synchronous/blocking client: one request thread generally waits for each response. It is stable but in maintenance mode. `WebClient` supports non-blocking reactive I/O, streaming, backpressure, and high concurrency; it can also be used synchronously with `.block()`, although that gives up most reactive benefits.\n\nChoose WebClient for WebFlux, streaming, or large I/O-bound fan-out where the entire path remains non-blocking. For normal blocking Spring MVC code, a blocking client is often simpler; modern Spring also provides `RestClient`. In every case configure connect/read/overall timeouts, bounded connection pools, observability, and careful retries.',
            },
            {
              question: 'How do microservices communicate?',
              answer:
                '**Synchronous** HTTP/gRPC fits immediate request-response and strong caller feedback, but couples latency and availability. **Asynchronous** messaging/events fits decoupling, buffering, fan-out, and long-running workflows, but introduces eventual consistency, duplicate delivery, ordering, and harder debugging.\n\nUse explicit contracts (OpenAPI/Protobuf/event schemas), timeouts and propagated deadlines, trace context, service discovery, TLS, and idempotency. Prefer async events for facts and background workflows; use sync calls when the caller cannot continue without the answer. Avoid long chains of synchronous service calls because latency and failure probability multiply.',
            },
            {
              question: 'What is an API Gateway and why is it required?',
              answer:
                'An API Gateway is the controlled edge entry point that routes requests to internal services and centralizes concerns such as TLS termination, authentication, rate limiting, request-size limits, routing, observability, and sometimes protocol transformation or response aggregation. It hides topology and gives clients one stable endpoint.\n\nIt is useful, not universally mandatory. Keep business logic and service-specific authorization inside services; otherwise the gateway becomes a bottleneck and a distributed monolith. Run multiple instances, keep routes/config versioned, bound expensive transformations, and distinguish gateway/BFF responsibilities from internal service-mesh traffic.',
            },
            {
              question: 'An @Async method throws an exception and nobody handles it. What happens?',
              answer:
                'For an `@Async` method returning `Future`/`CompletableFuture`, the exception completes that future exceptionally; it is observed only when the caller awaits or attaches error handling. For a `void` method, there is no result channel, so Spring sends the failure to `AsyncUncaughtExceptionHandler`—the default normally logs it.\n\nPrefer `CompletableFuture` or a durable queue for important work, attach recovery/metrics, and configure a named bounded executor plus rejection policy. Also remember that self-invocation bypasses the async proxy and transaction/security context does not automatically cross to the new thread.',
            },
            {
              question:
                'Spring Boot takes five minutes to start in production but only 20 seconds locally. How do you debug it?',
              answer:
                'Measure startup phases instead of guessing. Enable `ApplicationStartup` with `BufferingApplicationStartup` or JFR, inspect `/actuator/startup`, and capture repeated thread dumps while production is stalled. Compare timestamps for environment/config loading, context refresh, bean creation, migrations, web-server start, runners, and readiness.\n\nProduction-only causes include slow DNS/metadata/secret-vault calls, unreachable proxy endpoints and retry timeouts, database connection/TLS negotiation, Flyway/Liquibase lock contention or much larger schema/data, Hibernate validation, synchronous cache warm-up, broad classpath/entity scanning, slow disk/image extraction, low CPU requests or throttling, entropy, service-mesh sidecars, agents, and `@PostConstruct`/`SmartInitializingSingleton` remote calls.\n\nRun the same image and production profile/config under equivalent CPU/memory/network constraints; diff condition reports, active profiles, JVM flags, dependency endpoints, and migration history. Move optional work after readiness, put deadlines on mandatory calls, narrow scanning, right-size startup resources/probes, and never mark ready before essential initialization is complete.',
            },
            {
              question: 'JPA first-level cache vs second-level cache?',
              answer:
                'The **first-level cache** is the mandatory persistence context attached to one `EntityManager`/transaction. Re-reading the same entity ID returns the same managed instance, and dirty checking writes changes at flush. It disappears when the context closes.\n\nThe **second-level cache** is optional, provider-managed, and shared across persistence contexts/JVM requests (and possibly nodes with a suitable provider). It caches entity/collection state, not arbitrary query results unless query cache is separately enabled. Use it for frequently read, rarely changed reference data with explicit eviction/consistency rules. It does not fix N+1, poor SQL, or unbounded result loading.',
            },
            {
              question:
                'A JPA query is fast at 100 rows but extremely slow at one million. What is the likely cause?',
              answer:
                'The small dataset hid the algorithm and plan cost. At scale the database may switch to a full scan, bad nested-loop join, large sort/hash spill, or return far too many rows; missing/stale statistics and non-sargable predicates often cause bad estimates. JPA may add N+1 queries, hydrate large entity graphs, dirty-track every entity, and exhaust heap/GC. Offset pagination also becomes slower on deep pages.\n\nInspect actual SQL and `EXPLAIN ANALYZE`, rows scanned versus returned, spills, indexes/statistics, query count, fetch plan, and JVM allocation. Use a selective/covering index, DTO projection, keyset pagination, fetch join/entity graph where appropriate, streaming/batching for bulk work, and production-sized performance tests.',
            },
            {
              question: 'How do you implement distributed locking safely?',
              answer:
                'First prefer designs that avoid a lock: database unique constraints/conditional updates, optimistic versions, idempotency keys, or partitioning each key to one consumer. If a lock is necessary, use a proven coordinator such as ZooKeeper/etcd/Consul or a carefully configured Redis approach with atomic acquire (`SET key token NX PX ttl`) and token-checked release.\n\nA lease can expire while the old owner is paused, so attach a monotonically increasing **fencing token** and require the protected resource to reject stale owners. Define timeout, renewal, failure behavior, and observability. Never assume a Redis lock alone makes a database write correct; the database/resource must enforce the invariant.',
            },
            {
              question:
                'Redis cache is healthy, but database utilization is still 100%. What do you investigate?',
              answer:
                'Check cache hit ratio **by endpoint/key**, not merely Redis availability. Look for uncached write-heavy paths, wrong/unstable keys, very short TTLs, mass expiry, evictions, cold starts, cache penetration for missing keys, hot-key stampedes, and code that queries the database before checking cache. Also inspect whether cached data still triggers N+1/lazy loads or whether background jobs, replicas, migrations, and analytics are consuming the database.\n\nCorrelate DB statements with request traces, rank top SQL by total load, and compare cache misses to DB QPS. Fix keys/TTL and negative caching, add request coalescing for stampedes, optimize/index the remaining SQL, and never use caching to conceal an incorrect capacity or query plan.',
            },
            {
              question:
                'Performance degrades over a weekend without a deployment. What could have changed?',
              answer:
                '“No code change” does not mean “no system change.” Traffic/data volume may grow; caches can evict or expire; queues, sessions, logs, temp files, heap live set, threads, connections, or database bloat can accumulate. Scheduled jobs, backups, certificate/credential rotation, feature flags, autoscaling, cloud maintenance, noisy neighbors, dependency latency, statistics/plan changes, and retries can alter behavior.\n\nCompare Friday and Monday metrics/config across heap-after-GC, GC, pools, queues, disk, DB plans/locks, cache hit rate, dependency latency, instance count, feature flags, and infrastructure events. Build a timeline first, then use profiles/dumps for the resource that drifted. Restarting may clear evidence while leaving the cause intact.',
            },
            {
              question:
                'A REST API returns duplicate responses after a deployment, but the controller did not change. Where do you investigate?',
              answer:
                'Clarify “duplicate”: one HTTP request cannot normally receive two independent terminal responses, so this often means the client sent/retried twice, the gateway retried upstream, duplicate business side effects/webhooks occurred, or a response list contains duplicate data. Correlate a client-generated request/idempotency ID through CDN/LB, gateway/mesh, access logs, controller, database, and response. Count distinct inbound attempts and upstream attempts.\n\nDeployment changes can duplicate filter/interceptor registration, enable both servlet and security-chain filters, run old and new routes simultaneously, alter gateway retry policy, lose sticky/session/idempotency state on restart, start duplicate schedulers/consumers, or register the same endpoint/handler twice. Ingress retry-on-reset is especially likely while old pods drain; a backend may complete after the proxy retries because the connection closed before acknowledgement.\n\nInspect rollout/ingress/service-mesh config, pod overlap, connection draining, retry logs, filter chains, scheduled-job locks, consumer groups, and database unique/idempotency records. Make mutating APIs idempotent and propagate one stable request ID; do not disable retries until you know whether they protect safe reads or duplicate unsafe writes.',
            },
            {
              question:
                'A customer reports missing records, but database logs show the transaction committed. What could have happened?',
              answer:
                '“Committed” only proves one transaction committed on one database connection. Verify the record by primary key on the **writer/primary** and confirm database, cluster, schema, tenant, shard, region, and transaction ID. The application may read a lagging replica; route to a different shard/tenant; apply soft-delete, row-level-security, time-zone, status, or pagination filters; serve stale negative cache; or query before an asynchronous projection/index/CDC pipeline catches up.\n\nAlso check a later compensating/delete/update transaction, duplicate request overwriting state, wrong commit logs caused by nested/`REQUIRES_NEW` transactions, outbox/consumer failure, and user-visible read model versus source-of-truth table. Trace the write and subsequent read with correlation/business IDs, inspect WAL/binlog/CDC and audit history, cache keys, replica lag, and query bindings.\n\nFix routing/read-after-write guarantees, cache invalidation, outbox/replay, audit/versioning, or business state transitions. Never infer data loss from one API response, and never infer end-to-end visibility from a single “commit successful” log.',
            },
            {
              question:
                'After enabling caching, database load drops but memory usage keeps increasing. What might be wrong?',
              answer:
                'The cache may be unbounded, use a very long/no TTL, cache high-cardinality keys or large object graphs, retain tenant/user/request-specific variants, or store values twice through layered local caches. A custom key bug can create a new entry every call; caching null/errors can amplify cardinality; refresh futures/listeners/stats can retain old values. If it is an external Redis cache, rising JVM memory may instead come from a local client near-cache, deserialized copies, buffers, or pending requests.\n\nCheck cache entry count, estimated weight/bytes, key cardinality, hit/eviction/expiry rate, value size, and heap dominator/retainer paths. Compare heap-after-GC and use an allocation profile. Configure maximum **weight/size** plus TTL/TTI as appropriate, avoid caching huge mutable entities, use compact immutable DTOs, normalize keys, and invalidate/version correctly. A cache is a bounded optimization—not a second unbounded database.',
            },
            {
              question:
                'The application works in staging but fails only in production. How do you investigate?',
              answer:
                'Treat this as an environment/data/load difference until evidence says otherwise. Build a timeline and compare the **effective** artifact digest, JVM/runtime, config and secrets, active profiles/feature flags, CPU/memory/cgroup limits, replicas/topology, proxies/mesh/network policy/TLS/DNS, database schema/statistics/data volume, cache state, dependency versions/SLOs, and traffic shape/concurrency—not source code alone.\n\nUse one failing correlation ID to compare logs, traces, metrics, and downstream calls; reproduce with production-like anonymized data and limits; inspect p95/p99, pools, queues, GC, locks, throttling, and recent infrastructure/config changes. Canary or shadow traffic can isolate instance/version differences. Avoid enabling noisy debug logging globally or copying sensitive production data. Close the gap with immutable images, configuration/version inventory, migration checks, contract/load tests, and staging that mirrors the production constraints that mattered.',
            },
          ],
        },
      ],
    },
    {
      id: 'transactions',
      title: 'Spring Transactions',
      blocks: [
        {
          type: 'interviewQa',
          variant: 'sketch',
          title: 'Transactions Q&A',
          items: [
            {
              question: 'Why does @Transactional sometimes not work?',
              answer:
                'Usually one of these: the proxy never got applied in the first place — e.g. the method was called from inside the same class (self-invocation), the class or method is `final` (CGLIB proxies can\u2019t override those), or the class isn\u2019t actually a Spring bean. It can also be that the exception type thrown doesn\u2019t trigger a rollback by default, the transaction manager isn\u2019t configured correctly, or the method got called from a different thread that doesn\u2019t carry the transaction context. Another surprise: with `REQUIRED` propagation, your method might silently join an outer transaction you didn\u2019t expect, and its outcome now depends on that outer transaction too.',
            },
            {
              question: 'What exceptions trigger transaction rollback?',
              answer:
                'By **default**, Spring only rolls back the transaction when an **unchecked exception** is thrown (`RuntimeException` or `Error`). **Checked exceptions** are treated as "expected outcomes" and the transaction still **commits** — unless you tell Spring otherwise.\n\n**Best practice:** if a business method can throw a checked exception that should cancel the transaction, explicitly declare `@Transactional(rollbackFor = Exception.class)`. Or, simpler, design your domain to throw unchecked exceptions for failure cases so the default behavior just works.',
            },
            {
              question: 'What is the difference between REQUIRED and REQUIRES_NEW?',
              answer:
                '- **`REQUIRED` (the default):** join the current transaction if one already exists, otherwise start a new one.\n- **`REQUIRES_NEW`:** **pause** whatever transaction is currently running, start a completely fresh one, let it commit or roll back on its own, and only then resume the original transaction.\n\n**Where `REQUIRES_NEW` is useful:** writing an audit log entry that must be saved **even if** the rest of the operation later fails and rolls back. Use it carefully though — it means holding a second database connection at the same time, which adds load on your connection pool.',
            },
            {
              question: 'Explain all transaction propagation types.',
              answer:
                '- **REQUIRED** — join the existing transaction, or create a new one if there isn\u2019t one.\n- **REQUIRES_NEW** — always start a brand-new, independent transaction (pausing any existing one).\n- **SUPPORTS** — use the existing transaction if there is one; otherwise just run without a transaction at all.\n- **NOT_SUPPORTED** — pause any existing transaction and run this method without a transaction.\n- **MANDATORY** — there must already be a transaction running, or it throws an error.\n- **NEVER** — throws an error if a transaction is already running.\n- **NESTED** — creates a savepoint inside the current transaction (works with JDBC); if this part fails, it can roll back just to that savepoint instead of rolling back everything.\n\n**For interviews:** know `REQUIRED` vs `REQUIRES_NEW` vs `NESTED` really well — those are the ones people actually ask about.',
            },
            {
              question: 'What is transaction isolation?',
              answer:
                'Isolation controls how much one transaction can "see" of another transaction that\u2019s running **at the same time** — things like half-finished (uncommitted) changes, or rows that appear/disappear mid-transaction. Higher isolation means fewer weird edge cases, but it also usually means more locking and slower performance. You set it with `@Transactional(isolation = ...)`, or just rely on the database\u2019s own default.',
            },
            {
              question: 'Explain all isolation levels.',
              answer:
                '- **READ_UNCOMMITTED** — you can see other transactions\u2019 changes even before they commit (a "dirty read"). Rarely used.\n- **READ_COMMITTED** — you never see uncommitted changes from others. This is Postgres\u2019s default.\n- **REPEATABLE_READ** — once you\u2019ve read a row in your transaction, it won\u2019t change underneath you for the rest of that transaction. This is roughly what MySQL\u2019s InnoDB uses by default.\n- **SERIALIZABLE** — the strongest level; the database behaves as if transactions ran one at a time, using range locks or similar tricks.\n\n**Rule of thumb:** pick the **weakest** level that still keeps your data correct — stronger isolation always costs you performance.',
            },
            {
              question: 'What causes dirty reads?',
              answer:
                'A dirty read happens when you read data that another transaction has changed but **not yet committed**. If that other transaction later rolls back, you just made a decision based on data that technically never really existed. This can only happen at the `READ_UNCOMMITTED` isolation level.',
            },
            {
              question: 'What causes phantom reads?',
              answer:
                'A phantom read happens when you run the same range query twice inside one transaction, and the second time you see **new rows** that another transaction committed in between — rows that "phantom" appeared. You can prevent this with `SERIALIZABLE` isolation, or by using explicit locking like `SELECT ... FOR UPDATE` on the range you care about.',
            },
            {
              question:
                'Why does placing blocking I/O inside a transaction drastically reduce throughput under heavy load?',
              answer:
                'A transaction often owns a database connection and may hold row/table locks, MVCC snapshots, undo/version data, and transaction-manager thread state until completion. If that thread blocks on HTTP, file I/O, a queue, DNS, or a slow SDK, those scarce resources sit idle for the entire external latency. With enough concurrent requests, the connection pool empties, lock wait time grows, transactions retain more database state, Tomcat/executor threads pile up, and one slow dependency creates a cascading queueing failure even when database CPU is low.\n\nKeep the transaction boundary around local database work only. Validate/call remote services before the transaction when safe, or commit state plus a transactional outbox and perform I/O asynchronously afterward. For workflows spanning services use idempotency, retries with limits, saga compensation, and reconciliation—not a long local transaction. Add timeouts and instrument transaction duration, pool pending time, lock waits, and outbound latency. `REQUIRES_NEW` does not solve blocking; it can consume another connection.',
            },
            {
              question: 'What happens during nested transactions?',
              answer:
                'When people say "nested transaction" in Spring, they usually mean one of two things: the `NESTED` propagation type (which uses real database savepoints), or simply calling another `@Transactional` method with `REQUIRED` propagation, which just **joins** the same physical transaction rather than creating a separate one.\n\nWith `REQUIRED`, if the inner method fails, it marks the **whole** transaction as rollback-only — so everything gets rolled back together, even the outer work that otherwise succeeded. With `NESTED`, a failure can roll back to just the savepoint, leaving the earlier work intact. `REQUIRES_NEW`, by contrast, really is a separate, independent physical transaction.',
            },
            {
              question: 'What is transaction synchronization?',
              answer:
                'This is a way to register callbacks that run at specific points in a transaction\u2019s lifecycle — `beforeCommit`, `afterCommit`, `afterCompletion` — using `TransactionSynchronizationManager`.\n\n**Common uses:** flushing pending changes before commit, invalidating a cache **only after** the commit actually succeeds, or publishing an event only once you know the transaction went through. This last point matters a lot: if you publish an event *during* the transaction and it later rolls back, you\u2019ve told the rest of the system about something that never actually happened.',
            },
            {
              question: 'How do you debug transaction issues?',
              answer:
                'Turn on Spring\u2019s transaction debug logs to see when transactions start, commit, and roll back. Check `AopUtils.isAopProxy(bean)` to confirm the proxy is actually in place. Double-check the propagation and isolation settings on the annotation. Look at the database\u2019s lock view (like Postgres\u2019s `pg_locks`) to see what\u2019s actually blocked. Make sure only **one** transaction manager is configured for the resource you\u2019re debugging. Look for exceptions that are quietly caught and swallowed. And confirm `@Transactional` is on a `public` method that\u2019s actually called from outside the class.\n\n**Watch out:** tests annotated with `@Transactional` automatically roll back after each test, which can hide real bugs (like a missing commit) — write at least a few explicit, non-rolled-back test scenarios too.',
            },
            {
              question: 'What is the self-invocation problem?',
              answer:
                'When a method calls another method **on itself** (`this.otherMethod()`) inside the same class, it completely bypasses the Spring proxy — so any AOP behavior on that second method (`@Transactional`, `@Async`, `@Cacheable`, etc.) simply does not run, with no error or warning.\n\n**How to fix it:**\n- Move the second method into a **different** bean and call it through that bean instead.\n- Inject the bean into itself (`self`-injection) and call through that reference.\n- Use AspectJ compile-time weaving instead of proxy-based AOP (more setup, but avoids the problem entirely).\n- Or, often the cleanest fix: redesign the class boundaries so this situation doesn\u2019t come up.',
            },
            {
              question: 'How does Spring use proxies for transaction management?',
              answer:
                'When a bean has `@Transactional` methods, Spring wraps it with a `TransactionInterceptor` — using a JDK dynamic proxy if the bean implements an interface, or a CGLIB subclass proxy otherwise. That interceptor is what actually talks to `PlatformTransactionManager` to start/commit/roll back.\n\n**The catch:** only calls that come in **through the proxy** get this transactional behavior — calls made directly on the raw object (like self-invocation) skip it. This is exactly why it matters to design clean, external-facing "transactional" methods rather than relying on internal method calls to carry transaction behavior.',
            },
            {
              question:
                'Why can @TransactionalEventListener(AFTER_COMMIT) silently stop working in asynchronous event processing?',
              answer:
                '`@TransactionalEventListener` registers the listener with the **transaction active on the publishing thread**. If an event is published after work has already moved to an `@Async` executor, Reactor pipeline, or message callback without a Spring-managed transaction, there is no transaction synchronization to attach to; by default the listener is skipped (`fallbackExecution=false`). ThreadLocal transaction context is not propagated to another thread.\n\nA second trap is combining `AFTER_COMMIT` with `@Async`: scheduling can occur after commit, but the async listener runs with no original transaction. If it performs JPA writes without starting a new transaction, they may not be committed as expected. In-process events are also not durable—a crash after database commit but before executor execution loses the event.\n\nPublish inside the transactional method before it returns; keep the listener synchronous if it only hands off safe work, or make async persistence use an explicit new transaction such as a separate `@Transactional(REQUIRES_NEW)` bean. For reliable cross-process/critical work, write a transactional outbox in the original commit and publish from it. Test rollback, no-transaction publication, executor rejection, duplicate delivery, and crash recovery; enable transaction/event debug logging rather than setting `fallbackExecution=true` blindly.',
            },
          ],
        },
      ],
    },
    {
      id: 'architecture',
      title: 'Architecture Scenarios',
      blocks: [
        {
          type: 'interviewQa',
          variant: 'sketch',
          title: 'Architecture & Scale Q&A',
          items: [
            {
              question:
                'A production system using IoC Container starts failing intermittently under peak traffic. How would you investigate and redesign it?',
              answer:
                'Failures that only show up **under load** almost always point to one of three things: shared mutable state in a singleton bean, connection/thread pool exhaustion, or blocking calls tying up request-handling threads.\n\n**Investigate:** look at latency and error-rate metrics, check pool usage (active vs. pending), take thread dumps during the spike, check GC behavior, and look at the SLOs of anything this service depends on.\n\n**Redesign:** remove any mutable state from singleton beans, add bulkheads (separate pools per dependency), add timeouts and circuit breakers, bound your queues so they can\u2019t grow unbounded, size pools based on actual measured evidence, and isolate the hottest code paths so they can\u2019t starve everything else.',
            },
            {
              question:
                'Traffic grows 10\u00d7 and the current IoC container design becomes the bottleneck. What would you change first?',
              answer:
                'First, fix **contention** — reduce how much code is synchronized, shrink any critical sections, and stop storing per-request data inside singleton beans (that forces threads to fight over shared state). Next, tune your thread pools and database connection pools based on real numbers, add caching for data that\u2019s read often, and move heavy, non-urgent work to async processing. Only scale **horizontally** (more instances) once the app is fully stateless and you\u2019ve confirmed the database itself can actually handle the extra load — adding more app instances in front of an overloaded database just makes things worse.',
            },
            {
              question:
                'A dependency outage causes a feature built around IoC Container to cascade across the application. How do you contain it?',
              answer:
                'The goal is to **fail fast and stay contained**, instead of letting one broken dependency slowly take down everything else. Use timeouts on every outbound call, circuit breakers that stop calling a dependency once it\u2019s clearly unhealthy, separate ("bulkhead") thread pools per dependency so a slow one can\u2019t starve threads meant for others, rate limits, and graceful fallback behavior (like serving cached or default data instead of failing outright).\n\n**Also avoid:** sharing one single, unbounded HTTP client connection pool across every downstream service — one bad dependency can then exhaust it for everyone. And be careful that your health checks reflect the right thing: a **liveness** check (is the process alive) is not the same as a **readiness** check (should traffic be sent here right now).',
            },
            {
              question:
                'Two concurrent requests interact with the IoC container and produce inconsistent results. How would you make the flow correct?',
              answer:
                'This is almost always caused by **shared mutable state in a singleton bean** — two requests running on different threads are reading/writing the same fields at the same time.\n\n**Fix it by:** making services stateless (no per-request data stored in bean fields), keeping all mutable state inside the database where transactions and locks can protect it, using request-scoped beans only when you really need per-request state, and using `ThreadLocal` only with very clear, guaranteed cleanup (otherwise it leaks between requests on pooled threads). Prefer immutable configuration objects and pure functions (same input always gives same output) wherever you can for request-time computation.',
            },
            {
              question:
                'How would you prove that your redesign actually solved the production problem?',
              answer:
                'Don\u2019t just assume the fix worked — measure it. Define your key metrics up front (SLIs): p95/p99 latency, error rate, and resource saturation. Load test with data and traffic patterns that look like production, then directly compare the before-and-after numbers for those same metrics. Roll it out gradually with a canary deployment while watching pool usage and GC behavior closely. Keep a rollback plan ready in case something unexpected shows up. In short: **proof means metrics, not a feeling that it seems faster now.**',
            },
            {
              question:
                'A production system using Spring Boot Auto-Configuration starts failing intermittently. How would you investigate it?',
              answer:
                'Start by dumping the app\u2019s **effective configuration** — through a secured `/actuator/env` or the startup configuration report — so you know exactly what settings are actually active, not what you assume they are. Then check for profile-specific overrides that differ between instances, conditional beans that flip on or off depending on small classpath/config differences per instance, multiple `DataSource`s accidentally being wired, or a race condition around lazily-created singleton beans. In a safe environment, you can also enable the `ConditionEvaluationReport` (or debug logging for auto-configuration) to see exactly which auto-config classes were applied and why.',
            },
            {
              question:
                'Traffic increases 10\u00d7 and auto-configuration becomes a bottleneck. What would you optimize first?',
              answer:
                'Auto-configuration itself almost never slows things down at runtime — it only runs once, at startup. The real bottleneck is usually the **default settings** it applies: pool sizes, Tomcat thread counts, Jackson serialization behavior, Hibernate defaults. Override those starter defaults with values based on actual measurements, replace any "chatty" auto-configured bean that\u2019s doing more work than you need, and explicitly disable auto-configuration you don\u2019t use with exclude filters.',
            },
            {
              question: 'How do you isolate failures caused by misconfigured auto-configuration?',
              answer:
                'Treat it like a binary search: use `@SpringBootApplication(exclude = ...)` to rule things out one at a time, or replace an auto-configured bean with your own `@Configuration` to control it directly. Compare the `ConditionEvaluationReport` between a working node and a broken one to see what differs. Pin your Spring Boot and library versions so behavior doesn\u2019t silently shift between deployments. And make the app **fail loudly at startup** on invalid configuration (using `spring.config.on-not-found`, or your own validators) rather than limping along with a bad setting.',
            },
            {
              question: 'How do you handle concurrency issues introduced by auto-configuration?',
              answer:
                'Audit the singleton beans that starters create for you — check whether any of them keep mutable fields that could be shared unsafely across threads. Make sure shared HTTP clients like `RestTemplate` or `WebClient` are configured and used in a thread-safe way. Bound the size of any task executor that Boot auto-creates so it can\u2019t grow without limit. And be careful never to treat an auto-configured bean as if it were a fresh, per-use object when it\u2019s actually a shared singleton.',
            },
            {
              question: 'How would you validate your solution before deploying to production?',
              answer:
                'Run contract tests, load tests, and chaos tests in a staging environment first. Do a dry run of your canary deployment and autoscaling policy. Confirm any database migration is backward compatible with the currently-running version. Use feature flags so you can turn a change off quickly without a redeploy. Make sure dashboards and alerts are already set up and ready **before** the release, not added afterward. And have runbooks ready for common failure scenarios. Ultimately, gate the deploy on real SLOs — passing unit tests alone isn\u2019t enough evidence that it\u2019s safe.',
            },
            {
              question:
                'How would you design authentication for millions of users using Spring Security?',
              answer:
                'Use **stateless tokens** (like JWTs) or delegate to an external identity provider using OAuth2/OIDC, rather than keeping login sessions in your own app\u2019s memory. Spring Security\u2019s resource-server support validates JWTs using a cached JWKS (the provider\u2019s public keys), which scales horizontally without extra coordination between instances.\n\nOnly store sessions somewhere shared (like Redis) if you truly need session-based behavior. Add rate limiting on login endpoints and defenses against credential stuffing, plus multi-factor authentication where appropriate. At very high traffic, it can make sense to split authentication into its own dedicated service. Note that authorization (checking permissions) usually still happens locally in each API, even if authentication is centralized.',
            },
            {
              question: 'How do you prevent cascading failures across Spring Cloud microservices?',
              answer:
                'Put timeouts on every call between services. Only retry calls that are safely **idempotent** (repeating them causes no harm), and add random jitter to retry delays so retries don\u2019t all pile up at once. Use circuit breakers to stop calling a service that\u2019s clearly struggling. Use bulkheads (separate pools per dependency) and rate limits, and bound how much backlog/queue can build up. Design for graceful degradation — a feature failing shouldn\u2019t take down the whole app. Where a path isn\u2019t truly critical, decouple it with async messaging instead of a direct synchronous call. Regularly test all of this with chaos testing (deliberately breaking things in a controlled way).',
            },
            {
              question: 'When would you choose WebFlux over Spring MVC?',
              answer:
                'Choose WebFlux when you have very high concurrency with a lot of **waiting on I/O** — for example, a gateway that fans out to many slow downstream services, or heavy streaming use cases — **and** you can keep the entire stack non-blocking, including your database drivers. If your team, or your JDBC driver, or key libraries are still blocking, stick with regular Spring MVC — mixing blocking code into a reactive stack usually costs you more complexity than it saves in performance.',
            },
            {
              question: 'How do you optimize Hibernate under heavy load?',
              answer:
                'Eliminate any N+1 query problems. Use DTO projections instead of loading full entities when you only need a few fields. Use the second-level cache carefully (and only for data that\u2019s safe to be slightly stale). Batch your inserts and updates instead of doing them one at a time. Choose sensible flush modes. Avoid "Open Session in View" for APIs — it hides problems rather than fixing them. Right-size your connection pool for real concurrency. Use read replicas for read-heavy traffic. And avoid loading huge object graphs into a single persistence context — it uses a lot of memory and slows down flush/commit.',
            },
            {
              question: 'How do you troubleshoot deadlocks caused by Spring transactions?',
              answer:
                'Your database\u2019s deadlock logs will usually show you the exact lock order that caused the conflict. Fix it by making sure your code always acquires locks in a **consistent order**, keeping transactions as short as possible, avoiding unnecessarily strong isolation levels, and retrying automatically when the database picks your transaction as the "deadlock victim." Never wait on user input while a transaction is still open. When investigating, line up your Spring transaction boundaries against the actual SQL statements running at that time.',
            },
            {
              question:
                'How do you design resilient distributed transactions using the Saga pattern?',
              answer:
                'A Saga breaks one big operation into a series of small **local transactions**, each with a matching **compensating action** to undo it if something later fails. You can coordinate this either through choreography (each service reacts to events from the previous one) or orchestration (a central coordinator tells each service what to do next).\n\nMake every step idempotent, use timeouts everywhere, persist the saga\u2019s state so it can resume after a crash, and route anything that can\u2019t auto-recover to a dead-letter queue for manual handling. Sagas are generally preferred over two-phase commit (2PC) in microservices — you trade strict consistency for something more scalable, and accept **eventual consistency** instead.',
            },
            {
              question: 'Why is Saga needed? Explain it with a real-world example.',
              answer:
                'A normal ACID transaction cannot safely span autonomous microservices/databases without tightly coupling their availability. A Saga keeps each service’s write local and coordinates the business workflow with durable messages and compensating actions.\n\n**Travel booking example:** create itinerary → reserve flight → reserve hotel → charge payment. If hotel reservation fails, release the flight. If payment fails after both reservations, cancel both. Compensation is a new business action, not a magical database rollback—refunds can fail or complete later, so the workflow persists its state and retries idempotently.\n\nUse an outbox to publish each local commit reliably, deduplicate consumers, define timeouts, and expose an honest state such as `BOOKING_PENDING` while convergence is in progress.',
            },
            {
              question: 'When would you choose Saga over a distributed transaction?',
              answer:
                'Choose Saga when work spans independently deployed services or heterogeneous data stores, availability/scalability matter, and the business accepts eventual consistency plus explicit compensation. It is especially suitable for long-running workflows such as orders, travel, fulfillment, and onboarding.\n\nA single local database transaction is still simpler and stronger when all writes can live in one bounded context. XA/2PC may fit a small controlled environment where every resource supports it and strict atomicity outweighs blocking, coordinator failure, and operational coupling. Saga is not free: it adds intermediate states, message reliability, idempotency, reconciliation, and harder testing.',
            },
            {
              question: 'How do you design a highly available Spring Boot architecture?',
              answer:
                'Run multiple instances behind a load balancer. Keep every app instance stateless. Replicate your database and keep backups. Use caches with sensible TTLs (expiry times) so stale data doesn\u2019t linger forever. Set up proper health and readiness checks so traffic only goes to instances that can actually handle it. Spread instances across multiple availability zones. Regularly run chaos drills to see how the system actually behaves when something breaks. And use bulkheads so one dependency\u2019s failure can\u2019t take everything else down.\n\nIn short: **high availability = redundancy + detecting failure fast + a recovery process you\u2019ve actually tested.**',
            },
            {
              question:
                'What trade-offs would you make as an Architect when performance, consistency, and scalability conflict?',
              answer:
                'Start by naming the actual invariant you must protect. Money and payments usually need **strong** consistency; a social feed or recommendation list can usually tolerate **eventual** consistency just fine. Use patterns like CQRS or caching where a little staleness is acceptable, and reserve fully synchronous, strongly consistent writes for the truly critical operations. Write down your target RPO/RTO (how much data loss and downtime is acceptable) and what "consistency" means from the user\u2019s point of view. And always optimize the bottleneck you\u2019ve actually **measured** — not the one that seems scariest in theory.',
            },
            {
              question: 'Ship a new version of a Spring Boot service with zero downtime. How?',
              answer:
                'Use a **rolling deployment**: only replace instances once new ones report "ready" (readiness gate), and set `maxUnavailable=0` so you never drop below full capacity. Keep your database schema changes **backward compatible** during the rollout — the classic pattern is expand (add new stuff without removing anything) then contract (remove the old stuff later, once nothing uses it). Enable graceful shutdown (`server.shutdown=graceful`) so in-flight requests finish instead of being cut off, and avoid sticky sessions that would break during instance replacement. Migrate data in safe, compatible phases, and make sure autoscaling doesn\u2019t fight against the rollout while it\u2019s happening.',
            },
          ],
        },
      ],
    },
    {
      id: 'delivery-containers-collaboration',
      title: 'Docker, Deployment, and Delivery Scenarios',
      blocks: [
        {
          type: 'interviewQa',
          variant: 'sketch',
          title: 'Containers & Safe Delivery Q&A',
          items: [
            {
              question:
                'What is Docker, why do we use it, and how does it provide environment consistency?',
              answer:
                'Docker packages an application with its runtime, libraries, filesystem, and startup command into an immutable image. Containers run that image as isolated processes using operating-system namespaces and cgroups; unlike VMs, they share the host kernel.\n\nThe same content-addressed image moves through dev, test, staging, and production, so dependency and filesystem differences are minimized. A Dockerfile makes the environment reproducible and image tags/digests make deployments traceable. It does not make environments identical by itself—configuration, secrets, CPU architecture, kernel, external services, and data still differ and must be managed explicitly.',
            },
            {
              question: 'How do you secure Docker containers in production?',
              answer:
                'Use minimal trusted base images, pin by digest, patch/rebuild frequently, and scan images/SBOMs in CI. Use multi-stage builds so compilers and source do not reach runtime. Run as a non-root UID, drop Linux capabilities, enable `no-new-privileges`, use seccomp/AppArmor/SELinux, prefer a read-only root filesystem, and mount only required writable paths.\n\nNever bake secrets into images or environment dumps; inject them through a secret manager. Set CPU/memory/PID limits, restrict egress/ingress, do not expose the Docker socket, sign/verify images, and enforce admission policy. Log/audit runtime behavior and keep hosts/orchestrators patched. Containers are an isolation boundary, not a substitute for application security.',
            },
            {
              question: 'What are the benefits of containerization in microservices?',
              answer:
                'Containers provide an independently versioned deployment unit, reproducible runtime, fast startup, efficient density, process/resource isolation, and a standard health/config/logging contract for an orchestrator. This supports independent scaling, rolling/canary releases, immutable infrastructure, and consistent CI artifacts.\n\nTrade-offs remain: image supply-chain risk, orchestration/networking complexity, observability overhead, stateful storage concerns, and resource-limit/JVM tuning. A badly bounded monolith split into containers does not automatically become good microservices.',
            },
            {
              question: 'What is Blue-Green Deployment, and how does rollback work?',
              answer:
                'Blue is the current production environment; Green is an equivalent environment running the new release. Deploy and test Green privately, warm caches, verify health/smoke checks, then switch the router/load balancer to Green. Existing connections should drain gracefully, giving near-zero downtime.\n\nRollback is a traffic switch back to Blue while it is still healthy. The difficult part is data: schema changes must be backward compatible (expand first, contract in a later release), and irreversible writes/migrations need restore or forward-fix plans. Also manage background jobs and message consumers so both colors do not process the same work. Compared with canary, Blue-Green switches a large traffic share quickly and costs roughly double capacity during rollout.',
            },
            {
              question:
                'Two senior stakeholders modify the same code. How do you resolve the conflict and deploy safely?',
              answer:
                'Pause the merge and understand both intents before choosing lines. Ask each owner to explain the requirement, invariant, tests, and deadline; use the ticket/ADR/product owner to resolve business priority, not seniority. Pair on a combined design when both behaviors are required, or split the code behind clear interfaces/feature flags.\n\nRebase/merge the latest target branch into a dedicated integration branch, resolve the conflict together, and add tests covering both stakeholders’ scenarios plus regression/contract tests around the shared area. Request review from both owners, run CI and a production-like smoke/load test, then use a small canary or feature-flag rollout with metrics and logs. Define the rollback trigger and owner before deployment. Record the decision so the same semantic conflict does not reappear.',
            },
          ],
        },
      ],
    },
    {
      id: 'internals',
      title: 'Boot Internals and Auto-Configuration',
      blocks: [
        {
          type: 'interviewQa',
          variant: 'sketch',
          title: 'Boot Internals Q&A',
          items: [
            {
              question: 'How does Spring Boot decide which auto-configuration to apply?',
              answer:
                'Boot first loads a list of candidate auto-configuration classes, then checks each one\u2019s **condition annotations** against things like what\u2019s on the classpath, what beans already exist, what properties are set, and what kind of app you\u2019re running (web, reactive, etc.). If the conditions match, that configuration gets applied and registers its beans; if not, it\u2019s silently skipped — you can see exactly why in the condition evaluation report if you need to debug it. If you define your own bean of the same type, it usually wins automatically, because most auto-configuration is written with `@ConditionalOnMissingBean`.',
            },
            {
              question: 'What happens internally when you add spring-boot-starter-web?',
              answer:
                'This one starter dependency pulls in a whole bundle of things: Spring MVC, the Jackson library for JSON, an embedded Tomcat server (by default), and Bean Validation support. Boot\u2019s auto-configuration then wires up a `DispatcherServlet`, message converters (for turning objects into JSON and back), default error pages, and a web server factory. The end result: your app becomes a fully working web application without you writing any XML or manual server setup.',
            },
            {
              question: 'Why does Spring Boot prefer convention over configuration?',
              answer:
                'Spring Boot ships with sensible defaults for almost everything — it scans for components starting from your main class, reads config from `application.properties`, starts an embedded server automatically, and starter dependencies bring in the versions and beans that usually work together out of the box. This means you can get a working app running fast, and you only write configuration for the parts where your needs are different from the default. It cuts down on repetitive setup code while still letting you override anything that doesn\u2019t fit your case.',
            },
            {
              question: 'How does Spring Boot load application.properties internally?',
              answer:
                'A component called `ConfigDataEnvironmentPostProcessor` looks for configuration in a set of known locations — the classpath, the filesystem, or explicit "imports" — and loads them with the correct priority (e.g. `application-prod.properties` should override `application.properties` when the `prod` profile is active). All of this ends up in Spring\u2019s `Environment` object, and later, annotations like `@ConfigurationProperties` or `@Value` bind those values into your actual Java objects. YAML files (`application.yml`) are supported the same way.',
            },
            {
              question: 'Exact startup flow of a Spring Boot application.',
              answer:
                'Roughly: `main()` calls `SpringApplication.run()` \u2192 Spring prepares the `Environment` \u2192 prints the startup banner \u2192 creates an `ApplicationContext` \u2192 loads your configuration classes \u2192 runs any registered initializers \u2192 "refreshes" the context (this is where bean definitions are processed, auto-configuration runs, and singleton beans actually get created) \u2192 the embedded web server starts \u2192 any `ApplicationRunner`/`CommandLineRunner` beans execute \u2192 the app is now ready to serve traffic.\n\nIf anything fails during the "refresh" step, the app never becomes ready and won\u2019t accept traffic — which is usually the desired, safe behavior.',
            },
            {
              question: 'Difference between @ComponentScan and @SpringBootApplication.',
              answer:
                '`@SpringBootApplication` is actually a combination of three annotations: `@Configuration` + `@EnableAutoConfiguration` + `@ComponentScan` (plus a couple of smaller extras). `@ComponentScan` **by itself** only tells Spring to find and register your `@Component`/`@Service`/etc. classes — it does **not** trigger Boot\u2019s auto-configuration on its own. If your classes live in packages outside your main class\u2019s package, you\u2019ll need to customize the scan base packages so Spring can actually find them.',
            },
            {
              question: 'How does Spring Boot detect embedded Tomcat and configure it?',
              answer:
                'If the Tomcat classes are present on the classpath, and nothing has pushed the app toward a reactive setup instead, `ServletWebServerFactoryAutoConfiguration` registers a `TomcatServletWebServerFactory` for you. From there, properties like `server.port`, `server.tomcat.threads.max`, and other `server.*` settings let you tune the connector, thread pool, and connection limits without writing any Tomcat configuration code yourself.',
            },
            {
              question: 'What happens if two beans of the same type exist without @Qualifier?',
              answer:
                'Spring can\u2019t decide which one you meant, so injecting by type throws a `NoUniqueBeanDefinitionException`. You fix this by marking one bean as the default with `@Primary`, or by being explicit about which one you want using `@Qualifier` (or `@Resource(name = ...)`). If you\u2019re using constructor injection with multiple candidates, you can put `@Qualifier` right on the individual constructor parameter.',
            },
            {
              question: 'How does Spring Boot handle profile-specific configuration?',
              answer:
                'You activate one or more profiles using `spring.profiles.active` (or profile groups). Once active, Boot loads matching `application-{profile}.properties` files, and any bean marked `@Profile("that-profile")` becomes eligible to be created. Profiles are meant for differences between environments (dev, staging, prod) — but keep actual secrets in a proper secrets vault, never committed to your repository.',
            },
            {
              question: 'What is the role of SpringFactoriesLoader under the hood?',
              answer:
                'This is the older mechanism Spring uses to read `META-INF/spring.factories` files, which list things like application context initializers, auto-configuration classes, and listeners — without you having to hardcode any of that wiring yourself. Spring Boot 3 mostly moved to a newer `AutoConfiguration.imports` file instead, but the underlying idea is the same: metadata sitting on the classpath drives plugin-style loading automatically.',
            },
            {
              question: 'Difference between @RestController and @Controller internally.',
              answer:
                '`@RestController` is really just `@Controller` plus `@ResponseBody` applied automatically to the whole class. That means every method\u2019s return value gets passed through Spring\u2019s message converters (turning it into JSON, for example) instead of being treated as the name of a view to render. Plain `@Controller` is meant for traditional MVC apps that return view names — unless you add `@ResponseBody` on individual methods yourself.',
            },
            {
              question: 'How does Spring Boot manage dependency versions automatically?',
              answer:
                'Spring Boot publishes a **BOM** (Bill of Materials) called `spring-boot-dependencies`, which lists compatible, tested versions for a huge range of libraries. When you use `spring-boot-starter-parent` (or import `spring-boot-dependencies` directly), that BOM is pulled in, so you can add starter dependencies **without specifying a version** — Boot picks one that\u2019s known to work well with everything else. You can still override a specific version deliberately if you have a good reason to.',
            },
            {
              question: 'Lifecycle of a Spring Bean in Spring Boot.',
              answer:
                'Roughly: the bean is **instantiated** \u2192 its properties/dependencies are set \u2192 if it implements bean-aware interfaces, those callbacks run (like getting its own name) \u2192 any `BeanPostProcessor`s run their "before init" step \u2192 `@PostConstruct` (or `InitializingBean`) runs \u2192 `BeanPostProcessor`s run their "after init" step (this is where proxies often get applied) \u2192 the bean is now ready to use \u2192 later, on shutdown, `@PreDestroy` (or `DisposableBean`) runs, along with other close hooks. Note that the final object you actually use might be a proxy wrapping your real bean, created during that post-processing step.',
            },
            {
              question: 'Fat jar vs normal jar \u2014 internal difference.',
              answer:
                'A Spring Boot **fat jar** (sometimes called an "uber jar") packages all of your dependency jars **nested inside** one single jar file, and uses a custom `JarLauncher` (with a special `LaunchedURLClassLoader`) to actually run code straight out of those nested archives. A regular ("thin") jar only contains your own code, and expects you to supply the classpath (all the dependency jars) separately when you run it. The fat jar\u2019s whole benefit is simplicity: `java -jar app.jar` and you\u2019re done — no separate classpath setup needed.',
            },
            {
              question: 'How Spring Boot decides server port priority.',
              answer:
                'The port comes from whichever property source has the highest precedence in Spring\u2019s standard ordering — that could be a properties file, an environment variable (`SERVER_PORT`), or a command-line argument (`--server.port=8081`), among others. Setting `server.port=0` tells the app to pick a random free port — handy for tests. Many cloud platforms automatically inject a `PORT` environment variable that your app needs to respect.',
            },
            {
              question: 'What happens internally when you hit a REST endpoint.',
              answer:
                'This is the same flow as the general `DispatcherServlet` flow described earlier: request \u2192 filters \u2192 servlet \u2192 handler mapping \u2192 controller \u2192 service \u2192 message converters \u2192 response. The one thing to add: security or Actuator filters can short-circuit the request earlier in the chain — for example, rejecting an unauthenticated request before it ever reaches your controller.',
            },
            {
              question: 'How Spring Boot integrates with Actuator internally.',
              answer:
                'When Actuator is on the classpath, its auto-configuration registers each management endpoint (`/health`, `/metrics`, etc.) as its own bean, and sets up a web mapping for them — either on the same port as your app or a separate management port, depending on configuration. Which endpoints are actually reachable over the web is controlled by `management.endpoints.web.exposure.*`. Behind `/health`, multiple "health contributors" (database, disk space, custom checks, etc.) each report their own status, and Actuator combines them into one overall result.',
            },
            {
              question: 'How exception translation works in Spring Boot.',
              answer:
                'On the data layer, `@Repository` beans get wrapped with a proxy that automatically converts low-level, driver-specific persistence exceptions into Spring\u2019s own consistent `DataAccessException` hierarchy — so your service code doesn\u2019t need to know or care which database driver actually threw the error. On the web layer, you handle exceptions with `@ControllerAdvice` + `@ExceptionHandler` (or the newer `ProblemDetail` approach) to turn them into proper HTTP responses. If nothing catches an exception, Boot\u2019s default error handling renders a generic `/error` response.',
            },
            {
              question: 'Common performance mistakes in Spring Boot applications.',
              answer:
                'Leaving "Open Session in View" enabled for APIs (it hides lazy-loading problems instead of fixing them). Unbounded caches that grow forever and eventually cause memory pressure. Making slow, synchronous remote calls while holding a database transaction open. Connection/thread pools that are either far too small or far too large for real traffic. The N+1 query problem. Blocking calls inside a WebFlux reactive pipeline (which defeats the whole point of using it). Logging huge request/response payloads. Marking JPA relationships as `fetch = EAGER` everywhere, causing large object graphs to load when you only wanted one field. Missing database indexes. And starting way more Tomcat/Netty threads than the workload actually needs, without measuring first.',
            },
          ],
        },
      ],
    },
    {
      id: 'security-basics',
      title: 'Dependency Injection, Security, and Errors',
      blocks: [
        {
          type: 'sketchnote',
          title: 'OAuth 2.0 vs JWT',
          intro:
            'One defines delegated authorization; the other defines a portable token format. They solve different problems and are commonly used together.',
          items: [
            {
              code: 'OAuth',
              glyph: '↗',
              title: 'Authorization framework',
              subtitle: 'How a client gets delegated access',
              points: [
                'Defines roles, grants, scopes, consent, and token issuance',
                'Actors: client, user, authorization server, resource server',
                'OAuth access tokens may be opaque or JWT-formatted',
              ],
              tip: 'OAuth is a protocol/framework—not a token format.',
            },
            {
              code: 'JWT',
              glyph: 'J',
              title: 'Signed token format',
              subtitle: 'Header.Payload.Signature',
              points: [
                'Carries claims such as sub, iss, aud, exp, and scope',
                'Resource server can validate locally using a public key',
                'Readable by holders unless separately encrypted',
              ],
              tip: 'Signed does not mean secret. Never put passwords or sensitive PII in claims.',
            },
            {
              code: 'OIDC',
              glyph: 'ID',
              title: 'Authentication layer',
              subtitle: 'Login on top of OAuth 2.0',
              points: [
                'Adds ID Token, UserInfo, nonce, and identity semantics',
                'Use Authorization Code + PKCE for browser/mobile login',
                'The ID token is for the client; access token is for the API',
              ],
              tip: 'Say “OIDC for login, OAuth for delegated API access.”',
            },
            {
              code: 'Trade',
              glyph: '⇄',
              title: 'JWT vs opaque token',
              subtitle: 'Local speed vs central control',
              points: [
                'JWT: local validation, low latency, harder immediate revocation',
                'Opaque: introspection/revocation, but adds network/cache dependency',
                'Validate signature, issuer, audience, expiry, and key rotation',
              ],
              tip: 'Do not accept a token merely because it parses.',
            },
          ],
        },
        {
          type: 'interviewQa',
          variant: 'sketch',
          title: 'DI, Security & Errors Q&A',
          items: [
            {
              question: 'What is Dependency Injection?',
              answer:
                'It\u2019s a simple idea: instead of a class creating its own dependencies (with `new SomeClass()`), something else — "the container" — hands those dependencies to it from the outside. This keeps classes loosely coupled (easy to swap out an implementation), much easier to test (you can pass in a fake/mock dependency), and lets one central place manage object lifecycles. Spring\u2019s IoC (Inversion of Control) container is exactly this: the engine that creates your objects and injects their dependencies for you.',
            },
            {
              question: 'Types of Dependency Injection.',
              answer:
                'There are three common styles: **constructor** injection, **setter** injection, and **field** injection.\n\nConstructor injection is the recommended default for anything a class truly needs to function — it makes dependencies explicit and required. Setter injection fits optional dependencies that might be set later or changed. Field injection (`@Autowired` directly on a field) is generally discouraged because it hides dependencies and makes testing harder.\n\nSpring also supports **provider-style** injection (`ObjectProvider`) for cases where you need a dependency lazily, optionally, or when there might be multiple matching beans and you want to choose at runtime.',
            },
            {
              question: 'Explain Spring Boot application flow.',
              answer:
                'At **startup**, Boot builds the application context and starts the embedded server. At **runtime**, each incoming request flows through filters \u2192 `DispatcherServlet` \u2192 controller \u2192 service \u2192 repository \u2192 database, with cross-cutting behavior (like transactions or logging) layered in through AOP along the way. Actuator quietly observes health and metrics in the background, and Spring Security gatekeeps access before requests even reach your controllers. At **shutdown**, the app stops accepting new requests, finishes any in-flight ones, and then closes its beans cleanly.',
            },
            {
              question: 'How does Spring Security work?',
              answer:
                'The servlet container enters `DelegatingFilterProxy`, which delegates to Spring’s `FilterChainProxy`. It selects the first matching `SecurityFilterChain` and runs its ordered filters.\n\n1. The security context is loaded (or starts empty).\n2. An authentication filter extracts credentials: session, Basic, bearer token, or login form.\n3. It builds an unauthenticated `Authentication` and calls `AuthenticationManager` (usually `ProviderManager`).\n4. A matching `AuthenticationProvider` validates it—commonly through `UserDetailsService` + `PasswordEncoder`, or a JWT decoder—and returns an authenticated token with authorities.\n5. Spring stores it in `SecurityContextHolder` for the request; session-based apps may persist it, while stateless APIs rebuild it each request.\n6. `AuthorizationFilter` checks URL rules through an `AuthorizationManager`. Later, method interceptors enforce `@PreAuthorize`/`@PostAuthorize` before/after service calls.\n7. If authentication is missing/invalid, `AuthenticationEntryPoint` returns 401. If the caller is authenticated but forbidden, `AccessDeniedHandler` returns 403. If allowed, the request continues to `DispatcherServlet` and the controller.\n8. The context is cleared at request completion to prevent identity leaking between pooled threads.\n\nCSRF protects browser cookie/session flows; do not disable it merely because an API returns JSON. Stateless bearer-token APIs that do not authenticate with cookies typically disable CSRF, define CORS explicitly, and use `SessionCreationPolicy.STATELESS`.',
            },
            {
              question: 'Explain JWT Authentication flow.',
              answer:
                '1. The user logs in with their credentials.\n2. The identity provider (or your own auth service) verifies them and issues a **JWT** (a signed token containing some claims about the user).\n3. The client stores that token and sends it on every future request in an `Authorization: Bearer <token>` header.\n4. The resource server (your API) checks the token\u2019s signature and claims (like expiry) to confirm it\u2019s valid and untampered.\n5. Spring builds an `Authentication` object from the token\u2019s contents, and your authorization rules then decide what that user is allowed to do.\n\nA **refresh token** is used to get a new access token once the short-lived one expires, without making the user log in again. If you need to be able to instantly revoke access before a token naturally expires, you\u2019ll need extra machinery like a denylist or a token-version check, since a JWT by itself can\u2019t be "recalled" once issued.',
            },
            {
              question: 'How do you handle exceptions globally?',
              answer:
                'Use a `@ControllerAdvice` class with `@ExceptionHandler` methods that map your domain-specific errors to the right HTTP status code and a clean response body (often using Spring\u2019s built-in `ProblemDetail` format). For example: validation failures become **400**, permission errors become **403**, "not found" becomes **404**. Always log the error with a correlation/request ID so you can trace it later — but never leak internal details (like stack traces or SQL) back to the client.',
            },
            {
              question: 'Difference between @Qualifier and @Primary.',
              answer:
                '`@Primary` marks one specific bean as the "default choice" whenever there are multiple candidates of the same type and Spring has to pick one automatically. `@Qualifier` is more precise — it lets you say exactly **which** bean, by name or a custom qualifier annotation, you want injected in a particular spot. Think of `@Primary` as a convenient fallback for the common case, and `@Qualifier` as being explicit when you need control.',
            },
            {
              question: 'How do you perform graceful shutdown for in-flight requests?',
              answer:
                'Set `server.shutdown=graceful` along with a reasonable `spring.lifecycle.timeout-per-shutdown-phase`, so the app stops accepting new requests but lets requests already in progress finish first.\n\nIn Kubernetes, the usual pattern is: a short `preStop` sleep, the readiness probe starts failing (so no new traffic is routed here), and only then does Kubernetes send `SIGTERM`. The app stops taking new work, finishes what\u2019s in flight, and closes its connection pools cleanly. Make sure `terminationGracePeriodSeconds` in your pod spec is long enough to cover this whole drain process — otherwise Kubernetes will forcibly kill the pod before it finishes.',
            },
          ],
        },
      ],
    },
  ],
};

export default content;
