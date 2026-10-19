package com.researchscope.dto;

import java.time.LocalDateTime;

public class WorkspacePaperDTO {
    private String id;
    private String userId;
    private String paperId;
    private String collectionName;
    private String projectId;
    private String readingStatus;
    private String tags;
    private String notes;
    private LocalDateTime savedAt;
    private PaperDTO paper;

    public WorkspacePaperDTO() {}

    public WorkspacePaperDTO(String id, String userId, String paperId, String collectionName, String projectId, String readingStatus, String tags, String notes, LocalDateTime savedAt, PaperDTO paper) {
        this.id = id;
        this.userId = userId;
        this.paperId = paperId;
        this.collectionName = collectionName;
        this.projectId = projectId;
        this.readingStatus = readingStatus;
        this.tags = tags;
        this.notes = notes;
        this.savedAt = savedAt;
        this.paper = paper;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getPaperId() { return paperId; }
    public void setPaperId(String paperId) { this.paperId = paperId; }

    public String getCollectionName() { return collectionName; }
    public void setCollectionName(String collectionName) { this.collectionName = collectionName; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public String getReadingStatus() { return readingStatus; }
    public void setReadingStatus(String readingStatus) { this.readingStatus = readingStatus; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getSavedAt() { return savedAt; }
    public void setSavedAt(LocalDateTime savedAt) { this.savedAt = savedAt; }

    public PaperDTO getPaper() { return paper; }
    public void setPaper(PaperDTO paper) { this.paper = paper; }
}
