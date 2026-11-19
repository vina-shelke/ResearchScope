package com.researchscope.controller;

import com.researchscope.config.AuthContext;
import com.researchscope.dto.AuthRequest;
import com.researchscope.dto.AuthResponse;
import com.researchscope.dto.RegisterRequest;
import com.researchscope.dto.UserDTO;
import com.researchscope.entity.User;
import com.researchscope.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final AuthContext authContext;

    public AuthController(UserRepository userRepository, AuthContext authContext) {
        this.userRepository = userRepository;
        this.authContext = authContext;
    }

    private UserDTO toDTO(User u) {
        return new UserDTO(
                u.getId(),
                u.getEmail(),
                u.getPhoneNumber(),
                u.getUsername(),
                u.getRole(),
                u.getProfession() != null ? u.getProfession() : "Researcher",
                u.getInstitution() != null ? u.getInstitution() : "Academic Institution",
                u.getDepartment() != null ? u.getDepartment() : "Scholarly Research"
        );
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        if (request == null) {
            return ResponseEntity.badRequest().body("Login request is required");
        }

        String identifier = request.getIdentifier();
        if (identifier == null || identifier.isBlank()) {
            return ResponseEntity.badRequest().body("Email or mobile number is required");
        }

        String cleanIdentifier = identifier.trim();

        // 1. Try finding by email
        Optional<User> userOpt = userRepository.findByEmail(cleanIdentifier.toLowerCase());

        // 2. If not found by email, try finding by phone number
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByPhoneNumber(cleanIdentifier);
        }

        // 3. Fallback for demo credentials
        if (userOpt.isEmpty()) {
            if (cleanIdentifier.equalsIgnoreCase("researcher@researchscope.edu") || 
                cleanIdentifier.equalsIgnoreCase("demo") || 
                cleanIdentifier.equalsIgnoreCase("demo@researchscope.com")) {
                User demo = userRepository.findById(AuthContext.DEFAULT_USER_ID).orElseGet(() -> {
                    User u = new User(
                            AuthContext.DEFAULT_USER_ID, 
                            "researcher@researchscope.edu", 
                            "+1 (555) 019-2831",
                            "Dr. Elena Vance", 
                            "demo_hash", 
                            "RESEARCHER",
                            "Lead Research Scientist",
                            "Stanford University",
                            "Computer Science & AI"
                    );
                    return userRepository.save(u);
                });
                return ResponseEntity.ok(new AuthResponse(demo.getId(), toDTO(demo)));
            }
            return ResponseEntity.status(401).body("Invalid credentials. No account found for '" + cleanIdentifier + "'.");
        }

        User user = userOpt.get();
        return ResponseEntity.ok(new AuthResponse(user.getId(), toDTO(user)));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (request == null) {
            return ResponseEntity.badRequest().body("Registration data is required");
        }

        String email = (request.getEmail() != null) ? request.getEmail().trim().toLowerCase() : "";
        String phone = (request.getPhoneNumber() != null) ? request.getPhoneNumber().trim() : "";

        if (email.isBlank() && phone.isBlank()) {
            return ResponseEntity.badRequest().body("Either email address or mobile number is required");
        }

        // Check if email already exists
        if (!email.isBlank() && userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body("An account with email '" + email + "' already exists. Please log in.");
        }

        // Check if phone number already exists
        if (!phone.isBlank() && userRepository.existsByPhoneNumber(phone)) {
            return ResponseEntity.badRequest().body("An account with mobile number '" + phone + "' already exists. Please log in.");
        }

        // If email is empty, generate an internal email identifier from phone
        String finalEmail = !email.isBlank() ? email : ("phone_" + phone.replaceAll("[^0-9]", "") + "@user.researchscope.edu");
        String username = (request.getUsername() != null && !request.getUsername().isBlank())
                ? request.getUsername().trim()
                : (!email.isBlank() ? email.split("@")[0] : "Researcher");

        String profession = (request.getProfession() != null && !request.getProfession().isBlank())
                ? request.getProfession().trim()
                : "Working Professional";

        String institution = (request.getInstitution() != null && !request.getInstitution().isBlank())
                ? request.getInstitution().trim()
                : "Academic / Industry Organization";

        String department = (request.getDepartment() != null && !request.getDepartment().isBlank())
                ? request.getDepartment().trim()
                : "Research & Development";

        String id = "usr_" + UUID.randomUUID().toString().substring(0, 8);
        User user = new User(
                id,
                finalEmail,
                !phone.isBlank() ? phone : null,
                username,
                "hashed_" + (request.getPassword() != null ? request.getPassword().hashCode() : "default"),
                "RESEARCHER",
                profession,
                institution,
                department
        );

        User saved = userRepository.save(user);
        return ResponseEntity.ok(new AuthResponse(saved.getId(), toDTO(saved)));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(HttpServletRequest request) {
        String userId = authContext.getCurrentUserId(request);
        return userRepository.findById(userId)
                .map(u -> ResponseEntity.ok(toDTO(u)))
                .orElseGet(() -> {
                    User demo = userRepository.findById(AuthContext.DEFAULT_USER_ID).orElseGet(() -> {
                        User u = new User(
                                AuthContext.DEFAULT_USER_ID, 
                                "researcher@researchscope.edu", 
                                "+1 (555) 019-2831",
                                "Dr. Elena Vance", 
                                "demo_hash", 
                                "RESEARCHER",
                                "Lead Research Scientist",
                                "Stanford University",
                                "Computer Science & AI"
                        );
                        return userRepository.save(u);
                    });
                    return ResponseEntity.ok(toDTO(demo));
                });
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody RegisterRequest update, HttpServletRequest request) {
        String userId = authContext.getCurrentUserId(request);
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User session not found");
        }

        User u = userOpt.get();
        if (update.getUsername() != null && !update.getUsername().isBlank()) {
            u.setUsername(update.getUsername().trim());
        }
        if (update.getProfession() != null && !update.getProfession().isBlank()) {
            u.setProfession(update.getProfession().trim());
        }
        if (update.getInstitution() != null && !update.getInstitution().isBlank()) {
            u.setInstitution(update.getInstitution().trim());
        }
        if (update.getDepartment() != null && !update.getDepartment().isBlank()) {
            u.setDepartment(update.getDepartment().trim());
        }
        if (update.getPhoneNumber() != null && !update.getPhoneNumber().isBlank()) {
            u.setPhoneNumber(update.getPhoneNumber().trim());
        }

        User saved = userRepository.save(u);
        return ResponseEntity.ok(toDTO(saved));
    }
}
