package ma.enset.incidentdesk.dto;

import java.util.List;

/** Tableau de bord TECHNICIAN : incidents qui lui sont affectés. */
public record TechnicianDashboard(
        String role,
        long assigned,
        long critical,
        long toStart,
        long inProgress,
        long resolved,
        List<IncidentDto> recentIncidents
) {
}
