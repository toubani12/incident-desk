package ma.enset.incidentdesk.web;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.enset.incidentdesk.dto.ChangePasswordRequest;
import ma.enset.incidentdesk.dto.ProfileUpdateResponse;
import ma.enset.incidentdesk.dto.UpdateProfileRequest;
import ma.enset.incidentdesk.dto.UserDto;
import ma.enset.incidentdesk.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public UserDto me() {
        return profileService.me();
    }

    @PutMapping
    public ProfileUpdateResponse update(@Valid @RequestBody UpdateProfileRequest request) {
        return profileService.update(request);
    }

    @PutMapping("/password")
    public ResponseEntity<Map<String, String>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        profileService.changePassword(request);
        return ResponseEntity.ok(Map.of("message", "Mot de passe modifié avec succès"));
    }
}
