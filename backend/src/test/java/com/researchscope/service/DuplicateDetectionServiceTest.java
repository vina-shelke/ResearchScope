package com.researchscope.service;

import com.researchscope.dto.AuthorDTO;
import com.researchscope.dto.PaperDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class DuplicateDetectionServiceTest {

    private DuplicateDetectionService service;

    @BeforeEach
    void setUp() {
        service = new DuplicateDetectionService();
    }

    @Test
    void testNormalizeDoi() {
        assertEquals("10.1016/j.compedu.2023.104764", service.normalizeDoi("https://doi.org/10.1016/j.compedu.2023.104764"));
        assertEquals("10.1016/j.compedu.2023.104764", service.normalizeDoi("http://dx.doi.org/10.1016/j.compedu.2023.104764"));
        assertEquals("10.1016/j.compedu.2023.104764", service.normalizeDoi("doi:10.1016/j.compedu.2023.104764"));
        assertEquals("10.1016/j.compedu.2023.104764", service.normalizeDoi(" 10.1016/j.compedu.2023.104764 "));
        assertNull(service.normalizeDoi(null));
        assertNull(service.normalizeDoi("   "));
    }

    @Test
    void testDeduplicateAndMergeByDoi() {
        PaperDTO paper1 = new PaperDTO();
        paper1.setId("p1");
        paper1.setTitle("Generative AI in Education: A Review");
        paper1.setDoi("https://doi.org/10.1016/j.compedu.2023.104764");
        paper1.setPublicationYear(2023);
        paper1.setSource("OpenAlex");
        paper1.setCitationCount(42);
        paper1.setAbstractText("Abstract not available.");

        PaperDTO paper2 = new PaperDTO();
        paper2.setId("p2");
        paper2.setTitle("Generative AI in Education: A Review");
        paper2.setDoi("10.1016/j.compedu.2023.104764");
        paper2.setPublicationYear(2023);
        paper2.setSource("Crossref");
        paper2.setCitationCount(50);
        paper2.setAbstractText("This paper provides a detailed empirical investigation into generative AI models.");
        paper2.setIsOpenAccess(true);
        paper2.setPdfUrl("https://example.com/pdf");

        List<PaperDTO> merged = service.deduplicateAndMerge(List.of(paper1, paper2));

        assertEquals(1, merged.size(), "Should merge 2 duplicate DOI records into 1");
        PaperDTO result = merged.get(0);
        assertEquals("10.1016/j.compedu.2023.104764", result.getDoi());
        assertTrue(result.getSource().contains("OpenAlex"));
        assertTrue(result.getSource().contains("Crossref"));
        assertEquals(50, result.getCitationCount(), "Should take maximum citation count");
        assertEquals("This paper provides a detailed empirical investigation into generative AI models.", result.getAbstractText(), "Should enrich missing abstract");
        assertTrue(result.getIsOpenAccess(), "Should preserve Open Access flag");
        assertEquals("https://example.com/pdf", result.getPdfUrl());
    }

    @Test
    void testDeduplicateAndMergeByTitleAuthorYear() {
        PaperDTO paper1 = new PaperDTO();
        paper1.setId("p1");
        paper1.setTitle("Deep Learning for Autonomous Vehicles");
        paper1.setPublicationYear(2022);
        paper1.setSource("Semantic Scholar");
        AuthorDTO a1 = new AuthorDTO();
        a1.setName("Alice Smith");
        paper1.getAuthors().add(a1);

        PaperDTO paper2 = new PaperDTO();
        paper2.setId("p2");
        paper2.setTitle("Deep Learning for Autonomous Vehicles!");
        paper2.setPublicationYear(2022);
        paper2.setSource("OpenAlex");
        AuthorDTO a2 = new AuthorDTO();
        a2.setName("Alice Smith");
        a2.setOrcid("0000-0002-1825-0097");
        paper2.getAuthors().add(a2);

        AuthorDTO a3 = new AuthorDTO();
        a3.setName("Bob Jones");
        paper2.getAuthors().add(a3);

        List<PaperDTO> merged = service.deduplicateAndMerge(List.of(paper1, paper2));

        assertEquals(1, merged.size());
        PaperDTO result = merged.get(0);
        assertEquals(2, result.getAuthors().size(), "Should merge author lists");
        assertEquals("0000-0002-1825-0097", result.getAuthors().get(0).getOrcid(), "Should enrich author ORCID");
    }
}
