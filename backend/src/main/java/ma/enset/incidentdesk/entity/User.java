package ma.enset.incidentdesk.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ma.enset.incidentdesk.enums.Role;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

/**
 * Utilisateur de l'application.
 * <p>
 * La relation avec {@link Incident} est volontairement unidirectionnelle
 * (seul l'incident référence son créateur / son technicien) : on n'a jamais
 * besoin de charger "tous les incidents d'un utilisateur" en mémoire, les
 * listes sont obtenues par des requêtes paginables du repository.
 */
@Entity
@Table(name = "users", uniqueConstraints = @UniqueConstraint(name = "uk_users_email", columnNames = "email"))
@Getter
@Setter
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, length = 150)
    private String email;

    /** Hash BCrypt, jamais le mot de passe en clair. */
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role = Role.EMPLOYEE;

    @Column(nullable = false)
    private boolean enabled = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    public User(String fullName, String email, String password, Role role) {
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.role = role;
    }
}
