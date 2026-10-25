package ma.enset.incidentdesk.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Le claim "sub" du JWT contient l'email : si l'email change, l'ancien token ne
 * correspond plus à aucun compte. On renvoie donc de nouveaux tokens dans ce cas.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ProfileUpdateResponse(UserDto user, AuthResponse auth) {
}
