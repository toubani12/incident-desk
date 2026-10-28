package ma.enset.incidentdesk.service;

import lombok.RequiredArgsConstructor;
import ma.enset.incidentdesk.dto.*;
import ma.enset.incidentdesk.entity.User;
import ma.enset.incidentdesk.enums.*;
import ma.enset.incidentdesk.repository.IncidentRepository;
import ma.enset.incidentdesk.repository.UserRepository;
import ma.enset.incidentdesk.security.CurrentUserService;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final int RECENT = 5;

    private final IncidentRepository incidentRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    /** Tableau de bord adapté au rôle de l'utilisateur connecté. */
    @Transactional(readOnly = true)
    public Object forCurrentUser() {
        User me = currentUserService.currentUser();
        return switch (me.getRole()) {
            case EMPLOYEE -> employee(me);
            case TECHNICIAN -> technician(me);
            case ADMIN -> adminStatistics();
        };
    }

    private EmployeeDashboard employee(User me) {
        Long id = me.getId();
        return new EmployeeDashboard(
                Role.EMPLOYEE.name(),
                incidentRepository.countByCreatedBy_Id(id),
                incidentRepository.countByCreatedBy_IdAndStatus(id, IncidentStatus.OPEN),
                incidentRepository.countByCreatedBy_IdAndStatus(id, IncidentStatus.ASSIGNED),
                incidentRepository.countByCreatedBy_IdAndStatus(id, IncidentStatus.IN_PROGRESS),
                incidentRepository.countByCreatedBy_IdAndStatusIn(id,
                        List.of(IncidentStatus.RESOLVED, IncidentStatus.CLOSED)),
                incidentRepository.findByCreatedBy_IdOrderByCreatedAtDesc(id, PageRequest.of(0, RECENT))
                        .stream().map(DtoMapper::toDto).toList());
    }

    private TechnicianDashboard technician(User me) {
        Long id = me.getId();
        return new TechnicianDashboard(
                Role.TECHNICIAN.name(),
                incidentRepository.countByAssignedTo_Id(id),
                incidentRepository.countByAssignedTo_IdAndPriorityAndStatusNot(id, IncidentPriority.CRITICAL,
                        IncidentStatus.CLOSED),
                incidentRepository.countByAssignedTo_IdAndStatus(id, IncidentStatus.ASSIGNED),
                incidentRepository.countByAssignedTo_IdAndStatus(id, IncidentStatus.IN_PROGRESS),
                incidentRepository.countByAssignedTo_IdAndStatusIn(id,
                        List.of(IncidentStatus.RESOLVED, IncidentStatus.CLOSED)),
                incidentRepository.findByAssignedTo_IdOrderByUpdatedAtDesc(id, PageRequest.of(0, RECENT))
                        .stream().map(DtoMapper::toDto).toList());
    }

    @Transactional(readOnly = true)
    public AdminStatistics adminStatistics() {
        Map<String, Long> byStatus = zeroMap(IncidentStatus.values());
        incidentRepository.countGroupByStatus().forEach(r -> byStatus.put(r[0].toString(), (Long) r[1]));
        Map<String, Long> byCategory = zeroMap(IncidentCategory.values());
        incidentRepository.countGroupByCategory().forEach(r -> byCategory.put(r[0].toString(), (Long) r[1]));
        Map<String, Long> byPriority = zeroMap(IncidentPriority.values());
        incidentRepository.countGroupByPriority().forEach(r -> byPriority.put(r[0].toString(), (Long) r[1]));

        List<AdminStatistics.TechnicianLoad> workload = incidentRepository.technicianWorkload().stream()
                .map(r -> new AdminStatistics.TechnicianLoad(
                        (Long) r[0], (String) r[1], ((Number) r[2]).longValue(),
                        r[3] == null ? 0 : ((Number) r[3]).longValue()))
                .toList();

        return new AdminStatistics(
                Role.ADMIN.name(),
                userRepository.count(),
                userRepository.countByRole(Role.EMPLOYEE),
                userRepository.countByRole(Role.TECHNICIAN),
                userRepository.countByRole(Role.ADMIN),
                userRepository.countByEnabledFalse(),
                incidentRepository.count(),
                byStatus.get(IncidentStatus.OPEN.name()),
                byStatus.get(IncidentStatus.ASSIGNED.name()),
                byStatus.get(IncidentStatus.IN_PROGRESS.name()),
                byStatus.get(IncidentStatus.RESOLVED.name()),
                byStatus.get(IncidentStatus.CLOSED.name()),
                byStatus, byCategory, byPriority, workload,
                incidentRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, RECENT))
                        .stream().map(DtoMapper::toDto).toList());
    }

    private static Map<String, Long> zeroMap(Enum<?>[] values) {
        Map<String, Long> m = new LinkedHashMap<>();
        for (Enum<?> v : values) m.put(v.name(), 0L);
        return m;
    }
}
