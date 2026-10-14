package com.researchscope.service;

import com.researchscope.dto.AuthorDTO;
import com.researchscope.dto.InstitutionDTO;
import com.researchscope.dto.PaperDTO;
import com.researchscope.dto.TopicDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class DuplicateDetectionService {

    private static final Logger log = LoggerFactory.getLogger(DuplicateDetectionService.class);

    public List<PaperDTO> deduplicateAndMerge(List<PaperDTO> rawPapers) {
        if (rawPapers == null || rawPapers.isEmpty()) {
            return Collections.emptyList();
        }

        Map<String, PaperDTO> doiMap = new HashMap<>();
        Map<String, PaperDTO> titleAuthorYearMap = new HashMap<>();
        List<PaperDTO> mergedList = new ArrayList<>();

        for (PaperDTO paper : rawPapers) {
            String doiKey = (paper.getDoi() != null && !paper.getDoi().isBlank()) ? paper.getDoi().toLowerCase().trim() : null;
            String titleKey = normalizeTitle(paper.getTitle());
            String authorKey = getFirstAuthorKey(paper.getAuthors());
            Integer yearKey = paper.getPublicationYear();

            String titleAuthorKey = (titleKey != null && !titleKey.isBlank()) 
                    ? titleKey + "|" + (authorKey != null ? authorKey : "") + "|" + (yearKey != null ? yearKey : 0) 
                    : null;

            PaperDTO existing = null;
            if (doiKey != null && doiMap.containsKey(doiKey)) {
                existing = doiMap.get(doiKey);
                log.info("Duplicate paper identified by DOI: {}", doiKey);
            } else if (titleAuthorKey != null && titleAuthorYearMap.containsKey(titleAuthorKey)) {
                existing = titleAuthorYearMap.get(titleAuthorKey);
                log.info("Duplicate paper identified by Title/Author/Year match: {}", paper.getTitle());
            }

            if (existing != null) {
                mergePaperMetadata(existing, paper);
            } else {
                mergedList.add(paper);
                if (doiKey != null) doiMap.put(doiKey, paper);
                if (titleAuthorKey != null) titleAuthorYearMap.put(titleAuthorKey, paper);
            }
        }

        return mergedList;
    }

    private void mergePaperMetadata(PaperDTO target, PaperDTO source) {
        if ((target.getAbstractText() == null || target.getAbstractText().startsWith("Abstract not available")) 
                && source.getAbstractText() != null && !source.getAbstractText().startsWith("Abstract not available")) {
            target.setAbstractText(source.getAbstractText());
        }

        if ((target.getDoi() == null || target.getDoi().isBlank()) && source.getDoi() != null) {
            target.setDoi(source.getDoi());
        }

        if ((target.getVenue() == null || target.getVenue().isBlank()) && source.getVenue() != null) {
            target.setVenue(source.getVenue());
        }

        if (source.getCitationCount() != null && source.getCitationCount() > (target.getCitationCount() != null ? target.getCitationCount() : 0)) {
            target.setCitationCount(source.getCitationCount());
        }

        if (source.getSource() != null && !target.getSource().contains(source.getSource())) {
            target.setSource(target.getSource() + ", " + source.getSource());
        }

        // Merge Open Access & PDF
        if (Boolean.TRUE.equals(source.getIsOpenAccess())) {
            target.setIsOpenAccess(true);
        }
        if ((target.getPdfUrl() == null || target.getPdfUrl().isBlank()) && source.getPdfUrl() != null && !source.getPdfUrl().isBlank()) {
            target.setPdfUrl(source.getPdfUrl());
        }

        // Merge Paper Type & Publisher
        if ((target.getPaperType() == null || target.getPaperType().isBlank()) && source.getPaperType() != null && !source.getPaperType().isBlank()) {
            target.setPaperType(source.getPaperType());
        }
        if ((target.getPublisher() == null || target.getPublisher().isBlank()) && source.getPublisher() != null && !source.getPublisher().isBlank()) {
            target.setPublisher(source.getPublisher());
        }

        // Merge Retraction
        if (Boolean.TRUE.equals(source.getIsRetracted())) {
            target.setIsRetracted(true);
        }

        // Merge authors
        Set<String> authorNames = new HashSet<>();
        for (AuthorDTO a : target.getAuthors()) {
            authorNames.add(a.getName().toLowerCase());
        }
        for (AuthorDTO a : source.getAuthors()) {
            if (!authorNames.contains(a.getName().toLowerCase())) {
                target.getAuthors().add(a);
                authorNames.add(a.getName().toLowerCase());
            } else {
                // Enrich existing author with orcid if missing
                for (AuthorDTO existingA : target.getAuthors()) {
                    if (existingA.getName().equalsIgnoreCase(a.getName()) && existingA.getOrcid() == null && a.getOrcid() != null) {
                        existingA.setOrcid(a.getOrcid());
                    }
                }
            }
        }

        // Merge institutions
        Set<String> instNames = new HashSet<>();
        for (InstitutionDTO inst : target.getInstitutions()) {
            instNames.add(inst.getName().toLowerCase());
        }
        for (InstitutionDTO inst : source.getInstitutions()) {
            if (!instNames.contains(inst.getName().toLowerCase())) {
                target.getInstitutions().add(inst);
                instNames.add(inst.getName().toLowerCase());
            } else {
                // Enrich existing institution with ror / type if missing
                for (InstitutionDTO existingInst : target.getInstitutions()) {
                    if (existingInst.getName().equalsIgnoreCase(inst.getName())) {
                        if (existingInst.getRorId() == null && inst.getRorId() != null) {
                            existingInst.setRorId(inst.getRorId());
                        }
                        if (existingInst.getInstitutionType() == null && inst.getInstitutionType() != null) {
                            existingInst.setInstitutionType(inst.getInstitutionType());
                        }
                    }
                }
            }
        }

        // Merge topics
        Set<String> topicNames = new HashSet<>();
        for (TopicDTO t : target.getTopics()) topicNames.add(t.getName().toLowerCase());
        for (TopicDTO t : source.getTopics()) {
            if (!topicNames.contains(t.getName().toLowerCase())) {
                target.getTopics().add(t);
                topicNames.add(t.getName().toLowerCase());
            }
        }

        // Merge countries
        Set<String> countryCodes = new HashSet<>(target.getCountries());
        countryCodes.addAll(source.getCountries());
        target.setCountries(new ArrayList<>(countryCodes));
    }

    private String normalizeTitle(String title) {
        if (title == null) return "";
        return title.toLowerCase().replaceAll("[^a-z0-9]", "").trim();
    }

    private String getFirstAuthorKey(List<AuthorDTO> authors) {
        if (authors == null || authors.isEmpty()) return "";
        return authors.get(0).getName().toLowerCase().replaceAll("[^a-z]", "");
    }
}
