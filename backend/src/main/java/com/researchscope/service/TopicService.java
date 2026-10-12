package com.researchscope.service;

import com.researchscope.dto.PaginatedResponse;
import com.researchscope.dto.PaperDTO;
import com.researchscope.dto.TopicDTO;
import com.researchscope.entity.Paper;
import com.researchscope.entity.Topic;
import com.researchscope.repository.PaperRepository;
import com.researchscope.repository.TopicRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TopicService {

    private final TopicRepository topicRepository;
    private final PaperRepository paperRepository;
    private final PaperService paperService;

    public TopicService(TopicRepository topicRepository, PaperRepository paperRepository, PaperService paperService) {
        this.topicRepository = topicRepository;
        this.paperRepository = paperRepository;
        this.paperService = paperService;
    }

    public PaginatedResponse<TopicDTO> searchTopics(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Topic> pageResult = topicRepository.searchTopics((query != null && !query.isBlank()) ? query : null, pageable);

        List<TopicDTO> dtos = pageResult.getContent().stream()
                .map(t -> new TopicDTO(t.getId(), t.getName(), t.getCategory(), t.getPaperCount()))
                .toList();

        return new PaginatedResponse<>(
                dtos,
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements(),
                pageResult.getTotalPages(),
                pageResult.isLast()
        );
    }

    public Optional<TopicDTO> getTopicById(String id) {
        return topicRepository.findById(id).map(t ->
                new TopicDTO(t.getId(), t.getName(), t.getCategory(), t.getPaperCount())
        );
    }

    public List<PaperDTO> getPapersByTopic(String topicId) {
        List<Paper> papers = paperRepository.findPapersByTopicId(topicId);
        return papers.stream().map(paperService::toPaperDTO).toList();
    }
}
