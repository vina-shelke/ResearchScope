package com.researchscope.dto;

import java.time.LocalDateTime;

public class TeamMemberDTO {
    private Long id;
    private Long teamId;
    private String userId;
    private String email;
    private String name;
    private String role;
    private LocalDateTime joinedAt;
    private long assignedPapersCount;

    public TeamMemberDTO() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }

    public long getAssignedPapersCount() {
        return assignedPapersCount;
    }

    public void setAssignedPapersCount(long assignedPapersCount) {
        this.assignedPapersCount = assignedPapersCount;
    }
}
