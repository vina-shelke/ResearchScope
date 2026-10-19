package com.researchscope.controller;

import com.researchscope.dto.PaperComparisonMatrixDTO;
import com.researchscope.dto.PaperComparisonRequest;
import com.researchscope.service.PaperComparisonService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/paper-comparison")
public class PaperComparisonController {

    private final PaperComparisonService paperComparisonService;

    public PaperComparisonController(PaperComparisonService paperComparisonService) {
        this.paperComparisonService = paperComparisonService;
    }

    @PostMapping
    public ResponseEntity<PaperComparisonMatrixDTO> comparePapers(@RequestBody PaperComparisonRequest request) {
        List<String> ids = (request != null && request.getPaperIds() != null) ? request.getPaperIds() : List.of();
        PaperComparisonMatrixDTO matrix = paperComparisonService.comparePapers(ids);
        return ResponseEntity.ok(matrix);
    }

    @PostMapping(value = "/export/csv", produces = "text/csv")
    public ResponseEntity<String> exportComparisonCsvPost(@RequestBody PaperComparisonRequest request) {
        List<String> ids = (request != null && request.getPaperIds() != null) ? request.getPaperIds() : List.of();
        String csv = paperComparisonService.exportComparisonCsv(ids);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"paper-comparison.csv\"")
                .body(csv);
    }

    @GetMapping(value = "/export/csv", produces = "text/csv")
    public ResponseEntity<String> exportComparisonCsvGet(@RequestParam("paperIds") List<String> paperIds) {
        String csv = paperComparisonService.exportComparisonCsv(paperIds != null ? paperIds : List.of());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"paper-comparison.csv\"")
                .body(csv);
    }
}
