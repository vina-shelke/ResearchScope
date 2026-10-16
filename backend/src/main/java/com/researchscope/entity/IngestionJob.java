package com.researchscope.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "ingestion_jobs")
public class IngestionJob {

    @Id
    @Column(length = 100)
    private String id;

    @Column(name = "query_term", length = 255, nullable = false)
    private String queryTerm;

    @Column(length = 100, nullable = false)
    private String provider;

    @Column(name = "papers_found")
    private Integer papersFound = 0;

    @Column(name = "records_inserted")
    private Integer recordsInserted = 0;

    @Column(name = "duplicates_detected")
    private Integer duplicatesDetected = 0;

    @Column(length = 50)
    private String status = "COMPLETED";

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public IngestionJob() {}

    public IngestionJob(String id, String queryTerm, String provider, Integer papersFound, String status) {
        this.id = id;
        this.queryTerm = queryTerm;
        this.provider = provider;
        this.papersFound = papersFound != null ? papersFound : 0;
        this.status = status != null ? status : "COMPLETED";
    }

    public IngestionJob(String id, String queryTerm, String provider, Integer papersFound, Integer recordsInserted, Integer duplicatesDetected, String status, String errorMessage, LocalDateTime completedAt) {
        this.id = id;
        this.queryTerm = queryTerm;
        this.provider = provider;
        this.papersFound = papersFound != null ? papersFound : 0;
        this.recordsInserted = recordsInserted != null ? recordsInserted : 0;
        this.duplicatesDetected = duplicatesDetected != null ? duplicatesDetected : 0;
        this.status = status != null ? status : "COMPLETED";
        this.errorMessage = errorMessage;
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

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
