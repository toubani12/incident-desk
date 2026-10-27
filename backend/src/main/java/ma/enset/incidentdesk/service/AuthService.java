package ma.enset.incidentdesk.service;

import lombok.RequiredArgsConstructor;
import ma.enset.incidentdesk.dto.AuthResponse;
import ma.enset.incidentdesk.dto.LoginRequest;
import ma.enset.incidentdesk.dto.RegisterRequest;
import ma.enset.incidentdesk.entity.User;
import ma.enset.incidentdesk.enums.Role;
import ma.enset.incidentdesk.exception.EmailAlreadyUsedException;
import ma.enset.incidentdesk.repository.UserRepository;
import ma.enset.incidentdesk.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    /** Règles 1 et 2 : le rôle est toujours EMPLOYEE, quel que soit le contenu de la requête. */
    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = normalize(req.email());
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new EmailAlreadyUsedException(email);
        }
        User user = new User(req.fullName().trim(), email, passwordEncoder.encode(req.password()), Role.EMPLOYEE);
        userRepository.save(user);
        return issueTokens(user);
    }

    /**
     * Délègue la vérification à l'AuthenticationManager (DaoAuthenticationProvider + BCrypt).
     * Lève BadCredentialsException (401) ou DisabledException (403, règle 7).
     */
    @Transactional
    public AuthResponse login(LoginRequest req) {
        String email = normalize(req.email());
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, req.password()));
        User user = userRepository.findByEmailIgnoreCase(auth.getName()).orElseThrow();
        return issueTokens(user);
    }

    /** Rotation : l'ancien refresh token est révoqué, un nouveau couple est émis. */
    @Transactional
    public AuthResponse refresh(String refreshToken) {
        User user = refreshTokenService.consume(refreshToken);
        return issueTokens(user);
    }

    /** Déconnexion : le refresh token est révoqué ; l'access token expire seul (durée courte). */
    @Transactional
    public void logout(String refreshToken) {
        refreshTokenService.revoke(refreshToken);
    }

    @Transactional
    public AuthResponse issueTokens(User user) {
        String access = jwtService.generateAccessToken(user);
        String refresh = refreshTokenService.create(user);
        return new AuthResponse(access, refresh, "Bearer", jwtService.accessTokenTtlSeconds(),
                user.getRole().name(), user.getFullName(), user.getEmail(), user.getId());
    }

    static String normalize(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }
}
