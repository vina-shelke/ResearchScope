package com.researchscope.dto;

import java.util.List;

public class SourceEvidenceDTO {
    private String paperId;
    private String title;
    private List<String> authors;
    private Integer year;
    private String venue;
    private String doi;
    private String url;
    private String pdfUrl;
    private String section;
    private String passage;
    private String statementType;      // "DIRECTLY_REPORTED" or "AI_INFERRED"
    private String verificationStatus;  // "VERIFIED_GROUNDED", "INFERRED_SYNTHESIS", "INSUFFICIENT_EVIDENCE"

    public SourceEvidenceDTO() {}

    public SourceEvidenceDTO(String paperId, String title, List<String> authors, Integer year, String venue,
                             String doi, String url, String pdfUrl, String section, String passage,
                             String statementType, String verificationStatus) {
        this.paperId = paperId;
        this.title = title;
        this.authors = authors;
        this.year = year;
        this.venue = venue;
        this.doi = doi;
        this.url = url;
        this.pdfUrl = pdfUrl;
        this.section = section;
        this.passage = passage;
        this.statementType = statementType != null ? statementType : "DIRECTLY_REPORTED";
        this.verificationStatus = verificationStatus != null ? verificationStatus : "VERIFIED_GROUNDED";
    }

    public String getPaperId() { return paperId; }
    public void setPaperId(String paperId) { this.paperId = paperId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public List<String> getAuthors() { return authors; }
    public void setAuthors(List<String> authors) { this.authors = authors; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public String getDoi() { return doi; }
    public void setDoi(String doi) { this.doi = doi; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getPdfUrl() { return pdfUrl; }
    public void setPdfUrl(String pdfUrl) { this.pdfUrl = pdfUrl; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public String getPassage() { return passage; }
    public void setPassage(String passage) { this.passage = passage; }

    public String getStatementType() { return statementType; }
    public void setStatementType(String statementType) { this.statementType = statementType; }

    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }
}
