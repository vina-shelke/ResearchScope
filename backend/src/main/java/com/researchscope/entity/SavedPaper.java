package com.researchscope.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "saved_papers")
public class SavedPaper {

    @Id
    @Column(length = 100)
    private String id;

    @Column(name = "user_id", length = 100)
    private String userId = "user_demo";

    @Column(name = "paper_id", length = 100, nullable = false)
    private String paperId;

    @Column(name = "collection_name", length = 150)
    private String collectionName = "Favorites";

    @Column(name = "project_id", length = 100)
    private String projectId;

    @Column(name = "reading_status", length = 50)
    private String readingStatus = "UNREAD";

    @Column(length = 500)
    private String tags;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "saved_at", insertable = false, updatable = false)
    private LocalDateTime savedAt;

    public SavedPaper() {}

    public SavedPaper(String id, String paperId, String collectionName, String notes) {
        this.id = id;
        this.userId = "user_demo";
        this.paperId = paperId;
        this.collectionName = (collectionName != null && !collectionName.isBlank()) ? collectionName : "Favorites";
        this.notes = notes;
        this.readingStatus = "UNREAD";
    }

    public SavedPaper(String id, String userId, String paperId, String collectionName, String projectId, String readingStatus, String tags, String notes) {
        this.id = id;
        this.userId = (userId != null && !userId.isBlank()) ? userId : "user_demo";
        this.paperId = paperId;
        this.collectionName = (collectionName != null && !collectionName.isBlank()) ? collectionName : "Favorites";
        this.projectId = projectId;
        this.readingStatus = (readingStatus != null && !readingStatus.isBlank()) ? readingStatus : "UNREAD";
        this.tags = tags;
        this.notes = notes;
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
}
