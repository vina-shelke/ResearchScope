package com.researchscope.service;

import com.researchscope.dto.PaperComparisonMatrixDTO;
import com.researchscope.dto.PaperDTO;
import com.researchscope.dto.TopicDTO;
import com.researchscope.entity.Paper;
import com.researchscope.repository.PaperRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PaperComparisonServiceTest {

    private PaperRepository paperRepository;
    private PaperService paperService;
    private PaperComparisonService comparisonService;

    @BeforeEach
    void setUp() {
        paperRepository = mock(PaperRepository.class);
        paperService = mock(PaperService.class);
        comparisonService = new PaperComparisonService(paperRepository, paperService);
    }

    @Test
    void testComparePapersExtractsGroundedDimensions() {
        Paper p1 = new Paper();
        p1.setId("p1");
        p1.setTitle("Deep Learning for Cybersecurity: A Benchmark");
        p1.setAbstractText("This paper proposes a Transformer framework. We evaluated on ImageNet. Accuracy reached 98%. However, latency remains a challenge.");
        p1.setPublicationYear(2023);

        Paper p2 = new Paper();
        p2.setId("p2");
        p2.setTitle("Adversarial Robustness in Transformer Networks");
        p2.setAbstractText("This paper investigates whether attention heads are vulnerable. Tested on ImageNet. F1-Score was 95%. Future research should test pruning.");
        p2.setPublicationYear(2024);

        when(paperRepository.findAllById(anyList())).thenReturn(List.of(p1, p2));

        PaperDTO dto1 = new PaperDTO();
        dto1.setId("p1");
        dto1.setTitle(p1.getTitle());
        dto1.setAbstractText(p1.getAbstractText());
        dto1.setPublicationYear(2023);
        dto1.setVenue("IEEE S&P");
        dto1.setCitationCount(80);
        dto1.setTopics(List.of(new TopicDTO("t1", "Transformer", "Field", 50)));

        PaperDTO dto2 = new PaperDTO();
        dto2.setId("p2");
        dto2.setTitle(p2.getTitle());
        dto2.setAbstractText(p2.getAbstractText());
        dto2.setPublicationYear(2024);
        dto2.setVenue("ACM CCS");
        dto2.setCitationCount(45);
        dto2.setTopics(List.of(new TopicDTO("t1", "Transformer", "Field", 50)));

        when(paperService.toPaperDTOs(anyList())).thenReturn(List.of(dto1, dto2));

        PaperComparisonMatrixDTO matrix = comparisonService.comparePapers(List.of("p1", "p2"));

        assertNotNull(matrix);
        assertEquals(2, matrix.getPapers().size());

        var paper1 = matrix.getPapers().get(0);
        assertEquals("p1", paper1.getPaperId());
        assertTrue(paper1.getMethodsAndAlgorithms().contains("Transformer"));
        assertTrue(paper1.getEvaluationMetrics().contains("Accuracy"));
        assertNotEquals("Not available", paper1.getLimitations());

        var paper2 = matrix.getPapers().get(1);
        assertEquals("p2", paper2.getPaperId());
        assertTrue(paper2.getEvaluationMetrics().contains("F1-Score"));

        // Common methods
        assertTrue(matrix.getCommonMethods().contains("Transformer"));

        // CSV export
        String csv = comparisonService.exportComparisonCsv(List.of("p1", "p2"));
        assertNotNull(csv);
        assertTrue(csv.contains("Research Problem"));
        assertTrue(csv.contains("Deep Learning for Cybersecurity"));
    }
}
