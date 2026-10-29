package ma.enset.incidentdesk.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.enset.incidentdesk.dto.AdminStatistics;
import ma.enset.incidentdesk.dto.ChangeRoleRequest;
import ma.enset.incidentdesk.dto.UserDto;
import ma.enset.incidentdesk.enums.Role;
import ma.enset.incidentdesk.service.AdminUserService;
import ma.enset.incidentdesk.service.DashboardService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Administration. Double protection : règle d'URL /api/admin/** → hasRole("ADMIN")
 * dans SecurityConfig, et @PreAuthorize au niveau de la classe.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminUserService adminUserService;
    private final DashboardService dashboardService;

    @GetMapping("/users")
    public List<UserDto> users(@RequestParam(required = false) Role role) {
        return adminUserService.list(role);
    }

    @GetMapping("/technicians")
    public List<UserDto> technicians() {
        return adminUserService.activeTechnicians();
    }

    @PutMapping("/users/{id}/enable")
    public UserDto enable(@PathVariable Long id) {
        return adminUserService.setEnabled(id, true);
    }

    @PutMapping("/users/{id}/disable")
    public UserDto disable(@PathVariable Long id) {
        return adminUserService.setEnabled(id, false);
    }

    @PutMapping("/users/{id}/role")
    public UserDto changeRole(@PathVariable Long id, @Valid @RequestBody ChangeRoleRequest request) {
        return adminUserService.changeRole(id, request.role());
    }

    @GetMapping("/statistics")
    public AdminStatistics statistics() {
        return dashboardService.adminStatistics();
    }
}
