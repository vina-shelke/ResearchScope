package com.researchscope.repository;

import com.researchscope.entity.SavedPaper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedPaperRepository extends JpaRepository<SavedPaper, String> {

    Optional<SavedPaper> findByPaperId(String paperId);

    Optional<SavedPaper> findByUserIdAndPaperId(String userId, String paperId);

    List<SavedPaper> findByPaperIdIn(List<String> paperIds);

    boolean existsByPaperId(String paperId);

    boolean existsByUserIdAndPaperId(String userId, String paperId);

    void deleteByPaperId(String paperId);

    void deleteByUserIdAndPaperId(String userId, String paperId);

    List<SavedPaper> findAllByOrderBySavedAtDesc();

    List<SavedPaper> findByUserIdOrderBySavedAtDesc(String userId);

    List<SavedPaper> findByCollectionNameOrderBySavedAtDesc(String collectionName);

    List<SavedPaper> findByUserIdAndCollectionNameOrderBySavedAtDesc(String userId, String collectionName);

    List<SavedPaper> findByUserIdAndProjectIdOrderBySavedAtDesc(String userId, String projectId);

    List<SavedPaper> findByUserIdAndReadingStatusOrderBySavedAtDesc(String userId, String readingStatus);

    @Query("SELECT DISTINCT s.collectionName FROM SavedPaper s WHERE s.collectionName IS NOT NULL ORDER BY s.collectionName ASC")
    List<String> findDistinctCollections();

    @Query("SELECT DISTINCT s.collectionName FROM SavedPaper s WHERE s.userId = :userId AND s.collectionName IS NOT NULL ORDER BY s.collectionName ASC")
    List<String> findDistinctCollectionsByUserId(@Param("userId") String userId);
}
