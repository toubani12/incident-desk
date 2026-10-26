package ma.enset.incidentdesk.exception;

import org.springframework.http.HttpStatus;

/** Violation d'une règle métier (400 par défaut, 409 pour un conflit d'état). */
public class BusinessRuleException extends ApiException {
    public BusinessRuleException(String message) {
        super(HttpStatus.BAD_REQUEST, message);
    }

    public BusinessRuleException(HttpStatus status, String message) {
        super(status, message);
    }
}
