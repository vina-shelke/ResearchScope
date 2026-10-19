package com.researchscope.dto;

import java.time.LocalDateTime;

public class SavedSearchDTO {
    private String id;
    private String userId;
    private String queryText;
    private String filtersJson;
    private LocalDateTime createdAt;

    public SavedSearchDTO() {}

    public SavedSearchDTO(String id, String userId, String queryText, String filtersJson, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.queryText = queryText;
        this.filtersJson = filtersJson;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getQueryText() { return queryText; }
    public void setQueryText(String queryText) { this.queryText = queryText; }

    public String getFiltersJson() { return filtersJson; }
    public void setFiltersJson(String filtersJson) { this.filtersJson = filtersJson; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
