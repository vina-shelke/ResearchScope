package com.researchscope.repository;

import com.researchscope.entity.PaperCitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaperCitationRepository extends JpaRepository<PaperCitation, PaperCitation.PaperCitationId> {
    List<PaperCitation> findByCitingPaperId(String citingPaperId);
    List<PaperCitation> findByCitedPaperId(String citedPaperId);
}
