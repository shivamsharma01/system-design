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
