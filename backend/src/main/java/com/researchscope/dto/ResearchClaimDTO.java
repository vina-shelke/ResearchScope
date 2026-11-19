package com.researchscope.dto;

import java.util.List;

public class ResearchClaimDTO {
    private String claim;
    private String statementType; // "DIRECTLY_REPORTED" or "AI_INFERRED"
    private List<SourceEvidenceDTO> supportingEvidence;

    public ResearchClaimDTO() {}

    public ResearchClaimDTO(String claim, String statementType, List<SourceEvidenceDTO> supportingEvidence) {
        this.claim = claim;
        this.statementType = statementType != null ? statementType : "DIRECTLY_REPORTED";
        this.supportingEvidence = supportingEvidence;
    }

    public String getClaim() { return claim; }
    public void setClaim(String claim) { this.claim = claim; }

    public String getStatementType() { return statementType; }
    public void setStatementType(String statementType) { this.statementType = statementType; }

    public List<SourceEvidenceDTO> getSupportingEvidence() { return supportingEvidence; }
    public void setSupportingEvidence(List<SourceEvidenceDTO> supportingEvidence) { this.supportingEvidence = supportingEvidence; }
}
