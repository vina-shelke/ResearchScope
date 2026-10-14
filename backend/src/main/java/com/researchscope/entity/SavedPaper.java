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

    @Column(name = "paper_id", length = 100, nullable = false, unique = true)
    private String paperId;

    @Column(name = "collection_name", length = 150)
    private String collectionName = "Favorites";

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "saved_at", insertable = false, updatable = false)
    private LocalDateTime savedAt;

    public SavedPaper() {}

    public SavedPaper(String id, String paperId, String collectionName, String notes) {
        this.id = id;
        this.paperId = paperId;
        this.collectionName = (collectionName != null && !collectionName.isBlank()) ? collectionName : "Favorites";
        this.notes = notes;
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
}
