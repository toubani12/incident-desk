package ma.enset.incidentdesk.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ma.enset.incidentdesk.enums.IncidentCategory;
import ma.enset.incidentdesk.enums.IncidentPriority;
import ma.enset.incidentdesk.enums.IncidentStatus;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Incident déclaré par un employé.
 * <ul>
 *   <li>{@code createdBy} / {@code assignedTo} : {@code @ManyToOne(fetch = LAZY)} — plusieurs incidents
 *   pour un même utilisateur. LAZY évite de charger l'utilisateur à chaque lecture d'incident ;
 *   quand on en a besoin (listes, détail), le repository le récupère avec un {@code @EntityGraph}.</li>
 *   <li>{@code history} / {@code comments} : {@code @OneToMany(mappedBy = "incident")}, LAZY par défaut,
 *   cascade ALL + orphanRemoval car ils n'existent pas sans leur incident.</li>
 * </ul>
 */
@Entity
@Table(name = "incidents", indexes = {
        @Index(name = "idx_incident_created_by", columnList = "created_by_id"),
        @Index(name = "idx_incident_assigned_to", columnList = "assigned_to_id"),
        @Index(name = "idx_incident_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 3000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private IncidentCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private IncidentPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private IncidentStatus status = IncidentStatus.OPEN;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id")
    private User assignedTo;

    @OneToMany(mappedBy = "incident", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC, id ASC")
    private List<IncidentHistory> history = new ArrayList<>();

    @OneToMany(mappedBy = "incident", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC, id ASC")
    private List<IncidentComment> comments = new ArrayList<>();

    public void addHistory(IncidentHistory entry) {
        entry.setIncident(this);
        history.add(entry);
    }

    public void addComment(IncidentComment comment) {
        comment.setIncident(this);
        comments.add(comment);
    }
}
