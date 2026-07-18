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
            'Spring Boot interview prep with **in-depth answers** in sketchnote style — handwritten fonts on a notebook board. Expand each question to reveal the answer.',
        },
        {
          type: 'callout',
          variant: 'tip',
          title: 'How to practise',
          body: 'Answer out loud in four beats: **abstraction → internals → failure mode → how you observe it in prod**. Strong answers name the proxy, the pool, or the filter chain — not just the annotation.',
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
                '**Path:** client \u2192 embedded Tomcat \u2192 Servlet filter chain (Security, CORS, \u2026) \u2192 `DispatcherServlet` \u2192 handler mapping \u2192 controller method \u2192 argument resolvers \u2192 business/service \u2192 return value handlers (`@ResponseBody` / message converters) \u2192 HTTP response.\n\n**Key internals:** Boot auto-configures an embedded servlet container and registers `DispatcherServlet` at `/`. Filters run *around* the servlet. Controllers are beans; JSON usually goes through `MappingJackson2HttpMessageConverter`.\n\n**Say in interview:** \u201cFilters first, then DispatcherServlet routes to the mapped controller, binds/validates args, executes the method, then serializes the return value.\u201d',
            },
            {
              question: 'Explain the DispatcherServlet flow.',
              answer:
                '`DispatcherServlet` is Spring MVC\u2019s **front controller**:\n\n1. `HandlerMapping` finds the handler (`@RequestMapping` method).\n2. `HandlerAdapter` invokes it.\n3. `HandlerInterceptor`s run pre/post/afterCompletion.\n4. Return value is processed (`@ResponseBody`, `ResponseEntity`, view name).\n5. Exceptions go to `HandlerExceptionResolver` / `@ControllerAdvice`.\n\n**Sketch:** one servlet, many controllers \u2014 mapping + adapters keep MVC pluggable.',
            },
            {
              question: 'What is the difference between @Component, @Service, and @Repository?',
              answer:
                'All three mark a class as a **Spring bean** for component scanning.\n\n- **`@Component`**: generic stereotype.\n- **`@Service`**: semantic \u201cbusiness service\u201d (same mechanics as `@Component`).\n- **`@Repository`**: DAO/persistence stereotype; Spring can also apply **exception translation** (e.g. JDBC/JPA \u2192 `DataAccessException`).\n\n**Interview tip:** Prefer stereotypes for readability and AOP pointcuts; behavior difference that matters most is `@Repository` + persistence exception translation.',
            },
            {
              question: '@Autowired vs constructor injection?',
              answer:
                '**Constructor injection** (preferred): dependencies are `final`, required at creation, easy to test, fails fast if a bean is missing. Boot/Spring can omit `@Autowired` on a single constructor.\n\n**Field `@Autowired`**: hidden dependencies, harder to test, allows partially constructed objects, couples you to the container.\n\n**Setter injection**: optional/mutable deps. Use sparingly.\n\n**Rule:** constructor for required deps; avoid field injection in production code.',
            },
            {
              question: 'What is bean scope? Explain Singleton vs Prototype.',
              answer:
                '**Scope** = how many instances the container creates and how long they live.\n\n- **Singleton (default):** one shared instance per Spring container. Must be **thread-safe** (stateless services).\n- **Prototype:** new instance every injection/lookup. Spring does **not** fully manage prototype destruction for you.\n\nOthers: `request`, `session`, `application` (web). Mixing prototype into singleton injects **one** prototype unless you use `ObjectFactory`/`Provider`/`@Lookup`.',
            },
            {
              question: 'What is Spring AOP? Where have you used it?',
              answer:
                '**AOP** adds cross-cutting behavior (tx, logging, metrics, security) via **proxies** around beans (JDK interface proxy or CGLIB subclass).\n\nCommon uses: `@Transactional`, `@Async`, `@Cacheable`, custom `@Around` for timing/audit, method security (`@PreAuthorize`).\n\n**Caveat:** only **external** calls through the proxy are advised \u2014 self-invocation skips AOP.',
            },
            {
              question: 'How does @Transactional work internally?',
              answer:
                'Spring creates a **proxy**. On an advised call:\n\n1. `PlatformTransactionManager` starts/joins a transaction (propagation rules).\n2. Bind resources (e.g. EntityManager) to the thread via `TransactionSynchronizationManager`.\n3. Invoke the method.\n4. On success \u2192 commit (unless marked rollback-only). On **runtime** exception (default) \u2192 rollback.\n5. Run synchronizations (flush, afterCommit hooks).\n\n**Requires:** proxy call path, correct manager (JPA/JDBC), and usually public methods for proxy-based AOP.',
            },
            {
              question: 'What causes LazyInitializationException?',
              answer:
                'You access a **lazy** JPA association **outside** an open persistence context (transaction/`EntityManager` already closed) \u2014 classic: return entity from `@Transactional` service, then serialize `parent.getChildren()` in the controller/JSON layer.\n\n**Fixes:** fetch join / entity graph; `@Transactional(readOnly=true)` at the right layer; DTO projection; `OpenSessionInView` (usually avoid in APIs); initialize explicitly inside the transaction.',
            },
            {
              question: 'How do you implement pagination and sorting?',
              answer:
                'Use Spring Data: `Pageable` / `Sort` on repository methods \u2192 `Page<T>` or `Slice<T>`.\n\nController: `Pageable` from query params (`page`, `size`, `sort`) via `PageableHandlerMethodArgumentResolver`. Cap `max-page-size`. Prefer **keyset/seek** pagination for deep pages; `Page` counts are expensive on huge tables.\n\nReturn DTOs, not open entity graphs.',
            },
            {
              question: 'How do you validate request payloads?',
              answer:
                'Bean Validation (`jakarta.validation`): annotate DTOs (`@NotNull`, `@Size`, `@Email`, custom constraints). Put `@Valid` / `@Validated` on controller params. Handle `MethodArgumentNotValidException` in `@ControllerAdvice` \u2192 **400** with field errors.\n\nValidate at boundaries; keep domain invariants in the domain layer too. For path/query params, annotate and use `@Validated` on the controller class.',
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
                'Propagate a **correlation / trace ID** on every hop (W3C Trace Context / B3).\n\nStack: **Micrometer Tracing** + OpenTelemetry/Brave, log MDC (`traceId`, `spanId`), export to Zipkin/Jaeger/Tempo. Gateway injects IDs; each service continues the span for HTTP/messaging.\n\nAlso log `requestId` for support even when full tracing isn\u2019t sampled.',
            },
            {
              question: 'What are the most common causes of connection-pool exhaustion?',
              answer:
                '1. Slow queries / locks holding connections.\n2. Connections borrowed and not returned (missing try-with-resources / tx boundary bugs).\n3. Pool too small for concurrency (`HikariCP maximumPoolSize`).\n4. Long `@Transactional` methods (HTTP calls inside tx).\n5. Connection leaks from streaming/Blob misuse.\n6. Thread pile-up under downstream latency.\n\n**Debug:** Hikari metrics (`pending`, `active`, `usage`), DB `pg_stat_activity`, thread dumps, slow query log.',
            },
            {
              question: "What's the difference between @PathVariable and @RequestParam?",
              answer:
                '- **`@PathVariable`**: resource identity in the path (`/orders/{id}`).\n- **`@RequestParam`**: query/form params (`?status=OPEN&page=0`) \u2014 filters, optional flags, pagination.\n\nPath = *which resource*; query = *how to view/filter it*.',
            },
            {
              question: 'How would you handle duplicate API requests in a payment service?',
              answer:
                'Treat payments as **idempotent**:\n\n1. Client sends `Idempotency-Key` (UUID).\n2. Persist key + request hash + result uniquely.\n3. Same key \u2192 return stored outcome; conflicting body \u2192 **409**.\n4. Serialize concurrent same-key requests (unique constraint / row lock).\n5. Outbox for side effects; never charge twice for one key.\n\nAlso make webhook handlers idempotent.',
            },
            {
              question: 'What is the N+1 query problem, and how do you fix it?',
              answer:
                'Load N parents, then **1 query per parent** for children \u2192 1+N round-trips.\n\n**Fixes:** `JOIN FETCH` / `@EntityGraph`; batch size (`@BatchSize` / `default_batch_fetch_size`); DTO/`@Query` projections; avoid lazy serialization. Detect with `spring.jpa.show-sql`, p6spy, or datasource metrics.',
            },
            {
              question:
                "What's the purpose of Spring Boot Actuator, and which endpoints do you use most?",
              answer:
                '**Actuator** exposes ops endpoints: health, metrics, info, env (careful), loggers, prometheus.\n\nMost used: `/health` (k8s probes), `/metrics` + **Prometheus**, `/info`, `/loggers` for dynamic levels. Lock down with security; never expose `env`/`heapdump` publicly.',
            },
            {
              question: 'What happens if two users update the same record simultaneously?',
              answer:
                'Last write wins unless you use locking:\n\n- **Optimistic:** `@Version` \u2014 second commit gets `OptimisticLockException`; retry/merge.\n- **Pessimistic:** `LockModeType.PESSIMISTIC_WRITE` \u2014 row lock; watch deadlocks/latency.\n\nAPIs should return **409** on conflict with a clear retry story.',
            },
            {
              question: 'How would you upload large files without causing memory issues?',
              answer:
                'Stream, don\u2019t buffer entire files:\n\n- Servlet multipart with disk threshold; or **raw InputStream** / `StreamingResponseBody`.\n- Write to object storage (S3) with multipart upload.\n- Avoid `byte[]` / loading full `MultipartFile.getBytes()`.\n- Size limits, content-type allow-list.\n\nFor downloads: stream from storage to response.',
            },
            {
              question: 'Why might @Transactional not roll back a transaction?',
              answer:
                'Common reasons:\n\n1. **Checked exception** (default: no rollback) \u2014 use `rollbackFor`.\n2. **Self-invocation** \u2014 no proxy.\n3. Not a Spring bean / wrong visibility (proxy AOP).\n4. Exception caught and swallowed inside the method.\n5. Wrong manager / read-only misconfig.\n6. DB DDL auto-commit quirks.\n\nVerify with logs (`DEBUG` tx) and that the call crosses the proxy.',
            },
            {
              question: 'How does Spring Boot manage database connections using HikariCP?',
              answer:
                'Boot auto-configures **HikariCP** as the `DataSource`. Pool size, timeouts, leak detection come from `spring.datasource.hikari.*`.\n\nConnections are borrowed for JDBC work / JPA and returned to the pool when the logical session ends (tx completion). Monitor `HikariPool` metrics; set `maximumPoolSize` \u2248 workable DB concurrency, not \u201cthread count.\u201d',
            },
            {
              question: 'How would you secure REST APIs using Spring Security and JWT?',
              answer:
                'Stateless JWT API:\n\n1. Login/IdP issues signed JWT (short TTL + refresh strategy).\n2. `SecurityFilterChain`: CSRF off for pure Bearer APIs; authorize requests.\n3. JWT filter validates signature/exp/issuer, builds `Authentication`.\n4. Method security for fine-grained authZ.\n5. Rotate keys (JWKS); never put secrets in JWT claims you must hide.\n\nPrefer opaque tokens + introspection when revocation is critical.',
            },
            {
              question:
                "If a production issue is reported but there are no exceptions in the logs, what's your debugging approach?",
              answer:
                '1. Reproduce with request ID / user / time window.\n2. Check **latency** metrics, saturation (CPU, pool, threads), GC.\n3. Confirm logging level & sampling; look for \u201csuccessful\u201d wrong answers.\n4. Distributed traces for stuck downstream calls.\n5. Thread dump if requests hang; heap dump if memory creeps.\n6. DB slow queries / locks.\n7. Recent deploys, config, feature flags.\n\nAbsence of stack traces often means timeouts, wrong results, or swallowed errors.',
            },
            {
              question: 'How would you improve a slow Spring Data JPA query?',
              answer:
                '1. Explain plan / add indexes.\n2. Select only needed columns (DTO projection).\n3. Kill N+1; tune fetch strategy.\n4. Pagination; avoid huge `IN` lists.\n5. Cache hot read-only data.\n6. Rewrite as native SQL if ORM overhead dominates.\n7. Check connection pool wait vs query time.\n\nMeasure before/after with metrics, not guesses.',
            },
            {
              question:
                "What's the difference between synchronous and asynchronous processing in Spring Boot?",
              answer:
                '**Sync:** caller thread waits (typical MVC request thread). Simple, easy error propagation, ties up container threads.\n\n**Async:** `@Async`, `CompletableFuture`, messaging, WebFlux. Free the request thread; process later. Need a **pool**, error handler, and idempotency for retries.\n\nUse async for email, fan-out, long jobs \u2014 not for every DB read.',
            },
            {
              question: 'How does Spring Boot auto-configuration work internally?',
              answer:
                'On startup, Boot loads auto-config classes from `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` (or legacy `spring.factories`) via `AutoConfigurationImportSelector`.\n\nEach class uses `@ConditionalOnClass`, `@ConditionalOnMissingBean`, `@ConditionalOnProperty`, etc. If conditions match, it registers beans (DataSource, DispatcherServlet, \u2026). **Your beans win** over auto-config when you define them (`@ConditionalOnMissingBean`).\n\n`@SpringBootApplication` \u2192 `@EnableAutoConfiguration`.',
            },
            {
              question: 'What steps would you take before scaling a Spring Boot application?',
              answer:
                '1. Prove CPU/RAM/GC vs pool/DB bottlenecks with metrics.\n2. Make app **stateless** (external sessions/cache).\n3. Tune pools (Tomcat, Hikari, HTTP clients).\n4. Add caching, async where safe.\n5. DB capacity & indexes first \u2014 horizontal pods won\u2019t fix a saturated DB.\n6. Load test; set HPA on the right signal (CPU/RPS/latency).\n7. Safe shutdown + readiness before sending traffic.',
            },
            {
              question: "What's the difference between BeanFactory and ApplicationContext?",
              answer:
                '`BeanFactory` is the basic IoC container (get bean, singleton cache).\n\n`ApplicationContext` extends it with **events**, internationalization, AOP/proxy integration, environment/profiles, and eager singleton startup by default. Boot apps use `ApplicationContext`.\n\n**Rule of thumb:** `BeanFactory` = core; `ApplicationContext` = production-ready container.',
            },
            {
              question:
                "How would you debug a Spring Boot application that's slow only in production?",
              answer:
                'Prod-only smells: data volume, concurrency, real downstreams, warm vs cold caches, different config/GC, noisy neighbors.\n\nApproach: compare prod config; enable **percentile** latency; profiling (async profiler/JFR); check DB plans on prod-sized data; pool waits; GC pauses; chatty service calls; feature flags. Avoid turning on `show-sql` globally in prod \u2014 sample traces instead.',
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
                'Proxy not applied (self-call, `final` class/method with CGLIB limits, non-Spring bean), exception type doesn\u2019t trigger rollback, transaction manager missing, or called from another thread without context propagation. Also `REQUIRED` joining an outer tx you didn\u2019t expect.',
            },
            {
              question: 'What exceptions trigger transaction rollback?',
              answer:
                '**Default:** rollback on **unchecked** (`RuntimeException`, `Error`). **Checked** exceptions commit unless `rollbackFor` includes them.\n\nBest practice: declare `rollbackFor = Exception.class` for business methods that throw checked failures, or use unchecked domain exceptions consistently.',
            },
            {
              question: 'What is the difference between REQUIRED and REQUIRES_NEW?',
              answer:
                '- **`REQUIRED` (default):** join existing tx or create one.\n- **`REQUIRES_NEW`:** **suspend** outer tx, run in a fresh tx, commit/rollback independently, then resume outer.\n\nUse `REQUIRES_NEW` for audit logs that must persist even if the outer work fails \u2014 carefully, it holds extra connections.',
            },
            {
              question: 'Explain all transaction propagation types.',
              answer:
                '- **REQUIRED** \u2014 join or create.\n- **REQUIRES_NEW** \u2014 always new.\n- **SUPPORTS** \u2014 use tx if present, else non-tx.\n- **NOT_SUPPORTED** \u2014 suspend tx, run non-tx.\n- **MANDATORY** \u2014 must have existing tx or error.\n- **NEVER** \u2014 error if tx exists.\n- **NESTED** \u2014 nested savepoint (JDBC); rollback to savepoint without full outer rollback.\n\nKnow REQUIRED vs REQUIRES_NEW vs NESTED cold.',
            },
            {
              question: 'What is transaction isolation?',
              answer:
                'Isolation defines **visibility** of concurrent work: what dirty/phantom/non-repeatable phenomena are allowed. Higher isolation \u2192 fewer anomalies, more locking/latency. Set via `@Transactional(isolation = \u2026)` or DB default.',
            },
            {
              question: 'Explain all isolation levels.',
              answer:
                '- **READ_UNCOMMITTED** \u2014 dirty reads possible.\n- **READ_COMMITTED** \u2014 no dirty reads (PG default).\n- **REPEATABLE_READ** \u2014 stable read set for rows you read (MySQL InnoDB approx).\n- **SERIALIZABLE** \u2014 strongest; range locks / serial execution.\n\nPick the weakest level that preserves your invariants.',
            },
            {
              question: 'What causes dirty reads?',
              answer:
                'Reading another transaction\u2019s **uncommitted** changes. If that tx rolls back, you acted on data that \u201cnever existed.\u201d Allowed under `READ_UNCOMMITTED`.',
            },
            {
              question: 'What causes phantom reads?',
              answer:
                'Re-running a range query in the same tx sees **new rows** committed by others. Mitigated by `SERIALIZABLE` or careful locking (`SELECT \u2026 FOR UPDATE` / predicate locks).',
            },
            {
              question: 'Why should API calls be avoided inside transactions?',
              answer:
                'They hold DB connections/locks for network RTT \u2192 pool exhaustion, timeouts, cascading latency. Prefer: local tx \u2192 commit \u2192 outbound call \u2192 compensating action / outbox. Keep transactions **short and local**.',
            },
            {
              question: 'What happens during nested transactions?',
              answer:
                'Spring \u201cnested\u201d usually means **`NESTED` propagation** (savepoints) or a logical inner `@Transactional` with `REQUIRED` that **same** physical tx.\n\nInner rollback with `REQUIRED` marks the whole tx rollback-only. `NESTED` can roll back to a savepoint. `REQUIRES_NEW` is a separate physical transaction.',
            },
            {
              question: 'What is transaction synchronization?',
              answer:
                'Callbacks registered with `TransactionSynchronizationManager` that run on tx lifecycle: `beforeCommit`, `afterCommit`, `afterCompletion`. Used for flushing, cache invalidation **afterCommit**, publishing events only when commit succeeds (avoid listening on rollback).',
            },
            {
              question: 'How do you debug transaction issues?',
              answer:
                'Enable Spring tx debug logs; verify proxy (`AopUtils.isAopProxy`); check propagation/isolation annotations; watch DB locks (`pg_locks`); confirm one manager; look for swallowed exceptions; assert `@Transactional` on public methods called externally. Tests with `@Transactional` can hide bugs \u2014 prefer explicit scenarios.',
            },
            {
              question: 'What is the self-invocation problem?',
              answer:
                'Calling `this.method()` inside a class bypasses the Spring **proxy**, so `@Transactional` / `@Async` / `@Cacheable` on the callee don\u2019t run.\n\n**Fixes:** refactor to another bean; `self` injection; AspectJ weaving; redesign boundaries.',
            },
            {
              question: 'How does Spring use proxies for transaction management?',
              answer:
                '`TransactionInterceptor` wraps bean methods. JDK proxy if interface; otherwise CGLIB subclass. Interceptor talks to `PlatformTransactionManager`. Only calls entering through the proxy get advice \u2014 architecture must expose transactional fa\u00e7ades cleanly.',
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
                'Symptoms under load point to **shared singleton state**, pool exhaustion, or blocking calls in request threads.\n\nInvestigate: metrics (latency, error rate, pool active/pending), thread dumps, GC, dependency SLOs. Redesign: remove mutable singleton state; bulkheads; timeouts/circuit breakers; bound queues; scale pools with evidence; isolate hot paths.',
            },
            {
              question:
                'Traffic grows 10\u00d7 and the current IoC container design becomes the bottleneck. What would you change first?',
              answer:
                'First fix **contention**: synchronize less, shrink critical sections, stop storing request data in singletons. Then tune executor/DB pools, add caching for hot reads, move heavy work async. Horizontal scale only after the app is stateless and the DB can take it.',
            },
            {
              question:
                'A dependency outage causes a feature built around IoC Container to cascade across the application. How do you contain it?',
              answer:
                'Fail fast with **timeouts**, **circuit breakers**, bulkhead thread pools per dependency, graceful degradation (cached/fallback responses). Don\u2019t share one unbounded HTTP client pool across all downstreams. Health checks should reflect deep dependencies carefully (liveness \u2260 readiness).',
            },
            {
              question:
                'Two concurrent requests interact with the IoC container and produce inconsistent results. How would you make the flow correct?',
              answer:
                'Almost always **shared mutable singleton** state. Make services stateless; confine mutability to DB with transactions/locks; use request-scoped beans sparingly; `ThreadLocal` only with clear cleanup. Prefer immutable configs and pure functions for request computation.',
            },
            {
              question:
                'How would you prove that your redesign actually solved the production problem?',
              answer:
                'Define SLIs (p95/p99, error rate, saturation). Load test with production-like data; compare golden signals before/after; canary deploy; watch pool metrics and GC. Keep a rollback plan. Proof = metrics, not vibes.',
            },
            {
              question:
                'A production system using Spring Boot Auto-Configuration starts failing intermittently. How would you investigate it?',
              answer:
                'Dump effective config (`/actuator/env` secured, or startup report). Check profile-specific overrides, conditional beans flipping when classpath/config differs per instance, multiple DataSources, or race on lazy singletons. Enable `ConditionEvaluationReport` / debug auto-config once in a safe env.',
            },
            {
              question:
                'Traffic increases 10\u00d7 and auto-configuration becomes a bottleneck. What would you optimize first?',
              answer:
                'Auto-config itself rarely is the bottleneck at runtime \u2014 **defaults** are (pool sizes, Tomcat threads, Jackson, Hibernate). Override starters\u2019 defaults with measured values; replace chatty auto beans; disable unused auto-config with excludes.',
            },
            {
              question: 'How do you isolate failures caused by misconfigured auto-configuration?',
              answer:
                'Binary search: `@SpringBootApplication(exclude=\u2026)`, custom `@Configuration` replacing auto beans, compare `ConditionEvaluationReport` across good/bad nodes, pin Boot/library versions, fail startup on invalid config (`spring.config.on-not-found`, custom validators).',
            },
            {
              question: 'How do you handle concurrency issues introduced by auto-configuration?',
              answer:
                'Audit singleton beans from starters for mutable fields; configure thread-safe templates (shared `RestTemplate`/`WebClient` correctly); bound task executors Boot creates; never inject prototype-looking helpers that are actually singletons without care.',
            },
            {
              question: 'How would you validate your solution before deploying to production?',
              answer:
                'Contract/load/chaos tests in staging; canary + autoscale policy dry-run; migration backward compatibility; feature flags; dashboards & alerts ready; runbooks. Gate deploy on SLOs, not only green unit tests.',
            },
            {
              question:
                'How would you design authentication for millions of users using Spring Security?',
              answer:
                'Stateless tokens or external IdP (OAuth2/OIDC). Spring Security resource server validates JWTs via JWKS cache. Horizontal scale authN; store sessions only if needed (Redis). Rate-limit login; MFA; credential stuffing defenses; separate auth service if traffic extreme. AuthZ still local checks on each API.',
            },
            {
              question: 'How do you prevent cascading failures across Spring Cloud microservices?',
              answer:
                'Timeouts everywhere, retries with jitter **only** on idempotent calls, circuit breakers, bulkheads, rate limits, backlog bounds, graceful degradation, and chaos testing. Prefer async decoupling for non-critical paths.',
            },
            {
              question: 'When would you choose WebFlux over Spring MVC?',
              answer:
                'High concurrency with lots of **I/O wait**, streaming, or gateways \u2014 when you can keep the stack non-blocking end-to-end (reactive drivers). Stick with MVC if the team/JDBC/blocking libs dominate; hybrid often costs more than it buys.',
            },
            {
              question: 'How do you optimize Hibernate under heavy load?',
              answer:
                'Eliminate N+1; DTO projections; 2nd-level cache carefully; batch inserts/updates; sensible flush modes; no OSIV for APIs; connection pool right-sizing; read replicas for read-heavy paths; avoid huge persistence contexts.',
            },
            {
              question: 'How do you troubleshoot deadlocks caused by Spring transactions?',
              answer:
                'DB deadlock logs show lock order. Fix by consistent **lock ordering**, shorter txs, less aggressive isolation, retry on deadlock victim errors, avoid user interaction mid-tx. Correlate Spring tx boundaries with SQL.',
            },
            {
              question:
                'How do you design resilient distributed transactions using the Saga pattern?',
              answer:
                'Choreography or orchestration sagas: each local tx + compensating action. Idempotent steps, timeouts, state machine persistence, dead-letter for manual fix. Prefer Saga over 2PC for microservices; accept eventual consistency.',
            },
            {
              question: 'How do you design a highly available Spring Boot architecture?',
              answer:
                'Multi-instance behind LB; stateless apps; replicated DB + backups; caches with TTLs; health/readiness; multi-AZ; chaos drills; dependency bulkheads. HA is redundancy + fast failure detection + tested recovery.',
            },
            {
              question:
                'What trade-offs would you make as an Architect when performance, consistency, and scalability conflict?',
              answer:
                'State the invariant: money \u2192 stronger consistency; feeds \u2192 eventual. Use CQRS/cache where staleness is OK; sync commands for critical writes. Document RPO/RTO and user-visible consistency. Optimize the bottleneck you measured.',
            },
            {
              question: 'Ship a new version of a Spring Boot service with zero downtime. How?',
              answer:
                'Rolling deploy: readiness gate, `maxUnavailable=0`, backward-compatible schema (expand/contract), drain with graceful shutdown (`server.shutdown=graceful`), sticky sessions avoided. Migrate data in compatible phases; autoscale during rollout.',
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
                'It loads candidate auto-config classes, then evaluates **condition annotations** against classpath, beans, properties, and web app type. Matching configs import; failures are silent skips (see condition report). User `@Configuration`/`@Bean` usually overrides via missing-bean conditions.',
            },
            {
              question: 'What happens internally when you add spring-boot-starter-web?',
              answer:
                'Pulls Spring MVC, Jackson, embedded Tomcat (by default), validation, etc. Auto-config sets up `DispatcherServlet`, message converters, error pages, and a web server factory. Your app becomes a servlet web application without manual XML.',
            },
            {
              question: 'Why does Spring Boot prefer convention over configuration?',
              answer:
                'Sensible defaults (component scan from main class, `application.properties`, embedded server, starter deps) get you productive fast. You override only differences. Reduces boilerplate while staying replaceable when conventions don\u2019t fit.',
            },
            {
              question: 'How does Spring Boot load application.properties internally?',
              answer:
                '`ConfigDataEnvironmentPostProcessor` loads config data from known locations (classpath, file, optional imports) with profile-specific files and priority rules. Property sources feed `Environment`; `@ConfigurationProperties` / `@Value` bind later. YAML supported via `application.yml`.',
            },
            {
              question: 'Exact startup flow of a Spring Boot application.',
              answer:
                '`main` \u2192 `SpringApplication.run` \u2192 prepare environment \u2192 print banner \u2192 create `ApplicationContext` \u2192 load sources \u2192 apply initializers \u2192 refresh context (bean defs, auto-config, singletons) \u2192 start web server \u2192 `ApplicationRunner`/`CommandLineRunner` \u2192 ready.\n\nFailures during refresh prevent traffic.',
            },
            {
              question: 'Difference between @ComponentScan and @SpringBootApplication.',
              answer:
                '`@SpringBootApplication` = `@Configuration` + `@EnableAutoConfiguration` + `@ComponentScan` (and more). `@ComponentScan` alone only discovers annotated beans \u2014 no Boot auto-config. Customize scan packages when modules live outside the main class package.',
            },
            {
              question: 'How does Spring Boot detect embedded Tomcat and configure it?',
              answer:
                'If Tomcat classes are present and no reactive stack takes precedence, `ServletWebServerFactoryAutoConfiguration` registers `TomcatServletWebServerFactory`. Properties under `server.*` / `server.tomcat.*` tune connectors, threads, limits.',
            },
            {
              question: 'What happens if two beans of the same type exist without @Qualifier?',
              answer:
                'Injection by type fails with `NoUniqueBeanDefinitionException`. Fix with `@Primary`, `@Qualifier`, or `@Resource(name=\u2026)`. Constructor params can use `@Qualifier` on each argument.',
            },
            {
              question: 'How does Spring Boot handle profile-specific configuration?',
              answer:
                '`spring.profiles.active` / groups activate profiles. Loads `application-{profile}.properties` and `@Profile` beans. Use profiles for env differences; keep secrets in a vault, not git.',
            },
            {
              question: 'What is the role of SpringFactoriesLoader under the hood?',
              answer:
                'Legacy loader for `META-INF/spring.factories` entries (ApplicationContextInitializers, auto-configs, Listeners). Boot 3 prefers `AutoConfiguration.imports`, but the idea remains: classpath meta-data drives plugin-like loading without hardcoding.',
            },
            {
              question: 'Difference between @RestController and @Controller internally.',
              answer:
                '`@RestController` = `@Controller` + `@ResponseBody` on the type \u2192 return values go through message converters, not view resolution. `@Controller` is for MVC views unless methods are annotated `@ResponseBody`.',
            },
            {
              question: 'How does Spring Boot manage dependency versions automatically?',
              answer:
                'The **BOM** (`spring-boot-dependencies`) imported by `spring-boot-starter-parent` or `spring-boot-dependencies` pins compatible versions. You omit versions on starters; override deliberately when needed.',
            },
            {
              question: 'Lifecycle of a Spring Bean in Spring Boot.',
              answer:
                'instantiate \u2192 populate properties \u2192 BeanName/Factory aware \u2192 BeanPostProcessor before \u2192 `@PostConstruct` / `InitializingBean` \u2192 BPP after \u2192 ready \u2192 on shutdown `@PreDestroy` / `DisposableBean` / close hooks. Proxies may wrap the bean during post-processing.',
            },
            {
              question: 'Fat jar vs normal jar \u2014 internal difference.',
              answer:
                'Boot **fat/uber jar** nests dependency jars and uses a custom `JarLauncher`/`LaunchedURLClassLoader` to run nested archives. Thin jar needs external classpath. Fat jar = `java -jar app.jar` deployability.',
            },
            {
              question: 'How Spring Boot decides server port priority.',
              answer:
                '`server.port` from Environment (properties, env vars `SERVER_PORT`, CLI args). Random port: `server.port=0`. Cloud platforms inject `PORT`. Highest-precedence property source wins per Spring\u2019s property order.',
            },
            {
              question: 'What happens internally when you hit a REST endpoint.',
              answer:
                'Same as DispatcherServlet flow: filters \u2192 servlet \u2192 mapping \u2192 controller \u2192 service \u2192 converters. Actuator/security filters may short-circuit earlier.',
            },
            {
              question: 'How Spring Boot integrates with Actuator internally.',
              answer:
                'Actuator auto-config registers management endpoints as beans + a management web mapping (same or separate port). Endpoint exposure via `management.endpoints.web.exposure`. Health contributors aggregate into `/health`.',
            },
            {
              question: 'How exception translation works in Spring Boot.',
              answer:
                '`@Repository` proxies translate low-level persistence exceptions to Spring\u2019s hierarchy. MVC: `@ControllerAdvice` + `@ExceptionHandler`, or `ProblemDetail` handlers. Boot\u2019s default error attributes render `/error` for unhandled cases.',
            },
            {
              question: 'Common performance mistakes in Spring Boot applications.',
              answer:
                'OSIV enabled for APIs; unbounded caches; sync remote calls in txs; tiny/huge pools; N+1; blocking in WebFlux; logging huge payloads; `fetch = EAGER` everywhere; missing indexes; starting too many Netty/Tomcat threads without measuring.',
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
          type: 'interviewQa',
          variant: 'sketch',
          title: 'DI, Security & Errors Q&A',
          items: [
            {
              question: 'What is Dependency Injection?',
              answer:
                'A technique where an object receives its dependencies from the outside (the container) instead of constructing them. Enables loose coupling, easier testing, and centralized lifecycle. Spring\u2019s IoC container is the DI engine.',
            },
            {
              question: 'Types of Dependency Injection.',
              answer:
                '**Constructor**, **setter**, **field**. Constructor injection is the default best practice for required deps; setter for optional; field discouraged. Spring also supports provider injection (`ObjectProvider`) for lazy/optional multi-bean cases.',
            },
            {
              question: 'Explain Spring Boot application flow.',
              answer:
                'Startup builds the context and embedded server; runtime requests enter filters \u2192 DispatcherServlet \u2192 controllers \u2192 services \u2192 repositories \u2192 DB; cross-cuts via AOP; Actuator observes; Security gatekeeps. Shutdown drains requests then closes beans.',
            },
            {
              question: 'How does Spring Security work?',
              answer:
                'A **filter chain** wraps every request. Filters authenticate (establish `SecurityContext`) and authorize before reaching MVC. Configured via `SecurityFilterChain` beans. Method security adds AOP checks. Context held in `ThreadLocal` (or reactive context).',
            },
            {
              question: 'Explain JWT Authentication flow.',
              answer:
                'User authenticates \u2192 issuer returns JWT \u2192 client sends `Authorization: Bearer` \u2192 resource server verifies signature & claims \u2192 builds `Authentication` \u2192 authorization rules apply. Refresh tokens rotate access tokens; revoke via short TTL + denylist/versioning if required.',
            },
            {
              question: 'How do you handle exceptions globally?',
              answer:
                '`@ControllerAdvice` + `@ExceptionHandler` mapping domain errors to HTTP status + body (`ProblemDetail`). Translate validation errors to 400, authZ to 403, not found to 404. Log with correlation ID; don\u2019t leak internals.',
            },
            {
              question: 'Difference between @Qualifier and @Primary.',
              answer:
                '`@Primary` marks the default bean when multiple candidates exist. `@Qualifier` selects a **specific** bean by name/annotation. Qualifier is precise; Primary is convenience for the common case.',
            },
            {
              question: 'How do you perform graceful shutdown for in-flight requests?',
              answer:
                '`server.shutdown=graceful` + sufficient `spring.lifecycle.timeout-per-shutdown-phase`. K8s: preStop sleep, readiness fail, then SIGTERM; stop accepting traffic, finish in-flight, close pools. Align `terminationGracePeriodSeconds` with drain time.',
            },
          ],
        },
      ],
    },
  ],
};

export default content;
