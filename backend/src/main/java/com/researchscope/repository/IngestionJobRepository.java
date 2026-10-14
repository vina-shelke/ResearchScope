package com.researchscope.repository;

import com.researchscope.entity.IngestionJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IngestionJobRepository extends JpaRepository<IngestionJob, String> {

    List<IngestionJob> findTop10ByOrderByCreatedAtDesc();

    List<IngestionJob> findByQueryTermIgnoreCaseOrderByCreatedAtDesc(String queryTerm);
}
