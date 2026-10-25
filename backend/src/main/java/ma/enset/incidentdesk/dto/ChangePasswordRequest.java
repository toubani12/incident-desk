package ma.enset.incidentdesk.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
        @NotBlank(message = "L'ancien mot de passe est obligatoire")
        String currentPassword,

        @NotBlank(message = "Le nouveau mot de passe est obligatoire")
        @Size(min = 8, max = 72, message = "Le nouveau mot de passe doit contenir entre 8 et 72 caractères")
        String newPassword,

        @NotBlank(message = "La confirmation est obligatoire")
        String confirmPassword
) {
    @JsonIgnore
    @AssertTrue(message = "La confirmation ne correspond pas au nouveau mot de passe")
    public boolean isConfirmationMatching() {
        return newPassword == null || newPassword.equals(confirmPassword);
    }
}
