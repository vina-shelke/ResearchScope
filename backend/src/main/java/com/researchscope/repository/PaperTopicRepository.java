package com.researchscope.repository;

import com.researchscope.entity.PaperTopic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaperTopicRepository extends JpaRepository<PaperTopic, PaperTopic.PaperTopicId> {
    List<PaperTopic> findByPaperId(String paperId);
    List<PaperTopic> findByTopicId(String topicId);
}
