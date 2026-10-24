package ma.enset.incidentdesk.dto;

import ma.enset.incidentdesk.entity.Incident;
import ma.enset.incidentdesk.entity.IncidentComment;
import ma.enset.incidentdesk.entity.IncidentHistory;
import ma.enset.incidentdesk.entity.User;

/** Conversions entité → DTO (appelées dans une transaction pour accéder aux relations LAZY). */
public final class DtoMapper {

    private DtoMapper() {
    }

    public static UserDto toDto(User u) {
        return new UserDto(u.getId(), u.getFullName(), u.getEmail(), u.getRole(), u.isEnabled(), u.getCreatedAt());
    }

    public static UserSummary toSummary(User u) {
        return u == null ? null : new UserSummary(u.getId(), u.getFullName(), u.getEmail(), u.getRole());
    }

    public static IncidentDto toDto(Incident i) {
        return new IncidentDto(i.getId(), i.getTitle(), i.getDescription(), i.getCategory(), i.getPriority(),
                i.getStatus(), i.getCreatedAt(), i.getUpdatedAt(),
                toSummary(i.getCreatedBy()), toSummary(i.getAssignedTo()));
    }

    public static HistoryDto toDto(IncidentHistory h) {
        return new HistoryDto(h.getId(), h.getType(), h.getFromStatus(), h.getToStatus(), h.getMessage(),
                h.getPerformedBy() == null ? null : h.getPerformedBy().getFullName(), h.getCreatedAt());
    }

    public static CommentDto toDto(IncidentComment c) {
        return new CommentDto(c.getId(), c.getContent(), toSummary(c.getAuthor()), c.getCreatedAt());
    }
}
