package ma.enset.incidentdesk.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.enset.incidentdesk.entity.User;
import ma.enset.incidentdesk.enums.Role;
import ma.enset.incidentdesk.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Crée les comptes de test au démarrage (uniquement si la table users est vide).
 * C'est le seul moyen d'obtenir un ADMIN : l'inscription publique donne toujours EMPLOYEE.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }
        create("Youssef El Mansouri", "admin@incident.ma", "Admin@123", Role.ADMIN, true);
        create("Karim Alaoui", "tech1@incident.ma", "Tech@1234", Role.TECHNICIAN, true);
        create("Sara Idrissi", "tech2@incident.ma", "Tech@1234", Role.TECHNICIAN, true);
        create("Badr Eddine Toubani", "badr@incident.ma", "Employe@123", Role.EMPLOYEE, true);
        create("Fatima Zahra El Amrani", "fatima@incident.ma", "Employe@123", Role.EMPLOYEE, true);
        create("Omar Tazi", "omar@incident.ma", "Employe@123", Role.EMPLOYEE, false);
        log.info("Comptes de démonstration créés (voir README)");
    }

    private void create(String name, String email, String rawPassword, Role role, boolean enabled) {
        User u = new User(name, email, passwordEncoder.encode(rawPassword), role);
        u.setEnabled(enabled);
        userRepository.save(u);
    }
}
