package com.researchscope.service;

import com.researchscope.dto.AuthorDTO;
import com.researchscope.dto.PaperDTO;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class PaperServiceTest {

    @Test
    void testNormalizeDoi() {
        assertEquals("10.1145/3318464.3389700", PaperService.normalizeDoi("https://doi.org/10.1145/3318464.3389700"));
        assertEquals("10.1145/3318464.3389700", PaperService.normalizeDoi("http://dx.doi.org/10.1145/3318464.3389700"));
        assertEquals("10.1145/3318464.3389700", PaperService.normalizeDoi("doi:10.1145/3318464.3389700"));
        assertEquals("10.1145/3318464.3389700", PaperService.normalizeDoi("10.1145/3318464.3389700"));
        assertNull(PaperService.normalizeDoi(null));
        assertNull(PaperService.normalizeDoi("   "));
    }

    @Test
    void testGenerateBibTeX() {
        PaperService service = new PaperService(null, null, null, null, null, null, null, null, null, null, null, null, null);

        PaperDTO paper = new PaperDTO();
        paper.setId("paper-12345");
        paper.setTitle("Attention Is All You Need");
        paper.setPublicationYear(2017);
        paper.setVenue("NeurIPS");
        paper.setDoi("10.5555/3295222.3295349");

        AuthorDTO author1 = new AuthorDTO();
        author1.setName("Ashish Vaswani");
        AuthorDTO author2 = new AuthorDTO();
        author2.setName("Noam Shazeer");
        paper.setAuthors(List.of(author1, author2));

        String bibtex = service.generateBibTeX(paper);

        assertNotNull(bibtex);
        assertTrue(bibtex.startsWith("@article{"));
        assertTrue(bibtex.contains("title = {Attention Is All You Need}"));
        assertTrue(bibtex.contains("author = {Ashish Vaswani and Noam Shazeer}"));
        assertTrue(bibtex.contains("year = {2017}"));
        assertTrue(bibtex.contains("doi = {10.5555/3295222.3295349}"));
    }

    @Test
    void testGenerateCsv() {
        PaperService service = new PaperService(null, null, null, null, null, null, null, null, null, null, null, null, null);

        PaperDTO paper = new PaperDTO();
        paper.setId("p-1");
        paper.setTitle("BERT: Pre-training of Deep Bidirectional Transformers");
        paper.setPublicationYear(2018);
        paper.setVenue("NAACL");
        paper.setCitationCount(45000);
        paper.setSource("OpenAlex");
        paper.setDoi("10.18653/v1/N19-1423");
        paper.setIsOpenAccess(true);

        AuthorDTO author = new AuthorDTO();
        author.setName("Jacob Devlin");
        paper.setAuthors(List.of(author));

        String csv = service.generateCsv(List.of(paper));

        assertNotNull(csv);
        assertTrue(csv.contains("\"ID\",\"Title\",\"Authors\",\"Publication Year\",\"Venue\",\"Citations\",\"DOI\""));
        assertTrue(csv.contains("BERT: Pre-training of Deep Bidirectional Transformers"));
        assertTrue(csv.contains("Jacob Devlin"));
        assertTrue(csv.contains("45000"));
        assertTrue(csv.contains("10.18653/v1/N19-1423"));
    }
}
