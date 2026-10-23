package ma.enset.incidentdesk.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ma.enset.incidentdesk.enums.HistoryType;
import ma.enset.incidentdesk.enums.IncidentStatus;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

/**
 * Trace d'un changement important sur un incident (création, affectation,
 * changement de statut, ajout de note). Les entrées ne sont jamais modifiées.
 */
@Entity
@Table(name = "incident_history")
@Getter
@Setter
@NoArgsConstructor
public class IncidentHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "incident_id", nullable = false)
    private Incident incident;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private HistoryType type;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private IncidentStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private IncidentStatus toStatus;

    /** Texte lisible, ex : "Affecté à Karim Alaoui" ou "OPEN -> IN_PROGRESS". */
    @Column(nullable = false, length = 300)
    private String message;

    /** Utilisateur à l'origine du changement. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by_id")
    private User performedBy;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    public static IncidentHistory of(HistoryType type, String message, User performedBy) {
        IncidentHistory h = new IncidentHistory();
        h.type = type;
        h.message = message;
        h.performedBy = performedBy;
        return h;
    }

    public static IncidentHistory statusChange(IncidentStatus from, IncidentStatus to, User performedBy) {
        IncidentHistory h = of(HistoryType.STATUS_CHANGED, from + " -> " + to, performedBy);
        h.fromStatus = from;
        h.toStatus = to;
        return h;
    }
}
