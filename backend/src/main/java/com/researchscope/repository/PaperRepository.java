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
        WHERE (:query IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.abstractText) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.doi) LIKE LOWER(CONCAT('%', :query, '%')))
          AND (:year IS NULL OR p.publicationYear = :year)
          AND (:source IS NULL OR LOWER(p.source) LIKE LOWER(CONCAT('%', :source, '%')))
          AND (:minCitations IS NULL OR p.citationCount >= :minCitations)
    """)
    Page<Paper> searchPapers(
        @Param("query") String query,
        @Param("year") Integer year,
        @Param("source") String source,
        @Param("minCitations") Integer minCitations,
        Pageable pageable
    );

    @Query("""
        SELECT DISTINCT p FROM Paper p
        LEFT JOIN PaperAuthor pa ON p.id = pa.paperId
        LEFT JOIN Author a ON pa.authorId = a.id
        LEFT JOIN PaperInstitution pi ON p.id = pi.paperId
        LEFT JOIN Institution inst ON pi.institutionId = inst.id
        WHERE (:query IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.abstractText) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.doi) LIKE LOWER(CONCAT('%', :query, '%')))
          AND (:year IS NULL OR p.publicationYear = :year)
          AND (:source IS NULL OR LOWER(p.source) LIKE LOWER(CONCAT('%', :source, '%')))
          AND (:minCitations IS NULL OR p.citationCount >= :minCitations)
          AND (:isOpenAccess IS NULL OR p.isOpenAccess = :isOpenAccess)
          AND (:paperType IS NULL OR LOWER(p.paperType) = LOWER(:paperType))
          AND (:author IS NULL OR LOWER(a.name) LIKE LOWER(CONCAT('%', :author, '%')))
          AND (:institution IS NULL OR LOWER(inst.name) LIKE LOWER(CONCAT('%', :institution, '%')))
    """)
    Page<Paper> searchPapersExtended(
        @Param("query") String query,
        @Param("year") Integer year,
        @Param("source") String source,
        @Param("minCitations") Integer minCitations,
        @Param("isOpenAccess") Boolean isOpenAccess,
        @Param("paperType") String paperType,
        @Param("author") String author,
        @Param("institution") String institution,
        Pageable pageable
    );

    @Query("SELECT COALESCE(SUM(p.citationCount), 0) FROM Paper p")
    Long sumCitationCount();

    @Query("SELECT COUNT(p) FROM Paper p WHERE p.isOpenAccess = true")
    Long countOpenAccess();

    @Query("SELECT p.publicationYear, COUNT(p) FROM Paper p WHERE p.publicationYear IS NOT NULL GROUP BY p.publicationYear ORDER BY p.publicationYear ASC")
    List<Object[]> findPublicationTrend();

    @Query("""
        SELECT p.publicationYear, COUNT(p)
        FROM Paper p
        WHERE (:query IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.abstractText) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.doi) LIKE LOWER(CONCAT('%', :query, '%')))
          AND p.publicationYear IS NOT NULL
        GROUP BY p.publicationYear
        ORDER BY p.publicationYear ASC
    """)
    List<Object[]> findPublicationTrendByQuery(@Param("query") String query);

    @Query("""
        SELECT p FROM Paper p
        WHERE (:query IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.abstractText) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.doi) LIKE LOWER(CONCAT('%', :query, '%')))
        ORDER BY p.citationCount DESC
    """)
    List<Paper> findTopCitedPapersByQuery(@Param("query") String query, Pageable pageable);

    @Query("SELECT p FROM Paper p ORDER BY p.citationCount DESC")
    List<Paper> findTopCitedPapers(Pageable pageable);

    @Query("SELECT p FROM Paper p JOIN PaperAuthor pa ON p.id = pa.paperId WHERE pa.authorId = :authorId")
    List<Paper> findPapersByAuthorId(@Param("authorId") String authorId);

    @Query("SELECT p FROM Paper p JOIN PaperInstitution pi ON p.id = pi.paperId WHERE pi.institutionId = :institutionId")
    List<Paper> findPapersByInstitutionId(@Param("institutionId") String institutionId);

    @Query("SELECT p FROM Paper p JOIN PaperTopic pt ON p.id = pt.paperId WHERE pt.topicId = :topicId")
    List<Paper> findPapersByTopicId(@Param("topicId") String topicId);

    @Query("""
        SELECT p.publicationYear, COUNT(p)
        FROM Paper p
        JOIN PaperTopic pt ON p.id = pt.paperId
        WHERE pt.topicId = :topicId AND p.publicationYear IS NOT NULL
        GROUP BY p.publicationYear
        ORDER BY p.publicationYear ASC
    """)
    List<Object[]> findPublicationTrendByTopicId(@Param("topicId") String topicId);

    @Query("""
        SELECT a, COUNT(p)
        FROM Paper p
        JOIN PaperTopic pt ON p.id = pt.paperId
        JOIN PaperAuthor pa ON p.id = pa.paperId
        JOIN Author a ON pa.authorId = a.id
        WHERE pt.topicId = :topicId
        GROUP BY a
        ORDER BY COUNT(p) DESC
    """)
    List<Object[]> findTopAuthorsByTopicId(@Param("topicId") String topicId, Pageable pageable);

    @Query("""
        SELECT inst, COUNT(p)
        FROM Paper p
        JOIN PaperTopic pt ON p.id = pt.paperId
        JOIN PaperInstitution pi ON p.id = pi.paperId
        JOIN Institution inst ON pi.institutionId = inst.id
        WHERE pt.topicId = :topicId
        GROUP BY inst
        ORDER BY COUNT(p) DESC
    """)
    List<Object[]> findTopInstitutionsByTopicId(@Param("topicId") String topicId, Pageable pageable);
}
