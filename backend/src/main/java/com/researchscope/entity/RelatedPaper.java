package com.researchscope.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "related_papers")
@IdClass(RelatedPaper.RelatedPaperId.class)
public class RelatedPaper {

    @Id
    @Column(name = "paper_id", length = 100)
    private String paperId;

    @Id
    @Column(name = "related_paper_id", length = 100)
    private String relatedPaperId;

    @Column(name = "similarity_score")
    private Double similarityScore = 0.0;

    public RelatedPaper() {}
    public RelatedPaper(String paperId, String relatedPaperId, Double similarityScore) {
        this.paperId = paperId;
        this.relatedPaperId = relatedPaperId;
        this.similarityScore = similarityScore;
    }

    public String getPaperId() { return paperId; }
    public void setPaperId(String paperId) { this.paperId = paperId; }

    public String getRelatedPaperId() { return relatedPaperId; }
    public void setRelatedPaperId(String relatedPaperId) { this.relatedPaperId = relatedPaperId; }

    public Double getSimilarityScore() { return similarityScore; }
    public void setSimilarityScore(Double similarityScore) { this.similarityScore = similarityScore; }

    public static class RelatedPaperId implements Serializable {
        private String paperId;
        private String relatedPaperId;
        public RelatedPaperId() {}
        public RelatedPaperId(String paperId, String relatedPaperId) {
            this.paperId = paperId;
            this.relatedPaperId = relatedPaperId;
        }
        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            RelatedPaperId that = (RelatedPaperId) o;
            return Objects.equals(paperId, that.paperId) && Objects.equals(relatedPaperId, that.relatedPaperId);
        }
        @Override
        public int hashCode() { return Objects.hash(paperId, relatedPaperId); }
    }
}
