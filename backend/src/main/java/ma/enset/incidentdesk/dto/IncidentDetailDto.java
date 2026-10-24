package ma.enset.incidentdesk.dto;

import ma.enset.incidentdesk.enums.IncidentStatus;

import java.util.List;

/**
 * Détail d'un incident avec son historique, ses notes et les actions autorisées
 * pour l'utilisateur connecté (le frontend s'en sert pour afficher les boutons,
 * mais chaque action reste re-vérifiée côté serveur).
 */
public record IncidentDetailDto(
        IncidentDto incident,
        List<HistoryDto> history,
        List<CommentDto> comments,
        Permissions permissions
) {
    public record Permissions(
            boolean canChangeStatus,
            boolean canAssign,
            boolean canComment,
            List<IncidentStatus> allowedStatuses
    ) {
    }
}
