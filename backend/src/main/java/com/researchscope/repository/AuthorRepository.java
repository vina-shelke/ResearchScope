package com.researchscope.repository;

import com.researchscope.entity.Author;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuthorRepository extends JpaRepository<Author, String> {

    Optional<Author> findByNameIgnoreCase(String name);
    Optional<Author> findByOpenAlexId(String openAlexId);

    @Query("SELECT a FROM Author a WHERE (:query IS NULL OR LOWER(a.name) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Author> searchAuthors(@Param("query") String query, Pageable pageable);

    @Query("SELECT a FROM Author a ORDER BY a.paperCount DESC")
    List<Author> findTopAuthorsByPaperCount(Pageable pageable);
}
