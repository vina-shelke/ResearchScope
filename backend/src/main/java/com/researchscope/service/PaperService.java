package com.researchscope.service;

import com.researchscope.dto.*;
import com.researchscope.entity.*;
import com.researchscope.repository.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.*;

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
            RelatedPaperRepository relatedPaperRepository
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
        Sort sort = Sort.by(Sort.Direction.DESC, "publicationYear");
        if ("citationCount".equalsIgnoreCase(sortBy)) {
            sort = Sort.by("asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC, "citationCount");
        } else if ("publicationYear".equalsIgnoreCase(sortBy)) {
            sort = Sort.by("asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC, "publicationYear");
        } else if ("title".equalsIgnoreCase(sortBy)) {
            sort = Sort.by("asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC, "title");
        }

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Paper> paperPage = paperRepository.searchPapers(
                (query != null && !query.isBlank()) ? query : null,
                year,
                (source != null && !source.isBlank()) ? source : null,
                minCitations,
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

        // Authors
        List<PaperAuthor> pas = paperAuthorRepository.findByPaperId(paper.getId());
        for (PaperAuthor pa : pas) {
            authorRepository.findById(pa.getAuthorId()).ifPresent(a ->
                    dto.getAuthors().add(new AuthorDTO(a.getId(), a.getName(), a.getOpenAlexId(), a.getPaperCount(), a.getCitationCount()))
            );
        }

        // Institutions
        List<PaperInstitution> pis = paperInstitutionRepository.findByPaperId(paper.getId());
        for (PaperInstitution pi : pis) {
            institutionRepository.findById(pi.getInstitutionId()).ifPresent(inst ->
                    dto.getInstitutions().add(new InstitutionDTO(inst.getId(), inst.getName(), inst.getCountryCode(), inst.getCountryCode(), inst.getPaperCount()))
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
}
