package com.researchscope.service;

import com.researchscope.dto.AuthorDTO;
import com.researchscope.dto.InstitutionDTO;
import com.researchscope.dto.PaginatedResponse;
import com.researchscope.dto.PaperDTO;
import com.researchscope.dto.TopicAnalyticsDTO;
import com.researchscope.dto.TopicDTO;
import com.researchscope.entity.Author;
import com.researchscope.entity.Institution;
import com.researchscope.entity.Paper;
import com.researchscope.entity.Topic;
import com.researchscope.repository.PaperRepository;
import com.researchscope.repository.TopicRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;

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

    public Optional<TopicAnalyticsDTO> getTopicAnalytics(String topicId) {
        return topicRepository.findById(topicId).map(t -> {
            TopicAnalyticsDTO dto = new TopicAnalyticsDTO();
            dto.setTopicId(t.getId());
            dto.setTopicName(t.getName());
            dto.setCategory(t.getCategory());

            List<Paper> papers = paperRepository.findPapersByTopicId(topicId);
            dto.setTotalPapers(papers.size());

            int totalCitations = papers.stream()
                    .mapToInt(p -> p.getCitationCount() != null ? p.getCitationCount() : 0)
                    .sum();
            dto.setTotalCitations(totalCitations);
            dto.setAvgCitationsPerPaper(papers.isEmpty() ? 0.0 : Math.round(((double) totalCitations / papers.size()) * 100.0) / 100.0);

            // Publication Trend
            List<Object[]> trendRows = paperRepository.findPublicationTrendByTopicId(topicId);
            List<Map<String, Object>> trendList = new ArrayList<>();
            for (Object[] row : trendRows) {
                if (row.length >= 2 && row[0] != null) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("year", row[0]);
                    map.put("count", row[1]);
                    trendList.add(map);
                }
            }
            dto.setPublicationTrend(trendList);

            // Top Authors
            List<Object[]> authorRows = paperRepository.findTopAuthorsByTopicId(topicId, PageRequest.of(0, 5));
            List<AuthorDTO> topAuthors = new ArrayList<>();
            for (Object[] row : authorRows) {
                if (row[0] instanceof Author a) {
                    topAuthors.add(new AuthorDTO(a.getId(), a.getName(), a.getOpenAlexId(), a.getOrcid(), a.getPaperCount(), a.getCitationCount()));
                }
            }
            dto.setTopAuthors(topAuthors);

            // Top Institutions
            List<Object[]> instRows = paperRepository.findTopInstitutionsByTopicId(topicId, PageRequest.of(0, 5));
            List<InstitutionDTO> topInsts = new ArrayList<>();
            for (Object[] row : instRows) {
                if (row[0] instanceof Institution inst) {
                    topInsts.add(new InstitutionDTO(inst.getId(), inst.getName(), inst.getCountryCode(), inst.getCountryCode(), inst.getPaperCount(), inst.getRorId(), inst.getInstitutionType()));
                }
            }
            dto.setTopInstitutions(topInsts);

            return dto;
        });
    }

    public List<Map<String, Object>> getTopicTrends(String topicId) {
        List<Object[]> trendRows = paperRepository.findPublicationTrendByTopicId(topicId);
        List<Map<String, Object>> trendList = new ArrayList<>();
        for (Object[] row : trendRows) {
            if (row.length >= 2 && row[0] != null) {
                Map<String, Object> map = new HashMap<>();
                map.put("year", row[0]);
                map.put("count", row[1]);
                trendList.add(map);
            }
        }
        return trendList;
    }
}
