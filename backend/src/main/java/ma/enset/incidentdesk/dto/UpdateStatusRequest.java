package ma.enset.incidentdesk.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import ma.enset.incidentdesk.enums.IncidentStatus;

/** Changement de statut, avec une note de traitement facultative. */
public record UpdateStatusRequest(
        @NotNull(message = "Le statut est obligatoire")
        IncidentStatus status,

        @Size(max = 2000, message = "La note ne doit pas dépasser 2000 caractères")
        String note
) {
}
