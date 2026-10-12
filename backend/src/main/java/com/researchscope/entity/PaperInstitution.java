package com.researchscope.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "paper_institutions")
@IdClass(PaperInstitution.PaperInstitutionId.class)
public class PaperInstitution {

    @Id
    @Column(name = "paper_id", length = 100)
    private String paperId;

    @Id
    @Column(name = "institution_id", length = 100)
    private String institutionId;

    public PaperInstitution() {}
    public PaperInstitution(String paperId, String institutionId) {
        this.paperId = paperId;
        this.institutionId = institutionId;
    }

    public String getPaperId() { return paperId; }
    public void setPaperId(String paperId) { this.paperId = paperId; }

    public String getInstitutionId() { return institutionId; }
    public void setInstitutionId(String institutionId) { this.institutionId = institutionId; }

    public static class PaperInstitutionId implements Serializable {
        private String paperId;
        private String institutionId;
        public PaperInstitutionId() {}
        public PaperInstitutionId(String paperId, String institutionId) {
            this.paperId = paperId;
            this.institutionId = institutionId;
        }
        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            PaperInstitutionId that = (PaperInstitutionId) o;
            return Objects.equals(paperId, that.paperId) && Objects.equals(institutionId, that.institutionId);
        }
        @Override
        public int hashCode() { return Objects.hash(paperId, institutionId); }
    }
}
