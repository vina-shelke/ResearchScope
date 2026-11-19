package com.researchscope.dto;

public class UpdateSectionRequest {
    private String content;

    public UpdateSectionRequest() {}

    public UpdateSectionRequest(String content) {
        this.content = content;
    }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
