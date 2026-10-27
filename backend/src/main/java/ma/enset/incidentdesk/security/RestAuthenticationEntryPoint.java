package ma.enset.incidentdesk.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import ma.enset.incidentdesk.exception.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/** Réponse 401 JSON quand une route protégée est appelée sans authentification valide. */
@Component
@RequiredArgsConstructor
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        Object cause = request.getAttribute(JwtFilter.ERROR_ATTRIBUTE);
        String message;
        if (JwtFilter.ERR_EXPIRED.equals(cause)) {
            message = "Token expiré : veuillez vous reconnecter";
        } else if (JwtFilter.ERR_INVALID.equals(cause)) {
            message = "Token invalide";
        } else if (JwtFilter.ERR_DISABLED.equals(cause)) {
            message = "Compte désactivé";
        } else if (JwtFilter.ERR_ROLE_CHANGED.equals(cause)) {
            message = "Vos droits ont changé : veuillez vous reconnecter";
        } else {
            message = "Authentification requise : token JWT manquant";
        }

        HttpStatus status = HttpStatus.UNAUTHORIZED;
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        objectMapper.writeValue(response.getOutputStream(),
                ErrorResponse.of(status.value(), status.getReasonPhrase(), message, request.getRequestURI()));
    }
}
