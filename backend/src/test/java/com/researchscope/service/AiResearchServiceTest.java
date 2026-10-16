package com.researchscope.service;

import com.researchscope.dto.AiAnswerResponse;
import com.researchscope.dto.AiQuestionRequest;
import com.researchscope.dto.AuthorDTO;
import com.researchscope.dto.PaperDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class AiResearchServiceTest {

    private AiResearchService aiResearchService;

    @BeforeEach
    void setUp() {
        aiResearchService = new AiResearchService(null, null);
    }

    @Test
    void testGenerateGroundedSynthesis() {
        PaperDTO p1 = new PaperDTO();
        p1.setId("p-1");
        p1.setTitle("Large Language Models in Medical Diagnosis");
        p1.setPublicationYear(2023);
        p1.setCitationCount(85);
        p1.setIsOpenAccess(true);
        p1.setVenue("Nature Medicine");
        p1.setAbstractText("This study provides empirical evaluation of LLMs in diagnostic decision support, showing a 15% increase in accuracy.");
        AuthorDTO a1 = new AuthorDTO();
        a1.setName("Sarah Connor");
        p1.setAuthors(List.of(a1));

        PaperDTO p2 = new PaperDTO();
        p2.setId("p-2");
        p2.setTitle("Federated Learning for Clinical Privacy");
        p2.setPublicationYear(2022);
        p2.setCitationCount(120);
        p2.setIsOpenAccess(false);
        p2.setVenue("IEEE Transactions on Healthcare");
        p2.setAbstractText("We propose a privacy-preserving federated framework for multi-hospital clinical trials.");
        AuthorDTO a2 = new AuthorDTO();
        a2.setName("John Doe");
        p2.setAuthors(List.of(a2));

        String synthesis = aiResearchService.generateGroundedSynthesis(
                "How do LLMs and federated learning impact healthcare?",
                List.of(p1, p2)
        );

        assertNotNull(synthesis);
        assertTrue(synthesis.contains("### Executive Summary"));
        assertTrue(synthesis.contains("### Key Findings & Evidence Synthesis"));
        assertTrue(synthesis.contains("**[1] Sarah Connor (2023)** — *\"Large Language Models in Medical Diagnosis\"*"));
        assertTrue(synthesis.contains("**[2] John Doe (2022)** — *\"Federated Learning for Clinical Privacy\"*"));
        assertTrue(synthesis.contains("### Methodologies & Academic Context"));
        assertTrue(synthesis.contains("Cumulative Citations:** 205 citations"));
        assertTrue(synthesis.contains("Open Access Accessibility:** 1 out of 2"));
        assertTrue(synthesis.contains("Nature Medicine"));
        assertTrue(synthesis.contains("### Research Implications & Future Directions"));
    }

    @Test
    void testEmptyQuestionHandling() {
        AiQuestionRequest request = new AiQuestionRequest("", null, 5);
        AiAnswerResponse response = aiResearchService.answerResearchQuestion(request);

        assertNotNull(response);
        assertTrue(response.getAnswer().contains("Please provide a valid research question"));
    }
}
