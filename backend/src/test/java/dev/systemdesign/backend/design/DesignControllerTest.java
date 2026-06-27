package dev.systemdesign.backend.design;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import dev.systemdesign.backend.config.SecurityConfig;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(DesignController.class)
@Import(SecurityConfig.class)
class DesignControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private DesignService service;

  private DesignDto netflix() {
    return new DesignDto(
        "netflix", "Design Netflix", "Streaming at scale", "Media & Streaming",
        "advanced", "published", 22, 100, "2026-06-28",
        List.of("streaming"), List.of("Cassandra"));
  }

  @Test
  void listDesignsReturnsCatalog() throws Exception {
    when(service.listAll()).thenReturn(List.of(netflix()));

    mockMvc
        .perform(get("/api/designs"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].slug").value("netflix"))
        .andExpect(jsonPath("$[0].title").value("Design Netflix"));
  }

  @Test
  void getDesignReturnsOneDesign() throws Exception {
    when(service.getBySlug("netflix")).thenReturn(Optional.of(netflix()));

    mockMvc
        .perform(get("/api/designs/netflix"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.category").value("Media & Streaming"));
  }

  @Test
  void getUnknownDesignReturns404() throws Exception {
    when(service.getBySlug("nope")).thenReturn(Optional.empty());

    mockMvc.perform(get("/api/designs/nope")).andExpect(status().isNotFound());
  }

  @Test
  void searchReturnsMatches() throws Exception {
    when(service.search("netflix")).thenReturn(List.of(netflix()));

    mockMvc
        .perform(get("/api/search").param("q", "netflix"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].slug").value("netflix"));
  }
}
