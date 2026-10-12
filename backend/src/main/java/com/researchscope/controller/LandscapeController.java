package com.researchscope.controller;

import com.researchscope.dto.LandscapeSummaryDTO;
import com.researchscope.service.ResearchLandscapeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/research-landscape")
public class LandscapeController {

    private final ResearchLandscapeService researchLandscapeService;

    public LandscapeController(ResearchLandscapeService researchLandscapeService) {
        this.researchLandscapeService = researchLandscapeService;
    }

    @GetMapping
    public ResponseEntity<LandscapeSummaryDTO> getLandscape(@RequestParam(value = "q", required = false) String query) {
        LandscapeSummaryDTO summary = researchLandscapeService.getResearchLandscape(query);
        return ResponseEntity.ok(summary);
    }
}
