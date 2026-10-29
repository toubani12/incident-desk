package ma.enset.incidentdesk.service;

import lombok.RequiredArgsConstructor;
import ma.enset.incidentdesk.dto.DtoMapper;
import ma.enset.incidentdesk.dto.UserDto;
import ma.enset.incidentdesk.entity.User;
import ma.enset.incidentdesk.enums.Role;
import ma.enset.incidentdesk.exception.BusinessRuleException;
import ma.enset.incidentdesk.exception.ResourceNotFoundException;
import ma.enset.incidentdesk.repository.UserRepository;
import ma.enset.incidentdesk.security.CurrentUserService;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final RefreshTokenService refreshTokenService;

    @Transactional(readOnly = true)
    public List<UserDto> list(Role role) {
        Sort sort = Sort.by("createdAt").ascending();
        List<User> users = role == null ? userRepository.findAll(sort) : userRepository.findByRole(role, sort);
        return users.stream().map(DtoMapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<UserDto> activeTechnicians() {
        return userRepository.findByRoleAndEnabledTrue(Role.TECHNICIAN, Sort.by("fullName"))
                .stream().map(DtoMapper::toDto).toList();
    }

    @Transactional
    public UserDto setEnabled(Long id, boolean enabled) {
        User user = find(id);
        if (!enabled && user.getId().equals(currentUserService.currentUser().getId())) {
            throw new BusinessRuleException("Vous ne pouvez pas désactiver votre propre compte");
        }
        user.setEnabled(enabled);
        if (!enabled) {
            refreshTokenService.revokeAll(user);
        }
        return DtoMapper.toDto(user);
    }

    @Transactional
    public UserDto changeRole(Long id, Role role) {
        User user = find(id);
        if (user.getId().equals(currentUserService.currentUser().getId())) {
            throw new BusinessRuleException("Vous ne pouvez pas modifier votre propre rôle");
        }
        user.setRole(role);
        return DtoMapper.toDto(user);
    }

    private User find(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
    }
}
