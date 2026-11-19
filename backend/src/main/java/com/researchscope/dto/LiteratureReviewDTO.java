package com.researchscope.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class LiteratureReviewDTO {
    private String id;
    private String userId;
    private String projectId;
    private String title;
    private String topicQuery;
    private String style;
    private String status;
    private String fullDraftMarkdown;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<PaperDTO> papers = new ArrayList<>();
    private List<LiteratureReviewSectionDTO> sections = new ArrayList<>();
    private List<SourceEvidenceDTO> sourceEvidence = new ArrayList<>();

    public LiteratureReviewDTO() {}

    public LiteratureReviewDTO(String id, String userId, String projectId, String title, String topicQuery,
                               String style, String status, String fullDraftMarkdown, LocalDateTime createdAt,
                               LocalDateTime updatedAt, List<PaperDTO> papers, List<LiteratureReviewSectionDTO> sections,
                               List<SourceEvidenceDTO> sourceEvidence) {
        this.id = id;
        this.userId = userId;
        this.projectId = projectId;
        this.title = title;
        this.topicQuery = topicQuery;
        this.style = style;
        this.status = status;
        this.fullDraftMarkdown = fullDraftMarkdown;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.papers = papers != null ? papers : new ArrayList<>();
        this.sections = sections != null ? sections : new ArrayList<>();
        this.sourceEvidence = sourceEvidence != null ? sourceEvidence : new ArrayList<>();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getTopicQuery() { return topicQuery; }
    public void setTopicQuery(String topicQuery) { this.topicQuery = topicQuery; }

    public String getStyle() { return style; }
    public void setStyle(String style) { this.style = style; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getFullDraftMarkdown() { return fullDraftMarkdown; }
    public void setFullDraftMarkdown(String fullDraftMarkdown) { this.fullDraftMarkdown = fullDraftMarkdown; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<PaperDTO> getPapers() { return papers; }
    public void setPapers(List<PaperDTO> papers) { this.papers = papers; }

    public List<LiteratureReviewSectionDTO> getSections() { return sections; }
    public void setSections(List<LiteratureReviewSectionDTO> sections) { this.sections = sections; }

    public List<SourceEvidenceDTO> getSourceEvidence() { return sourceEvidence; }
    public void setSourceEvidence(List<SourceEvidenceDTO> sourceEvidence) { this.sourceEvidence = sourceEvidence; }
}
