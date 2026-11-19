package com.researchscope.dto;

public class UpdateMethodologyFieldRequest {
    private String fieldName;
    private String correctedValue;

    public UpdateMethodologyFieldRequest() {}

    public UpdateMethodologyFieldRequest(String fieldName, String correctedValue) {
        this.fieldName = fieldName;
        this.correctedValue = correctedValue;
    }

    public String getFieldName() { return fieldName; }
    public void setFieldName(String fieldName) { this.fieldName = fieldName; }

    public String getCorrectedValue() { return correctedValue; }
    public void setCorrectedValue(String correctedValue) { this.correctedValue = correctedValue; }
}
