package ma.enset.incidentdesk.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

/** Paramètres JWT lus depuis application.properties (préfixe app.jwt). */
@ConfigurationProperties(prefix = "app.jwt")
public record JwtProperties(
        String secret,
        Duration accessTokenExpiration,
        Duration refreshTokenExpiration,
        String issuer
) {
}
