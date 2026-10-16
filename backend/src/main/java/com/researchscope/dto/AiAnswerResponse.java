package com.researchscope.dto;

import java.util.List;

public class AiAnswerResponse {
    private String question;
    private String answer;
    private String synthesisMethod;
    private List<PaperDTO> citedPapers;

    public AiAnswerResponse() {}

    public AiAnswerResponse(String question, String answer, String synthesisMethod, List<PaperDTO> citedPapers) {
        this.question = question;
        this.answer = answer;
        this.synthesisMethod = synthesisMethod;
        this.citedPapers = citedPapers;
    }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }

    public String getSynthesisMethod() { return synthesisMethod; }
    public void setSynthesisMethod(String synthesisMethod) { this.synthesisMethod = synthesisMethod; }

    public List<PaperDTO> getCitedPapers() { return citedPapers; }
    public void setCitedPapers(List<PaperDTO> citedPapers) { this.citedPapers = citedPapers; }
}
