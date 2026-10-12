package com.researchscope.service;

import com.researchscope.dto.AuthorDTO;
import com.researchscope.dto.InstitutionDTO;
import com.researchscope.dto.PaperDTO;
import com.researchscope.dto.TopicDTO;
import com.researchscope.entity.*;
import com.researchscope.integration.CrossrefAdapter;
import com.researchscope.integration.OpenAlexAdapter;
import com.researchscope.integration.SemanticScholarAdapter;
import com.researchscope.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class DataIngestionService {

    private static final Logger log = LoggerFactory.getLogger(DataIngestionService.class);

    private final OpenAlexAdapter openAlexAdapter;
    private final CrossrefAdapter crossrefAdapter;
    private final SemanticScholarAdapter semanticScholarAdapter;
    private final DuplicateDetectionService duplicateDetectionService;

    private final PaperRepository paperRepository;
    private final AuthorRepository authorRepository;
    private final InstitutionRepository institutionRepository;
    private final TopicRepository topicRepository;
    private final CountryRepository countryRepository;

    private final PaperAuthorRepository paperAuthorRepository;
    private final PaperInstitutionRepository paperInstitutionRepository;
    private final PaperTopicRepository paperTopicRepository;
    private final PaperCountryRepository paperCountryRepository;
    private final PaperCitationRepository paperCitationRepository;
    private final RelatedPaperRepository relatedPaperRepository;

    public DataIngestionService(
            OpenAlexAdapter openAlexAdapter,
            CrossrefAdapter crossrefAdapter,
            SemanticScholarAdapter semanticScholarAdapter,
            DuplicateDetectionService duplicateDetectionService,
            PaperRepository paperRepository,
            AuthorRepository authorRepository,
            InstitutionRepository institutionRepository,
            TopicRepository topicRepository,
            CountryRepository countryRepository,
            PaperAuthorRepository paperAuthorRepository,
            PaperInstitutionRepository paperInstitutionRepository,
            PaperTopicRepository paperTopicRepository,
            PaperCountryRepository paperCountryRepository,
            PaperCitationRepository paperCitationRepository,
            RelatedPaperRepository relatedPaperRepository
    ) {
        this.openAlexAdapter = openAlexAdapter;
        this.crossrefAdapter = crossrefAdapter;
        this.semanticScholarAdapter = semanticScholarAdapter;
        this.duplicateDetectionService = duplicateDetectionService;
        this.paperRepository = paperRepository;
        this.authorRepository = authorRepository;
        this.institutionRepository = institutionRepository;
        this.topicRepository = topicRepository;
        this.countryRepository = countryRepository;
        this.paperAuthorRepository = paperAuthorRepository;
        this.paperInstitutionRepository = paperInstitutionRepository;
        this.paperTopicRepository = paperTopicRepository;
        this.paperCountryRepository = paperCountryRepository;
        this.paperCitationRepository = paperCitationRepository;
        this.relatedPaperRepository = relatedPaperRepository;
    }

    @Transactional
    public List<PaperDTO> ingestResearchTopic(String query) {
        log.info("Starting scholarly data ingestion for topic: '{}'", query);

        List<PaperDTO> rawPapers = new ArrayList<>();

        // 1. Fetch from OpenAlex
        List<PaperDTO> openAlexResults = openAlexAdapter.searchWorks(query, 25);
        rawPapers.addAll(openAlexResults);

        // 2. Fetch from Crossref
        List<PaperDTO> crossrefResults = crossrefAdapter.searchWorks(query, 20);
        rawPapers.addAll(crossrefResults);

        // 3. Fetch from Semantic Scholar
        List<PaperDTO> semanticResults = semanticScholarAdapter.searchWorks(query, 20);
        rawPapers.addAll(semanticResults);

        log.info("Total raw papers fetched: OpenAlex={}, Crossref={}, SemanticScholar={}, Total={}",
                openAlexResults.size(), crossrefResults.size(), semanticResults.size(), rawPapers.size());

        // 4. Normalization and Duplicate Detection / Merging
        List<PaperDTO> deduplicatedPapers = duplicateDetectionService.deduplicateAndMerge(rawPapers);
        log.info("Total deduplicated papers to persist into MySQL: {}", deduplicatedPapers.size());

        // 5. Save/Update Entities in Database
        for (PaperDTO paperDTO : deduplicatedPapers) {
            savePaperEntityGraph(paperDTO);
        }

        // 6. Build Synthetic Citation & Related Relationships between ingested papers if missing
        linkRelatedAndCitations(deduplicatedPapers);

        return deduplicatedPapers;
    }

    @Transactional
    public void savePaperEntityGraph(PaperDTO dto) {
        // Save Paper
        Paper paper = new Paper();
        paper.setId(dto.getId());
        paper.setTitle(dto.getTitle());
        paper.setDoi(dto.getDoi());
        paper.setAbstractText(dto.getAbstractText());
        paper.setPublicationYear(dto.getPublicationYear());
        paper.setPublicationDate(dto.getPublicationDate());
        paper.setVenue(dto.getVenue());
        paper.setCitationCount(dto.getCitationCount() != null ? dto.getCitationCount() : 0);
        paper.setSource(dto.getSource());
        paper.setSourceId(dto.getSourceId());
        paper.setUrl(dto.getUrl());

        paperRepository.save(paper);

        // Save Authors
        int authorOrder = 1;
        for (AuthorDTO aDto : dto.getAuthors()) {
            Author author = authorRepository.findById(aDto.getId()).orElseGet(() -> new Author(aDto.getId(), aDto.getOpenAlexId(), aDto.getName()));
            author.setPaperCount((author.getPaperCount() != null ? author.getPaperCount() : 0) + 1);
            author.setCitationCount((author.getCitationCount() != null ? author.getCitationCount() : 0) + (dto.getCitationCount() != null ? dto.getCitationCount() : 0));
            authorRepository.save(author);

            PaperAuthor pa = new PaperAuthor(paper.getId(), author.getId(), authorOrder++);
            paperAuthorRepository.save(pa);
        }

        // Save Institutions & Countries
        for (InstitutionDTO iDto : dto.getInstitutions()) {
            if (iDto.getCountryCode() != null) {
                Country c = countryRepository.findById(iDto.getCountryCode()).orElseGet(() -> new Country(iDto.getCountryCode(), iDto.getCountryCode()));
                countryRepository.save(c);
            }

            Institution inst = institutionRepository.findById(iDto.getId()).orElseGet(() -> new Institution(iDto.getId(), null, iDto.getName(), iDto.getCountryCode()));
            inst.setPaperCount((inst.getPaperCount() != null ? inst.getPaperCount() : 0) + 1);
            institutionRepository.save(inst);

            PaperInstitution pi = new PaperInstitution(paper.getId(), inst.getId());
            paperInstitutionRepository.save(pi);
        }

        // Save Topics
        for (TopicDTO tDto : dto.getTopics()) {
            Topic topic = topicRepository.findByNameIgnoreCase(tDto.getName()).orElseGet(() -> new Topic(tDto.getId(), tDto.getName(), tDto.getCategory()));
            topic.setPaperCount((topic.getPaperCount() != null ? topic.getPaperCount() : 0) + 1);
            topicRepository.save(topic);

            PaperTopic pt = new PaperTopic(paper.getId(), topic.getId());
            paperTopicRepository.save(pt);
        }

        // Save Direct Countries
        for (String cCode : dto.getCountries()) {
            Country c = countryRepository.findById(cCode).orElseGet(() -> new Country(cCode, cCode));
            countryRepository.save(c);

            PaperCountry pc = new PaperCountry(paper.getId(), cCode);
            paperCountryRepository.save(pc);
        }
    }

    private void linkRelatedAndCitations(List<PaperDTO> papers) {
        if (papers.size() < 2) return;
        for (int i = 0; i < papers.size(); i++) {
            PaperDTO p1 = papers.get(i);
            for (int j = i + 1; j < Math.min(i + 5, papers.size()); j++) {
                PaperDTO p2 = papers.get(j);

                // Check shared topic or author
                boolean sharedTopic = p1.getTopics().stream().anyMatch(t -> p2.getTopics().stream().anyMatch(t2 -> t2.getName().equalsIgnoreCase(t.getName())));
                if (sharedTopic) {
                    relatedPaperRepository.save(new RelatedPaper(p1.getId(), p2.getId(), 0.85));
                    relatedPaperRepository.save(new RelatedPaper(p2.getId(), p1.getId(), 0.85));
                }

                // Create citation link if publication years align
                if (p1.getPublicationYear() != null && p2.getPublicationYear() != null) {
                    if (p1.getPublicationYear() > p2.getPublicationYear()) {
                        paperCitationRepository.save(new PaperCitation(p1.getId(), p2.getId()));
                    } else if (p2.getPublicationYear() > p1.getPublicationYear()) {
                        paperCitationRepository.save(new PaperCitation(p2.getId(), p1.getId()));
                    }
                }
            }
        }
    }
}
