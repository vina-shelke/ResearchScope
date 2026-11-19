package com.researchscope.dto;

public class AddTeamCommentRequest {
    private String commentText;
    private String consensusVote; // AGREE, DISAGREE, NEUTRAL, NONE

    public AddTeamCommentRequest() {}

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
}
