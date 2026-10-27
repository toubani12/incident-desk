package ma.enset.incidentdesk.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import ma.enset.incidentdesk.config.JwtProperties;
import ma.enset.incidentdesk.entity.User;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;

/**
 * Génération et vérification des access tokens JWT (HS256).
 * <p>
 * Claims émis :
 * <ul>
 *   <li>{@code sub} (enregistré) : email de l'utilisateur</li>
 *   <li>{@code iat} (enregistré) : date de création</li>
 *   <li>{@code exp} (enregistré) : date d'expiration</li>
 *   <li>{@code iss} (enregistré) : émetteur</li>
 *   <li>{@code role} (privé) : rôle de l'utilisateur (EMPLOYEE, TECHNICIAN, ADMIN)</li>
 *   <li>{@code uid} / {@code name} (privés) : identifiant et nom, pratiques pour le frontend</li>
 * </ul>
 */
@Service
public class JwtService {

    public static final String CLAIM_ROLE = "role";
    public static final String CLAIM_USER_ID = "uid";
    public static final String CLAIM_NAME = "name";

    private final JwtProperties props;
    private final SecretKey key;

    public JwtService(JwtProperties props) {
        this.props = props;
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(props.secret()));
    }

    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(user.getEmail())
                .issuer(props.issuer())
                .claim(CLAIM_ROLE, user.getRole().name())
                .claim(CLAIM_USER_ID, user.getId())
                .claim(CLAIM_NAME, user.getFullName())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(props.accessTokenExpiration())))
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }

    /**
     * Vérifie la signature, l'émetteur et l'expiration puis renvoie les claims.
     *
     * @throws io.jsonwebtoken.ExpiredJwtException si {@code exp} est dépassé
     * @throws io.jsonwebtoken.JwtException        si le token est mal formé ou falsifié
     */
    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .requireIssuer(props.issuer())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return parseClaims(token).get(CLAIM_ROLE, String.class);
    }

    public long accessTokenTtlSeconds() {
        return props.accessTokenExpiration().toSeconds();
    }
}
