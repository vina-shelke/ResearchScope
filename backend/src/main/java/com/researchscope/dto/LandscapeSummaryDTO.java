package com.researchscope.dto;

import java.util.List;
import java.util.Map;

public class LandscapeSummaryDTO {
    private String query;
    private long totalPapers;
    private long totalAuthors;
    private long totalInstitutions;
    private long totalCountries;
    private long totalCitations;
    private long openAccessPapersCount;

    private List<Map<String, Object>> publicationTrend;
    private List<TopicDTO> topTopics;
    private List<TopicDTO> emergingTopics;
    private List<InstitutionDTO> topInstitutions;
    private List<Map<String, Object>> countriesDistribution;
    private List<PaperDTO> topCitedPapers;

    // Feature 4: Trend and Emerging Analytics
    private List<Map<String, Object>> topicTrendsOverTime;
    private List<Map<String, Object>> emergingKeywords;
    private Map<String, Object> collaborationStats;
    private List<PaperDTO> recentlyPublishedPapers;
    private long uniquePublicationsCount;
    private long rawRecordsRetrievedCount;

    public LandscapeSummaryDTO() {}

    public LandscapeSummaryDTO(
            String query,
            long totalPapers,
            long totalAuthors,
            long totalInstitutions,
            long totalCountries,
            long totalCitations,
            long openAccessPapersCount,
            List<Map<String, Object>> publicationTrend,
            List<TopicDTO> topTopics,
            List<TopicDTO> emergingTopics,
            List<InstitutionDTO> topInstitutions,
            List<Map<String, Object>> countriesDistribution,
            List<PaperDTO> topCitedPapers,
            List<Map<String, Object>> topicTrendsOverTime,
            List<Map<String, Object>> emergingKeywords,
            Map<String, Object> collaborationStats,
            List<PaperDTO> recentlyPublishedPapers,
            long uniquePublicationsCount,
            long rawRecordsRetrievedCount
    ) {
        this.query = query;
        this.totalPapers = totalPapers;
        this.totalAuthors = totalAuthors;
        this.totalInstitutions = totalInstitutions;
        this.totalCountries = totalCountries;
        this.totalCitations = totalCitations;
        this.openAccessPapersCount = openAccessPapersCount;
        this.publicationTrend = publicationTrend;
        this.topTopics = topTopics;
        this.emergingTopics = emergingTopics;
        this.topInstitutions = topInstitutions;
        this.countriesDistribution = countriesDistribution;
        this.topCitedPapers = topCitedPapers;
        this.topicTrendsOverTime = topicTrendsOverTime;
        this.emergingKeywords = emergingKeywords;
        this.collaborationStats = collaborationStats;
        this.recentlyPublishedPapers = recentlyPublishedPapers;
        this.uniquePublicationsCount = uniquePublicationsCount;
        this.rawRecordsRetrievedCount = rawRecordsRetrievedCount;
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

    public long getTotalCitations() { return totalCitations; }
    public void setTotalCitations(long totalCitations) { this.totalCitations = totalCitations; }

    public long getOpenAccessPapersCount() { return openAccessPapersCount; }
    public void setOpenAccessPapersCount(long openAccessPapersCount) { this.openAccessPapersCount = openAccessPapersCount; }

    public List<Map<String, Object>> getPublicationTrend() { return publicationTrend; }
    public void setPublicationTrend(List<Map<String, Object>> publicationTrend) { this.publicationTrend = publicationTrend; }

    public List<TopicDTO> getTopTopics() { return topTopics; }
    public void setTopTopics(List<TopicDTO> topTopics) { this.topTopics = topTopics; }

    public List<TopicDTO> getEmergingTopics() { return emergingTopics; }
    public void setEmergingTopics(List<TopicDTO> emergingTopics) { this.emergingTopics = emergingTopics; }

    public List<InstitutionDTO> getTopInstitutions() { return topInstitutions; }
    public void setTopInstitutions(List<InstitutionDTO> topInstitutions) { this.topInstitutions = topInstitutions; }

    public List<Map<String, Object>> getCountriesDistribution() { return countriesDistribution; }
    public void setCountriesDistribution(List<Map<String, Object>> countriesDistribution) { this.countriesDistribution = countriesDistribution; }

    public List<PaperDTO> getTopCitedPapers() { return topCitedPapers; }
    public void setTopCitedPapers(List<PaperDTO> topCitedPapers) { this.topCitedPapers = topCitedPapers; }

    public List<Map<String, Object>> getTopicTrendsOverTime() { return topicTrendsOverTime; }
    public void setTopicTrendsOverTime(List<Map<String, Object>> topicTrendsOverTime) { this.topicTrendsOverTime = topicTrendsOverTime; }

    public List<Map<String, Object>> getEmergingKeywords() { return emergingKeywords; }
    public void setEmergingKeywords(List<Map<String, Object>> emergingKeywords) { this.emergingKeywords = emergingKeywords; }

    public Map<String, Object> getCollaborationStats() { return collaborationStats; }
    public void setCollaborationStats(Map<String, Object> collaborationStats) { this.collaborationStats = collaborationStats; }

    public List<PaperDTO> getRecentlyPublishedPapers() { return recentlyPublishedPapers; }
    public void setRecentlyPublishedPapers(List<PaperDTO> recentlyPublishedPapers) { this.recentlyPublishedPapers = recentlyPublishedPapers; }

    public long getUniquePublicationsCount() { return uniquePublicationsCount; }
    public void setUniquePublicationsCount(long uniquePublicationsCount) { this.uniquePublicationsCount = uniquePublicationsCount; }

    public long getRawRecordsRetrievedCount() { return rawRecordsRetrievedCount; }
    public void setRawRecordsRetrievedCount(long rawRecordsRetrievedCount) { this.rawRecordsRetrievedCount = rawRecordsRetrievedCount; }
}
