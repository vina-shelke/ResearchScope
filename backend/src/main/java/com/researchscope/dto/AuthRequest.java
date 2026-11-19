package com.researchscope.dto;

public class AuthRequest {
    private String identifier; // Email ID or Mobile Number
    private String email;
    private String password;

    public AuthRequest() {}

    public AuthRequest(String email, String password) {
        this.identifier = email;
        this.email = email;
        this.password = password;
    }

    public String getIdentifier() {
        if (identifier != null && !identifier.isBlank()) {
            return identifier.trim();
        }
        return email != null ? email.trim() : "";
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
        if (this.email == null) {
            this.email = identifier;
        }
    }

    public String getEmail() { return email; }
    public void setEmail(String email) {
        this.email = email;
        if (this.identifier == null) {
            this.identifier = email;
        }
    }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
