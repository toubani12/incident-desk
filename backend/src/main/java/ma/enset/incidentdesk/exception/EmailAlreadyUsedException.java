package ma.enset.incidentdesk.exception;

import org.springframework.http.HttpStatus;

/** 409 : l'email est déjà associé à un compte. */
public class EmailAlreadyUsedException extends ApiException {
    public EmailAlreadyUsedException(String email) {
        super(HttpStatus.CONFLICT, "Email déjà utilisé : " + email);
    }
}
