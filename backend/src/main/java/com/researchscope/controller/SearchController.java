package com.researchscope.controller;

import com.researchscope.dto.PaperDTO;
import com.researchscope.service.DataIngestionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final DataIngestionService dataIngestionService;

    public SearchController(DataIngestionService dataIngestionService) {
        this.dataIngestionService = dataIngestionService;
    }

    @GetMapping
    public ResponseEntity<List<PaperDTO>> searchTopic(@RequestParam("q") String query) {
        if (query == null || query.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        List<PaperDTO> papers = dataIngestionService.ingestResearchTopic(query.trim());
        return ResponseEntity.ok(papers);
    }
}
