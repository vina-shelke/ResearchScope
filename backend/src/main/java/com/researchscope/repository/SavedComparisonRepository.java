package com.researchscope.repository;

import com.researchscope.entity.SavedComparison;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedComparisonRepository extends JpaRepository<SavedComparison, String> {
    List<SavedComparison> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<SavedComparison> findByIdAndUserId(String id, String userId);
}
