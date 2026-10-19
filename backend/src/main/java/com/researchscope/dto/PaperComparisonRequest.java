package com.researchscope.dto;

import java.util.List;

public class PaperComparisonRequest {
    private List<String> paperIds;

    public PaperComparisonRequest() {}
    public PaperComparisonRequest(List<String> paperIds) {
        this.paperIds = paperIds;
    }

    public List<String> getPaperIds() { return paperIds; }
    public void setPaperIds(List<String> paperIds) { this.paperIds = paperIds; }
}
