package com.researchscope.dto;

import java.time.LocalDateTime;

public class TeamCommentDTO {
    private Long id;
    private Long teamId;
    private String paperId;
    private String authorId;
    private String authorName;
    private String commentText;
    private String consensusVote;
    private LocalDateTime createdAt;

    public TeamCommentDTO() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public String getPaperId() {
        return paperId;
    }

    public void setPaperId(String paperId) {
        this.paperId = paperId;
    }

    public String getAuthorId() {
        return authorId;
    }

    public void setAuthorId(String authorId) {
        this.authorId = authorId;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public String getCommentText() {
        return commentText;
    }

    public void setCommentText(String commentText) {
        this.commentText = commentText;
    }

    public String getConsensusVote() {
        return consensusVote;
    }

    public void setConsensusVote(String consensusVote) {
        this.consensusVote = consensusVote;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
