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
