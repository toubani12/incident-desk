package ma.enset.incidentdesk.service;

import lombok.RequiredArgsConstructor;
import ma.enset.incidentdesk.dto.*;
import ma.enset.incidentdesk.entity.Incident;
import ma.enset.incidentdesk.entity.IncidentComment;
import ma.enset.incidentdesk.entity.IncidentHistory;
import ma.enset.incidentdesk.entity.User;
import ma.enset.incidentdesk.enums.*;
import ma.enset.incidentdesk.exception.BusinessRuleException;
import ma.enset.incidentdesk.exception.ForbiddenActionException;
import ma.enset.incidentdesk.exception.ResourceNotFoundException;
import ma.enset.incidentdesk.repository.IncidentCommentRepository;
import ma.enset.incidentdesk.repository.IncidentHistoryRepository;
import ma.enset.incidentdesk.repository.IncidentRepository;
import ma.enset.incidentdesk.repository.UserRepository;
import ma.enset.incidentdesk.security.CurrentUserService;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.*;

/**
 * Logique métier des incidents.
 * <p>
 * Les annotations {@code @PreAuthorize} des contrôleurs filtrent par <b>rôle</b>.
 * Ce service ajoute le contrôle par <b>donnée</b> (propriétaire / technicien affecté),
 * qu'aucune règle d'URL ne peut exprimer : un employé qui tape GET /api/incidents/12
 * dans Postman reçoit 403 si l'incident n'est pas le sien.
 */
@Service
@RequiredArgsConstructor
public class IncidentService {

    /** Graphe des transitions de statut autorisées. CLOSED est terminal (règle 8). */
    private static final Map<IncidentStatus, Set<IncidentStatus>> TRANSITIONS = new EnumMap<>(IncidentStatus.class);

    static {
        TRANSITIONS.put(IncidentStatus.OPEN, EnumSet.of(IncidentStatus.IN_PROGRESS, IncidentStatus.CLOSED));
        TRANSITIONS.put(IncidentStatus.ASSIGNED, EnumSet.of(IncidentStatus.IN_PROGRESS, IncidentStatus.CLOSED));
        TRANSITIONS.put(IncidentStatus.IN_PROGRESS, EnumSet.of(IncidentStatus.RESOLVED, IncidentStatus.CLOSED));
        TRANSITIONS.put(IncidentStatus.RESOLVED, EnumSet.of(IncidentStatus.IN_PROGRESS, IncidentStatus.CLOSED));
        TRANSITIONS.put(IncidentStatus.CLOSED, EnumSet.noneOf(IncidentStatus.class));
    }

    private final IncidentRepository incidentRepository;
    private final IncidentHistoryRepository historyRepository;
    private final IncidentCommentRepository commentRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    /* ======================= Création / listes ======================= */

    @Transactional
    public IncidentDto create(CreateIncidentRequest req) {
        User me = currentUserService.currentUser();
        Incident incident = new Incident();
        incident.setTitle(req.title().trim());
        incident.setDescription(req.description().trim());
        incident.setCategory(req.category());
        incident.setPriority(req.priority());
        incident.setStatus(IncidentStatus.OPEN);
        incident.setCreatedBy(me);
        incident.addHistory(IncidentHistory.of(HistoryType.CREATED, "Incident créé", me));
        return DtoMapper.toDto(incidentRepository.save(incident));
    }

