package ma.enset.incidentdesk.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filtre exécuté une fois par requête : lit "Authorization: Bearer &lt;JWT&gt;",
 * vérifie le token puis place l'utilisateur dans le SecurityContext.
 * <p>
 * Le filtre ne renvoie jamais lui-même d'erreur : en cas de problème il mémorise la cause
 * dans un attribut de requête et laisse la chaîne continuer. Si la route est protégée,
 * {@link RestAuthenticationEntryPoint} renverra un 401 avec un message précis.
 */
public class JwtFilter extends OncePerRequestFilter {

    public static final String ERROR_ATTRIBUTE = "incidentdesk.jwt.error";
    public static final String ERR_EXPIRED = "expired";
    public static final String ERR_INVALID = "invalid";
    public static final String ERR_DISABLED = "disabled";
    public static final String ERR_ROLE_CHANGED = "role_changed";

    private static final String BEARER = "Bearer ";

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI().substring(request.getContextPath().length());
        return path.startsWith("/auth/") || path.startsWith("/h2-console");
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain chain) throws ServletException, IOException {

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith(BEARER)) {
            chain.doFilter(request, response);
            return;
        }

        String token = header.substring(BEARER.length()).trim();
        try {
            Claims claims = jwtService.parseClaims(token);
            String email = claims.getSubject();
            String tokenRole = claims.get(JwtService.CLAIM_ROLE, String.class);

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails user = userDetailsService.loadUserByUsername(email);

                if (!user.isEnabled()) {
                    request.setAttribute(ERROR_ATTRIBUTE, ERR_DISABLED);
                } else if (!sameRole(tokenRole, user)) {
                    // le rôle a été modifié par un admin depuis l'émission du token
                    request.setAttribute(ERROR_ATTRIBUTE, ERR_ROLE_CHANGED);
                } else {
                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContext context = SecurityContextHolder.createEmptyContext();
                    context.setAuthentication(auth);
                    SecurityContextHolder.setContext(context);
                }
            }
        } catch (ExpiredJwtException e) {
            request.setAttribute(ERROR_ATTRIBUTE, ERR_EXPIRED);
        } catch (JwtException | IllegalArgumentException | UsernameNotFoundException e) {
            request.setAttribute(ERROR_ATTRIBUTE, ERR_INVALID);
        }

        chain.doFilter(request, response);
    }

    private boolean sameRole(String tokenRole, UserDetails user) {
        if (tokenRole == null) return false;
        String expected = "ROLE_" + tokenRole;
        for (GrantedAuthority a : user.getAuthorities()) {
            if (expected.equals(a.getAuthority())) return true;
        }
        return false;
    }
}
