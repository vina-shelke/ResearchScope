package com.researchscope.repository;

import com.researchscope.entity.ResearchProject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResearchProjectRepository extends JpaRepository<ResearchProject, String> {
    List<ResearchProject> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<ResearchProject> findByIdAndUserId(String id, String userId);
}
