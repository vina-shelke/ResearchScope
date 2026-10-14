package com.researchscope.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class TopicAnalyticsDTO {
    private String topicId;
    private String topicName;
    private String category;
    private Integer totalPapers = 0;
    private Integer totalCitations = 0;
    private Double avgCitationsPerPaper = 0.0;
    private List<Map<String, Object>> publicationTrend = new ArrayList<>();
    private List<AuthorDTO> topAuthors = new ArrayList<>();
    private List<InstitutionDTO> topInstitutions = new ArrayList<>();

    public TopicAnalyticsDTO() {}

    public String getTopicId() { return topicId; }
    public void setTopicId(String topicId) { this.topicId = topicId; }

    public String getTopicName() { return topicName; }
    public void setTopicName(String topicName) { this.topicName = topicName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getTotalPapers() { return totalPapers; }
    public void setTotalPapers(Integer totalPapers) { this.totalPapers = totalPapers; }

    public Integer getTotalCitations() { return totalCitations; }
    public void setTotalCitations(Integer totalCitations) { this.totalCitations = totalCitations; }

    public Double getAvgCitationsPerPaper() { return avgCitationsPerPaper; }
    public void setAvgCitationsPerPaper(Double avgCitationsPerPaper) { this.avgCitationsPerPaper = avgCitationsPerPaper; }

    public List<Map<String, Object>> getPublicationTrend() { return publicationTrend; }
    public void setPublicationTrend(List<Map<String, Object>> publicationTrend) { this.publicationTrend = publicationTrend; }

    public List<AuthorDTO> getTopAuthors() { return topAuthors; }
    public void setTopAuthors(List<AuthorDTO> topAuthors) { this.topAuthors = topAuthors; }

    public List<InstitutionDTO> getTopInstitutions() { return topInstitutions; }
    public void setTopInstitutions(List<InstitutionDTO> topInstitutions) { this.topInstitutions = topInstitutions; }
}
