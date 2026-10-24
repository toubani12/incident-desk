package ma.enset.incidentdesk.dto;

import ma.enset.incidentdesk.enums.IncidentCategory;
import ma.enset.incidentdesk.enums.IncidentPriority;
import ma.enset.incidentdesk.enums.IncidentStatus;

import java.time.Instant;

public record IncidentDto(
        Long id,
        String title,
        String description,
        IncidentCategory category,
        IncidentPriority priority,
        IncidentStatus status,
        Instant createdAt,
        Instant updatedAt,
        UserSummary createdBy,
        UserSummary assignedTo
) {
}
