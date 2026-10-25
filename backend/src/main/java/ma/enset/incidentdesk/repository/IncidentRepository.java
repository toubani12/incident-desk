package ma.enset.incidentdesk.repository;

import ma.enset.incidentdesk.entity.Incident;
import ma.enset.incidentdesk.enums.IncidentPriority;
import ma.enset.incidentdesk.enums.IncidentStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface IncidentRepository extends JpaRepository<Incident, Long>, JpaSpecificationExecutor<Incident> {

    /* ---------- Lectures avec chargement des utilisateurs liés (évite le N+1) ---------- */

    @EntityGraph(attributePaths = {"createdBy", "assignedTo"})
    @Query("select i from Incident i where i.id = :id")
    Optional<Incident> findWithUsersById(@Param("id") Long id);

    @EntityGraph(attributePaths = {"createdBy", "assignedTo"})
    List<Incident> findByCreatedBy_IdOrderByCreatedAtDesc(Long userId);

    @EntityGraph(attributePaths = {"createdBy", "assignedTo"})
    List<Incident> findByAssignedTo_IdOrderByUpdatedAtDesc(Long userId);

    @EntityGraph(attributePaths = {"createdBy", "assignedTo"})
    List<Incident> findByCreatedBy_IdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"createdBy", "assignedTo"})
    List<Incident> findByAssignedTo_IdOrderByUpdatedAtDesc(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"createdBy", "assignedTo"})
    List<Incident> findAllByOrderByCreatedAtDesc(Pageable pageable);

    /** Recherche filtrée (administration) avec chargement des utilisateurs liés. */
    @Override
    @EntityGraph(attributePaths = {"createdBy", "assignedTo"})
    List<Incident> findAll(Specification<Incident> spec, Sort sort);

    /* ---------- Statistiques ---------- */

    long countByCreatedBy_Id(Long userId);

    long countByCreatedBy_IdAndStatus(Long userId, IncidentStatus status);

    long countByCreatedBy_IdAndStatusIn(Long userId, Collection<IncidentStatus> statuses);

    long countByAssignedTo_Id(Long userId);

    long countByAssignedTo_IdAndStatus(Long userId, IncidentStatus status);

    long countByAssignedTo_IdAndStatusIn(Long userId, Collection<IncidentStatus> statuses);

    long countByAssignedTo_IdAndPriorityAndStatusNot(Long userId, IncidentPriority priority, IncidentStatus status);

    long countByStatus(IncidentStatus status);

    @Query("select i.status, count(i) from Incident i group by i.status")
    List<Object[]> countGroupByStatus();

    @Query("select i.category, count(i) from Incident i group by i.category")
    List<Object[]> countGroupByCategory();

    @Query("select i.priority, count(i) from Incident i group by i.priority")
    List<Object[]> countGroupByPriority();

    /** Charge de travail par technicien : [id, nom, total, actifs]. */
    @Query("""
            select t.id, t.fullName, count(i),
                   sum(case when i.status in (ma.enset.incidentdesk.enums.IncidentStatus.ASSIGNED,
                                           ma.enset.incidentdesk.enums.IncidentStatus.IN_PROGRESS) then 1 else 0 end)
            from Incident i join i.assignedTo t
            group by t.id, t.fullName
            order by count(i) desc
            """)
    List<Object[]> technicianWorkload();
}
