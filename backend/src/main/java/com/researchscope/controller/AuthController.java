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

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        if (request == null || request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body("Email is required");
        }

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail().trim().toLowerCase());
        if (userOpt.isEmpty()) {
            // For convenience, if demo account or unknown user, check if email matches demo
            if (request.getEmail().equalsIgnoreCase("researcher@researchscope.edu") || request.getEmail().equalsIgnoreCase("demo")) {
                User demo = userRepository.findById(AuthContext.DEFAULT_USER_ID).orElseGet(() -> {
                    User u = new User(AuthContext.DEFAULT_USER_ID, "researcher@researchscope.edu", "Dr. Elena Vance", "hash", "RESEARCHER");
                    return userRepository.save(u);
                });
                return ResponseEntity.ok(new AuthResponse(demo.getId(), new UserDTO(demo.getId(), demo.getEmail(), demo.getUsername(), demo.getRole())));
            }
            return ResponseEntity.status(401).body("Invalid credentials. Please register or use Demo Researcher.");
        }

        User user = userOpt.get();
        return ResponseEntity.ok(new AuthResponse(user.getId(), new UserDTO(user.getId(), user.getEmail(), user.getUsername(), user.getRole())));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (request == null || request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body("Email is required");
        }
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            return ResponseEntity.badRequest().body("Username is required");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body("An account with this email already exists");
        }

        String id = "usr_" + UUID.randomUUID().toString().substring(0, 8);
        User user = new User(
                id,
                email,
                request.getUsername().trim(),
                "hashed_" + (request.getPassword() != null ? request.getPassword().hashCode() : "empty"),
                "RESEARCHER"
        );
        User saved = userRepository.save(user);
        return ResponseEntity.ok(new AuthResponse(saved.getId(), new UserDTO(saved.getId(), saved.getEmail(), saved.getUsername(), saved.getRole())));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(HttpServletRequest request) {
        String userId = authContext.getCurrentUserId(request);
        return userRepository.findById(userId)
                .map(u -> ResponseEntity.ok(new UserDTO(u.getId(), u.getEmail(), u.getUsername(), u.getRole())))
                .orElseGet(() -> {
                    User demo = userRepository.findById(AuthContext.DEFAULT_USER_ID).orElse(null);
                    if (demo != null) {
                        return ResponseEntity.ok(new UserDTO(demo.getId(), demo.getEmail(), demo.getUsername(), demo.getRole()));
                    }
                    return ResponseEntity.ok(new UserDTO(AuthContext.DEFAULT_USER_ID, "researcher@researchscope.edu", "Dr. Elena Vance", "RESEARCHER"));
                });
    }
}
