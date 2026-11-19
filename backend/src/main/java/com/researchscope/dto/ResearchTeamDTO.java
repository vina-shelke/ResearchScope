package com.researchscope.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ResearchTeamDTO {
    private Long id;
    private String name;
    private String description;
    private String institution;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String currentUserRole;
    private List<TeamMemberDTO> members;
    private List<TeamPaperDTO> papers;
    private long totalPapers;
    private long reviewedPapers;
    private long inProgressPapers;
    private long toReadPapers;

    public ResearchTeamDTO() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getInstitution() {
        return institution;
    }

    public void setInstitution(String institution) {
        this.institution = institution;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getCurrentUserRole() {
        return currentUserRole;
    }

    public void setCurrentUserRole(String currentUserRole) {
        this.currentUserRole = currentUserRole;
    }

    public List<TeamMemberDTO> getMembers() {
        return members;
    }

    public void setMembers(List<TeamMemberDTO> members) {
        this.members = members;
    }

    public List<TeamPaperDTO> getPapers() {
        return papers;
    }

    public void setPapers(List<TeamPaperDTO> papers) {
        this.papers = papers;
    }

    public long getTotalPapers() {
        return totalPapers;
    }

    public void setTotalPapers(long totalPapers) {
        this.totalPapers = totalPapers;
    }

    public long getReviewedPapers() {
        return reviewedPapers;
    }

    public void setReviewedPapers(long reviewedPapers) {
        this.reviewedPapers = reviewedPapers;
    }

    public long getInProgressPapers() {
        return inProgressPapers;
    }

    public void setInProgressPapers(long inProgressPapers) {
        this.inProgressPapers = inProgressPapers;
    }

    public long getToReadPapers() {
        return toReadPapers;
    }

    public void setToReadPapers(long toReadPapers) {
        this.toReadPapers = toReadPapers;
    }
}
