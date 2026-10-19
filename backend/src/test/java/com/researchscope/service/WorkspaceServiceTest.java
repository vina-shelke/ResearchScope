package com.researchscope.service;

import com.researchscope.dto.CreateProjectRequest;
import com.researchscope.dto.ResearchProjectDTO;
import com.researchscope.dto.UpdateReadingStatusRequest;
import com.researchscope.dto.WorkspacePaperDTO;
import com.researchscope.entity.Paper;
import com.researchscope.entity.ResearchProject;
import com.researchscope.entity.SavedPaper;
import com.researchscope.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class WorkspaceServiceTest {

    private ResearchProjectRepository projectRepository;
    private SavedPaperRepository savedPaperRepository;
    private SavedSearchRepository searchRepository;
    private SavedComparisonRepository comparisonRepository;
    private SavedGapAnalysisRepository gapAnalysisRepository;
    private PaperRepository paperRepository;
    private PaperService paperService;
    private WorkspaceService workspaceService;

    @BeforeEach
    void setUp() {
        projectRepository = mock(ResearchProjectRepository.class);
        savedPaperRepository = mock(SavedPaperRepository.class);
        searchRepository = mock(SavedSearchRepository.class);
        comparisonRepository = mock(SavedComparisonRepository.class);
        gapAnalysisRepository = mock(SavedGapAnalysisRepository.class);
        paperRepository = mock(PaperRepository.class);
        paperService = mock(PaperService.class);

        workspaceService = new WorkspaceService(
                projectRepository,
                savedPaperRepository,
                searchRepository,
                comparisonRepository,
                gapAnalysisRepository,
                paperRepository,
                paperService
        );
    }

    @Test
    void testCreateProjectAndGetUserProjects() {
        ResearchProject project = new ResearchProject("proj_1", "user_test", "AI Ethics", "Notes");
        when(projectRepository.save(any(ResearchProject.class))).thenReturn(project);
        when(projectRepository.findByUserIdOrderByCreatedAtDesc("user_test")).thenReturn(List.of(project));
        when(savedPaperRepository.findByUserIdOrderBySavedAtDesc("user_test")).thenReturn(List.of());

        ResearchProjectDTO created = workspaceService.createProject("user_test", new CreateProjectRequest("AI Ethics", "Notes"));
        assertNotNull(created);
        assertEquals("AI Ethics", created.getTitle());

        List<ResearchProjectDTO> list = workspaceService.getUserProjects("user_test");
        assertEquals(1, list.size());
        assertEquals("AI Ethics", list.get(0).getTitle());
    }

    @Test
    void testSavePaperToWorkspaceWithReadingStatus() {
        when(paperRepository.existsById("p1")).thenReturn(true);
        when(paperRepository.findById("p1")).thenReturn(Optional.of(new Paper()));
        when(savedPaperRepository.findByUserIdAndPaperId("user_test", "p1")).thenReturn(Optional.empty());

        SavedPaper saved = new SavedPaper("sp_1", "user_test", "p1", "Favorites", "proj_1", "READING", "llm,privacy", "Interesting paper");
        when(savedPaperRepository.save(any(SavedPaper.class))).thenReturn(saved);

        UpdateReadingStatusRequest request = new UpdateReadingStatusRequest("READING", "Favorites", "proj_1", "llm,privacy", "Interesting paper");
        WorkspacePaperDTO result = workspaceService.savePaperToWorkspace("user_test", "p1", request);

        assertNotNull(result);
        assertEquals("READING", result.getReadingStatus());
        assertEquals("proj_1", result.getProjectId());
    }
}
