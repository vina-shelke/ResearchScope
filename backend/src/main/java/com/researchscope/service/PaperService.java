package com.researchscope.service;

import com.researchscope.dto.*;
import com.researchscope.entity.*;
import com.researchscope.repository.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PaperService {

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
    private final PaperReferenceRepository paperReferenceRepository;
    private final SavedPaperRepository savedPaperRepository;

    public PaperService(
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
            PaperReferenceRepository paperReferenceRepository,
            SavedPaperRepository savedPaperRepository
    ) {
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
        this.paperReferenceRepository = paperReferenceRepository;
        this.savedPaperRepository = savedPaperRepository;
    }

    public static String normalizeDoi(String doi) {
        if (doi == null || doi.isBlank()) return null;
        String clean = doi.trim();
        clean = clean.replaceFirst("^(?i)https?://(dx\\.)?doi\\.org/", "");
        clean = clean.replaceFirst("^(?i)doi:", "");
        return clean.trim();
    }

    public PaginatedResponse<PaperDTO> searchPapers(
            String query,
            Integer year,
            String source,
            Integer minCitations,
            String sortBy,
            String sortDir,
            int page,
            int size
    ) {
        return searchPapersExtended(query, year, source, minCitations, null, null, null, null, sortBy, sortDir, page, size);
    }

    public PaginatedResponse<PaperDTO> searchPapersExtended(
            String query,
            Integer year,
            String source,
            Integer minCitations,
            Boolean isOpenAccess,
            String paperType,
            String author,
            String institution,
            String sortBy,
            String sortDir,
            int page,
            int size
    ) {
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Sort sort;
        if ("citationCount".equalsIgnoreCase(sortBy) || "citations".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(direction, "citationCount");
        } else if ("newest".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "publicationYear");
        } else if ("oldest".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.ASC, "publicationYear");
        } else if ("title".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(direction, "title");
        } else if ("relevance".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "citationCount").and(Sort.by(Sort.Direction.DESC, "publicationYear"));
        } else {
            sort = Sort.by(direction, "publicationYear");
        }

        Pageable pageable = PageRequest.of(page, size, sort);
        String trimmedQuery = (query != null && !query.isBlank()) ? query.trim() : null;
        String normalizedDoi = normalizeDoi(trimmedQuery);
        String effectiveQuery = (normalizedDoi != null && !normalizedDoi.isBlank()) ? normalizedDoi : trimmedQuery;

        Page<Paper> paperPage = paperRepository.searchPapersExtended(
                effectiveQuery,
                year,
                (source != null && !source.isBlank()) ? source.trim() : null,
                minCitations,
                isOpenAccess,
                (paperType != null && !paperType.isBlank()) ? paperType.trim() : null,
                (author != null && !author.isBlank()) ? author.trim() : null,
                (institution != null && !institution.isBlank()) ? institution.trim() : null,
                pageable
        );

        List<PaperDTO> dtos = toPaperDTOs(paperPage.getContent());

        return new PaginatedResponse<>(
                dtos,
                paperPage.getNumber(),
                paperPage.getSize(),
                paperPage.getTotalElements(),
                paperPage.getTotalPages(),
                paperPage.isLast()
        );
    }

    public Optional<PaperDTO> getPaperById(String id) {
        return paperRepository.findById(id).map(paper -> {
            PaperDTO dto = toPaperDTO(paper);
            dto.setRelatedPapers(getRelatedPapers(id));
            dto.setCitations(getCitationsForPaper(id));
            dto.setReferences(getReferencesForPaper(id));
            return dto;
        });
    }

    public List<PaperDTO> getRelatedPapers(String paperId) {
        List<RelatedPaper> rels = relatedPaperRepository.findByPaperId(paperId);
        List<String> relatedIds = rels.stream().map(RelatedPaper::getRelatedPaperId).toList();
        List<Paper> papers = paperRepository.findAllById(relatedIds);
        return toPaperDTOs(papers);
    }

    public List<PaperDTO> getCitationsForPaper(String paperId) {
        List<PaperCitation> citations = paperCitationRepository.findByCitedPaperId(paperId);
        List<String> citingIds = citations.stream().map(PaperCitation::getCitingPaperId).toList();
        List<Paper> papers = paperRepository.findAllById(citingIds);
        return toPaperDTOs(papers);
    }

    public List<PaperDTO> getReferencesForPaper(String paperId) {
        List<PaperReference> refs = paperReferenceRepository.findByPaperId(paperId);
        List<String> refIds = refs.stream().map(PaperReference::getReferencedPaperId).toList();
        List<Paper> papers = paperRepository.findAllById(refIds);
        return toPaperDTOs(papers);
    }

    public List<PaperDTO> toPaperDTOs(List<Paper> papers) {
        if (papers == null || papers.isEmpty()) {
            return Collections.emptyList();
        }

        List<String> paperIds = papers.stream().map(Paper::getId).toList();

        // 1. Fetch saved paper mappings
        Map<String, SavedPaper> savedMap = savedPaperRepository.findByPaperIdIn(paperIds).stream()
                .collect(Collectors.toMap(SavedPaper::getPaperId, sp -> sp, (a, b) -> a));

        // 2. Fetch paper authors and author details
        List<PaperAuthor> allPaperAuthors = paperAuthorRepository.findByPaperIdIn(paperIds);
        List<String> authorIds = allPaperAuthors.stream().map(PaperAuthor::getAuthorId).distinct().toList();
        Map<String, Author> authorMap = authorRepository.findAllById(authorIds).stream()
                .collect(Collectors.toMap(Author::getId, a -> a, (a, b) -> a));
        Map<String, List<PaperAuthor>> paperAuthorsByPaper = allPaperAuthors.stream()
                .sorted(Comparator.comparing(PaperAuthor::getAuthorOrder, Comparator.nullsLast(Comparator.naturalOrder())))
                .collect(Collectors.groupingBy(PaperAuthor::getPaperId));

        // 3. Fetch paper institutions and institution details
        List<PaperInstitution> allPaperInstitutions = paperInstitutionRepository.findByPaperIdIn(paperIds);
        List<String> instIds = allPaperInstitutions.stream().map(PaperInstitution::getInstitutionId).distinct().toList();
        Map<String, Institution> instMap = institutionRepository.findAllById(instIds).stream()
                .collect(Collectors.toMap(Institution::getId, i -> i, (a, b) -> a));
        Map<String, List<PaperInstitution>> paperInstsByPaper = allPaperInstitutions.stream()
                .collect(Collectors.groupingBy(PaperInstitution::getPaperId));

        // 4. Fetch paper topics and topic details
        List<PaperTopic> allPaperTopics = paperTopicRepository.findByPaperIdIn(paperIds);
        List<String> topicIds = allPaperTopics.stream().map(PaperTopic::getTopicId).distinct().toList();
        Map<String, Topic> topicMap = topicRepository.findAllById(topicIds).stream()
                .collect(Collectors.toMap(Topic::getId, t -> t, (a, b) -> a));
        Map<String, List<PaperTopic>> paperTopicsByPaper = allPaperTopics.stream()
                .collect(Collectors.groupingBy(PaperTopic::getPaperId));

        // 5. Fetch paper countries
        List<PaperCountry> allPaperCountries = paperCountryRepository.findByPaperIdIn(paperIds);
        Map<String, List<PaperCountry>> paperCountriesByPaper = allPaperCountries.stream()
                .collect(Collectors.groupingBy(PaperCountry::getPaperId));

        // Construct DTOs
        List<PaperDTO> dtoList = new ArrayList<>(papers.size());
        for (Paper paper : papers) {
            PaperDTO dto = mapPaperToDTOBase(paper);

            // Saved status
            SavedPaper sp = savedMap.get(paper.getId());
            if (sp != null) {
                dto.setIsSaved(true);
                dto.setSavedCollection(sp.getCollectionName());
                dto.setSavedNotes(sp.getNotes());
            }

            // Authors
            List<PaperAuthor> pas = paperAuthorsByPaper.getOrDefault(paper.getId(), Collections.emptyList());
            for (PaperAuthor pa : pas) {
                Author a = authorMap.get(pa.getAuthorId());
                if (a != null) {
                    dto.getAuthors().add(new AuthorDTO(a.getId(), a.getName(), a.getOpenAlexId(), a.getOrcid(), a.getPaperCount(), a.getCitationCount()));
                }
            }

            // Institutions
            List<PaperInstitution> pis = paperInstsByPaper.getOrDefault(paper.getId(), Collections.emptyList());
            for (PaperInstitution pi : pis) {
                Institution inst = instMap.get(pi.getInstitutionId());
                if (inst != null) {
                    dto.getInstitutions().add(new InstitutionDTO(inst.getId(), inst.getName(), inst.getCountryCode(), inst.getCountryCode(), inst.getPaperCount(), inst.getRorId(), inst.getInstitutionType()));
                }
            }

            // Topics
            List<PaperTopic> pts = paperTopicsByPaper.getOrDefault(paper.getId(), Collections.emptyList());
            for (PaperTopic pt : pts) {
                Topic t = topicMap.get(pt.getTopicId());
                if (t != null) {
                    dto.getTopics().add(new TopicDTO(t.getId(), t.getName(), t.getCategory(), t.getPaperCount()));
                }
            }

            // Countries
            List<PaperCountry> pcs = paperCountriesByPaper.getOrDefault(paper.getId(), Collections.emptyList());
            for (PaperCountry pc : pcs) {
                dto.getCountries().add(pc.getCountryCode());
            }

            dtoList.add(dto);
        }

        return dtoList;
    }

    public PaperDTO toPaperDTO(Paper paper) {
        if (paper == null) return null;
        List<PaperDTO> list = toPaperDTOs(List.of(paper));
        return list.isEmpty() ? null : list.get(0);
    }

    private PaperDTO mapPaperToDTOBase(Paper paper) {
        PaperDTO dto = new PaperDTO();
        dto.setId(paper.getId());
        dto.setTitle(paper.getTitle());
        dto.setDoi(paper.getDoi());
        dto.setAbstractText(paper.getAbstractText());
        dto.setPublicationYear(paper.getPublicationYear());
        dto.setPublicationDate(paper.getPublicationDate());
        dto.setVenue(paper.getVenue());
        dto.setCitationCount(paper.getCitationCount());
        dto.setSource(paper.getSource());
        dto.setSourceId(paper.getSourceId());
        dto.setUrl(paper.getUrl());
        dto.setIsOpenAccess(paper.getIsOpenAccess() != null ? paper.getIsOpenAccess() : false);
        dto.setPdfUrl(paper.getPdfUrl());
        dto.setPaperType(paper.getPaperType());
        dto.setPublisher(paper.getPublisher());
        dto.setIsRetracted(paper.getIsRetracted() != null ? paper.getIsRetracted() : false);
        return dto;
    }

    public String generateBibTeX(PaperDTO paper) {
        String citeKey = (paper.getAuthors() != null && !paper.getAuthors().isEmpty())
                ? paper.getAuthors().get(0).getName().replaceAll("[^a-zA-Z]", "") + (paper.getPublicationYear() != null ? paper.getPublicationYear() : "")
                : "paper_" + (paper.getId() != null ? paper.getId().substring(0, Math.min(8, paper.getId().length())) : "record");

        String authorString = (paper.getAuthors() != null && !paper.getAuthors().isEmpty())
                ? paper.getAuthors().stream().map(AuthorDTO::getName).collect(Collectors.joining(" and "))
                : "Unknown";

        StringBuilder sb = new StringBuilder();
        sb.append("@article{").append(citeKey).append(",\n");
        sb.append("  title = {").append(escapeBibTeX(paper.getTitle())).append("},\n");
        sb.append("  author = {").append(escapeBibTeX(authorString)).append("},\n");
        if (paper.getPublicationYear() != null) {
            sb.append("  year = {").append(paper.getPublicationYear()).append("},\n");
        }
        if (paper.getVenue() != null && !paper.getVenue().isBlank()) {
            sb.append("  journal = {").append(escapeBibTeX(paper.getVenue())).append("},\n");
        }
        if (paper.getDoi() != null && !paper.getDoi().isBlank()) {
            sb.append("  doi = {").append(escapeBibTeX(paper.getDoi())).append("},\n");
        }
        if (paper.getUrl() != null && !paper.getUrl().isBlank()) {
            sb.append("  url = {").append(escapeBibTeX(paper.getUrl())).append("},\n");
        }
        if (paper.getPublisher() != null && !paper.getPublisher().isBlank()) {
            sb.append("  publisher = {").append(escapeBibTeX(paper.getPublisher())).append("},\n");
        }
        sb.append("}");
        return sb.toString();
    }

    public String generateRis(PaperDTO paper) {
        StringBuilder sb = new StringBuilder();
        sb.append("TY  - JOUR\n");
        if (paper.getTitle() != null && !paper.getTitle().isBlank()) {
            sb.append("TI  - ").append(paper.getTitle().replace("\n", " ").trim()).append("\n");
        }
        if (paper.getAuthors() != null) {
            for (AuthorDTO author : paper.getAuthors()) {
                if (author.getName() != null && !author.getName().isBlank()) {
                    sb.append("AU  - ").append(author.getName().trim()).append("\n");
                }
            }
        }
        if (paper.getPublicationYear() != null) {
            sb.append("PY  - ").append(paper.getPublicationYear()).append("\n");
        }
        if (paper.getVenue() != null && !paper.getVenue().isBlank()) {
            sb.append("JO  - ").append(paper.getVenue().replace("\n", " ").trim()).append("\n");
        }
        if (paper.getDoi() != null && !paper.getDoi().isBlank()) {
            sb.append("DO  - ").append(paper.getDoi().trim()).append("\n");
        }
        if (paper.getUrl() != null && !paper.getUrl().isBlank()) {
            sb.append("UR  - ").append(paper.getUrl().trim()).append("\n");
        }
        if (paper.getPdfUrl() != null && !paper.getPdfUrl().isBlank()) {
            sb.append("L1  - ").append(paper.getPdfUrl().trim()).append("\n");
        }
        if (paper.getPublisher() != null && !paper.getPublisher().isBlank()) {
            sb.append("PB  - ").append(paper.getPublisher().trim()).append("\n");
        }
        if (paper.getAbstractText() != null && !paper.getAbstractText().isBlank()) {
            sb.append("AB  - ").append(paper.getAbstractText().replace("\n", " ").trim()).append("\n");
        }
        sb.append("ER  - \n");
        return sb.toString();
    }

    public String generateCsv(List<PaperDTO> papers) {
        StringBuilder sb = new StringBuilder();
        sb.append("\"ID\",\"Title\",\"Authors\",\"Publication Year\",\"Venue\",\"Citations\",\"DOI\",\"Open Access\",\"PDF URL\",\"Paper Type\",\"Publisher\",\"Source\"\n");
        for (PaperDTO p : papers) {
            String authors = (p.getAuthors() != null) ? p.getAuthors().stream().map(AuthorDTO::getName).collect(Collectors.joining("; ")) : "";
            sb.append(escapeCsv(p.getId())).append(",");
            sb.append(escapeCsv(p.getTitle())).append(",");
            sb.append(escapeCsv(authors)).append(",");
            sb.append(p.getPublicationYear() != null ? p.getPublicationYear() : "").append(",");
            sb.append(escapeCsv(p.getVenue())).append(",");
            sb.append(p.getCitationCount() != null ? p.getCitationCount() : 0).append(",");
            sb.append(escapeCsv(p.getDoi())).append(",");
            sb.append(Boolean.TRUE.equals(p.getIsOpenAccess()) ? "true" : "false").append(",");
            sb.append(escapeCsv(p.getPdfUrl())).append(",");
            sb.append(escapeCsv(p.getPaperType())).append(",");
            sb.append(escapeCsv(p.getPublisher())).append(",");
            sb.append(escapeCsv(p.getSource())).append("\n");
        }
        return sb.toString();
    }

    private String escapeBibTeX(String text) {
        if (text == null) return "";
        return text.replace("{", "\\{").replace("}", "\\}").replace("\n", " ").trim();
    }

    private String escapeCsv(String text) {
        if (text == null) return "\"\"";
        return "\"" + text.replace("\"", "\"\"").replace("\n", " ").replace("\r", " ").trim() + "\"";
    }
}
