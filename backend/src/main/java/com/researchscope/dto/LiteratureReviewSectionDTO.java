package com.researchscope.dto;

import java.time.LocalDateTime;

public class LiteratureReviewSectionDTO {
    private String id;
    private String reviewId;
    private String sectionKey;
    private String sectionTitle;
    private Integer orderIndex;
    private String content;
    private Boolean isUserEdited;
    private LocalDateTime updatedAt;

    public LiteratureReviewSectionDTO() {}

    public LiteratureReviewSectionDTO(String id, String reviewId, String sectionKey, String sectionTitle,
                                      Integer orderIndex, String content, Boolean isUserEdited, LocalDateTime updatedAt) {
        this.id = id;
        this.reviewId = reviewId;
        this.sectionKey = sectionKey;
        this.sectionTitle = sectionTitle;
        this.orderIndex = orderIndex;
        this.content = content;
        this.isUserEdited = isUserEdited;
        this.updatedAt = updatedAt;
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
