package com.researchscope.dto;

import java.time.LocalDateTime;

public class SavedGapAnalysisDTO {
    private String id;
    private String userId;
    private String topicQuery;
    private String gapsDataJson;
    private LocalDateTime createdAt;

    public SavedGapAnalysisDTO() {}

    public SavedGapAnalysisDTO(String id, String userId, String topicQuery, String gapsDataJson, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.topicQuery = topicQuery;
        this.gapsDataJson = gapsDataJson;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getTopicQuery() { return topicQuery; }
    public void setTopicQuery(String topicQuery) { this.topicQuery = topicQuery; }

    public String getGapsDataJson() { return gapsDataJson; }
    public void setGapsDataJson(String gapsDataJson) { this.gapsDataJson = gapsDataJson; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
