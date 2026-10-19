package com.researchscope.dto;

import java.util.List;

public class PaperComparisonItemDTO {
    private String paperId;
    private String title;
    private List<String> authors;
    private Integer publicationYear;
    private String venue;
    private String doi;
    private String url;
    private Integer citationCount;
    private Boolean isOpenAccess;

    private String researchProblem;
    private String researchQuestions;
    private List<String> methodsAndAlgorithms;
    private String datasetsAndSamples;
    private List<String> evaluationMetrics;
    private String mainFindings;
    private String limitations;
    private String futureDirections;

    public PaperComparisonItemDTO() {}

    public PaperComparisonItemDTO(
            String paperId,
            String title,
            List<String> authors,
            Integer publicationYear,
            String venue,
            String doi,
            String url,
            Integer citationCount,
            Boolean isOpenAccess,
            String researchProblem,
            String researchQuestions,
            List<String> methodsAndAlgorithms,
            String datasetsAndSamples,
            List<String> evaluationMetrics,
            String mainFindings,
            String limitations,
            String futureDirections
    ) {
        this.paperId = paperId;
        this.title = title;
        this.authors = authors;
        this.publicationYear = publicationYear;
        this.venue = venue != null && !venue.isBlank() ? venue : "Not available";
        this.doi = doi != null && !doi.isBlank() ? doi : "Not available";
        this.url = url != null && !url.isBlank() ? url : "Not available";
        this.citationCount = citationCount;
        this.isOpenAccess = isOpenAccess;
        this.researchProblem = researchProblem != null && !researchProblem.isBlank() ? researchProblem : "Not available";
        this.researchQuestions = researchQuestions != null && !researchQuestions.isBlank() ? researchQuestions : "Not available";
        this.methodsAndAlgorithms = methodsAndAlgorithms != null && !methodsAndAlgorithms.isEmpty() ? methodsAndAlgorithms : List.of("Not available");
        this.datasetsAndSamples = datasetsAndSamples != null && !datasetsAndSamples.isBlank() ? datasetsAndSamples : "Not available";
        this.evaluationMetrics = evaluationMetrics != null && !evaluationMetrics.isEmpty() ? evaluationMetrics : List.of("Not available");
        this.mainFindings = mainFindings != null && !mainFindings.isBlank() ? mainFindings : "Not available";
        this.limitations = limitations != null && !limitations.isBlank() ? limitations : "Not available";
        this.futureDirections = futureDirections != null && !futureDirections.isBlank() ? futureDirections : "Not available";
    }

    public String getPaperId() { return paperId; }
    public void setPaperId(String paperId) { this.paperId = paperId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public List<String> getAuthors() { return authors; }
    public void setAuthors(List<String> authors) { this.authors = authors; }

    public Integer getPublicationYear() { return publicationYear; }
    public void setPublicationYear(Integer publicationYear) { this.publicationYear = publicationYear; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public String getDoi() { return doi; }
    public void setDoi(String doi) { this.doi = doi; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public Integer getCitationCount() { return citationCount; }
    public void setCitationCount(Integer citationCount) { this.citationCount = citationCount; }

    public Boolean getIsOpenAccess() { return isOpenAccess; }
    public void setIsOpenAccess(Boolean isOpenAccess) { this.isOpenAccess = isOpenAccess; }

    public String getResearchProblem() { return researchProblem; }
    public void setResearchProblem(String researchProblem) { this.researchProblem = researchProblem; }

    public String getResearchQuestions() { return researchQuestions; }
    public void setResearchQuestions(String researchQuestions) { this.researchQuestions = researchQuestions; }

    public List<String> getMethodsAndAlgorithms() { return methodsAndAlgorithms; }
    public void setMethodsAndAlgorithms(List<String> methodsAndAlgorithms) { this.methodsAndAlgorithms = methodsAndAlgorithms; }

    public String getDatasetsAndSamples() { return datasetsAndSamples; }
    public void setDatasetsAndSamples(String datasetsAndSamples) { this.datasetsAndSamples = datasetsAndSamples; }

    public List<String> getEvaluationMetrics() { return evaluationMetrics; }
    public void setEvaluationMetrics(List<String> evaluationMetrics) { this.evaluationMetrics = evaluationMetrics; }

    public String getMainFindings() { return mainFindings; }
    public void setMainFindings(String mainFindings) { this.mainFindings = mainFindings; }

    public String getLimitations() { return limitations; }
    public void setLimitations(String limitations) { this.limitations = limitations; }

    public String getFutureDirections() { return futureDirections; }
    public void setFutureDirections(String futureDirections) { this.futureDirections = futureDirections; }
}
