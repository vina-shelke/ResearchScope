package com.researchscope.repository;

import com.researchscope.entity.RelatedPaper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RelatedPaperRepository extends JpaRepository<RelatedPaper, RelatedPaper.RelatedPaperId> {
    List<RelatedPaper> findByPaperId(String paperId);
}
