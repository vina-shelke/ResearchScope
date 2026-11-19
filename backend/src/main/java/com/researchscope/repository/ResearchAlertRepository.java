package com.researchscope.repository;

import com.researchscope.entity.ResearchAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResearchAlertRepository extends JpaRepository<ResearchAlert, Long> {
    List<ResearchAlert> findByUserIdOrderByCreatedAtDesc(String userId);
    List<ResearchAlert> findByActiveTrue();
}
