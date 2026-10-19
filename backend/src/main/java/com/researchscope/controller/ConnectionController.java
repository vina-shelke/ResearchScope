package com.researchscope.controller;

import com.researchscope.dto.ResearchGraphDTO;
import com.researchscope.service.ResearchConnectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "topic", required = false) String topic,
            @RequestParam(value = "author", required = false) String author,
            @RequestParam(value = "institution", required = false) String institution,
            @RequestParam(value = "relationships", required = false) List<String> relationships,
            @RequestParam(value = "limit", defaultValue = "15") int limit
    ) {
        ResearchGraphDTO graph = researchConnectionService.getResearchGraph(
                query, year, topic, author, institution, relationships, limit
        );
        return ResponseEntity.ok(graph);
    }

    @GetMapping("/expand")
    public ResponseEntity<ResearchGraphDTO> expandNode(
            @RequestParam("nodeId") String nodeId,
            @RequestParam(value = "nodeType", defaultValue = "Paper") String nodeType,
            @RequestParam(value = "limit", defaultValue = "8") int limit
    ) {
        ResearchGraphDTO expansion = researchConnectionService.expandNode(nodeId, nodeType, limit);
        return ResponseEntity.ok(expansion);
    }
}
