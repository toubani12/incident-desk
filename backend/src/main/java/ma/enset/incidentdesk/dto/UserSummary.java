package ma.enset.incidentdesk.dto;

import ma.enset.incidentdesk.enums.Role;

/** Vue réduite d'un utilisateur, imbriquée dans les incidents. */
public record UserSummary(Long id, String fullName, String email, Role role) {
}
