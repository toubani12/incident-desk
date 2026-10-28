package ma.enset.incidentdesk.web;

import lombok.RequiredArgsConstructor;
import ma.enset.incidentdesk.service.DashboardService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Tableau de bord dont le contenu dépend du rôle (EMPLOYEE, TECHNICIAN ou ADMIN). */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public Object dashboard() {
        return dashboardService.forCurrentUser();
    }
}
