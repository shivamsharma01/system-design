package dev.systemdesign.backend.design;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;

/** Persisted metadata for a single System Design topic. */
@Entity
@Table(name = "designs")
public class DesignEntity {

  @Id
  @Column(nullable = false, length = 100)
  private String slug;

  @Column(nullable = false)
  private String title;

  @Column(length = 1000)
  private String tagline;

  private String category;

  private String difficulty;

  private String status;

  private int readingTimeMin;

  private int popularity;

  private String dateAdded;

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "design_tags", joinColumns = @JoinColumn(name = "slug"))
  @Column(name = "tag")
  private List<String> tags = new ArrayList<>();

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "design_technologies", joinColumns = @JoinColumn(name = "slug"))
  @Column(name = "technology")
  private List<String> technologies = new ArrayList<>();

  public DesignEntity() {}

  public String getSlug() {
    return slug;
  }

  public void setSlug(String slug) {
    this.slug = slug;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getTagline() {
    return tagline;
  }

  public void setTagline(String tagline) {
    this.tagline = tagline;
  }

  public String getCategory() {
    return category;
  }

  public void setCategory(String category) {
    this.category = category;
  }

  public String getDifficulty() {
    return difficulty;
  }

  public void setDifficulty(String difficulty) {
    this.difficulty = difficulty;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  public int getReadingTimeMin() {
    return readingTimeMin;
  }

  public void setReadingTimeMin(int readingTimeMin) {
    this.readingTimeMin = readingTimeMin;
  }

  public int getPopularity() {
    return popularity;
  }

  public void setPopularity(int popularity) {
    this.popularity = popularity;
  }

  public String getDateAdded() {
    return dateAdded;
  }

  public void setDateAdded(String dateAdded) {
    this.dateAdded = dateAdded;
  }

  public List<String> getTags() {
    return tags;
  }

  public void setTags(List<String> tags) {
    this.tags = tags;
  }

  public List<String> getTechnologies() {
    return technologies;
  }

  public void setTechnologies(List<String> technologies) {
    this.technologies = technologies;
  }
}
