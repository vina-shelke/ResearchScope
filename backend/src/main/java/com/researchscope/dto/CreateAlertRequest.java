package com.researchscope.dto;

public class CreateAlertRequest {
    private String query;
    private String frequency; // REALTIME, DAILY, WEEKLY

    public CreateAlertRequest() {}

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }
}
