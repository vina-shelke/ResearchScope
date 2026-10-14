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
        Sort sort = Sort.by(Sort.Direction.DESC, "publicationYear");
        if ("citationCount".equalsIgnoreCase(sortBy)) {
            sort = Sort.by("asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC, "citationCount");
        } else if ("publicationYear".equalsIgnoreCase(sortBy)) {
            sort = Sort.by("asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC, "publicationYear");
        } else if ("title".equalsIgnoreCase(sortBy)) {
            sort = Sort.by("asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC, "title");
        }

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Paper> paperPage = paperRepository.searchPapersExtended(
                (query != null && !query.isBlank()) ? query.trim() : null,
                year,
                (source != null && !source.isBlank()) ? source.trim() : null,
                minCitations,
                isOpenAccess,
                (paperType != null && !paperType.isBlank()) ? paperType.trim() : null,
                (author != null && !author.isBlank()) ? author.trim() : null,
                (institution != null && !institution.isBlank()) ? institution.trim() : null,
                pageable
        );

        List<PaperDTO> dtos = paperPage.getContent().stream()
                .map(this::toPaperDTO)
                .toList();

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
        List<PaperDTO> list = new ArrayList<>();
        for (RelatedPaper rel : rels) {
            paperRepository.findById(rel.getRelatedPaperId()).ifPresent(p -> list.add(toPaperDTO(p)));
        }
        return list;
    }

    public List<PaperDTO> getCitationsForPaper(String paperId) {
        List<PaperCitation> citations = paperCitationRepository.findByCitedPaperId(paperId);
        List<PaperDTO> list = new ArrayList<>();
        for (PaperCitation pc : citations) {
            paperRepository.findById(pc.getCitingPaperId()).ifPresent(p -> list.add(toPaperDTO(p)));
        }
        return list;
    }

    public List<PaperDTO> getReferencesForPaper(String paperId) {
        List<PaperReference> refs = paperReferenceRepository.findByPaperId(paperId);
        List<PaperDTO> list = new ArrayList<>();
        for (PaperReference pr : refs) {
            paperRepository.findById(pr.getReferencedPaperId()).ifPresent(p -> list.add(toPaperDTO(p)));
        }
        return list;
    }

    public PaperDTO toPaperDTO(Paper paper) {
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

        // Saved bookmark status
        savedPaperRepository.findByPaperId(paper.getId()).ifPresent(sp -> {
            dto.setIsSaved(true);
            dto.setSavedCollection(sp.getCollectionName());
            dto.setSavedNotes(sp.getNotes());
        });

        // Authors
        List<PaperAuthor> pas = paperAuthorRepository.findByPaperId(paper.getId());
        for (PaperAuthor pa : pas) {
            authorRepository.findById(pa.getAuthorId()).ifPresent(a ->
                    dto.getAuthors().add(new AuthorDTO(a.getId(), a.getName(), a.getOpenAlexId(), a.getOrcid(), a.getPaperCount(), a.getCitationCount()))
            );
        }

        // Institutions
        List<PaperInstitution> pis = paperInstitutionRepository.findByPaperId(paper.getId());
        for (PaperInstitution pi : pis) {
            institutionRepository.findById(pi.getInstitutionId()).ifPresent(inst ->
                    dto.getInstitutions().add(new InstitutionDTO(inst.getId(), inst.getName(), inst.getCountryCode(), inst.getCountryCode(), inst.getPaperCount(), inst.getRorId(), inst.getInstitutionType()))
            );
        }

        // Topics
        List<PaperTopic> pts = paperTopicRepository.findByPaperId(paper.getId());
        for (PaperTopic pt : pts) {
            topicRepository.findById(pt.getTopicId()).ifPresent(t ->
                    dto.getTopics().add(new TopicDTO(t.getId(), t.getName(), t.getCategory(), t.getPaperCount()))
            );
        }

        // Countries
        List<PaperCountry> pcs = paperCountryRepository.findByPaperId(paper.getId());
        for (PaperCountry pc : pcs) {
            dto.getCountries().add(pc.getCountryCode());
        }

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
