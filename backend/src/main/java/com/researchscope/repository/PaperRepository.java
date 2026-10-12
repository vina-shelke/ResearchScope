package com.researchscope.repository;

import com.researchscope.entity.Paper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaperRepository extends JpaRepository<Paper, String> {

    Optional<Paper> findByDoi(String doi);

    List<Paper> findByTitleIgnoreCase(String title);

    @Query("""
        SELECT p FROM Paper p
        WHERE (:query IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.abstractText) LIKE LOWER(CONCAT('%', :query, '%')))
          AND (:year IS NULL OR p.publicationYear = :year)
          AND (:source IS NULL OR LOWER(p.source) = LOWER(:source))
          AND (:minCitations IS NULL OR p.citationCount >= :minCitations)
    """)
    Page<Paper> searchPapers(
        @Param("query") String query,
        @Param("year") Integer year,
        @Param("source") String source,
        @Param("minCitations") Integer minCitations,
        Pageable pageable
    );

    @Query("SELECT p.publicationYear, COUNT(p) FROM Paper p WHERE p.publicationYear IS NOT NULL GROUP BY p.publicationYear ORDER BY p.publicationYear ASC")
    List<Object[]> findPublicationTrend();

    @Query("SELECT p FROM Paper p ORDER BY p.citationCount DESC")
    List<Paper> findTopCitedPapers(Pageable pageable);

    @Query("SELECT p FROM Paper p JOIN PaperAuthor pa ON p.id = pa.paperId WHERE pa.authorId = :authorId")
    List<Paper> findPapersByAuthorId(@Param("authorId") String authorId);

    @Query("SELECT p FROM Paper p JOIN PaperInstitution pi ON p.id = pi.paperId WHERE pi.institutionId = :institutionId")
    List<Paper> findPapersByInstitutionId(@Param("institutionId") String institutionId);

    @Query("SELECT p FROM Paper p JOIN PaperTopic pt ON p.id = pt.paperId WHERE pt.topicId = :topicId")
    List<Paper> findPapersByTopicId(@Param("topicId") String topicId);
}
