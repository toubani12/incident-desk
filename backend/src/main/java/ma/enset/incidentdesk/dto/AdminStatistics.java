package ma.enset.incidentdesk.dto;

import java.util.List;
import java.util.Map;

public record AdminStatistics(
        String role,
        long totalUsers,
        long employees,
        long technicians,
        long admins,
        long disabledUsers,
        long totalIncidents,
        long open,
        long assigned,
        long inProgress,
        long resolved,
        long closed,
        Map<String, Long> byStatus,
        Map<String, Long> byCategory,
        Map<String, Long> byPriority,
        List<TechnicianLoad> technicianWorkload,
        List<IncidentDto> recentIncidents
) {
    public record TechnicianLoad(Long id, String fullName, long total, long active) {
    }
}