    @Transactional(readOnly = true)
    public List<IncidentDto> myIncidents() {
        User me = currentUserService.currentUser();
        return incidentRepository.findByCreatedBy_IdOrderByCreatedAtDesc(me.getId())
                .stream().map(DtoMapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<IncidentDto> assignedToMe() {
        User me = currentUserService.currentUser();
        return incidentRepository.findByAssignedTo_IdOrderByUpdatedAtDesc(me.getId())
                .stream().map(DtoMapper::toDto).toList();
    }

    /** Liste complète (ADMIN) avec filtres facultatifs. */
    @Transactional(readOnly = true)
    public List<IncidentDto> search(IncidentStatus status, IncidentPriority priority,
                                    IncidentCategory category, Long assignedTo, String q) {
        Specification<Incident> spec = (root, query, cb) -> cb.conjunction();
        if (status != null) spec = spec.and((r, qy, cb) -> cb.equal(r.get("status"), status));
        if (priority != null) spec = spec.and((r, qy, cb) -> cb.equal(r.get("priority"), priority));
        if (category != null) spec = spec.and((r, qy, cb) -> cb.equal(r.get("category"), category));
        if (assignedTo != null) spec = spec.and((r, qy, cb) -> cb.equal(r.get("assignedTo").get("id"), assignedTo));
        if (StringUtils.hasText(q)) {
            String like = "%" + q.trim().toLowerCase(Locale.ROOT) + "%";
            spec = spec.and((r, qy, cb) -> cb.or(
                    cb.like(cb.lower(r.get("title")), like),
                    cb.like(cb.lower(r.get("description")), like)));
        }
        return incidentRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream().map(DtoMapper::toDto).toList();
    }

    /* ======================= Détail ======================= */

    @Transactional(readOnly = true)
    public IncidentDetailDto detail(Long id) {
        User me = currentUserService.currentUser();
        Incident incident = loadReadable(id, me);
        return toDetail(incident, me);
    }

    @Transactional(readOnly = true)
    public List<HistoryDto> history(Long id) {
        User me = currentUserService.currentUser();
        loadReadable(id, me);
        return historyRepository.findByIncident_IdOrderByCreatedAtAscIdAsc(id).stream().map(DtoMapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<CommentDto> comments(Long id) {
        User me = currentUserService.currentUser();
        loadReadable(id, me);
        return commentRepository.findByIncident_IdOrderByCreatedAtAscIdAsc(id).stream().map(DtoMapper::toDto).toList();
    }

    /* ======================= Actions ======================= */

    /** Règles 5 et 8 : technicien affecté (ou admin) uniquement, jamais sur un incident CLOSED. */
    @Transactional
    public IncidentDetailDto updateStatus(Long id, UpdateStatusRequest req) {
        User me = currentUserService.currentUser();
        Incident incident = load(id);
        ensureCanWork(incident, me);

        IncidentStatus from = incident.getStatus();
        IncidentStatus to = req.status();
        if (from == IncidentStatus.CLOSED) {
            throw new BusinessRuleException(HttpStatus.CONFLICT, "Incident clôturé : son statut ne peut plus être modifié");
        }
        if (from == to) {
            throw new BusinessRuleException("L'incident est déjà au statut " + to);
        }
        if (!allowedStatuses(incident, me).contains(to)) {
            throw new BusinessRuleException("Transition non autorisée : " + from + " -> " + to);
        }

        incident.setStatus(to);
        incident.addHistory(IncidentHistory.statusChange(from, to, me));
        if (StringUtils.hasText(req.note())) {
            appendNote(incident, me, req.note());
        }
        incidentRepository.saveAndFlush(incident);
        return toDetail(incident, me);
    }

    /** Règle 6 : seul un ADMIN affecte (garanti par @PreAuthorize + contrôles ci-dessous). */
    @Transactional
    public IncidentDetailDto assign(Long id, Long technicianId) {
        User me = currentUserService.currentUser();
        Incident incident = load(id);
        if (incident.getStatus() == IncidentStatus.CLOSED) {
            throw new BusinessRuleException(HttpStatus.CONFLICT, "Incident clôturé : impossible de l'affecter");
        }
        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technicien introuvable"));
        if (technician.getRole() != Role.TECHNICIAN) {
            throw new BusinessRuleException("L'utilisateur choisi n'est pas un technicien");
        }
        if (!technician.isEnabled()) {
            throw new BusinessRuleException("Ce technicien est désactivé");
        }
        User previous = incident.getAssignedTo();
        if (previous != null && previous.getId().equals(technician.getId())) {
            throw new BusinessRuleException("L'incident est déjà affecté à " + technician.getFullName());
        }

        incident.setAssignedTo(technician);
        IncidentStatus from = incident.getStatus();
        String message = previous == null
                ? "Affecté à " + technician.getFullName()
                : "Réaffecté de " + previous.getFullName() + " à " + technician.getFullName();
        IncidentHistory entry = IncidentHistory.of(HistoryType.ASSIGNED, message, me);
        if (from == IncidentStatus.OPEN) {
            incident.setStatus(IncidentStatus.ASSIGNED);
            entry.setFromStatus(from);
            entry.setToStatus(IncidentStatus.ASSIGNED);
        }
        incident.addHistory(entry);
        incidentRepository.saveAndFlush(incident);
        return toDetail(incident, me);
    }

    @Transactional
    public CommentDto addComment(Long id, CommentRequest req) {
        User me = currentUserService.currentUser();
        Incident incident = load(id);
        ensureCanWork(incident, me);
        if (incident.getStatus() == IncidentStatus.CLOSED) {
            throw new BusinessRuleException(HttpStatus.CONFLICT, "Incident clôturé : impossible d'ajouter une note");
        }
        IncidentComment comment = appendNote(incident, me, req.content());
        incidentRepository.saveAndFlush(incident);
        return DtoMapper.toDto(comment);
    }

    /* ======================= Contrôles d'accès par donnée ======================= */

    private Incident load(Long id) {
        return incidentRepository.findWithUsersById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident introuvable"));
    }

    /** Lecture : ADMIN tout ; EMPLOYEE ses incidents ; TECHNICIAN les incidents qui lui sont affectés. */
    private Incident loadReadable(Long id, User me) {
        Incident incident = load(id);
        boolean allowed = switch (me.getRole()) {
            case ADMIN -> true;
            case EMPLOYEE -> isOwner(incident, me);
            case TECHNICIAN -> isAssignee(incident, me);
        };
        if (!allowed) {
            throw new ForbiddenActionException(me.getRole() == Role.EMPLOYEE
                    ? "Accès interdit : cet incident ne vous appartient pas"
                    : "Accès interdit : cet incident ne vous est pas affecté");
        }
        return incident;
    }

    /** Traitement : ADMIN, ou TECHNICIAN affecté à l'incident. */
    private void ensureCanWork(Incident incident, User me) {
        if (me.getRole() == Role.ADMIN) return;
        if (me.getRole() == Role.TECHNICIAN && isAssignee(incident, me)) return;
        throw new ForbiddenActionException(me.getRole() == Role.TECHNICIAN
                ? "Accès interdit : cet incident ne vous est pas affecté"
                : "Accès interdit : action réservée aux techniciens et administrateurs");
    }

    private static boolean isOwner(Incident i, User me) {
        return i.getCreatedBy() != null && i.getCreatedBy().getId().equals(me.getId());
    }

    private static boolean isAssignee(Incident i, User me) {
        return i.getAssignedTo() != null && i.getAssignedTo().getId().equals(me.getId());
    }

    private List<IncidentStatus> allowedStatuses(Incident incident, User me) {
        boolean admin = me.getRole() == Role.ADMIN;
        boolean tech = me.getRole() == Role.TECHNICIAN && isAssignee(incident, me);
        if (!admin && !tech) return List.of();

        List<IncidentStatus> result = new ArrayList<>();
        for (IncidentStatus s : TRANSITIONS.get(incident.getStatus())) {
            if (s == IncidentStatus.IN_PROGRESS && incident.getAssignedTo() == null) continue;
            if (s == IncidentStatus.CLOSED && !admin) continue; // seul l'admin clôture
            result.add(s);
        }
        return result;
    }

    private IncidentComment appendNote(Incident incident, User me, String content) {
        IncidentComment comment = new IncidentComment(me, content.trim());
        incident.addComment(comment);
        incident.addHistory(IncidentHistory.of(HistoryType.NOTE_ADDED, "Note de traitement ajoutée", me));
        return comment;
    }

    private IncidentDetailDto toDetail(Incident incident, User me) {
        List<IncidentStatus> allowed = allowedStatuses(incident, me);
        boolean closed = incident.getStatus() == IncidentStatus.CLOSED;
        boolean worker = me.getRole() == Role.ADMIN || (me.getRole() == Role.TECHNICIAN && isAssignee(incident, me));
        IncidentDetailDto.Permissions perms = new IncidentDetailDto.Permissions(
                !allowed.isEmpty(),
                me.getRole() == Role.ADMIN && !closed,
                worker && !closed,
                allowed);
        return new IncidentDetailDto(
                DtoMapper.toDto(incident),
                incident.getHistory().stream().map(DtoMapper::toDto).toList(),
                incident.getComments().stream().map(DtoMapper::toDto).toList(),
                perms);
    }
}
