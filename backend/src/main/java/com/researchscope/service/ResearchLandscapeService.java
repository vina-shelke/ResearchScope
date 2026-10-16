package com.researchscope.service;

import com.researchscope.dto.InstitutionDTO;
import com.researchscope.dto.LandscapeSummaryDTO;
import com.researchscope.dto.PaperDTO;
import com.researchscope.dto.TopicDTO;
import com.researchscope.entity.Institution;
import com.researchscope.entity.Paper;
import com.researchscope.entity.Topic;
import com.researchscope.repository.*;
import org.springframework.data.domain.Page;
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
    private final PaperCountryRepository paperCountryRepository;
    private final PaperService paperService;

    public ResearchLandscapeService(
            DataIngestionService dataIngestionService,
            PaperRepository paperRepository,
            AuthorRepository authorRepository,
            InstitutionRepository institutionRepository,
            TopicRepository topicRepository,
            CountryRepository countryRepository,
            PaperCountryRepository paperCountryRepository,
            PaperService paperService
    ) {
        this.dataIngestionService = dataIngestionService;
        this.paperRepository = paperRepository;
        this.authorRepository = authorRepository;
        this.institutionRepository = institutionRepository;
        this.topicRepository = topicRepository;
        this.countryRepository = countryRepository;
        this.paperCountryRepository = paperCountryRepository;
        this.paperService = paperService;
    }

    public LandscapeSummaryDTO getResearchLandscape(String query) {
        boolean hasQuery = (query != null && !query.isBlank());
        if (hasQuery) {
            dataIngestionService.ingestResearchTopic(query.trim());
        }

        long totalPapers;
        long totalAuthors;
        long totalInstitutions;
        long totalCountries;
        long totalCitations;
        long openAccessPapersCount;

        List<Object[]> trendRaw;
        List<Paper> topPapersRaw;

        if (hasQuery) {
            String q = query.trim();
            Page<Paper> queryPage = paperRepository.searchPapersExtended(q, null, null, null, null, null, null, null, PageRequest.of(0, 100));
            List<Paper> content = queryPage.getContent();
            List<PaperDTO> queryDTOs = paperService.toPaperDTOs(content);

            totalPapers = queryPage.getTotalElements();
            Set<String> authorIds = new HashSet<>();
            Set<String> instIds = new HashSet<>();
            Set<String> countryCodes = new HashSet<>();
            long sumCitations = 0;
            long oaCount = 0;

            for (PaperDTO p : queryDTOs) {
                p.getAuthors().forEach(a -> authorIds.add(a.getId()));
                p.getInstitutions().forEach(i -> instIds.add(i.getId()));
                countryCodes.addAll(p.getCountries());
                if (p.getCitationCount() != null) sumCitations += p.getCitationCount();
                if (Boolean.TRUE.equals(p.getIsOpenAccess())) oaCount++;
            }

            totalAuthors = Math.max(authorIds.size(), authorRepository.count());
            totalInstitutions = Math.max(instIds.size(), institutionRepository.count());
            totalCountries = Math.max(countryCodes.size(), countryRepository.count());
            totalCitations = sumCitations > 0 ? sumCitations : (paperRepository.sumCitationCount() != null ? paperRepository.sumCitationCount() : 0);
            openAccessPapersCount = oaCount > 0 ? oaCount : (paperRepository.countOpenAccess() != null ? paperRepository.countOpenAccess() : 0);

            trendRaw = paperRepository.findPublicationTrendByQuery(q);
            if (trendRaw.isEmpty()) {
                trendRaw = paperRepository.findPublicationTrend();
            }
            topPapersRaw = paperRepository.findTopCitedPapersByQuery(q, PageRequest.of(0, 5));
            if (topPapersRaw.isEmpty()) {
                topPapersRaw = paperRepository.findTopCitedPapers(PageRequest.of(0, 5));
            }
        } else {
            totalPapers = paperRepository.count();
            totalAuthors = authorRepository.count();
            totalInstitutions = institutionRepository.count();
            totalCountries = countryRepository.count();
            Long citSum = paperRepository.sumCitationCount();
            totalCitations = citSum != null ? citSum : 0;
            Long oaSum = paperRepository.countOpenAccess();
            openAccessPapersCount = oaSum != null ? oaSum : 0;

            trendRaw = paperRepository.findPublicationTrend();
            topPapersRaw = paperRepository.findTopCitedPapers(PageRequest.of(0, 5));
        }

        // Publication Trend list
        List<Map<String, Object>> publicationTrend = new ArrayList<>();
        for (Object[] row : trendRaw) {
            Map<String, Object> map = new HashMap<>();
            map.put("year", row[0]);
            map.put("count", row[1]);
            publicationTrend.add(map);
        }

        // Top Topics (up to 20 topics)
        List<Topic> topTopicsRaw = topicRepository.findTopTopics(PageRequest.of(0, 20));
        List<TopicDTO> allTopTopics = topTopicsRaw.stream()
                .map(t -> new TopicDTO(t.getId(), t.getName(), t.getCategory(), t.getPaperCount()))
                .toList();

        List<TopicDTO> topTopics = allTopTopics.stream().limit(10).toList();
        List<TopicDTO> emergingTopics = allTopTopics.stream().skip(10).limit(8).toList();
        if (emergingTopics.isEmpty() && allTopTopics.size() > 5) {
            emergingTopics = allTopTopics.stream().skip(5).limit(5).toList();
        }

        // Top Institutions
        List<Institution> topInstsRaw = institutionRepository.findTopInstitutions(PageRequest.of(0, 8));
        List<InstitutionDTO> topInstitutions = topInstsRaw.stream()
                .map(i -> new InstitutionDTO(i.getId(), i.getName(), i.getCountryCode(), i.getCountryCode(), i.getPaperCount(), i.getRorId(), i.getInstitutionType()))
                .toList();

        // Country output distribution
        List<Object[]> countryRaw = paperCountryRepository.findCountryOutputDistribution();
        List<Map<String, Object>> countriesDistribution = new ArrayList<>();
        for (Object[] r : countryRaw) {
            if (countriesDistribution.size() >= 10) break;
            Map<String, Object> m = new HashMap<>();
            m.put("country", r[0] != null ? r[0] : r[1]);
            m.put("code", r[1]);
            m.put("count", r[2]);
            countriesDistribution.add(m);
        }

        // Top Cited Papers
        List<PaperDTO> topCitedPapers = paperService.toPaperDTOs(topPapersRaw);

        return new LandscapeSummaryDTO(
                query,
                totalPapers,
                totalAuthors,
                totalInstitutions,
                totalCountries,
                totalCitations,
                openAccessPapersCount,
                publicationTrend,
                topTopics,
                emergingTopics,
                topInstitutions,
                countriesDistribution,
                topCitedPapers
        );
    }
}
