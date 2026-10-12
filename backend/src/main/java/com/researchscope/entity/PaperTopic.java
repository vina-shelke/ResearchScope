package com.researchscope.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "paper_topics")
@IdClass(PaperTopic.PaperTopicId.class)
public class PaperTopic {

    @Id
    @Column(name = "paper_id", length = 100)
    private String paperId;

    @Id
    @Column(name = "topic_id", length = 100)
    private String topicId;

    public PaperTopic() {}
    public PaperTopic(String paperId, String topicId) {
        this.paperId = paperId;
        this.topicId = topicId;
    }

    public String getPaperId() { return paperId; }
    public void setPaperId(String paperId) { this.paperId = paperId; }

    public String getTopicId() { return topicId; }
    public void setTopicId(String topicId) { this.topicId = topicId; }

    public static class PaperTopicId implements Serializable {
        private String paperId;
        private String topicId;
        public PaperTopicId() {}
        public PaperTopicId(String paperId, String topicId) {
            this.paperId = paperId;
            this.topicId = topicId;
        }
        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            PaperTopicId that = (PaperTopicId) o;
            return Objects.equals(paperId, that.paperId) && Objects.equals(topicId, that.topicId);
        }
        @Override
        public int hashCode() { return Objects.hash(paperId, topicId); }
    }
}
