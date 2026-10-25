package ma.enset.incidentdesk.repository;

import ma.enset.incidentdesk.entity.IncidentHistory;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IncidentHistoryRepository extends JpaRepository<IncidentHistory, Long> {

    @EntityGraph(attributePaths = "performedBy")
    List<IncidentHistory> findByIncident_IdOrderByCreatedAtAscIdAsc(Long incidentId);
}
