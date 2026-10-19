package com.researchscope.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "saved_comparisons")
public class SavedComparison {

    @Id
    @Column(length = 100)
    private String id;

    @Column(name = "user_id", length = 100, nullable = false)
    private String userId;

    @Column(nullable = false)
    private String title;

    @Column(name = "paper_ids_json", columnDefinition = "TEXT", nullable = false)
    private String paperIdsJson;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public SavedComparison() {}

    public SavedComparison(String id, String userId, String title, String paperIdsJson, String notes) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.paperIdsJson = paperIdsJson;
        this.notes = notes;
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
}
