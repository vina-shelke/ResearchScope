package com.researchscope.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "team_papers")
public class TeamPaper {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "team_id", nullable = false)
    private Long teamId;

    @Column(name = "paper_id", nullable = false, length = 100)
    private String paperId;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(length = 500)
    private String authors;

    @Column(name = "publication_year")
    private Integer publicationYear;

    @Column(length = 255)
    private String venue;

    @Column(length = 100)
    private String doi;

    @Column(nullable = false, length = 50)
    private String status = "TO_READ"; // TO_READ, IN_PROGRESS, REVIEWED, REJECTED

    @Column(name = "assigned_to_user_id", length = 100)
    private String assignedToUserId;

    @Column(name = "assigned_to_name", length = 100)
    private String assignedToName;

    @Column(length = 50)
    private String consensus = "PENDING"; // AGREE, DISAGREE, NEUTRAL, PENDING

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "added_by", nullable = false, length = 100)
    private String addedBy;

    @Column(name = "added_at", nullable = false)
    private LocalDateTime addedAt = LocalDateTime.now();

    public TeamPaper() {}

    public TeamPaper(Long teamId, String paperId, String title, String authors, Integer publicationYear, String venue, String doi, String addedBy) {
        this.teamId = teamId;
        this.paperId = paperId;
        this.title = title;
        this.authors = authors;
        this.publicationYear = publicationYear;
        this.venue = venue;
        this.doi = doi;
        this.addedBy = addedBy;
        this.status = "TO_READ";
        this.consensus = "PENDING";
        this.addedAt = LocalDateTime.now();
    }

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

    public String getPaperId() {
        return paperId;
    }

    public void setPaperId(String paperId) {
        this.paperId = paperId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAuthors() {
        return authors;
    }

    public void setAuthors(String authors) {
        this.authors = authors;
    }

    public Integer getPublicationYear() {
        return publicationYear;
    }

    public void setPublicationYear(Integer publicationYear) {
        this.publicationYear = publicationYear;
    }

    public String getVenue() {
        return venue;
    }

    public void setVenue(String venue) {
        this.venue = venue;
    }

    public String getDoi() {
        return doi;
    }

    public void setDoi(String doi) {
        this.doi = doi;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAssignedToUserId() {
        return assignedToUserId;
    }

    public void setAssignedToUserId(String assignedToUserId) {
        this.assignedToUserId = assignedToUserId;
    }

    public String getAssignedToName() {
        return assignedToName;
    }

    public void setAssignedToName(String assignedToName) {
        this.assignedToName = assignedToName;
    }

    public String getConsensus() {
        return consensus;
    }

    public void setConsensus(String consensus) {
        this.consensus = consensus;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getAddedBy() {
        return addedBy;
    }

    public void setAddedBy(String addedBy) {
        this.addedBy = addedBy;
    }

    public LocalDateTime getAddedAt() {
        return addedAt;
    }

    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }
}
