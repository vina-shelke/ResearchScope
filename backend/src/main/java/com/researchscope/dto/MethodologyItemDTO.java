package com.researchscope.dto;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MethodologyItemDTO {
    private String paperId;
    private String paperTitle;
    private List<String> authors;
    private Integer publicationYear;
    private String venue;
    private String doi;
    private String url;
    private Boolean isOpenAccess;
    private String pdfUrl;

    // The 11 Dimensions
    private String methodologyType;
    private String researchDesign;
    private String datasetUsed;
    private String sampleSize;
    private String dataCollectionMethod;
    private String toolsTechnologies;
    private String algorithmsUsed;
    private String evaluationMetrics;
    private String experimentalSetup;
    private String researchResults;
    private String limitations;

    // Confidence Scores & Manual Corrections
    private Map<String, String> confidenceScores = new HashMap<>();
    private Map<String, Object> manualCorrections = new HashMap<>();

    public MethodologyItemDTO() {}

    public String getPaperId() { return paperId; }
    public void setPaperId(String paperId) { this.paperId = paperId; }

    public String getPaperTitle() { return paperTitle; }
    public void setPaperTitle(String paperTitle) { this.paperTitle = paperTitle; }

    public List<String> getAuthors() { return authors; }
    public void setAuthors(List<String> authors) { this.authors = authors; }

    public Integer getPublicationYear() { return publicationYear; }
    public void setPublicationYear(Integer publicationYear) { this.publicationYear = publicationYear; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public String getDoi() { return doi; }
    public void setDoi(String doi) { this.doi = doi; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public Boolean getIsOpenAccess() { return isOpenAccess; }
    public void setIsOpenAccess(Boolean isOpenAccess) { this.isOpenAccess = isOpenAccess; }

    public String getPdfUrl() { return pdfUrl; }
    public void setPdfUrl(String pdfUrl) { this.pdfUrl = pdfUrl; }

    public String getMethodologyType() { return methodologyType; }
    public void setMethodologyType(String methodologyType) { this.methodologyType = methodologyType; }

    public String getResearchDesign() { return researchDesign; }
    public void setResearchDesign(String researchDesign) { this.researchDesign = researchDesign; }

    public String getDatasetUsed() { return datasetUsed; }
    public void setDatasetUsed(String datasetUsed) { this.datasetUsed = datasetUsed; }

    public String getSampleSize() { return sampleSize; }
    public void setSampleSize(String sampleSize) { this.sampleSize = sampleSize; }

    public String getDataCollectionMethod() { return dataCollectionMethod; }
    public void setDataCollectionMethod(String dataCollectionMethod) { this.dataCollectionMethod = dataCollectionMethod; }

    public String getToolsTechnologies() { return toolsTechnologies; }
    public void setToolsTechnologies(String toolsTechnologies) { this.toolsTechnologies = toolsTechnologies; }

    public String getAlgorithmsUsed() { return algorithmsUsed; }
    public void setAlgorithmsUsed(String algorithmsUsed) { this.algorithmsUsed = algorithmsUsed; }

    public String getEvaluationMetrics() { return evaluationMetrics; }
    public void setEvaluationMetrics(String evaluationMetrics) { this.evaluationMetrics = evaluationMetrics; }

    public String getExperimentalSetup() { return experimentalSetup; }
    public void setExperimentalSetup(String experimentalSetup) { this.experimentalSetup = experimentalSetup; }

    public String getResearchResults() { return researchResults; }
    public void setResearchResults(String researchResults) { this.researchResults = researchResults; }

    public String getLimitations() { return limitations; }
    public void setLimitations(String limitations) { this.limitations = limitations; }

    public Map<String, String> getConfidenceScores() { return confidenceScores; }
    public void setConfidenceScores(Map<String, String> confidenceScores) { this.confidenceScores = confidenceScores; }

    public Map<String, Object> getManualCorrections() { return manualCorrections; }
    public void setManualCorrections(Map<String, Object> manualCorrections) { this.manualCorrections = manualCorrections; }
}
