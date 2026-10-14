package com.researchscope.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "institutions")
public class Institution {

    @Id
    @Column(length = 100)
    private String id;

    @Column(name = "openalex_id", length = 150)
    private String openAlexId;

    @Column(nullable = false)
    private String name;

    @Column(name = "country_code", length = 10)
    private String countryCode;

    @Column(name = "paper_count")
    private Integer paperCount = 0;

    @Column(name = "ror_id", length = 100)
    private String rorId;

    @Column(name = "institution_type", length = 100)
    private String institutionType;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public Institution() {}

    public Institution(String id, String openAlexId, String name, String countryCode) {
        this.id = id;
        this.openAlexId = openAlexId;
        this.name = name;
        this.countryCode = countryCode;
    }

    public Institution(String id, String openAlexId, String name, String countryCode, String rorId, String institutionType) {
        this.id = id;
        this.openAlexId = openAlexId;
        this.name = name;
        this.countryCode = countryCode;
        this.rorId = rorId;
        this.institutionType = institutionType;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getOpenAlexId() { return openAlexId; }
    public void setOpenAlexId(String openAlexId) { this.openAlexId = openAlexId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCountryCode() { return countryCode; }
    public void setCountryCode(String countryCode) { this.countryCode = countryCode; }

    public Integer getPaperCount() { return paperCount; }
    public void setPaperCount(Integer paperCount) { this.paperCount = paperCount; }

    public String getRorId() { return rorId; }
    public void setRorId(String rorId) { this.rorId = rorId; }

    public String getInstitutionType() { return institutionType; }
    public void setInstitutionType(String institutionType) { this.institutionType = institutionType; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
