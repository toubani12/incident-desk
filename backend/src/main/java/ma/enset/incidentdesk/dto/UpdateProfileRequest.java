package ma.enset.incidentdesk.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @NotBlank(message = "Le nom complet est obligatoire")
        @Size(min = 3, max = 100, message = "Le nom doit contenir entre 3 et 100 caractères")
        String fullName,

        @NotBlank(message = "L'email est obligatoire")
        @Email(message = "Format d'email invalide")
        @Size(max = 150, message = "L'email ne doit pas dépasser 150 caractères")
        String email
) {
}
