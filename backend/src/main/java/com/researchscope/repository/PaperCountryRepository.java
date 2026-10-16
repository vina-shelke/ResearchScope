package com.researchscope.repository;

import com.researchscope.entity.PaperCountry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaperCountryRepository extends JpaRepository<PaperCountry, PaperCountry.PaperCountryId> {
    List<PaperCountry> findByPaperId(String paperId);
    List<PaperCountry> findByPaperIdIn(List<String> paperIds);
    List<PaperCountry> findByCountryCode(String countryCode);

    @org.springframework.data.jpa.repository.Query("""
        SELECT c.name, pc.countryCode, COUNT(pc.paperId)
        FROM PaperCountry pc
        JOIN Country c ON pc.countryCode = c.code
        GROUP BY c.name, pc.countryCode
        ORDER BY COUNT(pc.paperId) DESC
    """)
    List<Object[]> findCountryOutputDistribution();
}
