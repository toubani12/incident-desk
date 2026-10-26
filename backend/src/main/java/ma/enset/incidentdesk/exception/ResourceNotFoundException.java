package ma.enset.incidentdesk.exception;

import org.springframework.http.HttpStatus;

/** 404 : utilisateur, incident... introuvable. */
public class ResourceNotFoundException extends ApiException {
    public ResourceNotFoundException(String message) {
        super(HttpStatus.NOT_FOUND, message);
    }
}
