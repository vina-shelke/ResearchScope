package com.researchscope.dto;

import java.util.List;
import java.util.Map;

public class LandscapeSummaryDTO {
    private String query;
    private long totalPapers;
    private long totalAuthors;
    private long totalInstitutions;
    private long totalCountries;

    private List<Map<String, Object>> publicationTrend;
    private List<TopicDTO> topTopics;
    private List<PaperDTO> topCitedPapers;

    public LandscapeSummaryDTO() {}

    public LandscapeSummaryDTO(String query, long totalPapers, long totalAuthors, long totalInstitutions, long totalCountries, List<Map<String, Object>> publicationTrend, List<TopicDTO> topTopics, List<PaperDTO> topCitedPapers) {
        this.query = query;
        this.totalPapers = totalPapers;
        this.totalAuthors = totalAuthors;
        this.totalInstitutions = totalInstitutions;
        this.totalCountries = totalCountries;
        this.publicationTrend = publicationTrend;
        this.topTopics = topTopics;
        this.topCitedPapers = topCitedPapers;
    }

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }

    public long getTotalPapers() { return totalPapers; }
    public void setTotalPapers(long totalPapers) { this.totalPapers = totalPapers; }

    public long getTotalAuthors() { return totalAuthors; }
    public void setTotalAuthors(long totalAuthors) { this.totalAuthors = totalAuthors; }

    public long getTotalInstitutions() { return totalInstitutions; }
    public void setTotalInstitutions(long totalInstitutions) { this.totalInstitutions = totalInstitutions; }

    public long getTotalCountries() { return totalCountries; }
    public void setTotalCountries(long totalCountries) { this.totalCountries = totalCountries; }

    public List<Map<String, Object>> getPublicationTrend() { return publicationTrend; }
    public void setPublicationTrend(List<Map<String, Object>> publicationTrend) { this.publicationTrend = publicationTrend; }

    public List<TopicDTO> getTopTopics() { return topTopics; }
    public void setTopTopics(List<TopicDTO> topTopics) { this.topTopics = topTopics; }

    public List<PaperDTO> getTopCitedPapers() { return topCitedPapers; }
    public void setTopCitedPapers(List<PaperDTO> topCitedPapers) { this.topCitedPapers = topCitedPapers; }
}
