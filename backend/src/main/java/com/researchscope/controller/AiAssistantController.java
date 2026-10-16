package com.researchscope.controller;

import com.researchscope.dto.AiAnswerResponse;
import com.researchscope.dto.AiQuestionRequest;
import com.researchscope.service.AiResearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
public class AiAssistantController {

    private final AiResearchService aiResearchService;

    public AiAssistantController(AiResearchService aiResearchService) {
        this.aiResearchService = aiResearchService;
    }

    @PostMapping("/ask")
    public ResponseEntity<AiAnswerResponse> askQuestion(@RequestBody AiQuestionRequest request) {
        if (request == null || request.getQuestion() == null || request.getQuestion().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        AiAnswerResponse response = aiResearchService.answerResearchQuestion(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/suggested-prompts")
    public ResponseEntity<List<String>> getSuggestedPrompts() {
        List<String> prompts = List.of(
                "What are the emerging trends and key findings in Generative AI for education?",
                "How do Transformer models improve natural language processing and computer vision?",
                "What are the primary security and privacy vulnerabilities identified in medical AI applications?",
                "Summarize the most influential papers and methodologies in deep reinforcement learning.",
                "What are the challenges and potential solutions for algorithmic fairness in machine learning?"
        );
        return ResponseEntity.ok(prompts);
    }
}
