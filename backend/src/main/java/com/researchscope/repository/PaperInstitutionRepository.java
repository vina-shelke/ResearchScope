package com.researchscope.repository;

import com.researchscope.entity.PaperInstitution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaperInstitutionRepository extends JpaRepository<PaperInstitution, PaperInstitution.PaperInstitutionId> {
    List<PaperInstitution> findByPaperId(String paperId);
    List<PaperInstitution> findByInstitutionId(String institutionId);
}
