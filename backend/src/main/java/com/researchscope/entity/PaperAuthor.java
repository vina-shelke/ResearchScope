package com.researchscope.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "paper_authors")
@IdClass(PaperAuthor.PaperAuthorId.class)
public class PaperAuthor {

    @Id
    @Column(name = "paper_id", length = 100)
    private String paperId;

    @Id
    @Column(name = "author_id", length = 100)
    private String authorId;

    @Column(name = "author_order")
    private Integer authorOrder = 0;

    public PaperAuthor() {}

    public PaperAuthor(String paperId, String authorId, Integer authorOrder) {
        this.paperId = paperId;
        this.authorId = authorId;
        this.authorOrder = authorOrder;
    }

    public String getPaperId() { return paperId; }
    public void setPaperId(String paperId) { this.paperId = paperId; }

    public String getAuthorId() { return authorId; }
    public void setAuthorId(String authorId) { this.authorId = authorId; }

    public Integer getAuthorOrder() { return authorOrder; }
    public void setAuthorOrder(Integer authorOrder) { this.authorOrder = authorOrder; }

    public static class PaperAuthorId implements Serializable {
        private String paperId;
        private String authorId;

        public PaperAuthorId() {}
        public PaperAuthorId(String paperId, String authorId) {
            this.paperId = paperId;
            this.authorId = authorId;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            PaperAuthorId that = (PaperAuthorId) o;
            return Objects.equals(paperId, that.paperId) && Objects.equals(authorId, that.authorId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(paperId, authorId);
        }
    }
}
