package com.researchscope.service;

import com.researchscope.dto.PaperDTO;
import com.researchscope.dto.SavedPaperDTO;
import com.researchscope.dto.SavedPaperRequest;
import com.researchscope.entity.SavedPaper;
import com.researchscope.repository.PaperRepository;
import com.researchscope.repository.SavedPaperRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SavedPaperService {

    private final SavedPaperRepository savedPaperRepository;
    private final PaperRepository paperRepository;
    private final PaperService paperService;

    public SavedPaperService(
            SavedPaperRepository savedPaperRepository,
            PaperRepository paperRepository,
            PaperService paperService
    ) {
        this.savedPaperRepository = savedPaperRepository;
        this.paperRepository = paperRepository;
        this.paperService = paperService;
    }

    public List<SavedPaperDTO> getSavedPapers(String collectionName) {
        List<SavedPaper> list;
        if (collectionName != null && !collectionName.isBlank() && !collectionName.equalsIgnoreCase("all")) {
            list = savedPaperRepository.findByCollectionNameOrderBySavedAtDesc(collectionName);
        } else {
            list = savedPaperRepository.findAllByOrderBySavedAtDesc();
        }

        return list.stream().map(sp -> {
            PaperDTO paperDTO = paperRepository.findById(sp.getPaperId())
                    .map(paperService::toPaperDTO)
                    .orElse(null);
            return new SavedPaperDTO(
                    sp.getId(),
                    sp.getPaperId(),
                    sp.getCollectionName(),
                    sp.getNotes(),
                    sp.getSavedAt(),
                    paperDTO
            );
        }).filter(sp -> sp.getPaper() != null).toList();
    }

    public boolean isPaperSaved(String paperId) {
        return savedPaperRepository.existsByPaperId(paperId);
    }

    public Optional<SavedPaper> getSavedRecord(String paperId) {
        return savedPaperRepository.findByPaperId(paperId);
    }

    @Transactional
    public SavedPaperDTO savePaper(String paperId, SavedPaperRequest request) {
        if (!paperRepository.existsById(paperId)) {
            throw new IllegalArgumentException("Paper with ID " + paperId + " not found");
        }

        String collection = (request != null && request.getCollectionName() != null && !request.getCollectionName().isBlank())
                ? request.getCollectionName().trim() : "Favorites";
        String notes = (request != null) ? request.getNotes() : null;

        SavedPaper saved = savedPaperRepository.findByPaperId(paperId).orElseGet(() -> {
            SavedPaper sp = new SavedPaper();
            sp.setId(UUID.randomUUID().toString());
            sp.setPaperId(paperId);
            return sp;
        });

        saved.setCollectionName(collection);
        if (notes != null) {
            saved.setNotes(notes);
        }

        SavedPaper persisted = savedPaperRepository.save(saved);

        PaperDTO paperDTO = paperRepository.findById(paperId)
                .map(paperService::toPaperDTO)
                .orElse(null);

        return new SavedPaperDTO(
                persisted.getId(),
                persisted.getPaperId(),
                persisted.getCollectionName(),
                persisted.getNotes(),
                persisted.getSavedAt(),
                paperDTO
        );
    }

    @Transactional
    public void removeSavedPaper(String paperId) {
        savedPaperRepository.deleteByPaperId(paperId);
    }

    public List<String> getCollections() {
        return savedPaperRepository.findDistinctCollections();
    }

    public String exportSavedPapersCsv(String collectionName) {
        List<SavedPaperDTO> list = getSavedPapers(collectionName);
        List<PaperDTO> papers = list.stream().map(SavedPaperDTO::getPaper).toList();
        return paperService.generateCsv(papers);
    }

    public String exportSavedPapersBibTeX(String collectionName) {
        List<SavedPaperDTO> list = getSavedPapers(collectionName);
        StringBuilder sb = new StringBuilder();
        for (SavedPaperDTO sp : list) {
            if (sp.getPaper() != null) {
                sb.append(paperService.generateBibTeX(sp.getPaper())).append("\n\n");
            }
        }
        return sb.toString();
    }
}
