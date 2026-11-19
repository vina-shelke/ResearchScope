package com.researchscope.controller;

import com.researchscope.config.AuthContext;
import com.researchscope.dto.*;
import com.researchscope.service.MethodologyAnalysisService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/methodology")
public class MethodologyController {

    private final MethodologyAnalysisService methodologyService;
    private final AuthContext authContext;

    public MethodologyController(MethodologyAnalysisService methodologyService, AuthContext authContext) {
        this.methodologyService = methodologyService;
        this.authContext = authContext;
    }

    @PostMapping("/analyze")
    public ResponseEntity<MethodologyMatrixDTO> analyzeMethodology(
            @RequestBody(required = false) AnalyzeMethodologyRequest request,
            HttpServletRequest httpRequest
    ) {
        String userId = authContext.getCurrentUserId(httpRequest);
        List<String> paperIds = (request != null && request.getPaperIds() != null)
                ? request.getPaperIds()
                : List.of();

        MethodologyMatrixDTO matrix = methodologyService.analyzePapers(paperIds, userId);
        return ResponseEntity.ok(matrix);
    }

    @PutMapping("/{paperId}/field")
    public ResponseEntity<MethodologyItemDTO> updateField(
            @PathVariable("paperId") String paperId,
            @RequestBody UpdateMethodologyFieldRequest request,
            HttpServletRequest httpRequest
    ) {
        String userId = authContext.getCurrentUserId(httpRequest);
        MethodologyItemDTO updated = methodologyService.updateField(paperId, request.getFieldName(), request.getCorrectedValue(), userId);
        return ResponseEntity.ok(updated);
    }

    @GetMapping(value = "/export/csv", produces = "text/csv")
    public ResponseEntity<String> exportCsv(
            @RequestParam(value = "paperIds", required = false) String paperIdsParam,
            HttpServletRequest httpRequest
    ) {
        String userId = authContext.getCurrentUserId(httpRequest);
        List<String> paperIds = (paperIdsParam != null && !paperIdsParam.isBlank())
                ? Arrays.stream(paperIdsParam.split(",")).map(String::trim).toList()
                : List.of();

        String csv = methodologyService.exportCsv(paperIds, userId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"research-methodology-analysis.csv\"")
                .body(csv);
    }
}
