package com.researchscope.dto;

import java.util.ArrayList;
import java.util.List;

public class AiAnswerResponse {
    private String question;
    private String answer;
    private String explanationLevel = "ACADEMIC";
    private String synthesisMethod;
    private List<PaperDTO> citedPapers = new ArrayList<>();
    private List<SourceEvidenceDTO> evidenceList = new ArrayList<>();
    private List<ResearchClaimDTO> structuredClaims = new ArrayList<>();
    private List<String> suggestedQuestions = new ArrayList<>();
    private Boolean hasSufficientEvidence = true;
    private String warningMessage;

    public AiAnswerResponse() {}

    public AiAnswerResponse(String question, String answer, String synthesisMethod, List<PaperDTO> citedPapers) {
        this.question = question;
        this.answer = answer;
        this.synthesisMethod = synthesisMethod;
        this.citedPapers = citedPapers != null ? citedPapers : new ArrayList<>();
        this.hasSufficientEvidence = !this.citedPapers.isEmpty();
    }

    public AiAnswerResponse(String question, String answer, String explanationLevel, String synthesisMethod,
                            List<PaperDTO> citedPapers, List<SourceEvidenceDTO> evidenceList,
                            List<ResearchClaimDTO> structuredClaims, List<String> suggestedQuestions,
                            Boolean hasSufficientEvidence, String warningMessage) {
        this.question = question;
        this.answer = answer;
        this.explanationLevel = explanationLevel;
        this.synthesisMethod = synthesisMethod;
        this.citedPapers = citedPapers != null ? citedPapers : new ArrayList<>();
        this.evidenceList = evidenceList != null ? evidenceList : new ArrayList<>();
        this.structuredClaims = structuredClaims != null ? structuredClaims : new ArrayList<>();
        this.suggestedQuestions = suggestedQuestions != null ? suggestedQuestions : new ArrayList<>();
        this.hasSufficientEvidence = hasSufficientEvidence;
        this.warningMessage = warningMessage;
    }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }

    public String getExplanationLevel() { return explanationLevel; }
    public void setExplanationLevel(String explanationLevel) { this.explanationLevel = explanationLevel; }

    public String getSynthesisMethod() { return synthesisMethod; }
    public void setSynthesisMethod(String synthesisMethod) { this.synthesisMethod = synthesisMethod; }

    public List<PaperDTO> getCitedPapers() { return citedPapers; }
    public void setCitedPapers(List<PaperDTO> citedPapers) { this.citedPapers = citedPapers; }

    public List<SourceEvidenceDTO> getEvidenceList() { return evidenceList; }
    public void setEvidenceList(List<SourceEvidenceDTO> evidenceList) { this.evidenceList = evidenceList; }

    public List<ResearchClaimDTO> getStructuredClaims() { return structuredClaims; }
    public void setStructuredClaims(List<ResearchClaimDTO> structuredClaims) { this.structuredClaims = structuredClaims; }

    public List<String> getSuggestedQuestions() { return suggestedQuestions; }
    public void setSuggestedQuestions(List<String> suggestedQuestions) { this.suggestedQuestions = suggestedQuestions; }

    public Boolean getHasSufficientEvidence() { return hasSufficientEvidence; }
    public void setHasSufficientEvidence(Boolean hasSufficientEvidence) { this.hasSufficientEvidence = hasSufficientEvidence; }

    public String getWarningMessage() { return warningMessage; }
    public void setWarningMessage(String warningMessage) { this.warningMessage = warningMessage; }
}
