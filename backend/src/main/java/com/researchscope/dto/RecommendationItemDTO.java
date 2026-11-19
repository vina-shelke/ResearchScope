package com.researchscope.dto;

import java.util.List;

public class RecommendationItemDTO {
    private String paperId;
    private String title;
    private List<String> authors;
    private Integer publicationYear;
    private String venue;
    private Integer citationCount;
    private Boolean isOpenAccess;
    private String doi;
    private int relevanceScore; // 0-100%
    private String matchedReason;
    private List<String> matchingTopics;
    private boolean isSavedInWorkspace;

    public RecommendationItemDTO() {}

    public String getPaperId() {
        return paperId;
    }

    public void setPaperId(String paperId) {
        this.paperId = paperId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public List<String> getAuthors() {
        return authors;
    }

    public void setAuthors(List<String> authors) {
        this.authors = authors;
    }

    public Integer getPublicationYear() {
        return publicationYear;
    }

    public void setPublicationYear(Integer publicationYear) {
        this.publicationYear = publicationYear;
    }

    public String getVenue() {
        return venue;
    }

    public void setVenue(String venue) {
        this.venue = venue;
    }

    public Integer getCitationCount() {
        return citationCount;
    }

    public void setCitationCount(Integer citationCount) {
        this.citationCount = citationCount;
    }

    public Boolean getIsOpenAccess() {
        return isOpenAccess;
    }

    public void setIsOpenAccess(Boolean openAccess) {
        isOpenAccess = openAccess;
    }

    public String getDoi() {
        return doi;
    }

    public void setDoi(String doi) {
        this.doi = doi;
    }

    public int getRelevanceScore() {
        return relevanceScore;
    }

    public void setRelevanceScore(int relevanceScore) {
        this.relevanceScore = relevanceScore;
    }

    public String getMatchedReason() {
        return matchedReason;
    }

    public void setMatchedReason(String matchedReason) {
        this.matchedReason = matchedReason;
    }

    public List<String> getMatchingTopics() {
        return matchingTopics;
    }

    public void setMatchingTopics(List<String> matchingTopics) {
        this.matchingTopics = matchingTopics;
    }

    public boolean isSavedInWorkspace() {
        return isSavedInWorkspace;
    }

    public void setSavedInWorkspace(boolean savedInWorkspace) {
        isSavedInWorkspace = savedInWorkspace;
    }
}
