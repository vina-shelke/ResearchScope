package com.researchscope.repository;

import com.researchscope.entity.MethodologyExtraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MethodologyExtractionRepository extends JpaRepository<MethodologyExtraction, String> {

    Optional<MethodologyExtraction> findByPaperId(String paperId);

    Optional<MethodologyExtraction> findByPaperIdAndUserId(String paperId, String userId);

    List<MethodologyExtraction> findByPaperIdIn(List<String> paperIds);

    List<MethodologyExtraction> findByPaperIdInAndUserId(List<String> paperIds, String userId);
}
