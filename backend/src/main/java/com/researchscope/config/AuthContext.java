package com.researchscope.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

@Component
public class AuthContext {

    public static final String DEFAULT_USER_ID = "user_demo";

    public String getCurrentUserId(HttpServletRequest request) {
        if (request == null) {
            return DEFAULT_USER_ID;
        }

        String userIdHeader = request.getHeader("X-User-Id");
        if (userIdHeader != null && !userIdHeader.isBlank()) {
            return userIdHeader.trim();
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            if (token.startsWith("user_")) {
                return token;
            }
        }

        return DEFAULT_USER_ID;
    }
}
