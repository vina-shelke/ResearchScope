package com.researchscope.dto;

public class AiQuestionRequest {
    private String question;
    private String topic;
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

    public Integer getMaxSources() { return maxSources; }
    public void setMaxSources(Integer maxSources) { this.maxSources = maxSources; }
}
