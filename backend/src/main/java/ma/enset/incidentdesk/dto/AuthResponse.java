package ma.enset.incidentdesk.dto;

/** Réponse de /auth/login, /auth/register et /auth/refresh. */
public record AuthResponse(
        String token,
        String refreshToken,
        String tokenType,
        long expiresIn,
        String role,
        String fullName,
        String email,
        Long userId
) {
}
