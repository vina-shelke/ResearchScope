package com.researchscope.controller;

import com.researchscope.dto.IngestionJobDTO;
import com.researchscope.dto.PaperDTO;
import com.researchscope.service.DataIngestionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ingestion")
public class IngestionController {

    private final DataIngestionService dataIngestionService;

    public IngestionController(DataIngestionService dataIngestionService) {
        this.dataIngestionService = dataIngestionService;
    }

    @PostMapping("/jobs")
    public ResponseEntity<IngestionJobDTO> triggerAsyncIngestion(@RequestParam("q") String query) {
        if (query == null || query.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        IngestionJobDTO job = dataIngestionService.startAsyncIngestion(query.trim());
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(job);
    }

    @GetMapping("/jobs/{id}")
    public ResponseEntity<IngestionJobDTO> getJobStatus(@PathVariable("id") String id) {
        return dataIngestionService.getJobById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/jobs")
    public ResponseEntity<List<IngestionJobDTO>> getRecentJobs() {
        return ResponseEntity.ok(dataIngestionService.getRecentJobs());
    }

    @PostMapping("/sync")
    public ResponseEntity<List<PaperDTO>> triggerSyncIngestion(@RequestParam("q") String query) {
        if (query == null || query.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        List<PaperDTO> papers = dataIngestionService.ingestResearchTopic(query.trim());
        return ResponseEntity.ok(papers);
    }
}
