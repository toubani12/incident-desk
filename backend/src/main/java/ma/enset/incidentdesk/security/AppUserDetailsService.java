package ma.enset.incidentdesk.security;

import lombok.RequiredArgsConstructor;
import ma.enset.incidentdesk.entity.User;
import ma.enset.incidentdesk.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Charge un utilisateur par son email pour Spring Security.
 * L'autorité est préfixée par "ROLE_" pour être compatible avec hasRole("ADMIN").
 * Le flag {@code enabled} est propagé : un compte désactivé lève DisabledException au login.
 */
@Service
@RequiredArgsConstructor
public class AppUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable : " + email));

        return org.springframework.security.core.userdetails.User.withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())))
                .disabled(!user.isEnabled())
                .build();
    }
}
