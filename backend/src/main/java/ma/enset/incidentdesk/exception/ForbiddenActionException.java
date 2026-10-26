package ma.enset.incidentdesk.exception;

import org.springframework.http.HttpStatus;

/** 403 : l'utilisateur est authentifié mais n'a pas le droit d'accéder à cette ressource. */
public class ForbiddenActionException extends ApiException {
    public ForbiddenActionException(String message) {
        super(HttpStatus.FORBIDDEN, message);
    }
}
