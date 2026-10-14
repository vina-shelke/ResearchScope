package com.researchscope.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "paper_references")
@IdClass(PaperReference.PaperReferenceId.class)
public class PaperReference {

    @Id
    @Column(name = "paper_id", length = 100)
    private String paperId;

    @Id
    @Column(name = "referenced_paper_id", length = 100)
    private String referencedPaperId;

    public PaperReference() {}

    public PaperReference(String paperId, String referencedPaperId) {
        this.paperId = paperId;
        this.referencedPaperId = referencedPaperId;
    }

    public String getPaperId() { return paperId; }
    public void setPaperId(String paperId) { this.paperId = paperId; }

    public String getReferencedPaperId() { return referencedPaperId; }
    public void setReferencedPaperId(String referencedPaperId) { this.referencedPaperId = referencedPaperId; }

    public static class PaperReferenceId implements Serializable {
        private String paperId;
        private String referencedPaperId;

        public PaperReferenceId() {}

        public PaperReferenceId(String paperId, String referencedPaperId) {
            this.paperId = paperId;
            this.referencedPaperId = referencedPaperId;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            PaperReferenceId that = (PaperReferenceId) o;
            return Objects.equals(paperId, that.paperId) && Objects.equals(referencedPaperId, that.referencedPaperId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(paperId, referencedPaperId);
        }
    }
}
