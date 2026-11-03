package com.researchscope.controller;

import com.researchscope.dto.PaginatedResponse;
import com.researchscope.dto.PaperDTO;
import com.researchscope.service.PaperService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/papers")
public class PaperController {

    private final PaperService paperService;
    private final com.researchscope.service.SemanticSearchService semanticSearchService;

    public PaperController(PaperService paperService, com.researchscope.service.SemanticSearchService semanticSearchService) {
        this.paperService = paperService;
        this.semanticSearchService = semanticSearchService;
    }

    @GetMapping("/semantic")
    public ResponseEntity<PaginatedResponse<PaperDTO>> searchSemantic(
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        PaginatedResponse<PaperDTO> response = semanticSearchService.searchPapersSemantic(query, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<PaginatedResponse<PaperDTO>> getPapers(
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "source", required = false) String source,
            @RequestParam(value = "minCitations", required = false) Integer minCitations,
            @RequestParam(value = "isOpenAccess", required = false) Boolean isOpenAccess,
            @RequestParam(value = "paperType", required = false) String paperType,
            @RequestParam(value = "author", required = false) String author,
            @RequestParam(value = "institution", required = false) String institution,
            @RequestParam(value = "sortBy", defaultValue = "publicationYear") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        PaginatedResponse<PaperDTO> response = paperService.searchPapersExtended(
                query, year, source, minCitations, isOpenAccess, paperType, author, institution, sortBy, sortDir, page, size
        );
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

    @GetMapping("/{id}/recommendations")
    public ResponseEntity<List<com.researchscope.dto.PaperRecommendationDTO>> getRecommendations(
            @PathVariable("id") String id,
            @RequestParam(value = "limit", defaultValue = "5") int limit
    ) {
        List<com.researchscope.dto.PaperRecommendationDTO> recs = semanticSearchService.getRecommendationsForPaper(id, limit);
        return ResponseEntity.ok(recs);
    }

    @GetMapping("/{id}/citations")
    public ResponseEntity<List<PaperDTO>> getPaperCitations(@PathVariable("id") String id) {
        List<PaperDTO> citations = paperService.getCitationsForPaper(id);
        return ResponseEntity.ok(citations);
    }

    @GetMapping("/{id}/references")
    public ResponseEntity<List<PaperDTO>> getPaperReferences(@PathVariable("id") String id) {
        List<PaperDTO> references = paperService.getReferencesForPaper(id);
        return ResponseEntity.ok(references);
    }

    @GetMapping(value = "/{id}/export/bibtex", produces = "text/plain")
    public ResponseEntity<String> exportSinglePaperBibTeX(@PathVariable("id") String id) {
        return paperService.getPaperById(id)
                .map(paper -> ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"paper-" + id + ".bib\"")
                        .body(paperService.generateBibTeX(paper)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(value = "/{id}/export/ris", produces = "application/x-research-info-systems")
    public ResponseEntity<String> exportSinglePaperRis(@PathVariable("id") String id) {
        return paperService.getPaperById(id)
                .map(paper -> ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"paper-" + id + ".ris\"")
                        .body(paperService.generateRis(paper)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(value = "/export/csv", produces = "text/csv")
    public ResponseEntity<String> exportPapersCsv(
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "source", required = false) String source,
            @RequestParam(value = "minCitations", required = false) Integer minCitations,
            @RequestParam(value = "isOpenAccess", required = false) Boolean isOpenAccess,
            @RequestParam(value = "paperType", required = false) String paperType,
            @RequestParam(value = "author", required = false) String author,
            @RequestParam(value = "institution", required = false) String institution
    ) {
        PaginatedResponse<PaperDTO> response = paperService.searchPapersExtended(
                query, year, source, minCitations, isOpenAccess, paperType, author, institution, "publicationYear", "desc", 0, 500
        );
        String csv = paperService.generateCsv(response.getContent());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"research-papers.csv\"")
                .body(csv);
    }

    @GetMapping(value = "/export/bibtex", produces = "text/plain")
    public ResponseEntity<String> exportPapersBibTeX(
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "source", required = false) String source,
            @RequestParam(value = "minCitations", required = false) Integer minCitations,
            @RequestParam(value = "isOpenAccess", required = false) Boolean isOpenAccess,
            @RequestParam(value = "paperType", required = false) String paperType,
            @RequestParam(value = "author", required = false) String author,
            @RequestParam(value = "institution", required = false) String institution
    ) {
        PaginatedResponse<PaperDTO> response = paperService.searchPapersExtended(
                query, year, source, minCitations, isOpenAccess, paperType, author, institution, "publicationYear", "desc", 0, 500
        );
        StringBuilder sb = new StringBuilder();
        for (PaperDTO paper : response.getContent()) {
            sb.append(paperService.generateBibTeX(paper)).append("\n\n");
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"research-papers.bib\"")
                .body(sb.toString());
    }

    @GetMapping(value = "/export/ris", produces = "application/x-research-info-systems")
    public ResponseEntity<String> exportPapersRis(
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "source", required = false) String source,
            @RequestParam(value = "minCitations", required = false) Integer minCitations,
            @RequestParam(value = "isOpenAccess", required = false) Boolean isOpenAccess,
            @RequestParam(value = "paperType", required = false) String paperType,
            @RequestParam(value = "author", required = false) String author,
            @RequestParam(value = "institution", required = false) String institution
    ) {
        PaginatedResponse<PaperDTO> response = paperService.searchPapersExtended(
                query, year, source, minCitations, isOpenAccess, paperType, author, institution, "publicationYear", "desc", 0, 500
        );
        StringBuilder sb = new StringBuilder();
        for (PaperDTO paper : response.getContent()) {
            sb.append(paperService.generateRis(paper)).append("\n");
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"research-papers.ris\"")
                .body(sb.toString());
    }
}
