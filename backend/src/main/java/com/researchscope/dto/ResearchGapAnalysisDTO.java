package com.researchscope.dto;

import java.util.List;
import java.util.Map;

public class ResearchGapAnalysisDTO {
    private String topicQuery;
    private int totalPapersAnalyzed;
    private List<ResearchGapCandidateDTO> gapCandidates;
    private List<ThemeClusterDTO> themes;
    private Map<String, Long> methodologyDistribution;
    private String coverageAssessment;
    private List<String> limitationsSummary;
    private List<String> recommendedLiteratureDirections;

    public ResearchGapAnalysisDTO() {}

    public ResearchGapAnalysisDTO(
            String topicQuery,
            int totalPapersAnalyzed,
            List<ResearchGapCandidateDTO> gapCandidates,
            List<ThemeClusterDTO> themes,
            Map<String, Long> methodologyDistribution,
            String coverageAssessment,
            List<String> limitationsSummary,
            List<String> recommendedLiteratureDirections
    ) {
        this.topicQuery = topicQuery;
        this.totalPapersAnalyzed = totalPapersAnalyzed;
        this.gapCandidates = gapCandidates;
        this.themes = themes;
        this.methodologyDistribution = methodologyDistribution;
        this.coverageAssessment = coverageAssessment;
        this.limitationsSummary = limitationsSummary;
        this.recommendedLiteratureDirections = recommendedLiteratureDirections;
    }

    public String getTopicQuery() { return topicQuery; }
    public void setTopicQuery(String topicQuery) { this.topicQuery = topicQuery; }

    public int getTotalPapersAnalyzed() { return totalPapersAnalyzed; }
    public void setTotalPapersAnalyzed(int totalPapersAnalyzed) { this.totalPapersAnalyzed = totalPapersAnalyzed; }

    public List<ResearchGapCandidateDTO> getGapCandidates() { return gapCandidates; }
    public void setGapCandidates(List<ResearchGapCandidateDTO> gapCandidates) { this.gapCandidates = gapCandidates; }

    public List<ThemeClusterDTO> getThemes() { return themes; }
    public void setThemes(List<ThemeClusterDTO> themes) { this.themes = themes; }

    public Map<String, Long> getMethodologyDistribution() { return methodologyDistribution; }
    public void setMethodologyDistribution(Map<String, Long> methodologyDistribution) { this.methodologyDistribution = methodologyDistribution; }

    public String getCoverageAssessment() { return coverageAssessment; }
    public void setCoverageAssessment(String coverageAssessment) { this.coverageAssessment = coverageAssessment; }

    public List<String> getLimitationsSummary() { return limitationsSummary; }
    public void setLimitationsSummary(List<String> limitationsSummary) { this.limitationsSummary = limitationsSummary; }

    public List<String> getRecommendedLiteratureDirections() { return recommendedLiteratureDirections; }
    public void setRecommendedLiteratureDirections(List<String> recommendedLiteratureDirections) { this.recommendedLiteratureDirections = recommendedLiteratureDirections; }
}
