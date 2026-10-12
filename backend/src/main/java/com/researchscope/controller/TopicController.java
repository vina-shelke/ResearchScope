package com.researchscope.controller;

import com.researchscope.dto.PaginatedResponse;
import com.researchscope.dto.PaperDTO;
import com.researchscope.dto.TopicDTO;
import com.researchscope.service.TopicService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/topics")
public class TopicController {

    private final TopicService topicService;

    public TopicController(TopicService topicService) {
        this.topicService = topicService;
    }

    @GetMapping
    public ResponseEntity<PaginatedResponse<TopicDTO>> getTopics(
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(topicService.searchTopics(query, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TopicDTO> getTopicById(@PathVariable("id") String id) {
        return topicService.getTopicById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/papers")
    public ResponseEntity<List<PaperDTO>> getPapersByTopic(@PathVariable("id") String id) {
        return ResponseEntity.ok(topicService.getPapersByTopic(id));
    }
}
