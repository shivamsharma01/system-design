package dev.systemdesign.backend.design;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** REST API for design metadata and search. */
@RestController
@RequestMapping("/api")
public class DesignController {

  private final DesignService service;

  public DesignController(DesignService service) {
    this.service = service;
  }

  @GetMapping("/designs")
  public List<DesignDto> listDesigns() {
    return service.listAll();
  }

  @GetMapping("/designs/{slug}")
  public ResponseEntity<DesignDto> getDesign(@PathVariable String slug) {
    return service.getBySlug(slug).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
  }

  @GetMapping("/search")
  public List<DesignDto> search(@RequestParam(name = "q", defaultValue = "") String query) {
    return service.search(query);
  }
}
