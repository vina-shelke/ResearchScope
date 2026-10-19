package com.researchscope.dto;

import java.util.List;

public class PaperComparisonMatrixDTO {
    private List<PaperComparisonItemDTO> papers;
    private List<String> commonMethods;
    private List<String> commonLimitations;
    private String synthesisSummary;

    public PaperComparisonMatrixDTO() {}

    public PaperComparisonMatrixDTO(List<PaperComparisonItemDTO> papers, List<String> commonMethods, List<String> commonLimitations, String synthesisSummary) {
        this.papers = papers;
        this.commonMethods = commonMethods;
        this.commonLimitations = commonLimitations;
        this.synthesisSummary = synthesisSummary;
    }

    public List<PaperComparisonItemDTO> getPapers() { return papers; }
    public void setPapers(List<PaperComparisonItemDTO> papers) { this.papers = papers; }

    public List<String> getCommonMethods() { return commonMethods; }
    public void setCommonMethods(List<String> commonMethods) { this.commonMethods = commonMethods; }

    public List<String> getCommonLimitations() { return commonLimitations; }
    public void setCommonLimitations(List<String> commonLimitations) { this.commonLimitations = commonLimitations; }

    public String getSynthesisSummary() { return synthesisSummary; }
    public void setSynthesisSummary(String synthesisSummary) { this.synthesisSummary = synthesisSummary; }
}
