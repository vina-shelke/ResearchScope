package com.researchscope.service;

import com.researchscope.dto.PaperDTO;
import com.researchscope.dto.ResearchGapAnalysisDTO;
import com.researchscope.dto.TopicDTO;
import com.researchscope.entity.Paper;
import com.researchscope.repository.PaperRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ResearchGapServiceTest {

    private PaperRepository paperRepository;
    private PaperService paperService;
    private DataIngestionService dataIngestionService;
    private ResearchGapService researchGapService;

    @BeforeEach
    void setUp() {
        paperRepository = mock(PaperRepository.class);
        paperService = mock(PaperService.class);
        dataIngestionService = mock(DataIngestionService.class);
        researchGapService = new ResearchGapService(paperRepository, paperService, dataIngestionService);
    }

    @Test
    void testAnalyzeTopicGapsSynthesizesEvidence() {
        Paper p1 = new Paper();
        p1.setId("p1");
        p1.setTitle("Adversarial Attacks on LLMs: A Comprehensive Survey");
        p1.setAbstractText("This survey reviews adversarial attacks. However, standardized benchmarks remain a major challenge in real-world deployment.");
        p1.setPublicationYear(2023);

        Paper p2 = new Paper();
        p2.setId("p2");
        p2.setTitle("Empirical Evaluation of Generative AI in Classrooms");
        p2.setAbstractText("We conduct an experiment with 500 students. Future research should evaluate differential privacy trade-offs.");
        p2.setPublicationYear(2024);

        when(paperRepository.searchPapersExtended(any(), any(), any(), any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(p1, p2)));

        PaperDTO dto1 = new PaperDTO();
        dto1.setId("p1");
        dto1.setTitle(p1.getTitle());
        dto1.setAbstractText(p1.getAbstractText());
        dto1.setPublicationYear(2023);
        dto1.setCitationCount(150);
        dto1.setTopics(List.of(new TopicDTO("t1", "Cybersecurity", "Field", 50)));

        PaperDTO dto2 = new PaperDTO();
        dto2.setId("p2");
        dto2.setTitle(p2.getTitle());
        dto2.setAbstractText(p2.getAbstractText());
        dto2.setPublicationYear(2024);
        dto2.setCitationCount(25);
        dto2.setTopics(List.of(new TopicDTO("t2", "Education", "Field", 30)));

        when(paperService.toPaperDTOs(anyList())).thenReturn(List.of(dto1, dto2));

        ResearchGapAnalysisDTO analysis = researchGapService.analyzeTopicGaps("Generative AI in Education", 10);

        assertNotNull(analysis);
        assertEquals("Generative AI in Education", analysis.getTopicQuery());
        assertEquals(2, analysis.getTotalPapersAnalyzed());
        assertFalse(analysis.getGapCandidates().isEmpty());

        var firstGap = analysis.getGapCandidates().get(0);
        assertNotNull(firstGap.getTitle());
        assertNotNull(firstGap.getExplanation());
        assertNotNull(firstGap.getConfidenceScore());
        assertFalse(firstGap.getSupportingPapers().isEmpty());
    }
}
