package com.researchscope.controller;

import com.researchscope.dto.PaginatedResponse;
import com.researchscope.dto.PaperDTO;
import com.researchscope.service.PaperService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/papers")
public class PaperController {

    private final PaperService paperService;

    public PaperController(PaperService paperService) {
        this.paperService = paperService;
    }

    @GetMapping
    public ResponseEntity<PaginatedResponse<PaperDTO>> getPapers(
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "source", required = false) String source,
            @RequestParam(value = "minCitations", required = false) Integer minCitations,
            @RequestParam(value = "sortBy", defaultValue = "publicationYear") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        PaginatedResponse<PaperDTO> response = paperService.searchPapers(query, year, source, minCitations, sortBy, sortDir, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaperDTO> getPaperById(@PathVariable("id") String id) {
        return paperService.getPaperById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/related")
    public ResponseEntity<List<PaperDTO>> getRelatedPapers(@PathVariable("id") String id) {
        List<PaperDTO> related = paperService.getRelatedPapers(id);
        return ResponseEntity.ok(related);
    }

    @GetMapping("/{id}/citations")
    public ResponseEntity<List<PaperDTO>> getPaperCitations(@PathVariable("id") String id) {
        List<PaperDTO> citations = paperService.getCitationsForPaper(id);
        return ResponseEntity.ok(citations);
    }
}
