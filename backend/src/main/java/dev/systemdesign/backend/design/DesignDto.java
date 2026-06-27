package dev.systemdesign.backend.design;

import java.util.List;

/** API representation of a design's metadata. */
public record DesignDto(
    String slug,
    String title,
    String tagline,
    String category,
    String difficulty,
    String status,
    int readingTimeMin,
    int popularity,
    String dateAdded,
    List<String> tags,
    List<String> technologies) {

  public static DesignDto from(DesignEntity entity) {
    return new DesignDto(
        entity.getSlug(),
        entity.getTitle(),
        entity.getTagline(),
        entity.getCategory(),
        entity.getDifficulty(),
        entity.getStatus(),
        entity.getReadingTimeMin(),
        entity.getPopularity(),
        entity.getDateAdded(),
        List.copyOf(entity.getTags()),
        List.copyOf(entity.getTechnologies()));
  }
}
