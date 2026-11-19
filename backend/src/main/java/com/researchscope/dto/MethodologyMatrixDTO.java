package com.researchscope.dto;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MethodologyMatrixDTO {
    private List<MethodologyItemDTO> items = new ArrayList<>();
    private Map<String, Integer> technologyFrequency = new HashMap<>();
    private Map<String, Integer> datasetFrequency = new HashMap<>();
    private List<String> metricsSummary = new ArrayList<>();
    private String synthesisSummary;

    public MethodologyMatrixDTO() {}

    public MethodologyMatrixDTO(List<MethodologyItemDTO> items, Map<String, Integer> technologyFrequency,
                                Map<String, Integer> datasetFrequency, List<String> metricsSummary, String synthesisSummary) {
        this.items = items != null ? items : new ArrayList<>();
        this.technologyFrequency = technologyFrequency != null ? technologyFrequency : new HashMap<>();
        this.datasetFrequency = datasetFrequency != null ? datasetFrequency : new HashMap<>();
        this.metricsSummary = metricsSummary != null ? metricsSummary : new ArrayList<>();
        this.synthesisSummary = synthesisSummary;
    }

    public List<MethodologyItemDTO> getItems() { return items; }
    public void setItems(List<MethodologyItemDTO> items) { this.items = items; }

    public Map<String, Integer> getTechnologyFrequency() { return technologyFrequency; }
    public void setTechnologyFrequency(Map<String, Integer> technologyFrequency) { this.technologyFrequency = technologyFrequency; }

    public Map<String, Integer> getDatasetFrequency() { return datasetFrequency; }
    public void setDatasetFrequency(Map<String, Integer> datasetFrequency) { this.datasetFrequency = datasetFrequency; }

    public List<String> getMetricsSummary() { return metricsSummary; }
    public void setMetricsSummary(List<String> metricsSummary) { this.metricsSummary = metricsSummary; }

    public String getSynthesisSummary() { return synthesisSummary; }
    public void setSynthesisSummary(String synthesisSummary) { this.synthesisSummary = synthesisSummary; }
}
