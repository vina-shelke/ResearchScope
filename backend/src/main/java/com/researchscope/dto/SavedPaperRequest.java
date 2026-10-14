package com.researchscope.dto;

public class SavedPaperRequest {
    private String collectionName;
    private String notes;

    public SavedPaperRequest() {}

    public SavedPaperRequest(String collectionName, String notes) {
        this.collectionName = collectionName;
        this.notes = notes;
    }

    public String getCollectionName() { return collectionName; }
    public void setCollectionName(String collectionName) { this.collectionName = collectionName; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
