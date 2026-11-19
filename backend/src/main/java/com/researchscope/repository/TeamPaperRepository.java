package com.researchscope.repository;

import com.researchscope.entity.TeamPaper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamPaperRepository extends JpaRepository<TeamPaper, Long> {
    List<TeamPaper> findByTeamIdOrderByAddedAtDesc(Long teamId);
    Optional<TeamPaper> findByTeamIdAndPaperId(Long teamId, String paperId);
    long countByTeamIdAndStatus(Long teamId, String status);
    void deleteByTeamId(Long teamId);
}
