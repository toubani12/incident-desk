package ma.enset.incidentdesk.dto;

import ma.enset.incidentdesk.enums.Role;

import java.time.Instant;

/** Utilisateur exposé par l'API : le mot de passe n'est jamais renvoyé. */
public record UserDto(Long id, String fullName, String email, Role role, boolean enabled, Instant createdAt) {
}
