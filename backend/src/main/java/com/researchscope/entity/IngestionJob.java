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

    @Column(length = 50)
    private String status = "COMPLETED";

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public IngestionJob() {}

    public IngestionJob(String id, String queryTerm, String provider, Integer papersFound, String status) {
        this.id = id;
        this.queryTerm = queryTerm;
        this.provider = provider;
        this.papersFound = papersFound != null ? papersFound : 0;
        this.status = status != null ? status : "COMPLETED";
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getQueryTerm() { return queryTerm; }
    public void setQueryTerm(String queryTerm) { this.queryTerm = queryTerm; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public Integer getPapersFound() { return papersFound; }
    public void setPapersFound(Integer papersFound) { this.papersFound = papersFound; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
