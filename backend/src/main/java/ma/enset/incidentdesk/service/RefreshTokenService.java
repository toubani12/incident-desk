package ma.enset.incidentdesk.service;

import lombok.RequiredArgsConstructor;
import ma.enset.incidentdesk.config.JwtProperties;
import ma.enset.incidentdesk.entity.RefreshToken;
import ma.enset.incidentdesk.entity.User;
import ma.enset.incidentdesk.exception.ApiException;
import ma.enset.incidentdesk.repository.RefreshTokenRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Refresh tokens opaques (chaîne aléatoire de 256 bits), stockés en base sous forme
 * d'empreinte SHA-256, à usage unique : chaque /auth/refresh révoque l'ancien jeton
 * et en émet un nouveau (rotation).
 */
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final RefreshTokenRepository repository;
    private final JwtProperties jwtProperties;

    /** Crée un refresh token et renvoie sa valeur en clair (seule fois où elle existe). */
    @Transactional
    public String create(User user) {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        String raw = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        RefreshToken token = new RefreshToken();
        token.setUser(user);
        token.setTokenHash(hash(raw));
        token.setExpiresAt(Instant.now().plus(jwtProperties.refreshTokenExpiration()));
        repository.save(token);
        return raw;
    }

    /** Vérifie un refresh token, le révoque et renvoie l'utilisateur associé. */
    @Transactional
    public User consume(String raw) {
        RefreshToken token = repository.findByTokenHash(hash(raw))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Refresh token invalide"));
        if (!token.isUsable()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Refresh token expiré ou révoqué");
        }
        User user = token.getUser();
        if (!user.isEnabled()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Compte désactivé");
        }
        token.setRevoked(true);
        return user;
    }

    @Transactional
    public void revoke(String raw) {
        repository.findByTokenHash(hash(raw)).ifPresent(t -> t.setRevoked(true));
    }

    @Transactional
    public void revokeAll(User user) {
        repository.revokeAllForUser(user.getId());
    }

    private static String hash(String raw) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(md.digest(raw.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
