package com.researchscope.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "saved_gap_analyses")
public class SavedGapAnalysis {

    @Id
    @Column(length = 100)
    private String id;

    @Column(name = "user_id", length = 100, nullable = false)
    private String userId;

    @Column(name = "topic_query", nullable = false)
    private String topicQuery;

    @Column(name = "gaps_data_json", columnDefinition = "LONGTEXT", nullable = false)
    private String gapsDataJson;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public SavedGapAnalysis() {}

    public SavedGapAnalysis(String id, String userId, String topicQuery, String gapsDataJson) {
        this.id = id;
        this.userId = userId;
        this.topicQuery = topicQuery;
        this.gapsDataJson = gapsDataJson;
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
}
