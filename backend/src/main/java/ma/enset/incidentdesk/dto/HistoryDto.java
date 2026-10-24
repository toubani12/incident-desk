package ma.enset.incidentdesk.dto;

import ma.enset.incidentdesk.enums.HistoryType;
import ma.enset.incidentdesk.enums.IncidentStatus;

import java.time.Instant;

public record HistoryDto(
        Long id,
        HistoryType type,
        IncidentStatus fromStatus,
        IncidentStatus toStatus,
        String message,
        String performedBy,
        Instant createdAt
) {
}
