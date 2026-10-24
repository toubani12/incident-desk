package ma.enset.incidentdesk.dto;

import java.time.Instant;

public record CommentDto(Long id, String content, UserSummary author, Instant createdAt) {
}
