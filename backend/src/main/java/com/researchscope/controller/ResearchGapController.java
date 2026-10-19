package com.researchscope.controller;

import com.researchscope.dto.ResearchGapAnalysisDTO;
import com.researchscope.service.ResearchGapService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/research-gaps")
public class ResearchGapController {

    private final ResearchGapService researchGapService;

    public ResearchGapController(ResearchGapService researchGapService) {
        this.researchGapService = researchGapService;
    }

    @GetMapping
    public ResponseEntity<ResearchGapAnalysisDTO> analyzeTopicGaps(
            @RequestParam(value = "q", defaultValue = "Generative AI in Education") String query,
            @RequestParam(value = "limit", defaultValue = "30") int limit
    ) {
        ResearchGapAnalysisDTO result = researchGapService.analyzeTopicGaps(query, limit);
        return ResponseEntity.ok(result);
    }
}
