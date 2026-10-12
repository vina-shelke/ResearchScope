package com.researchscope.repository;

import com.researchscope.entity.Topic;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TopicRepository extends JpaRepository<Topic, String> {

    Optional<Topic> findByNameIgnoreCase(String name);

    @Query("SELECT t FROM Topic t WHERE (:query IS NULL OR LOWER(t.name) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Topic> searchTopics(@Param("query") String query, Pageable pageable);

    @Query("SELECT t FROM Topic t ORDER BY t.paperCount DESC")
    List<Topic> findTopTopics(Pageable pageable);
}
