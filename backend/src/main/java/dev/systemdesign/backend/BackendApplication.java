package dev.systemdesign.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the optional System Design metadata + search API.
 *
 * <p>The Angular frontend works fully without this backend. When enabled, it
 * provides a REST surface ({@code /api/designs}, {@code /api/search}) that the
 * frontend can switch to by providing an {@code ApiContentSource} and setting
 * {@code apiBaseUrl}.
 */
@SpringBootApplication
public class BackendApplication {

  public static void main(String[] args) {
    SpringApplication.run(BackendApplication.class, args);
  }
}
