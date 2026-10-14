package com.researchscope.controller;

import com.researchscope.dto.SavedPaperDTO;
import com.researchscope.dto.SavedPaperRequest;
import com.researchscope.service.SavedPaperService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/saved-papers")
public class SavedPaperController {

    private final SavedPaperService savedPaperService;

    public SavedPaperController(SavedPaperService savedPaperService) {
        this.savedPaperService = savedPaperService;
    }

    @GetMapping
    public ResponseEntity<List<SavedPaperDTO>> getSavedPapers(@RequestParam(value = "collection", required = false) String collection) {
        List<SavedPaperDTO> list = savedPaperService.getSavedPapers(collection);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/collections")
    public ResponseEntity<List<String>> getCollections() {
        List<String> collections = savedPaperService.getCollections();
        return ResponseEntity.ok(collections);
    }

    @PostMapping("/{paperId}")
    public ResponseEntity<SavedPaperDTO> savePaper(
            @PathVariable("paperId") String paperId,
            @RequestBody(required = false) SavedPaperRequest request
    ) {
        SavedPaperDTO saved = savedPaperService.savePaper(paperId, request);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{paperId}")
    public ResponseEntity<Map<String, Object>> removeSavedPaper(@PathVariable("paperId") String paperId) {
        savedPaperService.removeSavedPaper(paperId);
        return ResponseEntity.ok(Map.of("message", "Paper removed from library", "paperId", paperId, "success", true));
    }

    @GetMapping(value = "/export/csv", produces = "text/csv")
    public ResponseEntity<String> exportSavedPapersCsv(@RequestParam(value = "collection", required = false) String collection) {
        String csv = savedPaperService.exportSavedPapersCsv(collection);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"saved-papers.csv\"")
                .body(csv);
    }

    @GetMapping(value = "/export/bibtex", produces = "text/plain")
    public ResponseEntity<String> exportSavedPapersBibTeX(@RequestParam(value = "collection", required = false) String collection) {
        String bibtex = savedPaperService.exportSavedPapersBibTeX(collection);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"saved-papers.bib\"")
                .body(bibtex);
    }
}
