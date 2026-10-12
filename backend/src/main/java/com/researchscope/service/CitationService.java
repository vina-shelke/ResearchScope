package com.researchscope.service;

import com.researchscope.dto.CitationIntelligenceDTO;
import com.researchscope.dto.PaperDTO;
import com.researchscope.entity.Paper;
import com.researchscope.repository.PaperRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CitationService {

    private final PaperRepository paperRepository;
    private final PaperService paperService;

    public CitationService(PaperRepository paperRepository, PaperService paperService) {
        this.paperRepository = paperRepository;
        this.paperService = paperService;
    }

    public CitationIntelligenceDTO getCitationIntelligence() {
        List<Paper> topPapers = paperRepository.findTopCitedPapers(PageRequest.of(0, 10));
        List<PaperDTO> mostCited = topPapers.stream().map(paperService::toPaperDTO).toList();

        // Citation Distribution breakdown
        List<Paper> allPapers = paperRepository.findAll();
        Map<String, Integer> distMap = new LinkedHashMap<>();
        distMap.put("0-10 Citations", 0);
        distMap.put("11-50 Citations", 0);
        distMap.put("51-100 Citations", 0);
        distMap.put("100+ Citations", 0);

        for (Paper p : allPapers) {
            int c = p.getCitationCount() != null ? p.getCitationCount() : 0;
            if (c <= 10) distMap.put("0-10 Citations", distMap.get("0-10 Citations") + 1);
            else if (c <= 50) distMap.put("11-50 Citations", distMap.get("11-50 Citations") + 1);
            else if (c <= 100) distMap.put("51-100 Citations", distMap.get("51-100 Citations") + 1);
            else distMap.put("100+ Citations", distMap.get("100+ Citations") + 1);
        }

        List<Map<String, Object>> citationDistribution = distMap.entrySet().stream().map(e -> {
            Map<String, Object> m = new HashMap<>();
            m.put("range", e.getKey());
            m.put("count", e.getValue());
            return m;
        }).toList();

        // Citation trend by year
        Map<Integer, Integer> yearCitations = new TreeMap<>();
        for (Paper p : allPapers) {
            if (p.getPublicationYear() != null) {
                yearCitations.put(p.getPublicationYear(),
                        yearCitations.getOrDefault(p.getPublicationYear(), 0) + (p.getCitationCount() != null ? p.getCitationCount() : 0));
            }
        }

        List<Map<String, Object>> citationTrends = yearCitations.entrySet().stream().map(e -> {
            Map<String, Object> m = new HashMap<>();
            m.put("year", e.getKey());
            m.put("citations", e.getValue());
            return m;
        }).toList();

        return new CitationIntelligenceDTO(mostCited, citationDistribution, citationTrends);
    }
}
