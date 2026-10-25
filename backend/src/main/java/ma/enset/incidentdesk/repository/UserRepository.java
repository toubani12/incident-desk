package ma.enset.incidentdesk.repository;

import ma.enset.incidentdesk.entity.User;
import ma.enset.incidentdesk.enums.Role;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

    List<User> findByRole(Role role, Sort sort);

    List<User> findByRoleAndEnabledTrue(Role role, Sort sort);

    long countByRole(Role role);

    long countByEnabledFalse();
}
