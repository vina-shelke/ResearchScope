package com.researchscope.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "source_records")
public class SourceRecord {

    @Id
    @Column(length = 100)
    private String id;

    @Column(name = "paper_id", length = 100, nullable = false)
    private String paperId;

    @Column(name = "provider_name", length = 50, nullable = false)
    private String providerName;

    @Column(name = "external_id", length = 255, nullable = false)
    private String externalId;

    @Column(length = 500)
    private String url;

    @Column(name = "fetched_at", insertable = false, updatable = false)
    private LocalDateTime fetchedAt;

    public SourceRecord() {}

    public SourceRecord(String id, String paperId, String providerName, String externalId, String url) {
        this.id = id;
        this.paperId = paperId;
        this.providerName = providerName;
        this.externalId = externalId;
        this.url = url;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPaperId() { return paperId; }
    public void setPaperId(String paperId) { this.paperId = paperId; }

    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }

    public String getExternalId() { return externalId; }
    public void setExternalId(String externalId) { this.externalId = externalId; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public LocalDateTime getFetchedAt() { return fetchedAt; }
}
