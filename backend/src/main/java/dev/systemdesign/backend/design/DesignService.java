package dev.systemdesign.backend.design;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import org.springframework.stereotype.Service;

/** Business logic for listing, fetching, and searching designs. */
@Service
public class DesignService {

  private final DesignRepository repository;

  public DesignService(DesignRepository repository) {
    this.repository = repository;
  }

  public List<DesignDto> listAll() {
    return repository.findAllByOrderByPopularityDesc().stream().map(DesignDto::from).toList();
  }

  public Optional<DesignDto> getBySlug(String slug) {
    return repository.findById(slug).map(DesignDto::from);
  }

  /**
   * Simple case-insensitive substring search across title, tagline, tags, and
   * technologies. A production backend would back this with full-text search
   * (Postgres tsvector / Elasticsearch); the API contract stays the same.
   */
  public List<DesignDto> search(String query) {
    if (query == null || query.isBlank()) {
      return List.of();
    }
    String q = query.toLowerCase(Locale.ROOT).trim();
    return repository.findAllByOrderByPopularityDesc().stream()
        .filter(d -> matches(d, q))
        .map(DesignDto::from)
        .toList();
  }

  private boolean matches(DesignEntity d, String q) {
    return contains(d.getTitle(), q)
        || contains(d.getTagline(), q)
        || contains(d.getCategory(), q)
        || d.getTags().stream().anyMatch(t -> contains(t, q))
        || d.getTechnologies().stream().anyMatch(t -> contains(t, q));
  }

  private boolean contains(String value, String q) {
    return value != null && value.toLowerCase(Locale.ROOT).contains(q);
  }
}
