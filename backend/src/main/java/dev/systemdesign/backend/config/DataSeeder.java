package dev.systemdesign.backend.config;

import dev.systemdesign.backend.design.DesignEntity;
import dev.systemdesign.backend.design.DesignRepository;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Seeds the catalog on startup if empty. Mirrors the frontend registry so the
 * API and the bundled content stay in sync for demos. In a real deployment this
 * would be replaced by migrations + an admin/content pipeline.
 */
@Configuration
public class DataSeeder {

  @Bean
  CommandLineRunner seedDesigns(DesignRepository repository) {
    return args -> {
      if (repository.count() > 0) {
        return;
      }
      repository.saveAll(
          List.of(
              design(
                  "interview-framework", "System Design Interview Framework",
                  "The RESHADED strategy, time budgets, and how to tell system design apart from HLD, LLD, and machine coding.",
                  "Interview Prep", "beginner", "published", 18, 110, "2026-06-30",
                  List.of("interview", "framework", "RESHADED", "HLD", "LLD"),
                  List.of("REST", "SQL", "NoSQL", "Kafka", "Redis")),
              design(
                  "solid-principles", "SOLID Design Principles",
                  "Five object-oriented principles for maintainable code — with examples, violations, and interview Q&A.",
                  "OOP Fundamentals", "intermediate", "published", 20, 105, "2026-07-04",
                  List.of("solid", "oop", "lld", "srp", "ocp"),
                  List.of("Java", "Python", "Interfaces", "Abstraction")),
              design(
                  "singleton", "Singleton Pattern",
                  "One shared instance for the whole app — config, logging, and connection managers, plus the pitfalls interviewers love.",
                  "Creational", "beginner", "published", 12, 96, "2026-07-09",
                  List.of("singleton", "creational", "gof", "lld"),
                  List.of("Java", "Spring", "Logging", "Configuration")),
              design(
                  "factory-method", "Factory Method Pattern",
                  "Let subclasses decide which object to create — notifications, payments, and document exporters without hard-coded new.",
                  "Creational", "beginner", "published", 12, 95, "2026-07-09",
                  List.of("factory-method", "creational", "gof", "lld"),
                  List.of("Java", "Notifications", "Payments")),
              design(
                  "abstract-factory", "Abstract Factory Pattern",
                  "Create families of related objects — UI themes, cloud providers, or payment stacks — without coupling to concrete classes.",
                  "Creational", "intermediate", "published", 14, 88, "2026-07-09",
                  List.of("abstract-factory", "creational", "gof", "lld"),
                  List.of("Java", "UI Themes", "Cloud SDKs")),
              design(
                  "builder", "Builder Pattern",
                  "Step-by-step construction for complex objects — HTTP requests, SQL queries, and meal orders with optional parts.",
                  "Creational", "beginner", "published", 12, 94, "2026-07-09",
                  List.of("builder", "creational", "gof", "lld"),
                  List.of("Java", "HTTP Clients", "SQL")),
              design(
                  "prototype", "Prototype Pattern",
                  "Clone existing objects instead of rebuilding them — document templates, game entities, and expensive configs.",
                  "Creational", "intermediate", "published", 11, 82, "2026-07-09",
                  List.of("prototype", "creational", "gof", "lld"),
                  List.of("Java", "Cloneable", "Templates")),
              design(
                  "object-pool", "Object Pool Pattern",
                  "Reuse expensive objects — DB connections, threads, and game bullets — instead of creating and destroying them constantly.",
                  "Creational", "intermediate", "published", 12, 85, "2026-07-09",
                  List.of("object-pool", "creational", "performance", "lld"),
                  List.of("Java", "JDBC", "Thread Pools")),
              design(
                  "adapter", "Adapter Pattern",
                  "Make incompatible interfaces work together — payment SDKs, legacy APIs, and third-party libraries behind one contract.",
                  "Structural", "beginner", "published", 12, 93, "2026-07-09",
                  List.of("adapter", "structural", "gof", "lld"),
                  List.of("Java", "Payments", "Legacy APIs")),
              design(
                  "bridge", "Bridge Pattern",
                  "Decouple abstraction from implementation — notifications over email/SMS, shapes over renderers, without class explosion.",
                  "Structural", "intermediate", "published", 13, 80, "2026-07-09",
                  List.of("bridge", "structural", "gof", "lld"),
                  List.of("Java", "Notifications", "Rendering")),
              design(
                  "composite", "Composite Pattern",
                  "Treat individual objects and groups the same — file trees, org charts, and nested menus with one interface.",
                  "Structural", "intermediate", "published", 13, 86, "2026-07-09",
                  List.of("composite", "structural", "gof", "lld"),
                  List.of("Java", "File Systems", "UI Trees")),
              design(
                  "decorator", "Decorator Pattern",
                  "Add behavior dynamically — logging, compression, auth wrappers, and Java I/O streams without subclass explosion.",
                  "Structural", "intermediate", "published", 14, 97, "2026-07-09",
                  List.of("decorator", "structural", "gof", "lld"),
                  List.of("Java", "I/O Streams", "Middleware")),
              design(
                  "facade", "Facade Pattern",
                  "One simple API over a messy subsystem — checkout, home-theater style orchestration, and service entry points.",
                  "Structural", "beginner", "published", 12, 92, "2026-07-09",
                  List.of("facade", "structural", "gof", "lld"),
                  List.of("Java", "Checkout", "Microservices")),
              design(
                  "flyweight", "Flyweight Pattern",
                  "Share intrinsic state across many objects — text characters, map icons, and game particles to cut memory use.",
                  "Structural", "intermediate", "published", 13, 78, "2026-07-09",
                  List.of("flyweight", "structural", "gof", "lld"),
                  List.of("Java", "Caching", "Games")),
              design(
                  "proxy", "Proxy Pattern",
                  "Control access to another object — lazy loading, caching, auth checks, and remote stubs without changing the client.",
                  "Structural", "intermediate", "published", 14, 91, "2026-07-09",
                  List.of("proxy", "structural", "gof", "lld"),
                  List.of("Java", "Caching", "Security")),
              design(
                  "chain-of-responsibility", "Chain of Responsibility Pattern",
                  "Pass a request along handlers until one handles it — middleware, support tiers, and approval workflows.",
                  "Behavioral", "intermediate", "published", 12, 90, "2026-07-09",
                  List.of("chain-of-responsibility", "behavioral", "gof", "lld"),
                  List.of("Java", "Servlet Filters", "Middleware")),
              design(
                  "command", "Command Pattern",
                  "Encapsulate actions as objects — undo/redo, job queues, macros, and transactional UI operations.",
                  "Behavioral", "intermediate", "published", 13, 96, "2026-07-09",
                  List.of("command", "behavioral", "gof", "lld"),
                  List.of("Java", "Job Queues", "UI")),
              design(
                  "iterator", "Iterator Pattern",
                  "Traverse a collection without exposing its structure — Java Iterable, custom trees, and lazy sequences.",
                  "Behavioral", "beginner", "published", 10, 84, "2026-07-09",
                  List.of("iterator", "behavioral", "gof", "lld"),
                  List.of("Java", "Collections", "Streams")),
              design(
                  "mediator", "Mediator Pattern",
                  "Centralize messy object chatter — chat rooms, UI dialogs, and air-traffic-style coordination.",
                  "Behavioral", "intermediate", "published", 12, 85, "2026-07-09",
                  List.of("mediator", "behavioral", "gof", "lld"),
                  List.of("Java", "UI", "Messaging")),
              design(
                  "memento", "Memento Pattern",
                  "Snapshot and restore object state — undo stacks, drafts, and game save points without breaking encapsulation.",
                  "Behavioral", "intermediate", "published", 11, 82, "2026-07-09",
                  List.of("memento", "behavioral", "gof", "lld"),
                  List.of("Java", "Editors", "Games")),
              design(
                  "observer", "Observer Pattern",
                  "Notify many listeners when state changes — UI bindings, event buses, and pub/sub building blocks.",
                  "Behavioral", "beginner", "published", 13, 99, "2026-07-09",
                  List.of("observer", "behavioral", "gof", "lld"),
                  List.of("Java", "RxJava", "Event Bus")),
              design(
                  "state", "State Pattern",
                  "Change behavior with internal state — order lifecycles, vending machines, and workflow engines without giant switches.",
                  "Behavioral", "intermediate", "published", 13, 97, "2026-07-09",
                  List.of("state", "behavioral", "gof", "lld"),
                  List.of("Java", "Workflows", "Orders")),
              design(
                  "strategy", "Strategy Pattern",
                  "Swap algorithms at runtime — pricing, shipping, payment methods, and the classic OCP interview answer.",
                  "Behavioral", "beginner", "published", 12, 100, "2026-07-09",
                  List.of("strategy", "behavioral", "gof", "lld"),
                  List.of("Java", "Payments", "Pricing")),
              design(
                  "template-method", "Template Method Pattern",
                  "Define an algorithm skeleton in a base class — subclasses fill in the steps for reports, ETL, and game loops.",
                  "Behavioral", "beginner", "published", 11, 88, "2026-07-09",
                  List.of("template-method", "behavioral", "gof", "lld"),
                  List.of("Java", "ETL", "Frameworks")),
              design(
                  "visitor", "Visitor Pattern",
                  "Add operations to object structures without changing them — compilers, document exporters, and AST walks.",
                  "Behavioral", "advanced", "published", 13, 78, "2026-07-09",
                  List.of("visitor", "behavioral", "gof", "lld"),
                  List.of("Java", "Compilers", "Documents")),
              design(
                  "interpreter", "Interpreter Pattern",
                  "Evaluate sentences in a simple language — rule engines, search filters, and mini DSLs without a full compiler.",
                  "Behavioral", "advanced", "published", 12, 75, "2026-07-09",
                  List.of("interpreter", "behavioral", "gof", "lld"),
                  List.of("Java", "Rules", "DSL")),
              design(
                  "null-object", "Null Object Pattern",
                  "Replace null with a do-nothing object — safer defaults for loggers, discounts, and optional collaborators.",
                  "Behavioral", "beginner", "published", 10, 83, "2026-07-09",
                  List.of("null-object", "behavioral", "lld", "null-safety"),
                  List.of("Java", "Optional", "Logging")),
              design(
                  "specification", "Specification Pattern",
                  "Composable business-rule predicates — filter products, validate orders, and keep domain rules testable.",
                  "Behavioral", "intermediate", "published", 12, 87, "2026-07-09",
                  List.of("specification", "behavioral", "ddd", "lld"),
                  List.of("Java", "DDD", "Filtering")),
              design(
                  "producer-consumer", "Producer-Consumer Pattern",
                  "Decouple producers and consumers with a bounded queue — order pipelines, log shippers, and backpressure that interviewers expect.",
                  "Concurrency", "intermediate", "published", 13, 94, "2026-07-09",
                  List.of("producer-consumer", "concurrency", "queue", "lld"),
                  List.of("Java", "BlockingQueue", "Kafka")),
              design(
                  "thread-pool", "Thread Pool Pattern",
                  "Reuse a fixed set of workers for many short tasks — Executors, web servers, and sizing trade-offs for LLD and system design.",
                  "Concurrency", "intermediate", "published", 13, 95, "2026-07-09",
                  List.of("thread-pool", "concurrency", "executors", "lld"),
                  List.of("Java", "ExecutorService", "Tomcat")),
              design(
                  "read-write-lock", "Read-Write Lock Pattern",
                  "Many concurrent readers or one exclusive writer — caches, config maps, and when ReentrantReadWriteLock actually helps.",
                  "Concurrency", "intermediate", "published", 12, 88, "2026-07-09",
                  List.of("read-write-lock", "concurrency", "locking", "lld"),
                  List.of("Java", "ReentrantReadWriteLock", "Caching")),
              design(
                  "double-checked-locking", "Double-Checked Locking Pattern",
                  "Lazy init with less lock contention — volatile, the Java memory model, and safer alternatives interviewers compare.",
                  "Concurrency", "intermediate", "published", 12, 90, "2026-07-09",
                  List.of("double-checked-locking", "concurrency", "singleton", "lld"),
                  List.of("Java", "volatile", "Singleton")),
              design(
                  "actor-model", "Actor Model Pattern",
                  "Isolate state behind message mailboxes — Akka, Erlang/OTP, and concurrent design without shared mutable memory.",
                  "Concurrency", "advanced", "published", 14, 84, "2026-07-09",
                  List.of("actor-model", "concurrency", "messaging", "lld"),
                  List.of("Java", "Akka", "Erlang")),
              design(
                  "future-promise", "Future / Promise Pattern",
                  "Represent a result that arrives later — CompletableFuture, async APIs, and composing concurrent work cleanly.",
                  "Concurrency", "intermediate", "published", 13, 93, "2026-07-09",
                  List.of("future", "promise", "concurrency", "lld"),
                  List.of("Java", "CompletableFuture", "Async")),
              design(
                  "balking", "Balking Pattern",
                  "Act only when the object is in the right state — otherwise return immediately. Autosave, idempotent starts, and fail-fast concurrency.",
                  "Concurrency", "beginner", "published", 10, 76, "2026-07-09",
                  List.of("balking", "concurrency", "state", "lld"),
                  List.of("Java", "Synchronization", "State")),
              design(
                  "guarded-suspension", "Guarded Suspension Pattern",
                  "Wait until a precondition is true — wait/notify, Condition queues, and how this differs from Balking.",
                  "Concurrency", "intermediate", "published", 12, 82, "2026-07-09",
                  List.of("guarded-suspension", "concurrency", "wait-notify", "lld"),
                  List.of("Java", "wait/notify", "Condition")),
              design(
                  "mvc", "MVC Pattern",
                  "Separate model, view, and controller — the classic UI architecture behind Spring MVC, Rails, and countless web apps.",
                  "Architectural", "beginner", "published", 12, 98, "2026-07-09",
                  List.of("mvc", "architectural", "ui", "lld"),
                  List.of("Java", "Spring MVC", "Web UI")),
              design(
                  "mvp", "MVP Pattern",
                  "Passive views with presenters that own UI logic — highly testable screens for Android and desktop apps.",
                  "Architectural", "intermediate", "published", 11, 85, "2026-07-09",
                  List.of("mvp", "architectural", "ui", "lld"),
                  List.of("Java", "Android", "UI Testing")),
              design(
                  "mvvm", "MVVM Pattern",
                  "Bind views to view-models — Angular, Android Jetpack, and WPF-style declarative UI with two-way data flow.",
                  "Architectural", "intermediate", "published", 12, 94, "2026-07-09",
                  List.of("mvvm", "architectural", "ui", "lld"),
                  List.of("Angular", "Android", "Data Binding")),
              design(
                  "layered-architecture", "Layered Architecture",
                  "Presentation → domain → data — the default enterprise layout, its dependency rule, and when layers become a trap.",
                  "Architectural", "beginner", "published", 12, 96, "2026-07-09",
                  List.of("layered", "architectural", "enterprise", "lld"),
                  List.of("Java", "Spring Boot", "REST")),
              design(
                  "hexagonal-architecture", "Hexagonal Architecture",
                  "Ports and adapters isolate the domain — swap databases, UIs, and message buses without rewriting core logic.",
                  "Architectural", "intermediate", "published", 14, 92, "2026-07-09",
                  List.of("hexagonal", "ports-adapters", "architectural", "lld"),
                  List.of("Java", "Spring", "Domain Core")),
              design(
                  "repository", "Repository Pattern",
                  "Collection-like access to aggregates — hide SQL/ORM details so domain code stays persistence-ignorant.",
                  "Architectural", "beginner", "published", 12, 97, "2026-07-09",
                  List.of("repository", "architectural", "persistence", "lld"),
                  List.of("Java", "Spring Data", "JPA")),
              design(
                  "unit-of-work", "Unit of Work Pattern",
                  "Track changes across objects and commit once — ORM sessions, transactions, and atomic business operations.",
                  "Architectural", "intermediate", "published", 12, 89, "2026-07-09",
                  List.of("unit-of-work", "architectural", "transactions", "lld"),
                  List.of("Java", "JPA", "Hibernate")),
              design(
                  "dto", "DTO Pattern",
                  "Plain data carriers across boundaries — API payloads, layer boundaries, and why entities should not leak to clients.",
                  "Architectural", "beginner", "published", 10, 91, "2026-07-09",
                  List.of("dto", "architectural", "api", "lld"),
                  List.of("Java", "REST", "JSON")),
              design(
                  "active-record", "Active Record Pattern",
                  "Row + behavior in one object — Rails-style models, when they shine, and when Repository + domain models win.",
                  "Architectural", "beginner", "published", 11, 83, "2026-07-09",
                  List.of("active-record", "architectural", "orm", "lld"),
                  List.of("Ruby on Rails", "Java", "ORM")),
              design(
                  "service-locator", "Service Locator Pattern",
                  "A registry to look up dependencies — useful historically, often an anti-pattern today versus constructor injection.",
                  "Architectural", "intermediate", "published", 11, 80, "2026-07-09",
                  List.of("service-locator", "architectural", "di", "lld"),
                  List.of("Java", "DI Containers")),
              design(
                  "dependency-injection", "Dependency Injection Pattern",
                  "Supply collaborators from outside — constructor injection, Spring IoC, testability, and DIP in practice.",
                  "Architectural", "beginner", "published", 13, 99, "2026-07-09",
                  List.of("dependency-injection", "architectural", "di", "lld"),
                  List.of("Java", "Spring", "Guice")),
              design(
                  "domain-driven-design", "Domain-Driven Design Building Blocks",
                  "Entities, value objects, aggregates, and bounded contexts — the vocabulary for complex business domains.",
                  "Architectural", "advanced", "published", 16, 95, "2026-07-09",
                  List.of("ddd", "architectural", "domain", "lld"),
                  List.of("Java", "Domain Modeling", "Microservices")),
              design(
                  "health-check", "Health Check Pattern",
                  "Liveness and readiness probes so orchestrators route traffic only to healthy instances — Kubernetes, load balancers, and interview essentials.",
                  "Cloud & Resilience", "beginner", "published", 11, 94, "2026-07-09",
                  List.of("health-check", "cloud", "resilience", "kubernetes"),
                  List.of("Kubernetes", "Spring Actuator", "Load Balancers")),
              design(
                  "timeout", "Timeout Pattern",
                  "Bound every remote call — connect, read, and deadline timeouts that stop hung threads and cascading latency.",
                  "Cloud & Resilience", "beginner", "published", 11, 93, "2026-07-09",
                  List.of("timeout", "cloud", "resilience", "latency"),
                  List.of("Java", "HTTP Clients", "gRPC")),
              design(
                  "fail-fast", "Fail Fast Pattern",
                  "Detect hopeless errors early and return immediately — validation, circuit open states, and avoiding retry storms.",
                  "Cloud & Resilience", "beginner", "published", 10, 88, "2026-07-09",
                  List.of("fail-fast", "cloud", "resilience", "errors"),
                  List.of("Java", "APIs", "Validation")),
              design(
                  "graceful-degradation", "Graceful Degradation Pattern",
                  "Keep the core experience alive when dependencies fail — fallbacks, cached reads, and feature shedding under load.",
                  "Cloud & Resilience", "intermediate", "published", 12, 91, "2026-07-09",
                  List.of("graceful-degradation", "cloud", "resilience", "fallback"),
                  List.of("Java", "Caching", "Feature Flags")),
              design(
                  "blue-green-deployment", "Blue-Green Deployment Pattern",
                  "Two identical environments, one atomic traffic switch — zero-downtime releases and instant rollback.",
                  "Cloud & Resilience", "intermediate", "published", 12, 90, "2026-07-09",
                  List.of("blue-green", "cloud", "deployment", "devops"),
                  List.of("Kubernetes", "Load Balancers", "CI/CD")),
              design(
                  "canary-release", "Canary Release Pattern",
                  "Ship to a small slice of traffic first — progressive delivery, metrics gates, and safer rollouts than big-bang deploys.",
                  "Cloud & Resilience", "intermediate", "published", 12, 92, "2026-07-09",
                  List.of("canary", "cloud", "deployment", "devops"),
                  List.of("Kubernetes", "Service Mesh", "Observability")),
              design(
                  "feature-toggle", "Feature Toggle Pattern",
                  "Turn features on/off at runtime — dark launches, kill switches, experiments, and trunk-based development.",
                  "Cloud & Resilience", "beginner", "published", 12, 95, "2026-07-09",
                  List.of("feature-toggle", "feature-flag", "cloud", "devops"),
                  List.of("LaunchDarkly", "Unleash", "Config")),
              design(
                  "chaos-engineering", "Chaos Engineering Pattern",
                  "Inject failures on purpose — game days, Chaos Monkey, and proving resilience hypotheses in production-like systems.",
                  "Cloud & Resilience", "advanced", "published", 13, 86, "2026-07-09",
                  List.of("chaos-engineering", "cloud", "resilience", "reliability"),
                  List.of("Chaos Mesh", "Litmus", "Gremlin")),
              design(
                  "autoscaling", "Autoscaling Pattern",
                  "Add and remove capacity from metrics — HPA, queue-depth scaling, cool-downs, and the limits of scale-out.",
                  "Cloud & Resilience", "intermediate", "published", 13, 94, "2026-07-09",
                  List.of("autoscaling", "cloud", "scalability", "kubernetes"),
                  List.of("Kubernetes HPA", "AWS ASG", "Metrics")),
              design(
                  "publish-subscribe", "Publish-Subscribe Pattern",
                  "Producers publish to topics; subscribers consume independently — Kafka, SNS, and the decoupling story interviewers love.",
                  "Data & Messaging", "intermediate", "published", 12, 92, "2026-07-09",
                  List.of("pub-sub", "messaging", "kafka", "sns"),
                  List.of("Kafka", "AWS SNS", "RabbitMQ")),
              design(
                  "event-driven-architecture", "Event-Driven Architecture",
                  "System behavior driven by events — async reactions, choreography, and when to prefer EDA over request-response.",
                  "Data & Messaging", "advanced", "published", 14, 90, "2026-07-09",
                  List.of("eda", "events", "messaging", "architecture"),
                  List.of("Kafka", "Event Bus", "Microservices")),
              design(
                  "pipes-and-filters", "Pipes and Filters Pattern",
                  "Chain processing steps where each filter transforms a stream — ETL, stream pipelines, and composable stages.",
                  "Data & Messaging", "intermediate", "published", 12, 84, "2026-07-09",
                  List.of("pipes-filters", "etl", "streaming", "pipeline"),
                  List.of("Kafka Streams", "Flink", "ETL")),
              design(
                  "claim-check", "Claim Check Pattern",
                  "Store large payloads externally and pass a claim-check reference through the messaging system.",
                  "Data & Messaging", "intermediate", "published", 11, 82, "2026-07-09",
                  List.of("claim-check", "messaging", "blob", "s3"),
                  List.of("S3", "Kafka", "Object Storage")),
              design(
                  "message-router", "Message Router Pattern",
                  "Route messages to different channels or consumers based on rules, headers, or metadata.",
                  "Data & Messaging", "intermediate", "published", 11, 85, "2026-07-09",
                  List.of("message-router", "eip", "routing", "messaging"),
                  List.of("Kafka", "Camel", "ESB")),
              design(
                  "content-based-router", "Content-Based Router Pattern",
                  "Inspect message body or metadata to choose the destination channel — specialized message routing.",
                  "Data & Messaging", "intermediate", "published", 11, 83, "2026-07-09",
                  List.of("content-based-router", "eip", "routing", "messaging"),
                  List.of("Camel", "Kafka", "Rules")),
              design(
                  "message-filter", "Message Filter Pattern",
                  "Drop or pass messages based on criteria before they reach consumers — selective consumption.",
                  "Data & Messaging", "beginner", "published", 10, 80, "2026-07-09",
                  List.of("message-filter", "eip", "filtering", "messaging"),
                  List.of("Kafka", "SQS", "Streams")),
              design(
                  "aggregator", "Aggregator Pattern",
                  "Combine related messages into one composite using correlation IDs and completion conditions.",
                  "Data & Messaging", "intermediate", "published", 12, 86, "2026-07-09",
                  List.of("aggregator", "eip", "correlation", "messaging"),
                  List.of("Kafka Streams", "Camel", "Saga")),
              design(
                  "dead-letter-channel", "Dead Letter Channel Pattern",
                  "Route unprocessable messages to a DLQ for inspection, fix, and replay — poison-message quarantine.",
                  "Data & Messaging", "intermediate", "published", 12, 91, "2026-07-09",
                  List.of("dlq", "dead-letter", "messaging", "ops"),
                  List.of("SQS", "Kafka", "RabbitMQ")),
              design(
                  "wire-tap", "Wire Tap Pattern",
                  "Copy messages to a monitoring channel without affecting the main flow — audit and observability.",
                  "Data & Messaging", "beginner", "published", 10, 78, "2026-07-09",
                  List.of("wire-tap", "eip", "monitoring", "messaging"),
                  List.of("Kafka", "Camel", "Observability")),
              design(
                  "message-translator", "Message Translator Pattern",
                  "Convert message formats between systems with incompatible schemas — anti-corruption at the wire.",
                  "Data & Messaging", "intermediate", "published", 11, 84, "2026-07-09",
                  List.of("message-translator", "eip", "schema", "integration"),
                  List.of("Avro", "JSON", "Camel")),
              design(
                  "polling-consumer", "Polling Consumer Pattern",
                  "Consumer periodically pulls for new messages — SQS long poll, Kafka poll loops, vs push delivery.",
                  "Data & Messaging", "intermediate", "published", 11, 81, "2026-07-09",
                  List.of("polling", "consumer", "sqs", "kafka"),
                  List.of("SQS", "Kafka", "JDBC")),
              design(
                  "eventual-consistency", "Eventual Consistency Pattern",
                  "Accept temporary inconsistency across replicas for availability — CAP trade-offs and convergence.",
                  "Data & Messaging", "advanced", "published", 13, 93, "2026-07-09",
                  List.of("eventual-consistency", "cap", "replication", "distributed"),
                  List.of("Cassandra", "DynamoDB", "Kafka")),
              design(
                  "netflix", "Design Netflix",
                  "A global video streaming platform serving billions of hours of content with low latency.",
                  "Media & Streaming", "advanced", "published", 22, 100, "2026-06-28",
                  List.of("streaming", "video", "cdn", "microservices"),
                  List.of("Cassandra", "Kafka", "EVCache", "Open Connect CDN")),
              design(
                  "whatsapp", "Design WhatsApp",
                  "A real-time messaging platform with end-to-end encryption, presence, and group chats.",
                  "Messaging", "intermediate", "published", 18, 98, "2026-06-28",
                  List.of("real-time", "websockets", "messaging", "e2e-encryption"),
                  List.of("WebSocket", "Erlang", "Kafka", "Cassandra")),
              design(
                  "url-shortener", "Design a URL Shortener",
                  "A TinyURL/Bitly-style service that maps long URLs to short links at scale.",
                  "Web Services", "beginner", "published", 14, 95, "2026-06-28",
                  List.of("hashing", "key-generation", "caching"),
                  List.of("PostgreSQL", "Redis", "Base62")),
              design(
                  "uber", "Design Uber",
                  "A ride-hailing platform matching riders and drivers in real time.",
                  "Location Services", "advanced", "draft", 20, 90, "2026-06-28",
                  List.of("geospatial", "matching", "real-time"),
                  List.of("Geohash", "Kafka", "Redis", "PostGIS")),
              design(
                  "twitter", "Design Twitter / X",
                  "A social platform with timelines, fan-out, and trending topics.",
                  "Social Network", "advanced", "draft", 19, 88, "2026-06-28",
                  List.of("timeline", "fan-out", "feed"),
                  List.of("Redis", "Manhattan", "Kafka")),
              design(
                  "youtube", "Design YouTube",
                  "A video-sharing platform handling massive uploads, transcoding, and delivery.",
                  "Media & Streaming", "advanced", "draft", 21, 87, "2026-06-28",
                  List.of("video", "transcoding", "cdn"),
                  List.of("Bigtable", "Vitess", "FFmpeg")),
              design(
                  "instagram", "Design Instagram",
                  "A photo and short-video sharing app with feeds, stories, and a social graph.",
                  "Social Network", "intermediate", "draft", 17, 86, "2026-06-28",
                  List.of("feed", "media", "storage"),
                  List.of("Cassandra", "S3", "CDN")),
              design(
                  "discord", "Design Discord",
                  "A community chat platform with servers, channels, voice, and presence.",
                  "Messaging", "advanced", "draft", 18, 84, "2026-06-28",
                  List.of("real-time", "voice", "websockets"),
                  List.of("Elixir", "Cassandra", "ScyllaDB")),
              design(
                  "rate-limiter", "Design a Rate Limiter",
                  "A distributed rate limiter protecting APIs using token bucket and sliding window.",
                  "Infrastructure", "intermediate", "draft", 13, 82, "2026-06-28",
                  List.of("algorithms", "distributed", "throttling"),
                  List.of("Redis", "Lua", "Envoy")),
              design(
                  "notification-system", "Design a Notification System",
                  "A multi-channel notification service delivering push, SMS, and email at scale.",
                  "Infrastructure", "intermediate", "draft", 15, 80, "2026-06-28",
                  List.of("messaging", "fan-out", "queues"),
                  List.of("Kafka", "Redis", "APNs", "FCM")),
              design(
                  "distributed-cache", "Design a Distributed Cache",
                  "A Redis/Memcached-style distributed cache with consistent hashing and eviction.",
                  "Infrastructure", "advanced", "draft", 16, 78, "2026-06-28",
                  List.of("caching", "consistent-hashing", "replication"),
                  List.of("Consistent Hashing", "LRU", "Gossip"))));
    };
  }

  private static DesignEntity design(
      String slug, String title, String tagline, String category, String difficulty,
      String status, int readingTimeMin, int popularity, String dateAdded,
      List<String> tags, List<String> technologies) {
    DesignEntity e = new DesignEntity();
    e.setSlug(slug);
    e.setTitle(title);
    e.setTagline(tagline);
    e.setCategory(category);
    e.setDifficulty(difficulty);
    e.setStatus(status);
    e.setReadingTimeMin(readingTimeMin);
    e.setPopularity(popularity);
    e.setDateAdded(dateAdded);
    e.setTags(tags);
    e.setTechnologies(technologies);
    return e;
  }
}
