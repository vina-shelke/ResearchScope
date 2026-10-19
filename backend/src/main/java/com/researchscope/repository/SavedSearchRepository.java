package com.researchscope.repository;

import com.researchscope.entity.SavedSearch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedSearchRepository extends JpaRepository<SavedSearch, String> {
    List<SavedSearch> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<SavedSearch> findByIdAndUserId(String id, String userId);
}
