package com.researchscope.repository;

import com.researchscope.entity.LiteratureReviewSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LiteratureReviewSectionRepository extends JpaRepository<LiteratureReviewSection, String> {

    List<LiteratureReviewSection> findByReviewIdOrderByOrderIndexAsc(String reviewId);

    Optional<LiteratureReviewSection> findByReviewIdAndSectionKey(String reviewId, String sectionKey);

    void deleteByReviewId(String reviewId);
}
