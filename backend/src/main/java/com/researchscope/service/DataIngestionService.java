package com.researchscope.service;

import com.researchscope.dto.AuthorDTO;
import com.researchscope.dto.IngestionJobDTO;
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
    private final SourceRecordRepository sourceRecordRepository;
    private final IngestionJobRepository ingestionJobRepository;
    private final PaperReferenceRepository paperReferenceRepository;

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
            RelatedPaperRepository relatedPaperRepository,
            SourceRecordRepository sourceRecordRepository,
            IngestionJobRepository ingestionJobRepository,
            PaperReferenceRepository paperReferenceRepository
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
        this.sourceRecordRepository = sourceRecordRepository;
        this.ingestionJobRepository = ingestionJobRepository;
        this.paperReferenceRepository = paperReferenceRepository;
    }

    public IngestionJobDTO startAsyncIngestion(String query) {
        String queryClean = (query != null && !query.isBlank()) ? query.trim() : "General";
        String jobId = UUID.randomUUID().toString();
        IngestionJob job = new IngestionJob();
        job.setId(jobId);
        job.setQueryTerm(queryClean);
        job.setProvider("Unified (OpenAlex, Crossref, Semantic Scholar)");
        job.setStatus("PROCESSING");
        job.setPapersFound(0);
        job.setRecordsInserted(0);
        job.setDuplicatesDetected(0);
        ingestionJobRepository.save(job);

        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                executeIngestion(jobId, queryClean);
            } catch (Exception e) {
                log.error("Async ingestion failed for job {}: {}", jobId, e.getMessage(), e);
                updateJobFailure(jobId, e.getMessage());
            }
        });

        return toDTO(job);
    }

    public List<PaperDTO> ingestResearchTopic(String query) {
        String queryClean = (query != null && !query.isBlank()) ? query.trim() : "General";
        String jobId = UUID.randomUUID().toString();
        IngestionJob job = new IngestionJob();
        job.setId(jobId);
        job.setQueryTerm(queryClean);
        job.setProvider("Unified (OpenAlex, Crossref, Semantic Scholar)");
        job.setStatus("PROCESSING");
        job.setPapersFound(0);
        job.setRecordsInserted(0);
        job.setDuplicatesDetected(0);
        ingestionJobRepository.save(job);

        try {
            return executeIngestion(jobId, queryClean);
        } catch (Exception e) {
            log.error("Ingestion failed for query {}: {}", queryClean, e.getMessage(), e);
            updateJobFailure(jobId, e.getMessage());
            return Collections.emptyList();
        }
    }

    public List<PaperDTO> executeIngestion(String jobId, String query) {
        log.info("Starting scholarly data ingestion for topic: '{}' (Job: {})", query, jobId);

        List<PaperDTO> rawPapers = new ArrayList<>();

        // 1. Fetch from OpenAlex
        List<PaperDTO> openAlexResults = Collections.emptyList();
        try {
            openAlexResults = openAlexAdapter.searchWorks(query, 25);
            rawPapers.addAll(openAlexResults);
            recordIngestionJob(query, "OpenAlex", openAlexResults.size());
        } catch (Exception e) {
            log.warn("OpenAlex query failed: {}", e.getMessage());
        }

        // 2. Fetch from Crossref
        List<PaperDTO> crossrefResults = Collections.emptyList();
        try {
            crossrefResults = crossrefAdapter.searchWorks(query, 20);
            rawPapers.addAll(crossrefResults);
            recordIngestionJob(query, "Crossref", crossrefResults.size());
        } catch (Exception e) {
            log.warn("Crossref query failed: {}", e.getMessage());
        }

        // 3. Fetch from Semantic Scholar
        List<PaperDTO> semanticResults = Collections.emptyList();
        try {
            semanticResults = semanticScholarAdapter.searchWorks(query, 20);
            rawPapers.addAll(semanticResults);
            recordIngestionJob(query, "Semantic Scholar", semanticResults.size());
        } catch (Exception e) {
            log.warn("Semantic Scholar query failed: {}", e.getMessage());
        }

        log.info("Total raw papers fetched: OpenAlex={}, Crossref={}, SemanticScholar={}, Total={}",
                openAlexResults.size(), crossrefResults.size(), semanticResults.size(), rawPapers.size());

        // 4. Normalization and Duplicate Detection / Merging
        List<PaperDTO> deduplicatedPapers = duplicateDetectionService.deduplicateAndMerge(rawPapers);
        int duplicates = Math.max(0, rawPapers.size() - deduplicatedPapers.size());
        log.info("Total deduplicated papers to persist into MySQL: {} (duplicates merged: {})", deduplicatedPapers.size(), duplicates);

        // 5. Save/Update Entities in Database & Record Source Provenance
        for (PaperDTO paperDTO : deduplicatedPapers) {
            try {
                savePaperEntityGraph(paperDTO);
            } catch (Exception e) {
                log.warn("Error persisting paper '{}': {}", paperDTO.getTitle(), e.getMessage());
            }
        }

        // 6. Build Citation, Reference & Related Relationships between ingested papers
        try {
            linkRelatedAndCitations(deduplicatedPapers);
        } catch (Exception e) {
            log.warn("Error linking related/citations: {}", e.getMessage());
        }

        // 7. Update Job Status
        if (jobId != null) {
            try {
                ingestionJobRepository.findById(jobId).ifPresent(j -> {
                    j.setPapersFound(rawPapers.size());
                    j.setRecordsInserted(deduplicatedPapers.size());
                    j.setDuplicatesDetected(duplicates);
                    j.setStatus("COMPLETED");
                    j.setCompletedAt(java.time.LocalDateTime.now());
                    ingestionJobRepository.save(j);
                });
            } catch (Exception e) {
                log.warn("Could not update ingestion job: {}", e.getMessage());
            }
        }

        return deduplicatedPapers;
    }

    private void updateJobFailure(String jobId, String errorMessage) {
        if (jobId == null) return;
        try {
            ingestionJobRepository.findById(jobId).ifPresent(j -> {
                j.setStatus("FAILED");
                j.setErrorMessage(errorMessage != null ? errorMessage : "Unknown ingestion error");
                j.setCompletedAt(java.time.LocalDateTime.now());
                ingestionJobRepository.save(j);
            });
        } catch (Exception e) {
            log.warn("Could not mark job as failed: {}", e.getMessage());
        }
    }

    public Optional<IngestionJobDTO> getJobById(String id) {
        return ingestionJobRepository.findById(id).map(this::toDTO);
    }

    public List<IngestionJobDTO> getRecentJobs() {
        return ingestionJobRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(this::toDTO)
                .toList();
    }

    public IngestionJobDTO toDTO(IngestionJob job) {
        if (job == null) return null;
        return new IngestionJobDTO(
                job.getId(),
                job.getQueryTerm(),
                job.getProvider(),
                job.getPapersFound(),
                job.getRecordsInserted(),
                job.getDuplicatesDetected(),
                job.getStatus(),
                job.getErrorMessage(),
                job.getCreatedAt(),
                job.getCompletedAt()
        );
    }

    private void recordIngestionJob(String queryTerm, String provider, int count) {
        try {
            IngestionJob job = new IngestionJob(
                    UUID.randomUUID().toString(),
                    queryTerm,
                    provider,
                    count,
                    count,
                    0,
                    "COMPLETED",
                    null,
                    java.time.LocalDateTime.now()
            );
            ingestionJobRepository.save(job);
        } catch (Exception e) {
            log.warn("Could not record ingestion job: {}", e.getMessage());
        }
    }

    private void recordSourceRecord(String paperId, String providerName, String externalId, String url) {
        try {
            if (paperId == null || providerName == null) return;
            Optional<SourceRecord> existing = sourceRecordRepository.findByProviderNameAndExternalId(providerName, externalId);
            if (existing.isEmpty()) {
                SourceRecord sr = new SourceRecord(
                        UUID.randomUUID().toString(),
                        paperId,
                        providerName,
                        externalId,
                        url
                );
                sourceRecordRepository.save(sr);
            }
        } catch (Exception e) {
            log.warn("Could not record source record: {}", e.getMessage());
        }
    }

    @Transactional
    public void savePaperEntityGraph(PaperDTO dto) {
        // Save Paper with rich scholarly metadata
        Paper paper = paperRepository.findById(dto.getId()).orElseGet(Paper::new);
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

        paper.setIsOpenAccess(Boolean.TRUE.equals(dto.getIsOpenAccess()));
        if (dto.getPdfUrl() != null && !dto.getPdfUrl().isBlank()) {
            paper.setPdfUrl(dto.getPdfUrl());
        }
        if (dto.getPaperType() != null && !dto.getPaperType().isBlank()) {
            paper.setPaperType(dto.getPaperType());
        }
        if (dto.getPublisher() != null && !dto.getPublisher().isBlank()) {
            paper.setPublisher(dto.getPublisher());
        }
        paper.setIsRetracted(Boolean.TRUE.equals(dto.getIsRetracted()));

        paperRepository.save(paper);

        // Record source provenance
        if (dto.getSource() != null) {
            String[] providers = dto.getSource().split(",\\s*");
            for (String prov : providers) {
                String extId = dto.getSourceId() != null ? dto.getSourceId() : (dto.getDoi() != null ? dto.getDoi() : paper.getId());
                recordSourceRecord(paper.getId(), prov.trim(), extId, dto.getUrl());
            }
        }

        // Save Authors
        int authorOrder = 1;
        for (AuthorDTO aDto : dto.getAuthors()) {
            Author author = authorRepository.findById(aDto.getId()).orElseGet(() -> new Author(aDto.getId(), aDto.getOpenAlexId(), aDto.getName()));
            author.setPaperCount((author.getPaperCount() != null ? author.getPaperCount() : 0) + 1);
            author.setCitationCount((author.getCitationCount() != null ? author.getCitationCount() : 0) + (dto.getCitationCount() != null ? dto.getCitationCount() : 0));
            if (aDto.getOrcid() != null && !aDto.getOrcid().isBlank()) {
                author.setOrcid(aDto.getOrcid());
            }
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
            if (iDto.getRorId() != null && !iDto.getRorId().isBlank()) {
                inst.setRorId(iDto.getRorId());
            }
            if (iDto.getInstitutionType() != null && !iDto.getInstitutionType().isBlank()) {
                inst.setInstitutionType(iDto.getInstitutionType());
            }
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

                // Create citation and reference link if publication years align
                if (p1.getPublicationYear() != null && p2.getPublicationYear() != null) {
                    if (p1.getPublicationYear() > p2.getPublicationYear()) {
                        paperCitationRepository.save(new PaperCitation(p1.getId(), p2.getId()));
                        if (!paperReferenceRepository.existsByPaperIdAndReferencedPaperId(p1.getId(), p2.getId())) {
                            paperReferenceRepository.save(new PaperReference(p1.getId(), p2.getId()));
                        }
                    } else if (p2.getPublicationYear() > p1.getPublicationYear()) {
                        paperCitationRepository.save(new PaperCitation(p2.getId(), p1.getId()));
                        if (!paperReferenceRepository.existsByPaperIdAndReferencedPaperId(p2.getId(), p1.getId())) {
                            paperReferenceRepository.save(new PaperReference(p2.getId(), p1.getId()));
                        }
                    }
                }
            }
        }
    }
}
