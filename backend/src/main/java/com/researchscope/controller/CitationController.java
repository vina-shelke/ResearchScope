package com.researchscope.controller;

import com.researchscope.dto.CitationIntelligenceDTO;
import com.researchscope.service.CitationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/citations")
public class CitationController {

    private final CitationService citationService;

    public CitationController(CitationService citationService) {
        this.citationService = citationService;
    }

    @GetMapping("/intelligence")
    public ResponseEntity<CitationIntelligenceDTO> getCitationIntelligence() {
        return ResponseEntity.ok(citationService.getCitationIntelligence());
    }
}
