package ma.enset.incidentdesk.dto;

import jakarta.validation.constraints.NotNull;
import ma.enset.incidentdesk.enums.Role;

public record ChangeRoleRequest(@NotNull(message = "Le rôle est obligatoire") Role role) {
}
