package com.researchscope.dto;

public class RegisterRequest {
    private String email;
    private String phoneNumber;
    private String username; // Full Name / Display Name
    private String password;
    private String profession; // e.g. "Working Professional", "Student", "PhD Scholar", "Professor"
    private String institution; // University or Organization
    private String department; // Research field / Department

    public RegisterRequest() {}

    public RegisterRequest(String email, String username, String password) {
        this.email = email;
        this.username = username;
        this.password = password;
    }

    public RegisterRequest(String email, String phoneNumber, String username, String password, String profession, String institution, String department) {
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.username = username;
        this.password = password;
        this.profession = profession;
        this.institution = institution;
        this.department = department;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getProfession() { return profession; }
    public void setProfession(String profession) { this.profession = profession; }

    public String getInstitution() { return institution; }
    public void setInstitution(String institution) { this.institution = institution; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
}
