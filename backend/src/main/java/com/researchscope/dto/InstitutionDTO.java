package com.researchscope.dto;

public class InstitutionDTO {
    private String id;
    private String name;
    private String countryCode;
    private String countryName;
    private Integer paperCount;

    public InstitutionDTO() {}

    public InstitutionDTO(String id, String name, String countryCode, String countryName, Integer paperCount) {
        this.id = id;
        this.name = name;
        this.countryCode = countryCode;
        this.countryName = countryName;
        this.paperCount = paperCount;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCountryCode() { return countryCode; }
    public void setCountryCode(String countryCode) { this.countryCode = countryCode; }

    public String getCountryName() { return countryName; }
    public void setCountryName(String countryName) { this.countryName = countryName; }

    public Integer getPaperCount() { return paperCount; }
    public void setPaperCount(Integer paperCount) { this.paperCount = paperCount; }
}
