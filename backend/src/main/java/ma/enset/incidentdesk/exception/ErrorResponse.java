package ma.enset.incidentdesk.exception;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.Map;

/**
 * Format unique des erreurs renvoyées par l'API.
 * <pre>{ "status": 404, "error": "Not Found", "message": "Incident introuvable", "path": "/api/incidents/12" }</pre>
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        int status,
        String error,
        String message,
        String path,
        Instant timestamp,
        Map<String, String> errors
) {
    public static ErrorResponse of(int status, String error, String message, String path) {
        return new ErrorResponse(status, error, message, path, Instant.now(), null);
    }

    public static ErrorResponse withErrors(int status, String error, String message, String path,
                                           Map<String, String> errors) {
        return new ErrorResponse(status, error, message, path, Instant.now(), errors);
    }
}
