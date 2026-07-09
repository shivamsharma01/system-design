# Design Patterns Catalog

A backlog of design patterns to turn into pages under the **Design Patterns** section (`section: 'design-patterns'`). Use this file as a living checklist — mark items `[x]` when a page is published.

## How to use this file

1. Pick a pattern from the list (start with [Suggested build order](#suggested-build-order) for flagship depth).
2. Scaffold a page: `npm run new:design -- <slug> "Pattern Name"` from `frontend/`.
3. Set **`section: 'design-patterns'`** in `*.meta.ts`.
4. Check off the pattern here when the page is published.

**Entry format:** title, one-line description, suggested `slug` (kebab-case for the registry).

---

## Creational (GoF)

- [x] **Singleton** — Ensure a class has only one instance and provide global access to it. `slug: singleton`
- [x] **Factory Method** — Define an interface for creating objects; let subclasses decide which class to instantiate. `slug: factory-method`
- [x] **Abstract Factory** — Provide an interface for creating families of related objects without specifying concrete classes. `slug: abstract-factory`
- [x] **Builder** — Separate construction of a complex object from its representation so the same process can build different variants. `slug: builder`
- [x] **Prototype** — Create new objects by copying an existing instance (prototype) instead of constructing from scratch. `slug: prototype`
- [x] **Object Pool** — Reuse expensive-to-create objects from a pool instead of allocating and destroying repeatedly. `slug: object-pool`

---

## Structural (GoF)

- [x] **Adapter** — Convert one interface into another that clients expect, enabling incompatible types to work together. `slug: adapter`
- [x] **Bridge** — Decouple an abstraction from its implementation so both can vary independently. `slug: bridge`
- [x] **Composite** — Compose objects into tree structures to represent part-whole hierarchies uniformly. `slug: composite`
- [x] **Decorator** — Attach additional responsibilities to an object dynamically without subclassing. `slug: decorator`
- [x] **Facade** — Provide a simplified, unified interface to a complex subsystem. `slug: facade`
- [x] **Flyweight** — Share intrinsic state across many fine-grained objects to reduce memory use. `slug: flyweight`
- [x] **Proxy** — Provide a surrogate or placeholder to control access to another object. `slug: proxy`

---

## Behavioral (GoF)

- [x] **Chain of Responsibility** — Pass a request along a chain of handlers until one handles it. `slug: chain-of-responsibility`
- [x] **Command** — Encapsulate a request as an object so you can parameterize, queue, log, and undo operations. `slug: command`
- [x] **Iterator** — Access elements of a collection sequentially without exposing its internal structure. `slug: iterator`
- [x] **Mediator** — Centralize complex communications between objects to reduce tangled dependencies. `slug: mediator`
- [x] **Memento** — Capture and externalize an object's internal state so it can be restored later. `slug: memento`
- [x] **Observer** — Define a one-to-many dependency so observers are notified when subject state changes. `slug: observer`
- [x] **State** — Allow an object to alter its behavior when its internal state changes. `slug: state`
- [x] **Strategy** — Define a family of interchangeable algorithms and make them swappable at runtime. `slug: strategy`
- [x] **Template Method** — Define the skeleton of an algorithm in a base class, letting subclasses override specific steps. `slug: template-method`
- [x] **Visitor** — Separate algorithms from the object structure they operate on via double dispatch. `slug: visitor`
- [x] **Interpreter** — Define a grammar for a language and an interpreter to evaluate sentences in that language. `slug: interpreter`
- [x] **Null Object** — Provide a do-nothing default object instead of null checks everywhere. `slug: null-object`
- [x] **Specification** — Encapsulate business rules as composable, testable predicate objects. `slug: specification`

---

## Concurrency

- [x] **Producer-Consumer** — Decouple producers and consumers with a bounded buffer or queue between them. `slug: producer-consumer`
- [x] **Thread Pool** — Reuse a fixed set of worker threads to execute many short-lived tasks efficiently. `slug: thread-pool`
- [x] **Read-Write Lock** — Allow multiple concurrent readers or one exclusive writer to improve read-heavy workloads. `slug: read-write-lock`
- [x] **Double-Checked Locking** — Reduce synchronization overhead when lazily initializing a singleton in a multi-threaded environment. `slug: double-checked-locking`
- [x] **Actor Model** — Encapsulate state and behavior in actors that communicate only via asynchronous messages. `slug: actor-model`
- [x] **Future / Promise** — Represent the result of an asynchronous computation that will be available later. `slug: future-promise`
- [x] **Balking** — Only act on an object when it is in a particular state; otherwise return immediately. `slug: balking`
- [x] **Guarded Suspension** — Suspend a thread until a precondition is met before proceeding with an operation. `slug: guarded-suspension`

---

## Architectural and enterprise

- [x] **Model-View-Controller (MVC)** — Separate UI, business logic, and data into three cooperating components. `slug: mvc`
- [x] **Model-View-Presenter (MVP)** — View is passive; presenter handles UI logic and talks to the model. `slug: mvp`
- [x] **Model-View-ViewModel (MVVM)** — Bind view to view-model for declarative UI with two-way data binding. `slug: mvvm`
- [x] **Layered Architecture** — Organize the system into horizontal layers (presentation, domain, data) with strict dependencies. `slug: layered-architecture`
- [x] **Hexagonal Architecture (Ports and Adapters)** — Isolate core domain logic from external systems via explicit ports and adapters. `slug: hexagonal-architecture`
- [x] **Repository** — Mediate between domain and data mapping layers with a collection-like interface for aggregates. `slug: repository`
- [x] **Unit of Work** — Track changes to multiple objects during a business transaction and commit them atomically. `slug: unit-of-work`
- [x] **Data Transfer Object (DTO)** — Carry data between processes or layers without business logic. `slug: dto`
- [x] **Active Record** — An object that wraps a database row and includes both data access and domain logic. `slug: active-record`
- [x] **Service Locator** — Provide a registry to look up service implementations (prefer dependency injection in new code). `slug: service-locator`
- [x] **Dependency Injection** — Supply dependencies from outside rather than constructing them inside a class. `slug: dependency-injection`
- [x] **Domain-Driven Design (DDD) building blocks** — Entities, value objects, aggregates, and bounded contexts for complex domains. `slug: domain-driven-design`

---

## Distributed systems and microservices

- [ ] **API Gateway** — Single entry point that routes, authenticates, rate-limits, and aggregates calls to backend services. `slug: api-gateway`
- [ ] **Backend for Frontend (BFF)** — Dedicated API layer per client type (web, mobile) shaped to that client's needs. `slug: backend-for-frontend`
- [ ] **Service Discovery** — Dynamically locate service instances (client-side or server-side registry) instead of hard-coded endpoints. `slug: service-discovery`
- [ ] **Circuit Breaker** — Stop calling a failing dependency and fail fast until it recovers, preventing cascade failures. `slug: circuit-breaker`
- [ ] **Bulkhead** — Isolate resources (thread pools, connections) so failure in one area does not exhaust the whole system. `slug: bulkhead`
- [ ] **Retry with Exponential Backoff** — Retry transient failures with increasing delays and jitter to avoid thundering herds. `slug: retry-backoff`
- [ ] **Saga** — Coordinate a long-running distributed transaction as a sequence of local transactions with compensating actions. `slug: saga`
- [ ] **Transactional Outbox** — Atomically write domain events to an outbox table in the same DB transaction, then publish asynchronously. `slug: transactional-outbox`
- [ ] **Inbox Pattern** — Deduplicate incoming messages idempotently before processing to handle at-least-once delivery. `slug: inbox-pattern`
- [ ] **CQRS (Command Query Responsibility Segregation)** — Separate read and write models optimized for their respective workloads. `slug: cqrs`
- [ ] **Event Sourcing** — Persist state as an append-only sequence of events rather than overwriting current state. `slug: event-sourcing`
- [ ] **Sidecar** — Deploy a helper process alongside the main application container (e.g. proxy, logging agent). `slug: sidecar`
- [ ] **Ambassador** — Offload common connectivity concerns (retries, TLS, routing) to a local proxy sidecar. `slug: ambassador`
- [ ] **Anti-Corruption Layer** — Translate between your domain model and an external or legacy system's model at the boundary. `slug: anti-corruption-layer`
- [ ] **Strangler Fig** — Incrementally replace a legacy system by routing traffic to new services until the old system can be retired. `slug: strangler-fig`
- [ ] **Database per Service** — Each microservice owns its private datastore; no direct cross-service DB access. `slug: database-per-service`
- [ ] **Shared Nothing Architecture** — Nodes share no memory or disk; scale by adding independent units. `slug: shared-nothing`
- [ ] **Leader Election** — Choose one coordinator among distributed nodes (e.g. via Raft, ZooKeeper). `slug: leader-election`
- [ ] **Two-Phase Commit (2PC)** — Distributed atomic commit protocol; simple but blocking and not partition-tolerant. `slug: two-phase-commit`
- [ ] **Three-Phase Commit (3PC)** — Reduces blocking of 2PC with an extra pre-commit phase; still rarely used in practice. `slug: three-phase-commit`
- [ ] **Idempotent Consumer** — Design message handlers so duplicate delivery produces the same result as once-only delivery. `slug: idempotent-consumer`
- [ ] **Competing Consumers** — Multiple consumers pull from the same queue to scale processing horizontally. `slug: competing-consumers`
- [ ] **Scatter-Gather** — Broadcast a request to multiple services and aggregate their responses into one reply. `slug: scatter-gather`
- [ ] **Throttling** — Limit the rate of requests or resource consumption to protect the system under load. `slug: throttling`
- [ ] **Rate Limiter** — Enforce per-client or per-tenant request quotas at the edge or service layer. `slug: rate-limiter-pattern`
- [ ] **Cache-Aside** — Application loads data into cache on miss and invalidates or updates on writes. `slug: cache-aside`
- [ ] **Read-Through / Write-Through Cache** — Cache sits in front of the store and loads or writes through to the backing database. `slug: read-write-through-cache`
- [ ] **Write-Behind (Write-Back) Cache** — Acknowledge writes to cache immediately and flush to the store asynchronously. `slug: write-behind-cache`
- [ ] **Materialized View** — Precompute and store query results optimized for read-heavy access patterns. `slug: materialized-view`
- [ ] **Sharding** — Partition data across nodes by a shard key to scale storage and throughput horizontally. `slug: sharding-pattern`
- [ ] **Consistent Hashing** — Distribute keys across nodes with minimal remapping when nodes are added or removed. `slug: consistent-hashing`
- [ ] **Quorum** — Require a minimum number of replica acknowledgements for reads/writes to balance consistency and availability. `slug: quorum`
- [ ] **Gossip Protocol** — Nodes spread cluster state by periodically exchanging information with random peers. `slug: gossip-protocol`
- [ ] **Load Balancing** — Distribute traffic across multiple instances using round-robin, least-connections, or consistent hashing. `slug: load-balancing-pattern`
- [ ] **Service Mesh** — Infrastructure layer for service-to-service communication (mTLS, retries, observability). `slug: service-mesh`
- [ ] **Event-Driven Microservices** — Services communicate via asynchronous events rather than synchronous RPC chains. `slug: event-driven-microservices`

---

## Cloud and resilience

*Cross-refs:* **Circuit Breaker** and **Bulkhead** are listed under [Distributed systems and microservices](#distributed-systems-and-microservices).

- [x] **Health Check** — Expose liveness/readiness endpoints so orchestrators route traffic only to healthy instances. `slug: health-check`
- [x] **Timeout** — Bound wait time on every remote call to prevent threads and resources from hanging indefinitely. `slug: timeout`
- [x] **Fail Fast** — Detect errors early and return immediately instead of retrying hopeless operations. `slug: fail-fast`
- [x] **Graceful Degradation** — Reduce functionality (non-critical features) rather than failing entirely when dependencies are impaired. `slug: graceful-degradation`
- [x] **Blue-Green Deployment** — Run two identical environments; switch traffic atomically for zero-downtime releases. `slug: blue-green-deployment`
- [x] **Canary Release** — Roll out a new version to a small percentage of traffic before full promotion. `slug: canary-release`
- [x] **Feature Toggle (Feature Flag)** — Enable or disable functionality at runtime without redeploying code. `slug: feature-toggle`
- [x] **Chaos Engineering** — Intentionally inject failures in production to validate resilience assumptions. `slug: chaos-engineering`
- [x] **Autoscaling** — Automatically add or remove instances based on CPU, queue depth, or custom metrics. `slug: autoscaling`

---

## Data and messaging (enterprise integration)

*Cross-ref:* **Transactional Outbox** — see [Distributed systems and microservices](#distributed-systems-and-microservices).

- [x] **Publish-Subscribe** — Publishers emit events to a topic; subscribers receive without knowing each other. `slug: publish-subscribe`
- [x] **Event-Driven Architecture** — System behavior is driven by the production, detection, and consumption of events. `slug: event-driven-architecture`
- [x] **Pipes and Filters** — Chain processing steps where each filter transforms a stream of data passed through pipes. `slug: pipes-and-filters`
- [x] **Claim Check** — Store large message payloads externally and pass a reference (claim check) through the messaging system. `slug: claim-check`
- [x] **Message Router** — Route messages to different channels or consumers based on content or headers. `slug: message-router`
- [x] **Content-Based Router** — Inspect message body or metadata to decide the destination channel. `slug: content-based-router`
- [x] **Message Filter** — Drop or pass messages based on criteria before they reach consumers. `slug: message-filter`
- [x] **Aggregator** — Combine multiple related messages into a single composite message. `slug: aggregator`
- [x] **Dead Letter Channel** — Route messages that cannot be processed successfully to a separate queue for inspection. `slug: dead-letter-channel`
- [x] **Wire Tap** — Copy messages to a monitoring channel without affecting the main flow. `slug: wire-tap`
- [x] **Message Translator** — Convert message format between systems with incompatible schemas. `slug: message-translator`
- [x] **Polling Consumer** — Consumer periodically checks the source for new messages (vs push-based delivery). `slug: polling-consumer`
- [x] **Eventual Consistency** — Accept temporary inconsistency across replicas in exchange for availability and partition tolerance. `slug: eventual-consistency`

---

## ML and data-pipeline patterns

- [x] **Online Model Serving** — Serve low-latency predictions from a deployed model behind an API or embedded runtime. `slug: online-model-serving`
- [x] **Batch Inference** — Score large datasets offline on a schedule rather than per-request in real time. `slug: batch-inference`
- [x] **Feature Store** — Centralized repository for reusable, versioned features shared across training and serving. `slug: feature-store`
- [x] **Training-Serving Skew Prevention** — Ensure features computed at training time match those at inference time. `slug: training-serving-skew`
- [x] **Shadow Deployment** — Route production traffic to a new model in parallel without affecting user-facing responses. `slug: shadow-deployment`
- [x] **Champion-Challenger** — Compare a production model (champion) against a candidate (challenger) on live traffic metrics. `slug: champion-challenger`
- [x] **A/B Testing for Models** — Split users between model variants to measure business impact statistically. `slug: ab-testing-models`
- [x] **Model Gateway** — Unified entry point for routing inference requests across multiple models and versions. `slug: model-gateway`
- [x] **Ensemble Routing** — Combine predictions from multiple models (voting, stacking, weighted average). `slug: ensemble-routing`
- [x] **Drift Detection** — Monitor data and prediction distributions to detect when retraining is needed. `slug: drift-detection`
- [x] **Lambda Architecture** — Combine batch (accurate) and speed (real-time) layers for comprehensive analytics views. `slug: lambda-architecture`
- [x] **Kappa Architecture** — Process all data through a single streaming layer; replay streams for corrections. `slug: kappa-architecture`
- [x] **ETL / ELT Pipeline** — Extract, transform (or load-first), and load data into warehouses or lakes. `slug: etl-pipeline`
- [x] **Feature Pipeline** — Automated flow from raw data to engineered features ready for training or serving. `slug: feature-pipeline`
- [x] **Model Registry** — Version, stage, and govern trained models through their lifecycle (dev → staging → prod). `slug: model-registry`
- [x] **Feedback Loop (Closed-Loop ML)** — Capture production outcomes to continuously improve models over time. `slug: ml-feedback-loop`

---

## Interview favorites

Patterns most often named in **LLD**, **HLD**, and **system design** rounds. Many have dedicated pages above — this section is a quick reference.

| Pattern | Typical round | Why it comes up |
| --- | --- | --- |
| Strategy | LLD | Swappable algorithms (pricing, sorting, payment methods) |
| Observer | LLD | Event notification (UI, pub/sub building block) |
| Factory Method / Abstract Factory | LLD | Object creation without tight coupling |
| Singleton | LLD | Shared resource; also asked for pitfalls and testability |
| Decorator | LLD | Add behavior without subclass explosion (streams, middleware) |
| Adapter | LLD | Integrate third-party or legacy interfaces |
| Facade | LLD / HLD | Simplify complex subsystems |
| Command | LLD | Undo/redo, job queues, transactional actions |
| State | LLD | Order/ticket/workflow status machines |
| Builder | LLD | Complex object construction (queries, configs, HTTP requests) |
| Repository | LLD | Clean persistence boundary |
| Circuit Breaker | HLD / System design | Resilience in microservices |
| Saga | HLD / System design | Distributed transactions without 2PC |
| CQRS | HLD / System design | Read/write optimization at scale |
| Outbox | HLD / System design | Reliable event publishing from DB |
| API Gateway | System design | Edge routing, auth, rate limiting |
| Cache-Aside | System design | Read-heavy caching strategy |
| Leader Election | System design | Coordination in distributed systems |
| Pub/Sub | System design | Async decoupling, event-driven systems |

---

## Suggested build order

Implement these **15 patterns first** at flagship depth (similar to SOLID and Netflix articles). Order balances interview frequency, LLD vs HLD coverage, and foundational concepts.

| Priority | Pattern | Slug | Rationale |
| --- | --- | --- | --- |
| 1 | Strategy | `strategy` | Most common LLD pattern; easy to teach with clear before/after |
| 2 | Observer | `observer` | Events, pub/sub foundation, UI and messaging |
| 3 | Factory Method | `factory-method` | Creation patterns; pairs with Abstract Factory later |
| 4 | Singleton | `singleton` | Ubiquitous; great for pitfalls and testing discussion |
| 5 | Decorator | `decorator` | Middleware, streams, cross-cutting concerns |
| 6 | Adapter | `adapter` | Integration interviews, legacy systems |
| 7 | Facade | `facade` | Simplify subsystems; gateway precursor |
| 8 | Command | `command` | Undo, queues, job systems |
| 9 | State | `state` | Workflow/order state machines in LLD |
| 10 | Builder | `builder` | Complex construction (SQL, HTTP, configs) |
| 11 | Circuit Breaker | `circuit-breaker` | Top microservices resilience pattern |
| 12 | Saga | `saga` | Distributed transactions; pairs with payment/order designs |
| 13 | Transactional Outbox | `transactional-outbox` | Reliable events; increasingly standard in interviews |
| 14 | CQRS | `cqrs` | Read/write split; complements Event Sourcing |
| 15 | API Gateway | `api-gateway` | Natural bridge from system design section |

After these, consider: **Repository**, **Proxy**, **Composite**, **Chain of Responsibility**, **Event Sourcing**, **BFF**, **Cache-Aside**, **Idempotent Consumer**, **Leader Election**, **Feature Store**.

---

## Stats

| Category | Count |
| --- | ---: |
| Creational | 6 |
| Structural | 7 |
| Behavioral | 13 |
| Concurrency | 8 |
| Architectural and enterprise | 12 |
| Distributed systems and microservices | 33 |
| Cloud and resilience | 9 |
| Data and messaging | 13 |
| ML and data-pipeline | 16 |
| **Total (unique patterns)** | **120** |

*Cross-cutting patterns (Circuit Breaker, Bulkhead, Transactional Outbox) are listed once in their primary section; other sections link to them.*
