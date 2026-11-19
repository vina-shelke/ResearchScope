package com.researchscope.dto;

import java.util.List;

public class AnalyzeMethodologyRequest {
    private List<String> paperIds;

    public AnalyzeMethodologyRequest() {}

    public AnalyzeMethodologyRequest(List<String> paperIds) {
        this.paperIds = paperIds;
    }

    public List<String> getPaperIds() { return paperIds; }
    public void setPaperIds(List<String> paperIds) { this.paperIds = paperIds; }
}
