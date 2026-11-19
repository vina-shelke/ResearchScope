package com.researchscope.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "methodology_extractions")
public class MethodologyExtraction {

    @Id
    @Column(length = 100)
    private String id;

    @Column(name = "paper_id", length = 100, nullable = false)
    private String paperId;

    @Column(name = "user_id", length = 100)
    private String userId = "user_demo";

    @Column(name = "methodology_type", length = 100)
    private String methodologyType; // Experimental, Comparative, Case Study, Survey, Empirical, Theoretical

    @Column(name = "research_design", length = 255)
    private String researchDesign;

    @Column(name = "dataset_used", length = 255)
    private String datasetUsed;

    @Column(name = "sample_size", length = 150)
    private String sampleSize;

    @Column(name = "data_collection_method", length = 255)
    private String dataCollectionMethod;

    @Column(name = "tools_technologies", length = 255)
    private String toolsTechnologies;

    @Column(name = "algorithms_used", length = 255)
    private String algorithmsUsed;

    @Column(name = "evaluation_metrics", length = 255)
    private String evaluationMetrics;

    @Column(name = "experimental_setup", length = 500)
    private String experimentalSetup;

    @Column(name = "research_results", columnDefinition = "TEXT")
    private String researchResults;

    @Column(columnDefinition = "TEXT")
    private String limitations;

    @Column(name = "confidence_scores_json", columnDefinition = "TEXT")
    private String confidenceScoresJson;

    @Column(name = "manual_corrections_json", columnDefinition = "TEXT")
    private String manualCorrectionsJson;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public MethodologyExtraction() {}

    public MethodologyExtraction(String id, String paperId, String userId) {
        this.id = id;
        this.paperId = paperId;
        this.userId = userId != null ? userId : "user_demo";
        this.updatedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPaperId() { return paperId; }
    public void setPaperId(String paperId) { this.paperId = paperId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

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

    public String getConfidenceScoresJson() { return confidenceScoresJson; }
    public void setConfidenceScoresJson(String confidenceScoresJson) { this.confidenceScoresJson = confidenceScoresJson; }

    public String getManualCorrectionsJson() { return manualCorrectionsJson; }
    public void setManualCorrectionsJson(String manualCorrectionsJson) { this.manualCorrectionsJson = manualCorrectionsJson; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
