package com.researchscope.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "authors")
public class Author {

    @Id
    @Column(length = 100)
    private String id;

    @Column(name = "openalex_id", length = 150)
    private String openAlexId;

    @Column(nullable = false)
    private String name;

    @Column(name = "paper_count")
    private Integer paperCount = 0;

    @Column(name = "citation_count")
    private Integer citationCount = 0;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public Author() {}

    public Author(String id, String openAlexId, String name) {
        this.id = id;
        this.openAlexId = openAlexId;
        this.name = name;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getOpenAlexId() { return openAlexId; }
    public void setOpenAlexId(String openAlexId) { this.openAlexId = openAlexId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getPaperCount() { return paperCount; }
    public void setPaperCount(Integer paperCount) { this.paperCount = paperCount; }

    public Integer getCitationCount() { return citationCount; }
    public void setCitationCount(Integer citationCount) { this.citationCount = citationCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
