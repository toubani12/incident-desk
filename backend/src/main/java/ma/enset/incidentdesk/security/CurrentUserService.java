package ma.enset.incidentdesk.security;

import lombok.RequiredArgsConstructor;
import ma.enset.incidentdesk.entity.User;
import ma.enset.incidentdesk.enums.Role;
import ma.enset.incidentdesk.repository.UserRepository;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * Récupère l'utilisateur connecté à partir du SecurityContext rempli par {@link JwtFilter}.
 * <p>
 * {@code SecurityContextHolder.getContext().getAuthentication()} renvoie l'objet
 * {@link Authentication} de la requête courante ; {@code getName()} vaut le "username"
 * du {@code Principal}, ici l'email (= claim {@code sub} du JWT).
 */
@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final UserRepository userRepository;

    public String currentEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            throw new AuthenticationCredentialsNotFoundException("Aucun utilisateur authentifié");
        }
        return auth.getName();
    }

    public User currentUser() {
        String email = currentEmail();
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new AuthenticationCredentialsNotFoundException("Utilisateur introuvable"));
    }

    public static boolean is(User user, Role role) {
        return user.getRole() == role;
    }
}
