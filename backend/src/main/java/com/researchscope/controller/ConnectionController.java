package com.researchscope.controller;

import com.researchscope.dto.ResearchGraphDTO;
import com.researchscope.service.ResearchConnectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/research-connections")
public class ConnectionController {

    private final ResearchConnectionService researchConnectionService;

    public ConnectionController(ResearchConnectionService researchConnectionService) {
        this.researchConnectionService = researchConnectionService;
    }

    @GetMapping
    public ResponseEntity<ResearchGraphDTO> getResearchGraph(
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "limit", defaultValue = "15") int limit
    ) {
        return ResponseEntity.ok(researchConnectionService.getResearchGraph(query, limit));
    }
}
