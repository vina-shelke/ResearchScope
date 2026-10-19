package com.researchscope.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.researchscope.dto.*;
import com.researchscope.entity.*;
import com.researchscope.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class WorkspaceService {

    private final ResearchProjectRepository projectRepository;
    private final SavedPaperRepository savedPaperRepository;
    private final SavedSearchRepository searchRepository;
    private final SavedComparisonRepository comparisonRepository;
    private final SavedGapAnalysisRepository gapAnalysisRepository;
    private final PaperRepository paperRepository;
    private final PaperService paperService;
    private final ObjectMapper objectMapper;

    public WorkspaceService(
            ResearchProjectRepository projectRepository,
            SavedPaperRepository savedPaperRepository,
            SavedSearchRepository searchRepository,
            SavedComparisonRepository comparisonRepository,
            SavedGapAnalysisRepository gapAnalysisRepository,
            PaperRepository paperRepository,
            PaperService paperService
    ) {
        this.projectRepository = projectRepository;
        this.savedPaperRepository = savedPaperRepository;
        this.searchRepository = searchRepository;
        this.comparisonRepository = comparisonRepository;
        this.gapAnalysisRepository = gapAnalysisRepository;
        this.paperRepository = paperRepository;
        this.paperService = paperService;
        this.objectMapper = new ObjectMapper();
    }

    // --- Projects ---
    public List<ResearchProjectDTO> getUserProjects(String userId) {
        List<ResearchProject> projects = projectRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<SavedPaper> allUserPapers = savedPaperRepository.findByUserIdOrderBySavedAtDesc(userId);

        Map<String, Long> countsByProject = allUserPapers.stream()
                .filter(p -> p.getProjectId() != null)
                .collect(Collectors.groupingBy(SavedPaper::getProjectId, Collectors.counting()));

        return projects.stream().map(p -> new ResearchProjectDTO(
                p.getId(),
                p.getUserId(),
                p.getTitle(),
                p.getDescription(),
                countsByProject.getOrDefault(p.getId(), 0L).intValue(),
                p.getCreatedAt(),
                p.getUpdatedAt()
        )).toList();
    }

    @Transactional
    public ResearchProjectDTO createProject(String userId, CreateProjectRequest request) {
        String title = (request != null && request.getTitle() != null && !request.getTitle().isBlank())
                ? request.getTitle().trim() : "Untitled Project";
        String description = (request != null) ? request.getDescription() : "";

        ResearchProject project = new ResearchProject(
                "proj_" + UUID.randomUUID().toString().substring(0, 8),
                userId,
                title,
                description
        );
        ResearchProject saved = projectRepository.save(project);
        return new ResearchProjectDTO(saved.getId(), saved.getUserId(), saved.getTitle(), saved.getDescription(), 0, saved.getCreatedAt(), saved.getUpdatedAt());
    }

    @Transactional
    public void deleteProject(String userId, String projectId) {
        Optional<ResearchProject> existing = projectRepository.findByIdAndUserId(projectId, userId);
        if (existing.isPresent()) {
            projectRepository.delete(existing.get());
        }
    }

    // --- Workspace Papers & Reading Tracker ---
    public List<WorkspacePaperDTO> getWorkspacePapers(String userId, String collection, String projectId, String readingStatus) {
        List<SavedPaper> list;
        if (projectId != null && !projectId.isBlank() && !projectId.equalsIgnoreCase("all")) {
            list = savedPaperRepository.findByUserIdAndProjectIdOrderBySavedAtDesc(userId, projectId);
        } else if (readingStatus != null && !readingStatus.isBlank() && !readingStatus.equalsIgnoreCase("all")) {
            list = savedPaperRepository.findByUserIdAndReadingStatusOrderBySavedAtDesc(userId, readingStatus.toUpperCase());
        } else if (collection != null && !collection.isBlank() && !collection.equalsIgnoreCase("all")) {
            list = savedPaperRepository.findByUserIdAndCollectionNameOrderBySavedAtDesc(userId, collection);
        } else {
            list = savedPaperRepository.findByUserIdOrderBySavedAtDesc(userId);
        }

        List<String> paperIds = list.stream().map(SavedPaper::getPaperId).toList();
        List<Paper> papers = paperRepository.findAllById(paperIds);
        Map<String, PaperDTO> dtoMap = paperService.toPaperDTOs(papers).stream()
                .collect(Collectors.toMap(PaperDTO::getId, p -> p, (a, b) -> a));

        return list.stream().map(sp -> new WorkspacePaperDTO(
                sp.getId(),
                sp.getUserId(),
                sp.getPaperId(),
                sp.getCollectionName(),
                sp.getProjectId(),
                sp.getReadingStatus(),
                sp.getTags(),
                sp.getNotes(),
                sp.getSavedAt(),
                dtoMap.get(sp.getPaperId())
        )).filter(sp -> sp.getPaper() != null).toList();
    }

    @Transactional
    public WorkspacePaperDTO savePaperToWorkspace(String userId, String paperId, UpdateReadingStatusRequest request) {
        if (!paperRepository.existsById(paperId)) {
            throw new IllegalArgumentException("Paper with ID " + paperId + " not found");
        }

        SavedPaper saved = savedPaperRepository.findByUserIdAndPaperId(userId, paperId).orElseGet(() -> {
            SavedPaper sp = new SavedPaper();
            sp.setId("sp_" + UUID.randomUUID().toString().substring(0, 10));
            sp.setUserId(userId);
            sp.setPaperId(paperId);
            return sp;
        });

        if (request != null) {
            if (request.getCollectionName() != null && !request.getCollectionName().isBlank()) {
                saved.setCollectionName(request.getCollectionName().trim());
            }
            if (request.getProjectId() != null) {
                saved.setProjectId(request.getProjectId());
            }
            if (request.getReadingStatus() != null && !request.getReadingStatus().isBlank()) {
                saved.setReadingStatus(request.getReadingStatus().toUpperCase().trim());
            }
            if (request.getTags() != null) {
                saved.setTags(request.getTags());
            }
            if (request.getNotes() != null) {
                saved.setNotes(request.getNotes());
            }
        }

        SavedPaper persisted = savedPaperRepository.save(saved);
        PaperDTO paperDTO = paperRepository.findById(paperId).map(paperService::toPaperDTO).orElse(null);

        return new WorkspacePaperDTO(
                persisted.getId(),
                persisted.getUserId(),
                persisted.getPaperId(),
                persisted.getCollectionName(),
                persisted.getProjectId(),
                persisted.getReadingStatus(),
                persisted.getTags(),
                persisted.getNotes(),
                persisted.getSavedAt(),
                paperDTO
        );
    }

    @Transactional
    public void removePaperFromWorkspace(String userId, String paperId) {
        savedPaperRepository.deleteByUserIdAndPaperId(userId, paperId);
    }

    public List<String> getCollections(String userId) {
        return savedPaperRepository.findDistinctCollectionsByUserId(userId);
    }

    // --- Saved Searches ---
    public List<SavedSearchDTO> getSavedSearches(String userId) {
        return searchRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(s -> new SavedSearchDTO(s.getId(), s.getUserId(), s.getQueryText(), s.getFiltersJson(), s.getCreatedAt()))
                .toList();
    }

    @Transactional
    public SavedSearchDTO saveSearch(String userId, String queryText, String filtersJson) {
        SavedSearch search = new SavedSearch(
                "sch_" + UUID.randomUUID().toString().substring(0, 8),
                userId,
                queryText != null ? queryText.trim() : "",
                filtersJson != null ? filtersJson : "{}"
        );
        SavedSearch saved = searchRepository.save(search);
        return new SavedSearchDTO(saved.getId(), saved.getUserId(), saved.getQueryText(), saved.getFiltersJson(), saved.getCreatedAt());
    }

    @Transactional
    public void deleteSavedSearch(String userId, String searchId) {
        Optional<SavedSearch> existing = searchRepository.findByIdAndUserId(searchId, userId);
        existing.ifPresent(searchRepository::delete);
    }

    // --- Saved Comparisons ---
    public List<SavedComparisonDTO> getSavedComparisons(String userId) {
        return comparisonRepository.findByUserIdOrderByCreatedAtDesc(userId).stream().map(c -> {
            List<String> paperIds = parsePaperIds(c.getPaperIdsJson());
            List<Paper> papers = paperRepository.findAllById(paperIds);
            List<PaperDTO> paperDTOs = paperService.toPaperDTOs(papers);
            return new SavedComparisonDTO(
                    c.getId(),
                    c.getUserId(),
                    c.getTitle(),
                    c.getPaperIdsJson(),
                    c.getNotes(),
                    c.getCreatedAt(),
                    paperDTOs
            );
        }).toList();
    }

    @Transactional
    public SavedComparisonDTO saveComparison(String userId, String title, List<String> paperIds, String notes) {
        String idsJson = "[]";
        try {
            idsJson = objectMapper.writeValueAsString(paperIds != null ? paperIds : Collections.emptyList());
        } catch (Exception ignored) {}

        SavedComparison comparison = new SavedComparison(
                "cmp_" + UUID.randomUUID().toString().substring(0, 8),
                userId,
                title != null && !title.isBlank() ? title.trim() : "Untitled Comparison",
                idsJson,
                notes != null ? notes : ""
        );
        SavedComparison saved = comparisonRepository.save(comparison);
        List<Paper> papers = paperRepository.findAllById(paperIds != null ? paperIds : Collections.emptyList());
        return new SavedComparisonDTO(saved.getId(), saved.getUserId(), saved.getTitle(), saved.getPaperIdsJson(), saved.getNotes(), saved.getCreatedAt(), paperService.toPaperDTOs(papers));
    }

    @Transactional
    public void deleteSavedComparison(String userId, String comparisonId) {
        Optional<SavedComparison> existing = comparisonRepository.findByIdAndUserId(comparisonId, userId);
        existing.ifPresent(comparisonRepository::delete);
    }

    // --- Saved Gap Analyses ---
    public List<SavedGapAnalysisDTO> getSavedGapAnalyses(String userId) {
        return gapAnalysisRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(g -> new SavedGapAnalysisDTO(g.getId(), g.getUserId(), g.getTopicQuery(), g.getGapsDataJson(), g.getCreatedAt()))
                .toList();
    }

    @Transactional
    public SavedGapAnalysisDTO saveGapAnalysis(String userId, String topicQuery, String gapsDataJson) {
        SavedGapAnalysis gap = new SavedGapAnalysis(
                "gap_" + UUID.randomUUID().toString().substring(0, 8),
                userId,
                topicQuery != null ? topicQuery.trim() : "General",
                gapsDataJson != null ? gapsDataJson : "{}"
        );
        SavedGapAnalysis saved = gapAnalysisRepository.save(gap);
        return new SavedGapAnalysisDTO(saved.getId(), saved.getUserId(), saved.getTopicQuery(), saved.getGapsDataJson(), saved.getCreatedAt());
    }

    @Transactional
    public void deleteSavedGapAnalysis(String userId, String gapId) {
        Optional<SavedGapAnalysis> existing = gapAnalysisRepository.findByIdAndUserId(gapId, userId);
        existing.ifPresent(gapAnalysisRepository::delete);
    }

    // --- Exports ---
    public String exportBibTeX(String userId, String collection, String projectId) {
        List<WorkspacePaperDTO> list = getWorkspacePapers(userId, collection, projectId, null);
        StringBuilder sb = new StringBuilder();
        for (WorkspacePaperDTO wp : list) {
            if (wp.getPaper() != null) {
                sb.append(paperService.generateBibTeX(wp.getPaper())).append("\n\n");
            }
        }
        return sb.toString();
    }

    public String exportCsv(String userId, String collection, String projectId) {
        List<WorkspacePaperDTO> list = getWorkspacePapers(userId, collection, projectId, null);
        List<PaperDTO> papers = list.stream().map(WorkspacePaperDTO::getPaper).toList();
        return paperService.generateCsv(papers);
    }

    private List<String> parsePaperIds(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
