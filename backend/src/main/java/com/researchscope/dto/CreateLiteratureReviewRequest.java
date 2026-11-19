package com.researchscope.dto;

import java.util.List;

public class CreateLiteratureReviewRequest {
    private String title;
    private String topicQuery;
    private String style = "ACADEMIC"; // "ACADEMIC", "SIMPLE", "TECHNICAL"
    private List<String> paperIds;
    private String projectId;

    public CreateLiteratureReviewRequest() {}

    public CreateLiteratureReviewRequest(String title, String topicQuery, String style, List<String> paperIds, String projectId) {
        this.title = title;
        this.topicQuery = topicQuery;
        this.style = style != null ? style : "ACADEMIC";
        this.paperIds = paperIds;
        this.projectId = projectId;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getTopicQuery() { return topicQuery; }
    public void setTopicQuery(String topicQuery) { this.topicQuery = topicQuery; }

    public String getStyle() { return style; }
    public void setStyle(String style) { this.style = style; }

    public List<String> getPaperIds() { return paperIds; }
    public void setPaperIds(List<String> paperIds) { this.paperIds = paperIds; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }
}
