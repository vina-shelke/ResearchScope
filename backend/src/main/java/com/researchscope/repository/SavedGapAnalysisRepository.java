package com.researchscope.repository;

import com.researchscope.entity.SavedGapAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedGapAnalysisRepository extends JpaRepository<SavedGapAnalysis, String> {
    List<SavedGapAnalysis> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<SavedGapAnalysis> findByIdAndUserId(String id, String userId);
}
