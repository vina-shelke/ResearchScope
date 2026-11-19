package com.researchscope.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "literature_reviews")
public class LiteratureReview {

    @Id
    @Column(length = 100)
    private String id;

    @Column(name = "user_id", length = 100, nullable = false)
    private String userId = "user_demo";

    @Column(name = "project_id", length = 100)
    private String projectId;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(name = "topic_query", length = 255)
    private String topicQuery;

    @Column(length = 50)
    private String style = "ACADEMIC"; // "ACADEMIC", "SIMPLE", "TECHNICAL"

    @Column(name = "paper_ids_json", columnDefinition = "TEXT")
    private String paperIdsJson;

    @Column(length = 50)
    private String status = "DRAFT"; // "DRAFT", "COMPLETED"

    @Column(name = "full_draft_markdown", columnDefinition = "LONGTEXT")
    private String fullDraftMarkdown;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public LiteratureReview() {}

    public LiteratureReview(String id, String userId, String projectId, String title, String topicQuery, String style, String paperIdsJson) {
        this.id = id;
        this.userId = userId != null ? userId : "user_demo";
        this.projectId = projectId;
        this.title = title;
        this.topicQuery = topicQuery;
        this.style = style != null ? style : "ACADEMIC";
        this.paperIdsJson = paperIdsJson;
        this.status = "DRAFT";
        this.updatedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getTopicQuery() { return topicQuery; }
    public void setTopicQuery(String topicQuery) { this.topicQuery = topicQuery; }

    public String getStyle() { return style; }
    public void setStyle(String style) { this.style = style; }

    public String getPaperIdsJson() { return paperIdsJson; }
    public void setPaperIdsJson(String paperIdsJson) { this.paperIdsJson = paperIdsJson; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getFullDraftMarkdown() { return fullDraftMarkdown; }
    public void setFullDraftMarkdown(String fullDraftMarkdown) { this.fullDraftMarkdown = fullDraftMarkdown; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
