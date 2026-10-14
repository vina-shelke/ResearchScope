package com.researchscope.dto;

import java.time.LocalDateTime;

public class SavedPaperDTO {
    private String id;
    private String paperId;
    private String collectionName;
    private String notes;
    private LocalDateTime savedAt;
    private PaperDTO paper;

    public SavedPaperDTO() {}

    public SavedPaperDTO(String id, String paperId, String collectionName, String notes, LocalDateTime savedAt, PaperDTO paper) {
        this.id = id;
        this.paperId = paperId;
        this.collectionName = collectionName;
        this.notes = notes;
        this.savedAt = savedAt;
        this.paper = paper;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPaperId() { return paperId; }
    public void setPaperId(String paperId) { this.paperId = paperId; }

    public String getCollectionName() { return collectionName; }
    public void setCollectionName(String collectionName) { this.collectionName = collectionName; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getSavedAt() { return savedAt; }
    public void setSavedAt(LocalDateTime savedAt) { this.savedAt = savedAt; }

    public PaperDTO getPaper() { return paper; }
    public void setPaper(PaperDTO paper) { this.paper = paper; }
}
