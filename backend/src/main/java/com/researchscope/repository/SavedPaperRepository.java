package com.researchscope.repository;

import com.researchscope.entity.SavedPaper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedPaperRepository extends JpaRepository<SavedPaper, String> {

    Optional<SavedPaper> findByPaperId(String paperId);

    boolean existsByPaperId(String paperId);

    void deleteByPaperId(String paperId);

    List<SavedPaper> findAllByOrderBySavedAtDesc();

    List<SavedPaper> findByCollectionNameOrderBySavedAtDesc(String collectionName);

    @Query("SELECT DISTINCT s.collectionName FROM SavedPaper s WHERE s.collectionName IS NOT NULL ORDER BY s.collectionName ASC")
    List<String> findDistinctCollections();
}
