package com.researchscope.controller;

import com.researchscope.config.AuthContext;
import com.researchscope.dto.*;
import com.researchscope.service.LiteratureReviewService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/literature-reviews")
public class LiteratureReviewController {

    private final LiteratureReviewService reviewService;
    private final AuthContext authContext;

    public LiteratureReviewController(LiteratureReviewService reviewService, AuthContext authContext) {
        this.reviewService = reviewService;
        this.authContext = authContext;
    }

    @PostMapping("/generate")
    public ResponseEntity<LiteratureReviewDTO> generateReview(
            @RequestBody CreateLiteratureReviewRequest request,
            HttpServletRequest httpRequest
    ) {
        String userId = authContext.getCurrentUserId(httpRequest);
        LiteratureReviewDTO dto = reviewService.generateLiteratureReview(userId, request);
        return ResponseEntity.ok(dto);
    }

    @GetMapping
    public ResponseEntity<List<LiteratureReviewDTO>> getUserReviews(HttpServletRequest httpRequest) {
        String userId = authContext.getCurrentUserId(httpRequest);
        return ResponseEntity.ok(reviewService.getUserReviews(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LiteratureReviewDTO> getReviewById(
            @PathVariable("id") String reviewId,
            HttpServletRequest httpRequest
    ) {
        String userId = authContext.getCurrentUserId(httpRequest);
        return reviewService.getReviewById(userId, reviewId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/sections/{sectionKey}")
    public ResponseEntity<LiteratureReviewSectionDTO> updateSection(
            @PathVariable("id") String reviewId,
            @PathVariable("sectionKey") String sectionKey,
            @RequestBody UpdateSectionRequest request,
            HttpServletRequest httpRequest
    ) {
        String userId = authContext.getCurrentUserId(httpRequest);
        LiteratureReviewSectionDTO updated = reviewService.updateSectionContent(userId, reviewId, sectionKey, request.getContent());
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/sections/{sectionKey}/regenerate")
    public ResponseEntity<LiteratureReviewSectionDTO> regenerateSection(
            @PathVariable("id") String reviewId,
            @PathVariable("sectionKey") String sectionKey,
            @RequestBody(required = false) RegenerateSectionRequest request,
            HttpServletRequest httpRequest
    ) {
        String userId = authContext.getCurrentUserId(httpRequest);
        String instructions = request != null ? request.getInstructions() : null;
        LiteratureReviewSectionDTO regenerated = reviewService.regenerateSection(userId, reviewId, sectionKey, instructions);
        return ResponseEntity.ok(regenerated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteReview(
            @PathVariable("id") String reviewId,
            HttpServletRequest httpRequest
    ) {
        String userId = authContext.getCurrentUserId(httpRequest);
        reviewService.deleteReview(userId, reviewId);
        return ResponseEntity.ok(Map.of("message", "Literature review draft deleted", "id", reviewId, "success", true));
    }

    @GetMapping(value = "/{id}/export/{format}")
    public ResponseEntity<String> exportReview(
            @PathVariable("id") String reviewId,
            @PathVariable("format") String format,
            HttpServletRequest httpRequest
    ) {
        String userId = authContext.getCurrentUserId(httpRequest);
        String content = reviewService.exportReview(userId, reviewId, format);
        String extension = "latex".equalsIgnoreCase(format) ? "tex" : "md";
        String contentType = "latex".equalsIgnoreCase(format) ? "application/x-tex" : "text/markdown";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"literature-review-" + reviewId + "." + extension + "\"")
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .body(content);
    }
}
