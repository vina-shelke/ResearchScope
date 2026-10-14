package com.researchscope.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "papers")
public class Paper {

    @Id
    @Column(length = 100)
    private String id;

    @Column(length = 255)
    private String doi;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(name = "abstract_text", columnDefinition = "TEXT")
    private String abstractText;

    @Column(name = "publication_year")
    private Integer publicationYear;

    @Column(name = "publication_date", length = 50)
    private String publicationDate;

    @Column(length = 255)
    private String venue;

    @Column(name = "citation_count")
    private Integer citationCount = 0;

    @Column(length = 100)
    private String source;

    @Column(name = "source_id", length = 255)
    private String sourceId;

    @Column(length = 500)
    private String url;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "is_open_access")
    private Boolean isOpenAccess = false;

    @Column(name = "pdf_url", length = 500)
    private String pdfUrl;

    @Column(name = "paper_type", length = 100)
    private String paperType;

    @Column(length = 255)
    private String publisher;

    @Column(name = "is_retracted")
    private Boolean isRetracted = false;

    @Column(name = "last_updated", insertable = false, updatable = false)
    private LocalDateTime lastUpdated;

    public Paper() {}

    public Paper(String id, String title, String doi, Integer publicationYear, String venue, String source) {
        this.id = id;
        this.title = title;
        this.doi = doi;
        this.publicationYear = publicationYear;
        this.venue = venue;
        this.source = source;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDoi() { return doi; }
    public void setDoi(String doi) { this.doi = doi; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAbstractText() { return abstractText; }
    public void setAbstractText(String abstractText) { this.abstractText = abstractText; }

    public Integer getPublicationYear() { return publicationYear; }
    public void setPublicationYear(Integer publicationYear) { this.publicationYear = publicationYear; }

    public String getPublicationDate() { return publicationDate; }
    public void setPublicationDate(String publicationDate) { this.publicationDate = publicationDate; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public Integer getCitationCount() { return citationCount; }
    public void setCitationCount(Integer citationCount) { this.citationCount = citationCount; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getSourceId() { return sourceId; }
    public void setSourceId(String sourceId) { this.sourceId = sourceId; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public Boolean getIsOpenAccess() { return isOpenAccess; }
    public void setIsOpenAccess(Boolean isOpenAccess) { this.isOpenAccess = isOpenAccess; }

    public String getPdfUrl() { return pdfUrl; }
    public void setPdfUrl(String pdfUrl) { this.pdfUrl = pdfUrl; }

    public String getPaperType() { return paperType; }
    public void setPaperType(String paperType) { this.paperType = paperType; }

    public String getPublisher() { return publisher; }
    public void setPublisher(String publisher) { this.publisher = publisher; }

    public Boolean getIsRetracted() { return isRetracted; }
    public void setIsRetracted(Boolean isRetracted) { this.isRetracted = isRetracted; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
}
