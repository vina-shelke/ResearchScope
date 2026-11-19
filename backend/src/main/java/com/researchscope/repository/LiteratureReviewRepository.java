package com.researchscope.repository;

import com.researchscope.entity.LiteratureReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LiteratureReviewRepository extends JpaRepository<LiteratureReview, String> {

    List<LiteratureReview> findByUserIdOrderByUpdatedAtDesc(String userId);

    List<LiteratureReview> findByUserIdAndProjectId(String userId, String projectId);

    Optional<LiteratureReview> findByIdAndUserId(String id, String userId);

    void deleteByIdAndUserId(String id, String userId);
}
