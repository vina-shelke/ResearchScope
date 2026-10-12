package com.researchscope.repository;

import com.researchscope.entity.Institution;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InstitutionRepository extends JpaRepository<Institution, String> {

    Optional<Institution> findByNameIgnoreCase(String name);

    @Query("SELECT i FROM Institution i WHERE (:query IS NULL OR LOWER(i.name) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Institution> searchInstitutions(@Param("query") String query, Pageable pageable);

    @Query("SELECT i FROM Institution i ORDER BY i.paperCount DESC")
    List<Institution> findTopInstitutions(Pageable pageable);
}
