package com.researchscope.dto;

import java.util.ArrayList;
import java.util.List;

public class PaperDTO {
    private String id;
    private String title;
    private String abstractText;
    private Integer publicationYear;
    private String publicationDate;
    private String doi;
    private String venue;
    private Integer citationCount = 0;
    private String source;
    private String sourceId;
    private String url;

    private List<AuthorDTO> authors = new ArrayList<>();
    private List<InstitutionDTO> institutions = new ArrayList<>();
    private List<TopicDTO> topics = new ArrayList<>();
    private List<String> countries = new ArrayList<>();
    private List<PaperDTO> relatedPapers = new ArrayList<>();
    private List<PaperDTO> citations = new ArrayList<>();

    public PaperDTO() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAbstractText() { return abstractText; }
    public void setAbstractText(String abstractText) { this.abstractText = abstractText; }

    public Integer getPublicationYear() { return publicationYear; }
    public void setPublicationYear(Integer publicationYear) { this.publicationYear = publicationYear; }

    public String getPublicationDate() { return publicationDate; }
    public void setPublicationDate(String publicationDate) { this.publicationDate = publicationDate; }

    public String getDoi() { return doi; }
    public void setDoi(String doi) { this.doi = doi; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public Integer getCitationCount() { return citationCount; }
    public void setCitationCount(Integer citationCount) { this.citationCount = citationCount; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getSourceId() { return sourceId; }
    public void setSourceId(String sourceId) { this.sourceId = sourceId; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public List<AuthorDTO> getAuthors() { return authors; }
    public void setAuthors(List<AuthorDTO> authors) { this.authors = authors; }

    public List<InstitutionDTO> getInstitutions() { return institutions; }
    public void setInstitutions(List<InstitutionDTO> institutions) { this.institutions = institutions; }

    public List<TopicDTO> getTopics() { return topics; }
    public void setTopics(List<TopicDTO> topics) { this.topics = topics; }

    public List<String> getCountries() { return countries; }
    public void setCountries(List<String> countries) { this.countries = countries; }

    public List<PaperDTO> getRelatedPapers() { return relatedPapers; }
    public void setRelatedPapers(List<PaperDTO> relatedPapers) { this.relatedPapers = relatedPapers; }

    public List<PaperDTO> getCitations() { return citations; }
    public void setCitations(List<PaperDTO> citations) { this.citations = citations; }
}
