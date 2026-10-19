package com.researchscope.dto;

import java.time.LocalDateTime;
import java.util.List;

public class SavedComparisonDTO {
    private String id;
    private String userId;
    private String title;
    private String paperIdsJson;
    private String notes;
    private LocalDateTime createdAt;
    private List<PaperDTO> papers;

    public SavedComparisonDTO() {}

    public SavedComparisonDTO(String id, String userId, String title, String paperIdsJson, String notes, LocalDateTime createdAt, List<PaperDTO> papers) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.paperIdsJson = paperIdsJson;
        this.notes = notes;
        this.createdAt = createdAt;
        this.papers = papers;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getPaperIdsJson() { return paperIdsJson; }
    public void setPaperIdsJson(String paperIdsJson) { this.paperIdsJson = paperIdsJson; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<PaperDTO> getPapers() { return papers; }
    public void setPapers(List<PaperDTO> papers) { this.papers = papers; }
}
