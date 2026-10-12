package com.researchscope.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "paper_citations")
@IdClass(PaperCitation.PaperCitationId.class)
public class PaperCitation {

    @Id
    @Column(name = "citing_paper_id", length = 100)
    private String citingPaperId;

    @Id
    @Column(name = "cited_paper_id", length = 100)
    private String citedPaperId;

    public PaperCitation() {}
    public PaperCitation(String citingPaperId, String citedPaperId) {
        this.citingPaperId = citingPaperId;
        this.citedPaperId = citedPaperId;
    }

    public String getCitingPaperId() { return citingPaperId; }
    public void setCitingPaperId(String citingPaperId) { this.citingPaperId = citingPaperId; }

    public String getCitedPaperId() { return citedPaperId; }
    public void setCitedPaperId(String citedPaperId) { this.citedPaperId = citedPaperId; }

    public static class PaperCitationId implements Serializable {
        private String citingPaperId;
        private String citedPaperId;
        public PaperCitationId() {}
        public PaperCitationId(String citingPaperId, String citedPaperId) {
            this.citingPaperId = citingPaperId;
            this.citedPaperId = citedPaperId;
        }
        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            PaperCitationId that = (PaperCitationId) o;
            return Objects.equals(citingPaperId, that.citingPaperId) && Objects.equals(citedPaperId, that.citedPaperId);
        }
        @Override
        public int hashCode() { return Objects.hash(citingPaperId, citedPaperId); }
    }
}
