package com.researchscope.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "team_comments")
public class TeamComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "team_id", nullable = false)
    private Long teamId;

    @Column(name = "paper_id", nullable = false, length = 100)
    private String paperId;

    @Column(name = "author_id", nullable = false, length = 100)
    private String authorId;

    @Column(name = "author_name", nullable = false, length = 100)
    private String authorName;

    @Column(name = "comment_text", nullable = false, columnDefinition = "TEXT")
    private String commentText;

    @Column(name = "consensus_vote", length = 50)
    private String consensusVote = "NONE"; // AGREE, DISAGREE, NEUTRAL, NONE

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public TeamComment() {}

    public TeamComment(Long teamId, String paperId, String authorId, String authorName, String commentText, String consensusVote) {
        this.teamId = teamId;
        this.paperId = paperId;
        this.authorId = authorId;
        this.authorName = authorName;
        this.commentText = commentText;
        this.consensusVote = (consensusVote != null) ? consensusVote : "NONE";
        this.createdAt = LocalDateTime.now();
    }

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
