package com.researchscope.dto;

import java.util.List;

public class ThemeClusterDTO {
    private String name;
    private int paperCount;
    private List<String> samplePaperTitles;

    public ThemeClusterDTO() {}

    public ThemeClusterDTO(String name, int paperCount, List<String> samplePaperTitles) {
        this.name = name;
        this.paperCount = paperCount;
        this.samplePaperTitles = samplePaperTitles;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getPaperCount() { return paperCount; }
    public void setPaperCount(int paperCount) { this.paperCount = paperCount; }

    public List<String> getSamplePaperTitles() { return samplePaperTitles; }
    public void setSamplePaperTitles(List<String> samplePaperTitles) { this.samplePaperTitles = samplePaperTitles; }
}
