package com.researchscope.dto;

public class RegenerateSectionRequest {
    private String instructions;

    public RegenerateSectionRequest() {}

    public RegenerateSectionRequest(String instructions) {
        this.instructions = instructions;
    }

    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }
}
