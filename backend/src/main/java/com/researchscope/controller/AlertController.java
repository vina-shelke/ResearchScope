package com.researchscope.controller;

import com.researchscope.config.AuthContext;
import com.researchscope.dto.CreateAlertRequest;
import com.researchscope.dto.RecommendationItemDTO;
import com.researchscope.entity.ResearchAlert;
import com.researchscope.service.SmartRecommendationService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AlertController {

    private final SmartRecommendationService recommendationService;
    private final AuthContext authContext;

    public AlertController(SmartRecommendationService recommendationService, AuthContext authContext) {
        this.recommendationService = recommendationService;
        this.authContext = authContext;
    }

    @GetMapping("/recommendations/personalized")
    public ResponseEntity<List<RecommendationItemDTO>> getPersonalizedRecommendations(
            @RequestParam(defaultValue = "10") int limit,
            HttpServletRequest request) {
        String userId = authContext.getCurrentUserId(request);
        List<RecommendationItemDTO> items = recommendationService.getPersonalizedRecommendations(userId, limit);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/alerts/subscriptions")
    public ResponseEntity<List<ResearchAlert>> getUserAlerts(HttpServletRequest request) {
        String userId = authContext.getCurrentUserId(request);
        List<ResearchAlert> alerts = recommendationService.getUserAlerts(userId);
        return ResponseEntity.ok(alerts);
    }

    @PostMapping("/alerts/subscriptions")
    public ResponseEntity<ResearchAlert> subscribeAlert(
            @RequestBody CreateAlertRequest req,
            HttpServletRequest request) {
        String userId = authContext.getCurrentUserId(request);
        ResearchAlert alert = recommendationService.subscribeAlert(userId, req);
        return ResponseEntity.ok(alert);
    }

    @DeleteMapping("/alerts/subscriptions/{alertId}")
    public ResponseEntity<Map<String, String>> deleteAlert(
            @PathVariable Long alertId,
            HttpServletRequest request) {
        String userId = authContext.getCurrentUserId(request);
        recommendationService.deleteAlert(userId, alertId);
        return ResponseEntity.ok(Map.of("message", "Alert subscription removed"));
    }

    @GetMapping("/alerts/notifications")
    public ResponseEntity<List<Map<String, Object>>> getAlertNotifications(HttpServletRequest request) {
        String userId = authContext.getCurrentUserId(request);
        List<Map<String, Object>> notifs = recommendationService.getAlertNotifications(userId);
        return ResponseEntity.ok(notifs);
    }
}
