package com.researchscope.repository;

import com.researchscope.entity.ResearchTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResearchTeamRepository extends JpaRepository<ResearchTeam, Long> {
    List<ResearchTeam> findByCreatedBy(String createdBy);
}
