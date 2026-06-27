package dev.systemdesign.backend.design;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DesignRepository extends JpaRepository<DesignEntity, String> {

  List<DesignEntity> findAllByOrderByPopularityDesc();
}
