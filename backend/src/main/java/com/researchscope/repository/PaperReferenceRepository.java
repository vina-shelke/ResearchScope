package com.researchscope.repository;

import com.researchscope.entity.PaperReference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaperReferenceRepository extends JpaRepository<PaperReference, PaperReference.PaperReferenceId> {

    List<PaperReference> findByPaperId(String paperId);

    List<PaperReference> findByPaperIdIn(List<String> paperIds);

    List<PaperReference> findByReferencedPaperId(String referencedPaperId);

    boolean existsByPaperIdAndReferencedPaperId(String paperId, String referencedPaperId);
}
