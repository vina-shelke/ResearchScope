package com.researchscope.dto;

public class AuthorDTO {
    private String id;
    private String name;
    private String openAlexId;
    private Integer paperCount;
    private Integer citationCount;

    public AuthorDTO() {}

    public AuthorDTO(String id, String name, String openAlexId, Integer paperCount, Integer citationCount) {
        this.id = id;
        this.name = name;
        this.openAlexId = openAlexId;
        this.paperCount = paperCount;
        this.citationCount = citationCount;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getOpenAlexId() { return openAlexId; }
    public void setOpenAlexId(String openAlexId) { this.openAlexId = openAlexId; }

    public Integer getPaperCount() { return paperCount; }
    public void setPaperCount(Integer paperCount) { this.paperCount = paperCount; }

    public Integer getCitationCount() { return citationCount; }
    public void setCitationCount(Integer citationCount) { this.citationCount = citationCount; }
}
