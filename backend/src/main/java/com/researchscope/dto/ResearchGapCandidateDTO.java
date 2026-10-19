package com.researchscope.dto;

import java.util.List;
import java.util.Map;

public class ResearchGapCandidateDTO {
    private String id;
    private String title;
    private String explanation;
    private List<String> relatedThemes;
    private int relevantPaperCount;
    private List<Map<String, Object>> publicationTrend;
    private List<PaperDTO> supportingPapers;
    private List<String> extractedLimitations;
    private List<String> extractedFutureWork;
    private String confidenceScore; // HIGH, MEDIUM, LOW
    private String identificationMethod;
    private String coverageCaveat;

    public ResearchGapCandidateDTO() {}

    public ResearchGapCandidateDTO(
            String id,
            String title,
            String explanation,
            List<String> relatedThemes,
            int relevantPaperCount,
            List<Map<String, Object>> publicationTrend,
            List<PaperDTO> supportingPapers,
            List<String> extractedLimitations,
            List<String> extractedFutureWork,
            String confidenceScore,
            String identificationMethod,
            String coverageCaveat
    ) {
        this.id = id;
        this.title = title;
        this.explanation = explanation;
        this.relatedThemes = relatedThemes;
        this.relevantPaperCount = relevantPaperCount;
        this.publicationTrend = publicationTrend;
        this.supportingPapers = supportingPapers;
        this.extractedLimitations = extractedLimitations;
        this.extractedFutureWork = extractedFutureWork;
        this.confidenceScore = confidenceScore;
        this.identificationMethod = identificationMethod;
        this.coverageCaveat = coverageCaveat;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public List<String> getRelatedThemes() { return relatedThemes; }
    public void setRelatedThemes(List<String> relatedThemes) { this.relatedThemes = relatedThemes; }

    public int getRelevantPaperCount() { return relevantPaperCount; }
    public void setRelevantPaperCount(int relevantPaperCount) { this.relevantPaperCount = relevantPaperCount; }

    public List<Map<String, Object>> getPublicationTrend() { return publicationTrend; }
    public void setPublicationTrend(List<Map<String, Object>> publicationTrend) { this.publicationTrend = publicationTrend; }

    public List<PaperDTO> getSupportingPapers() { return supportingPapers; }
    public void setSupportingPapers(List<PaperDTO> supportingPapers) { this.supportingPapers = supportingPapers; }

    public List<String> getExtractedLimitations() { return extractedLimitations; }
    public void setExtractedLimitations(List<String> extractedLimitations) { this.extractedLimitations = extractedLimitations; }

    public List<String> getExtractedFutureWork() { return extractedFutureWork; }
    public void setExtractedFutureWork(List<String> extractedFutureWork) { this.extractedFutureWork = extractedFutureWork; }

    public String getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(String confidenceScore) { this.confidenceScore = confidenceScore; }

    public String getIdentificationMethod() { return identificationMethod; }
    public void setIdentificationMethod(String identificationMethod) { this.identificationMethod = identificationMethod; }

    public String getCoverageCaveat() { return coverageCaveat; }
    public void setCoverageCaveat(String coverageCaveat) { this.coverageCaveat = coverageCaveat; }
}
