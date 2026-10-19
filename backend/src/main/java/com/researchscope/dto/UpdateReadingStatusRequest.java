package com.researchscope.dto;

public class UpdateReadingStatusRequest {
    private String readingStatus;
    private String collectionName;
    private String projectId;
    private String tags;
    private String notes;

    public UpdateReadingStatusRequest() {}

    public UpdateReadingStatusRequest(String readingStatus, String collectionName, String projectId, String tags, String notes) {
        this.readingStatus = readingStatus;
        this.collectionName = collectionName;
        this.projectId = projectId;
        this.tags = tags;
        this.notes = notes;
    }

    public String getReadingStatus() { return readingStatus; }
    public void setReadingStatus(String readingStatus) { this.readingStatus = readingStatus; }

    public String getCollectionName() { return collectionName; }
    public void setCollectionName(String collectionName) { this.collectionName = collectionName; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
