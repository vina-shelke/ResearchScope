package com.researchscope.service;

import com.researchscope.dto.LandscapeSummaryDTO;
import com.researchscope.dto.PaperDTO;
import com.researchscope.dto.TopicDTO;
import com.researchscope.entity.Paper;
import com.researchscope.entity.Topic;
import com.researchscope.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ResearchLandscapeService {

    private final DataIngestionService dataIngestionService;
    private final PaperRepository paperRepository;
    private final AuthorRepository authorRepository;
    private final InstitutionRepository institutionRepository;
    private final TopicRepository topicRepository;
    private final CountryRepository countryRepository;
    private final PaperService paperService;

    public ResearchLandscapeService(
            DataIngestionService dataIngestionService,
            PaperRepository paperRepository,
            AuthorRepository authorRepository,
            InstitutionRepository institutionRepository,
            TopicRepository topicRepository,
            CountryRepository countryRepository,
            PaperService paperService
    ) {
        this.dataIngestionService = dataIngestionService;
        this.paperRepository = paperRepository;
        this.authorRepository = authorRepository;
        this.institutionRepository = institutionRepository;
        this.topicRepository = topicRepository;
        this.countryRepository = countryRepository;
        this.paperService = paperService;
    }

    public LandscapeSummaryDTO getResearchLandscape(String query) {
        // If query is provided, trigger ingestion to ensure live data exists in MySQL
        if (query != null && !query.isBlank()) {
            dataIngestionService.ingestResearchTopic(query.trim());
        }

        long totalPapers = paperRepository.count();
        long totalAuthors = authorRepository.count();
        long totalInstitutions = institutionRepository.count();
        long totalCountries = countryRepository.count();

        // Publication Trend
        List<Object[]> trendRaw = paperRepository.findPublicationTrend();
        List<Map<String, Object>> publicationTrend = new ArrayList<>();
        for (Object[] row : trendRaw) {
            Map<String, Object> map = new HashMap<>();
            map.put("year", row[0]);
            map.put("count", row[1]);
            publicationTrend.add(map);
        }

        // Top Topics
        List<Topic> topTopicsRaw = topicRepository.findTopTopics(PageRequest.of(0, 10));
        List<TopicDTO> topTopics = topTopicsRaw.stream()
                .map(t -> new TopicDTO(t.getId(), t.getName(), t.getCategory(), t.getPaperCount()))
                .toList();

        // Top Cited Papers
        List<Paper> topPapersRaw = paperRepository.findTopCitedPapers(PageRequest.of(0, 5));
        List<PaperDTO> topCitedPapers = topPapersRaw.stream().map(paperService::toPaperDTO).toList();

        return new LandscapeSummaryDTO(
                query,
                totalPapers,
                totalAuthors,
                totalInstitutions,
                totalCountries,
                publicationTrend,
                topTopics,
                topCitedPapers
        );
    }
}
