package com.researchscope.dto;

import java.util.List;

public class AiQuestionRequest {
    private String question;
    private String topic;
    private String scope = "TOPIC"; // "TOPIC", "PAPER", "PAPERS_SET", "PROJECT", "COLLECTION"
    private String paperId;
    private List<String> paperIds;
    private String projectId;
    private String collectionName;
    private String explanationLevel = "ACADEMIC"; // "BEGINNER", "ACADEMIC", "TECHNICAL"
    private String queryMode = "QUESTION"; // "QUESTION", "EXPLAIN", "SUMMARIZE", "LIMITATIONS", "COMPARE", "QUESTIONS_GEN"
    private String summaryType; // "SHORT", "DETAILED", "FINDINGS", "OBJECTIVES", "METHODS", "LIMITATIONS"
    private Integer maxSources = 5;

    public AiQuestionRequest() {}

    public AiQuestionRequest(String question, String topic, Integer maxSources) {
        this.question = question;
        this.topic = topic;
        this.maxSources = maxSources != null ? maxSources : 5;
    }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getScope() { return scope; }
    public void setScope(String scope) { this.scope = scope; }

    public String getPaperId() { return paperId; }
    public void setPaperId(String paperId) { this.paperId = paperId; }

    public List<String> getPaperIds() { return paperIds; }
    public void setPaperIds(List<String> paperIds) { this.paperIds = paperIds; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public String getCollectionName() { return collectionName; }
    public void setCollectionName(String collectionName) { this.collectionName = collectionName; }

    public String getExplanationLevel() { return explanationLevel; }
    public void setExplanationLevel(String explanationLevel) { this.explanationLevel = explanationLevel; }

    public String getQueryMode() { return queryMode; }
    public void setQueryMode(String queryMode) { this.queryMode = queryMode; }

    public String getSummaryType() { return summaryType; }
    public void setSummaryType(String summaryType) { this.summaryType = summaryType; }

    public Integer getMaxSources() { return maxSources; }
    public void setMaxSources(Integer maxSources) { this.maxSources = maxSources; }
}
