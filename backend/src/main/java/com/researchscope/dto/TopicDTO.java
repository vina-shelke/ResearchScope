package com.researchscope.dto;

public class TopicDTO {
    private String id;
    private String name;
    private String category;
    private Integer paperCount;

    public TopicDTO() {}

    public TopicDTO(String id, String name, String category, Integer paperCount) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.paperCount = paperCount;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getPaperCount() { return paperCount; }
    public void setPaperCount(Integer paperCount) { this.paperCount = paperCount; }
}
