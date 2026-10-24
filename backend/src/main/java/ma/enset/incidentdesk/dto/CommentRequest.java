package ma.enset.incidentdesk.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommentRequest(
        @NotBlank(message = "La note ne peut pas être vide")
        @Size(max = 2000, message = "La note ne doit pas dépasser 2000 caractères")
        String content
) {
}
