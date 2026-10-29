package ma.enset.incidentdesk.service;

import lombok.RequiredArgsConstructor;
import ma.enset.incidentdesk.dto.*;
import ma.enset.incidentdesk.entity.User;
import ma.enset.incidentdesk.exception.BusinessRuleException;
import ma.enset.incidentdesk.exception.EmailAlreadyUsedException;
import ma.enset.incidentdesk.repository.UserRepository;
import ma.enset.incidentdesk.security.CurrentUserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;

    @Transactional(readOnly = true)
    public UserDto me() {
        return DtoMapper.toDto(currentUserService.currentUser());
    }

    @Transactional
    public ProfileUpdateResponse update(UpdateProfileRequest req) {
        User me = currentUserService.currentUser();
        String email = AuthService.normalize(req.email());
        boolean emailChanged = !me.getEmail().equalsIgnoreCase(email);

        if (emailChanged && userRepository.existsByEmailIgnoreCaseAndIdNot(email, me.getId())) {
            throw new EmailAlreadyUsedException(email);
        }
        me.setFullName(req.fullName().trim());
        me.setEmail(email);
        userRepository.saveAndFlush(me);

        AuthResponse auth = null;
        if (emailChanged) {
            // l'ancien JWT porte l'ancien email (claim sub) : on invalide les sessions et on réémet
            refreshTokenService.revokeAll(me);
            auth = authService.issueTokens(me);
        }
        return new ProfileUpdateResponse(DtoMapper.toDto(me), auth);
    }

    /** Vérifie l'ancien mot de passe avant d'enregistrer le nouveau (encodé BCrypt). */
    @Transactional
    public void changePassword(ChangePasswordRequest req) {
        User me = currentUserService.currentUser();
        if (!passwordEncoder.matches(req.currentPassword(), me.getPassword())) {
            throw new BusinessRuleException("Ancien mot de passe incorrect");
        }
        if (passwordEncoder.matches(req.newPassword(), me.getPassword())) {
            throw new BusinessRuleException("Le nouveau mot de passe doit être différent de l'ancien");
        }
        me.setPassword(passwordEncoder.encode(req.newPassword()));
    }
}
