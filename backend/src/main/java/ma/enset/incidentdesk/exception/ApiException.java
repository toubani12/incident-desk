package ma.enset.incidentdesk.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/** Exception métier portant directement le code HTTP à renvoyer. */
@Getter
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }
}
