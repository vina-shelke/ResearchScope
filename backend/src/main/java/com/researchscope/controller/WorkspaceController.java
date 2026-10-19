package com.researchscope.controller;

import com.researchscope.config.AuthContext;
import com.researchscope.dto.*;
import com.researchscope.service.WorkspaceService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workspace")
public class WorkspaceController {

    private final WorkspaceService workspaceService;
    private final AuthContext authContext;

    public WorkspaceController(WorkspaceService workspaceService, AuthContext authContext) {
        this.workspaceService = workspaceService;
        this.authContext = authContext;
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getWorkspaceSummary(HttpServletRequest request) {
        String userId = authContext.getCurrentUserId(request);
        List<ResearchProjectDTO> projects = workspaceService.getUserProjects(userId);
        List<WorkspacePaperDTO> papers = workspaceService.getWorkspacePapers(userId, null, null, null);
        List<SavedSearchDTO> searches = workspaceService.getSavedSearches(userId);
        List<SavedComparisonDTO> comparisons = workspaceService.getSavedComparisons(userId);
        List<SavedGapAnalysisDTO> gaps = workspaceService.getSavedGapAnalyses(userId);

        long unread = papers.stream().filter(p -> "UNREAD".equalsIgnoreCase(p.getReadingStatus())).count();
        long reading = papers.stream().filter(p -> "READING".equalsIgnoreCase(p.getReadingStatus())).count();
        long completed = papers.stream().filter(p -> "COMPLETED".equalsIgnoreCase(p.getReadingStatus())).count();

        return ResponseEntity.ok(Map.of(
                "totalProjects", projects.size(),
                "totalSavedPapers", papers.size(),
                "unreadPapers", unread,
                "readingPapers", reading,
                "completedPapers", completed,
                "totalSavedSearches", searches.size(),
                "totalSavedComparisons", comparisons.size(),
                "totalSavedGapAnalyses", gaps.size()
        ));
    }

    // --- Projects ---
    @GetMapping("/projects")
    public ResponseEntity<List<ResearchProjectDTO>> getProjects(HttpServletRequest request) {
        String userId = authContext.getCurrentUserId(request);
        return ResponseEntity.ok(workspaceService.getUserProjects(userId));
    }

    @PostMapping("/projects")
    public ResponseEntity<ResearchProjectDTO> createProject(@RequestBody CreateProjectRequest createRequest, HttpServletRequest request) {
        String userId = authContext.getCurrentUserId(request);
        return ResponseEntity.ok(workspaceService.createProject(userId, createRequest));
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<Map<String, Object>> deleteProject(@PathVariable("id") String projectId, HttpServletRequest request) {
        String userId = authContext.getCurrentUserId(request);
        workspaceService.deleteProject(userId, projectId);
        return ResponseEntity.ok(Map.of("message", "Project deleted", "projectId", projectId, "success", true));
    }

    // --- Papers & Reading Status ---
    @GetMapping("/papers")
    public ResponseEntity<List<WorkspacePaperDTO>> getWorkspacePapers(
            @RequestParam(value = "collection", required = false) String collection,
            @RequestParam(value = "projectId", required = false) String projectId,
            @RequestParam(value = "status", required = false) String status,
            HttpServletRequest request
    ) {
        String userId = authContext.getCurrentUserId(request);
        return ResponseEntity.ok(workspaceService.getWorkspacePapers(userId, collection, projectId, status));
    }

    @PostMapping("/papers/{paperId}")
    public ResponseEntity<WorkspacePaperDTO> savePaperToWorkspace(
            @PathVariable("paperId") String paperId,
            @RequestBody(required = false) UpdateReadingStatusRequest updateRequest,
            HttpServletRequest request
    ) {
        String userId = authContext.getCurrentUserId(request);
        return ResponseEntity.ok(workspaceService.savePaperToWorkspace(userId, paperId, updateRequest));
    }

    @PutMapping("/papers/{paperId}/status")
    public ResponseEntity<WorkspacePaperDTO> updateReadingStatus(
            @PathVariable("paperId") String paperId,
            @RequestBody UpdateReadingStatusRequest updateRequest,
            HttpServletRequest request
    ) {
        String userId = authContext.getCurrentUserId(request);
        return ResponseEntity.ok(workspaceService.savePaperToWorkspace(userId, paperId, updateRequest));
    }

    @DeleteMapping("/papers/{paperId}")
    public ResponseEntity<Map<String, Object>> removePaperFromWorkspace(
            @PathVariable("paperId") String paperId,
            HttpServletRequest request
    ) {
        String userId = authContext.getCurrentUserId(request);
        workspaceService.removePaperFromWorkspace(userId, paperId);
        return ResponseEntity.ok(Map.of("message", "Paper removed from workspace", "paperId", paperId, "success", true));
    }

    @GetMapping("/collections")
    public ResponseEntity<List<String>> getCollections(HttpServletRequest request) {
        String userId = authContext.getCurrentUserId(request);
        return ResponseEntity.ok(workspaceService.getCollections(userId));
    }

    // --- Saved Searches ---
    @GetMapping("/searches")
    public ResponseEntity<List<SavedSearchDTO>> getSavedSearches(HttpServletRequest request) {
        String userId = authContext.getCurrentUserId(request);
        return ResponseEntity.ok(workspaceService.getSavedSearches(userId));
    }

    @PostMapping("/searches")
    public ResponseEntity<SavedSearchDTO> saveSearch(
            @RequestBody Map<String, String> body,
            HttpServletRequest request
    ) {
        String userId = authContext.getCurrentUserId(request);
        String queryText = body.getOrDefault("queryText", "");
        String filtersJson = body.getOrDefault("filtersJson", "{}");
        return ResponseEntity.ok(workspaceService.saveSearch(userId, queryText, filtersJson));
    }

    @DeleteMapping("/searches/{id}")
    public ResponseEntity<Map<String, Object>> deleteSavedSearch(@PathVariable("id") String id, HttpServletRequest request) {
        String userId = authContext.getCurrentUserId(request);
        workspaceService.deleteSavedSearch(userId, id);
        return ResponseEntity.ok(Map.of("message", "Search removed", "id", id, "success", true));
    }

    // --- Saved Comparisons ---
    @GetMapping("/comparisons")
    public ResponseEntity<List<SavedComparisonDTO>> getSavedComparisons(HttpServletRequest request) {
        String userId = authContext.getCurrentUserId(request);
        return ResponseEntity.ok(workspaceService.getSavedComparisons(userId));
    }

    @PostMapping("/comparisons")
    public ResponseEntity<SavedComparisonDTO> saveComparison(
            @RequestBody Map<String, Object> body,
            HttpServletRequest request
    ) {
        String userId = authContext.getCurrentUserId(request);
        String title = (String) body.getOrDefault("title", "Paper Comparison");
        List<String> paperIds = (List<String>) body.getOrDefault("paperIds", List.of());
        String notes = (String) body.getOrDefault("notes", "");
        return ResponseEntity.ok(workspaceService.saveComparison(userId, title, paperIds, notes));
    }

    @DeleteMapping("/comparisons/{id}")
    public ResponseEntity<Map<String, Object>> deleteSavedComparison(@PathVariable("id") String id, HttpServletRequest request) {
        String userId = authContext.getCurrentUserId(request);
        workspaceService.deleteSavedComparison(userId, id);
        return ResponseEntity.ok(Map.of("message", "Comparison removed", "id", id, "success", true));
    }

    // --- Saved Gap Analyses ---
    @GetMapping("/gap-analyses")
    public ResponseEntity<List<SavedGapAnalysisDTO>> getSavedGapAnalyses(HttpServletRequest request) {
        String userId = authContext.getCurrentUserId(request);
        return ResponseEntity.ok(workspaceService.getSavedGapAnalyses(userId));
    }

    @PostMapping("/gap-analyses")
    public ResponseEntity<SavedGapAnalysisDTO> saveGapAnalysis(
            @RequestBody Map<String, String> body,
            HttpServletRequest request
    ) {
        String userId = authContext.getCurrentUserId(request);
        String topicQuery = body.getOrDefault("topicQuery", "General");
        String gapsDataJson = body.getOrDefault("gapsDataJson", "{}");
        return ResponseEntity.ok(workspaceService.saveGapAnalysis(userId, topicQuery, gapsDataJson));
    }

    @DeleteMapping("/gap-analyses/{id}")
    public ResponseEntity<Map<String, Object>> deleteSavedGapAnalysis(@PathVariable("id") String id, HttpServletRequest request) {
        String userId = authContext.getCurrentUserId(request);
        workspaceService.deleteSavedGapAnalysis(userId, id);
        return ResponseEntity.ok(Map.of("message", "Gap analysis removed", "id", id, "success", true));
    }

    // --- Exports ---
    @GetMapping(value = "/export/bibtex", produces = "text/plain")
    public ResponseEntity<String> exportBibTeX(
            @RequestParam(value = "collection", required = false) String collection,
            @RequestParam(value = "projectId", required = false) String projectId,
            HttpServletRequest request
    ) {
        String userId = authContext.getCurrentUserId(request);
        String bibtex = workspaceService.exportBibTeX(userId, collection, projectId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"workspace-references.bib\"")
                .body(bibtex);
    }

    @GetMapping(value = "/export/csv", produces = "text/csv")
    public ResponseEntity<String> exportCsv(
            @RequestParam(value = "collection", required = false) String collection,
            @RequestParam(value = "projectId", required = false) String projectId,
            HttpServletRequest request
    ) {
        String userId = authContext.getCurrentUserId(request);
        String csv = workspaceService.exportCsv(userId, collection, projectId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"workspace-references.csv\"")
                .body(csv);
    }
}
