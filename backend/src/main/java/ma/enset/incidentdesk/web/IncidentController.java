package ma.enset.incidentdesk.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.enset.incidentdesk.dto.*;
import ma.enset.incidentdesk.enums.IncidentCategory;
import ma.enset.incidentdesk.enums.IncidentPriority;
import ma.enset.incidentdesk.enums.IncidentStatus;
import ma.enset.incidentdesk.service.IncidentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôle par rôle via {@code @PreAuthorize} ; le contrôle "propriétaire / technicien affecté"
 * est réalisé dans {@link IncidentService}.
 */
@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
public class IncidentController {

    private final IncidentService incidentService;

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<IncidentDto> create(@Valid @RequestBody CreateIncidentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(incidentService.create(request));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public List<IncidentDto> myIncidents() {
        return incidentService.myIncidents();
    }

    @GetMapping("/assigned")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public List<IncidentDto> assigned() {
        return incidentService.assignedToMe();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<IncidentDto> all(@RequestParam(required = false) IncidentStatus status,
                                 @RequestParam(required = false) IncidentPriority priority,
                                 @RequestParam(required = false) IncidentCategory category,
                                 @RequestParam(required = false) Long assignedTo,
                                 @RequestParam(required = false) String q) {
        return incidentService.search(status, priority, category, assignedTo, q);
    }

    /** Accessible à tout utilisateur authentifié ; le service vérifie le propriétaire ou le technicien. */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public IncidentDetailDto detail(@PathVariable Long id) {
        return incidentService.detail(id);
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("isAuthenticated()")
    public List<HistoryDto> history(@PathVariable Long id) {
        return incidentService.history(id);
    }

    @GetMapping("/{id}/comments")
    @PreAuthorize("isAuthenticated()")
    public List<CommentDto> comments(@PathVariable Long id) {
        return incidentService.comments(id);
    }

    @PostMapping("/{id}/comments")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN')")
    public ResponseEntity<CommentDto> addComment(@PathVariable Long id, @Valid @RequestBody CommentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(incidentService.addComment(id, request));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN')")
    public IncidentDetailDto updateStatus(@PathVariable Long id, @Valid @RequestBody UpdateStatusRequest request) {
        return incidentService.updateStatus(id, request);
    }

    @PutMapping("/{id}/assign/{technicianId}")
    @PreAuthorize("hasRole('ADMIN')")
    public IncidentDetailDto assign(@PathVariable Long id, @PathVariable Long technicianId) {
        return incidentService.assign(id, technicianId);
    }
}
