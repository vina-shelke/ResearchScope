package com.researchscope.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "paper_countries")
@IdClass(PaperCountry.PaperCountryId.class)
public class PaperCountry {

    @Id
    @Column(name = "paper_id", length = 100)
    private String paperId;

    @Id
    @Column(name = "country_code", length = 10)
    private String countryCode;

    public PaperCountry() {}
    public PaperCountry(String paperId, String countryCode) {
        this.paperId = paperId;
        this.countryCode = countryCode;
    }

    public String getPaperId() { return paperId; }
    public void setPaperId(String paperId) { this.paperId = paperId; }

    public String getCountryCode() { return countryCode; }
    public void setCountryCode(String countryCode) { this.countryCode = countryCode; }

    public static class PaperCountryId implements Serializable {
        private String paperId;
        private String countryCode;
        public PaperCountryId() {}
        public PaperCountryId(String paperId, String countryCode) {
            this.paperId = paperId;
            this.countryCode = countryCode;
        }
        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            PaperCountryId that = (PaperCountryId) o;
            return Objects.equals(paperId, that.paperId) && Objects.equals(countryCode, that.countryCode);
        }
        @Override
        public int hashCode() { return Objects.hash(paperId, countryCode); }
    }
}
