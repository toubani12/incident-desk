package ma.enset.incidentdesk.dto;

import java.util.List;

/** Tableau de bord EMPLOYEE : uniquement ses propres incidents. */
public record EmployeeDashboard(
        String role,
        long total,
        long open,
        long assigned,
        long inProgress,
        long resolvedOrClosed,
        List<IncidentDto> recentIncidents
) {
}
