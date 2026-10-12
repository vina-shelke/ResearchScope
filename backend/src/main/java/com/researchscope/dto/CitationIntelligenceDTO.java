package com.researchscope.dto;

import java.util.List;
import java.util.Map;

public class CitationIntelligenceDTO {
    private List<PaperDTO> mostCitedPapers;
    private List<Map<String, Object>> citationDistribution;
    private List<Map<String, Object>> citationTrends;

    public CitationIntelligenceDTO() {}

    public CitationIntelligenceDTO(List<PaperDTO> mostCitedPapers, List<Map<String, Object>> citationDistribution, List<Map<String, Object>> citationTrends) {
        this.mostCitedPapers = mostCitedPapers;
        this.citationDistribution = citationDistribution;
        this.citationTrends = citationTrends;
    }

    public List<PaperDTO> getMostCitedPapers() { return mostCitedPapers; }
    public void setMostCitedPapers(List<PaperDTO> mostCitedPapers) { this.mostCitedPapers = mostCitedPapers; }

    public List<Map<String, Object>> getCitationDistribution() { return citationDistribution; }
    public void setCitationDistribution(List<Map<String, Object>> citationDistribution) { this.citationDistribution = citationDistribution; }

    public List<Map<String, Object>> getCitationTrends() { return citationTrends; }
    public void setCitationTrends(List<Map<String, Object>> citationTrends) { this.citationTrends = citationTrends; }
}
