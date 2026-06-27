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
