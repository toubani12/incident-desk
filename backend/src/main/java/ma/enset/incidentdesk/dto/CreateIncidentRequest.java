package ma.enset.incidentdesk.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import ma.enset.incidentdesk.enums.IncidentCategory;
import ma.enset.incidentdesk.enums.IncidentPriority;

public record CreateIncidentRequest(
        @NotBlank(message = "Le titre est obligatoire")
        @Size(min = 5, max = 150, message = "Le titre doit contenir entre 5 et 150 caractères")
        String title,

        @NotBlank(message = "La description est obligatoire")
        @Size(min = 10, max = 3000, message = "La description doit contenir entre 10 et 3000 caractères")
        String description,

        @NotNull(message = "La catégorie est obligatoire")
        IncidentCategory category,

        @NotNull(message = "La priorité est obligatoire")
        IncidentPriority priority
) {
}
