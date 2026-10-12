package com.researchscope.repository;

import com.researchscope.entity.PaperCountry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaperCountryRepository extends JpaRepository<PaperCountry, PaperCountry.PaperCountryId> {
    List<PaperCountry> findByPaperId(String paperId);
    List<PaperCountry> findByCountryCode(String countryCode);
}
