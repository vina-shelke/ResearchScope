package com.researchscope.controller;

import com.researchscope.config.AuthContext;
import com.researchscope.dto.AiAnswerResponse;
import com.researchscope.dto.AiQuestionRequest;
import com.researchscope.service.AiResearchService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
public class AiAssistantController {

    private final AiResearchService aiResearchService;
    private final AuthContext authContext;

    public AiAssistantController(AiResearchService aiResearchService, AuthContext authContext) {
        this.aiResearchService = aiResearchService;
        this.authContext = authContext;
    }

    @PostMapping("/ask")
    public ResponseEntity<AiAnswerResponse> askQuestion(
            @RequestBody AiQuestionRequest request,
            HttpServletRequest httpRequest
    ) {
        if (request == null || request.getQuestion() == null || request.getQuestion().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        String userId = authContext.getCurrentUserId(httpRequest);
        AiAnswerResponse response = aiResearchService.answerResearchQuestion(request, userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/summarize")
    public ResponseEntity<AiAnswerResponse> summarizePaper(
            @RequestBody AiQuestionRequest request,
            HttpServletRequest httpRequest
    ) {
        if (request == null) return ResponseEntity.badRequest().build();
        request.setQueryMode("SUMMARIZE");
        if (request.getQuestion() == null || request.getQuestion().isBlank()) {
            request.setQuestion("Provide a structured academic summary of the paper objectives, methodology, key findings, and limitations.");
        }
        String userId = authContext.getCurrentUserId(httpRequest);
        AiAnswerResponse response = aiResearchService.answerResearchQuestion(request, userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/research-questions")
    public ResponseEntity<AiAnswerResponse> generateResearchQuestions(
            @RequestBody AiQuestionRequest request,
            HttpServletRequest httpRequest
    ) {
        if (request == null) return ResponseEntity.badRequest().build();
        request.setQueryMode("QUESTIONS_GEN");
        if (request.getQuestion() == null || request.getQuestion().isBlank()) {
            request.setQuestion("Formulate candidate research questions and hypotheses based on identified gaps in the literature.");
        }
        String userId = authContext.getCurrentUserId(httpRequest);
        AiAnswerResponse response = aiResearchService.answerResearchQuestion(request, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/suggested-prompts")
    public ResponseEntity<List<String>> getSuggestedPrompts() {
        List<String> prompts = List.of(
                "What are the limitations of existing machine learning approaches for detecting cyberattacks in cloud environments?",
                "What are the emerging trends and key empirical findings in Generative AI for education?",
                "How do Transformer models compare to convolutional architectures in vision tasks?",
                "What are the primary security and privacy vulnerabilities identified in medical AI applications?",
                "Summarize the most influential papers, sample sizes, and methodologies in deep reinforcement learning.",
                "What are the core challenges and potential solutions for algorithmic fairness in machine learning?"
        );
        return ResponseEntity.ok(prompts);
    }
}
