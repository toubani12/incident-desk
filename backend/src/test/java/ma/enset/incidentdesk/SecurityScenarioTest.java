package ma.enset.incidentdesk;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import ma.enset.incidentdesk.config.JwtProperties;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.time.Instant;
import java.util.Date;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Rejoue le scénario de l'énoncé (§24) et les 9 tests de sécurité obligatoires (§25).
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class SecurityScenarioTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper om;
    @Autowired JwtProperties jwtProperties;

    private String login(String email, String password) throws Exception {
        String body = mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return om.readTree(body).get("token").asText();
    }

    private ResultActions createIncident(String token, String title) throws Exception {
        return mvc.perform(post("/api/incidents").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"" + title + "\",\"description\":\"Description détaillée du problème\","
                        + "\"category\":\"MALWARE\",\"priority\":\"HIGH\"}"));
    }

    private long idOf(ResultActions r) throws Exception {
        JsonNode n = om.readTree(r.andReturn().getResponse().getContentAsString());
        return n.has("incident") ? n.get("incident").get("id").asLong() : n.get("id").asLong();
    }

    @Test
    @Order(1)
    void fullScenarioAndSecurityRules() throws Exception {
        String admin = login("admin@incident.ma", "Admin@123");
        String badr = login("badr@incident.ma", "Employe@123");
        String fatima = login("fatima@incident.ma", "Employe@123");
        String tech1 = login("tech1@incident.ma", "Tech@1234");
        String tech2 = login("tech2@incident.ma", "Tech@1234");

        long i1 = idOf(createIncident(badr, "Poste infecté par un malware").andExpect(status().isCreated()));
        createIncident(badr, "Tentative de phishing reçue").andExpect(status().isCreated());
        long i3 = idOf(createIncident(fatima, "Accès VPN impossible").andExpect(status().isCreated()));

        // 5. employé -> incident d'un autre employé : 403
        mvc.perform(get("/api/incidents/" + i3).header("Authorization", "Bearer " + badr))
                .andExpect(status().isForbidden());

        // 4. employé -> route admin : 403
        mvc.perform(get("/api/admin/users").header("Authorization", "Bearer " + badr))
                .andExpect(status().isForbidden());

        // admin affecte i1 à tech1
        mvc.perform(put("/api/incidents/" + i1 + "/assign/2").header("Authorization", "Bearer " + admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.incident.status").value("ASSIGNED"));

        // 6. tech2 essaie de modifier un incident non affecté : 403
        mvc.perform(put("/api/incidents/" + i1 + "/status").header("Authorization", "Bearer " + tech2)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"IN_PROGRESS\"}"))
                .andExpect(status().isForbidden());

        mvc.perform(put("/api/incidents/" + i1 + "/status").header("Authorization", "Bearer " + tech1)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"IN_PROGRESS\"}"))
                .andExpect(status().isOk());
        mvc.perform(put("/api/incidents/" + i1 + "/status").header("Authorization", "Bearer " + tech1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"RESOLVED\",\"note\":\"Le malware a été supprimé.\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.incident.status").value("RESOLVED"));

        // l'employé voit le nouvel état + l'historique
        mvc.perform(get("/api/incidents/" + i1).header("Authorization", "Bearer " + badr))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.incident.status").value("RESOLVED"))
                .andExpect(jsonPath("$.history.length()").value(5))
                .andExpect(jsonPath("$.comments.length()").value(1));

        // règle 8 : CLOSED est terminal
        mvc.perform(put("/api/incidents/" + i1 + "/status").header("Authorization", "Bearer " + admin)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"CLOSED\"}"))
                .andExpect(status().isOk());
        mvc.perform(put("/api/incidents/" + i1 + "/status").header("Authorization", "Bearer " + admin)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"IN_PROGRESS\"}"))
                .andExpect(status().isConflict());

        // 9. données invalides : 400 + détail par champ
        mvc.perform(post("/api/incidents").header("Authorization", "Bearer " + badr)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"\",\"category\":\"MALWARE\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.title").exists())
                .andExpect(jsonPath("$.errors.priority").exists());
    }

    @Test
    @Order(2)
    void tokenProblemsReturn401() throws Exception {
        // 1. sans JWT
        mvc.perform(get("/api/profile")).andExpect(status().isUnauthorized());
        // 2. JWT invalide
        mvc.perform(get("/api/profile").header("Authorization", "Bearer abc.def.ghi"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Token invalide"));
        // 3. JWT expiré (signé avec la vraie clé)
        Instant past = Instant.now().minusSeconds(3600);
        String expired = Jwts.builder().subject("badr@incident.ma").issuer(jwtProperties.issuer())
                .claim("role", "EMPLOYEE").issuedAt(Date.from(past.minusSeconds(300))).expiration(Date.from(past))
                .signWith(Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtProperties.secret())), Jwts.SIG.HS256)
                .compact();
        mvc.perform(get("/api/profile").header("Authorization", "Bearer " + expired))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Token expiré : veuillez vous reconnecter"));
    }

    @Test
    @Order(3)
    void loginAndRegisterRules() throws Exception {
        // 7. compte désactivé
        mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"omar@incident.ma\",\"password\":\"Employe@123\"}"))
                .andExpect(status().isForbidden());
        // mauvais mot de passe
        mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"badr@incident.ma\",\"password\":\"mauvais\"}"))
                .andExpect(status().isUnauthorized());
        // 8. email déjà utilisé
        mvc.perform(post("/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"Badr Toubani\",\"email\":\"badr@incident.ma\",\"password\":\"Password1\"}"))
                .andExpect(status().isConflict());
        // rôle imposé EMPLOYEE même si ADMIN est envoyé
        mvc.perform(post("/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"Mehdi Lahlou\",\"email\":\"mehdi.lahlou@incident.ma\",\"password\":\"Password1\",\"role\":\"ADMIN\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("EMPLOYEE"));
    }
}
