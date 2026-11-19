package com.researchscope.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "literature_review_sections")
public class LiteratureReviewSection {

    @Id
    @Column(length = 100)
    private String id;

    @Column(name = "review_id", length = 100, nullable = false)
    private String reviewId;

    @Column(name = "section_key", length = 50, nullable = false)
    private String sectionKey;

    @Column(name = "section_title", length = 200, nullable = false)
    private String sectionTitle;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    @Column(name = "is_user_edited")
    private Boolean isUserEdited = false;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public LiteratureReviewSection() {}

    public LiteratureReviewSection(String id, String reviewId, String sectionKey, String sectionTitle, Integer orderIndex, String content) {
        this.id = id;
        this.reviewId = reviewId;
        this.sectionKey = sectionKey;
        this.sectionTitle = sectionTitle;
        this.orderIndex = orderIndex;
        this.content = content;
        this.isUserEdited = false;
        this.updatedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getReviewId() { return reviewId; }
    public void setReviewId(String reviewId) { this.reviewId = reviewId; }

    public String getSectionKey() { return sectionKey; }
    public void setSectionKey(String sectionKey) { this.sectionKey = sectionKey; }

    public String getSectionTitle() { return sectionTitle; }
    public void setSectionTitle(String sectionTitle) { this.sectionTitle = sectionTitle; }

    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Boolean getIsUserEdited() { return isUserEdited; }
    public void setIsUserEdited(Boolean isUserEdited) { this.isUserEdited = isUserEdited; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
