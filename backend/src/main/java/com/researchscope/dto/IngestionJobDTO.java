package com.researchscope.dto;

import java.time.LocalDateTime;

public class IngestionJobDTO {
    private String id;
    private String queryTerm;
    private String provider;
    private Integer papersFound = 0;
    private Integer recordsInserted = 0;
    private Integer duplicatesDetected = 0;
    private String status;
    private String errorMessage;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;

    public IngestionJobDTO() {}

    public IngestionJobDTO(String id, String queryTerm, String provider, Integer papersFound, Integer recordsInserted, Integer duplicatesDetected, String status, String errorMessage, LocalDateTime createdAt, LocalDateTime completedAt) {
        this.id = id;
        this.queryTerm = queryTerm;
        this.provider = provider;
        this.papersFound = papersFound != null ? papersFound : 0;
        this.recordsInserted = recordsInserted != null ? recordsInserted : 0;
        this.duplicatesDetected = duplicatesDetected != null ? duplicatesDetected : 0;
        this.status = status;
        this.errorMessage = errorMessage;
        this.createdAt = createdAt;
        this.completedAt = completedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getQueryTerm() { return queryTerm; }
    public void setQueryTerm(String queryTerm) { this.queryTerm = queryTerm; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public Integer getPapersFound() { return papersFound; }
    public void setPapersFound(Integer papersFound) { this.papersFound = papersFound; }

    public Integer getRecordsInserted() { return recordsInserted; }
    public void setRecordsInserted(Integer recordsInserted) { this.recordsInserted = recordsInserted; }

    public Integer getDuplicatesDetected() { return duplicatesDetected; }
    public void setDuplicatesDetected(Integer duplicatesDetected) { this.duplicatesDetected = duplicatesDetected; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
