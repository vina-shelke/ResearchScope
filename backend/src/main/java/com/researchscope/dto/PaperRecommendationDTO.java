package com.researchscope.dto;

import java.util.List;

public class PaperRecommendationDTO {
    private PaperDTO paper;
    private double similarityScore;
    private List<String> sharedTopics;
    private boolean isCitedOrCites;
    private String recommendationReason;

    public PaperRecommendationDTO() {}

    public PaperRecommendationDTO(PaperDTO paper, double similarityScore, List<String> sharedTopics, boolean isCitedOrCites, String recommendationReason) {
        this.paper = paper;
        this.similarityScore = similarityScore;
        this.sharedTopics = sharedTopics;
        this.isCitedOrCites = isCitedOrCites;
        this.recommendationReason = recommendationReason;
    }

    public PaperDTO getPaper() { return paper; }
    public void setPaper(PaperDTO paper) { this.paper = paper; }

    public double getSimilarityScore() { return similarityScore; }
    public void setSimilarityScore(double similarityScore) { this.similarityScore = similarityScore; }

    public List<String> getSharedTopics() { return sharedTopics; }
    public void setSharedTopics(List<String> sharedTopics) { this.sharedTopics = sharedTopics; }

    public boolean isCitedOrCites() { return isCitedOrCites; }
    public void setCitedOrCites(boolean citedOrCites) { isCitedOrCites = citedOrCites; }

    public String getRecommendationReason() { return recommendationReason; }
    public void setRecommendationReason(String recommendationReason) { this.recommendationReason = recommendationReason; }

    public String getRationale() { return recommendationReason; }
    public void setRationale(String rationale) { this.recommendationReason = rationale; }
}
