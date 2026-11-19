import React, { useState, useEffect } from 'react';
import {
  fetchWorkspaceProjects,
  createWorkspaceProject,
  deleteWorkspaceProject,
  fetchWorkspacePapers,
  updatePaperReadingStatus,
  removePaperFromWorkspace,
  fetchSavedSearches,
  deleteSavedSearch,
  fetchSavedComparisons,
  deleteSavedComparison,
  fetchSavedGapAnalyses,
  deleteSavedGapAnalysis,
  fetchUserLiteratureReviews,
  fetchUserTeams,
  getWorkspaceBibTeXUrl,
  getWorkspaceCsvUrl
} from '../api/client';
import { useToast } from './Toast';

// Reusable Subcomponents
import WorkspaceHeader from './workspace/WorkspaceHeader';
import WorkspaceQuickActions from './workspace/WorkspaceQuickActions';
import WorkspaceEmptyState from './workspace/WorkspaceEmptyState';
import ReadingTrackerKanban from './workspace/ReadingTrackerKanban';
import ProjectsManager from './workspace/ProjectsManager';
import SavedSearchesManager from './workspace/SavedSearchesManager';
import SavedComparisonsList from './workspace/SavedComparisonsList';
import SavedGapsList from './workspace/SavedGapsList';
import LiteratureReviewGenerator from './LiteratureReviewGenerator';
import ResearchCollaborationView from './ResearchCollaborationView';

export default function WorkspaceView({
  onSelectPaper,
  onRunSearch,
  onLoadComparison,
  onOpenAuthModal,
  currentUser,
  setActiveTab,
  onOpenCite
}) {
  const toast = useToast();
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState('reading'); // reading, projects, searches, comparisons, gaps
  const [papers, setPapers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [searches, setSearches] = useState([]);
  const [comparisons, setComparisons] = useState([]);
  const [gaps, setGaps] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetchWorkspacePapers(),
      fetchWorkspaceProjects(),
      fetchSavedSearches(),
      fetchSavedComparisons(),
      fetchSavedGapAnalyses(),
      fetchUserLiteratureReviews().catch(() => []),
      fetchUserTeams().catch(() => [])
    ])
      .then(([pList, prjList, sList, cList, gList, rList, tList]) => {
        setPapers(pList || []);
        setProjects(prjList || []);
        setSearches(sList || []);
        setComparisons(cList || []);
        setGaps(gList || []);
        setReviews(rList || []);
        setTeams(tList || []);
      })
      .catch(err => {
        console.error('Failed to load workspace data:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Paper status change handler
  const handleStatusChange = async (paperId, newStatus) => {
    try {
      await updatePaperReadingStatus(paperId, { readingStatus: newStatus });
      setPapers(prev => prev.map(p => p.paperId === paperId ? { ...p, readingStatus: newStatus } : p));
      toast.success(`Reading status updated to ${newStatus}.`);
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error('Failed to update reading status.');
    }
  };

  // Paper notes update handler
  const handleSaveNotes = async (paperId, notes) => {
    try {
      await updatePaperReadingStatus(paperId, { notes });
      setPapers(prev => prev.map(p => p.paperId === paperId ? { ...p, notes } : p));
      toast.success('Research notes saved successfully.');
    } catch (err) {
      console.error('Failed to save notes:', err);
      toast.error('Failed to save notes.');
    }
  };

  // Remove paper from workspace
  const handleRemovePaper = async (paperId) => {
    try {
      await removePaperFromWorkspace(paperId);
      setPapers(prev => prev.filter(p => p.paperId !== paperId));
      toast.info('Paper removed from workspace.');
    } catch (err) {
      console.error('Failed to remove paper:', err);
      toast.error('Failed to remove paper.');
    }
  };

  // Project creation handler
  const handleCreateProject = async ({ title, description }) => {
    try {
      const created = await createWorkspaceProject({ title, description });
      setProjects(prev => [created, ...prev]);
      toast.success(`Project "${title}" created successfully.`);
    } catch (err) {
      console.error('Failed to create project:', err);
      toast.error('Failed to create project.');
      throw err;
    }
  };

  // Project deletion handler
  const handleDeleteProject = async (id) => {
    try {
      await deleteWorkspaceProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      toast.info('Research project deleted.');
    } catch (err) {
      console.error('Failed to delete project:', err);
      toast.error('Failed to delete project.');
    }
  };

  // Saved Search deletion handler
  const handleDeleteSearch = async (id) => {
    try {
      await deleteSavedSearch(id);
      setSearches(prev => prev.filter(s => s.id !== id));
      toast.info('Saved search query deleted.');
    } catch (err) {
      console.error('Failed to delete search:', err);
      toast.error('Failed to delete search.');
    }
  };

  // Saved Comparison deletion handler
  const handleDeleteComparison = async (id) => {
    try {
      await deleteSavedComparison(id);
      setComparisons(prev => prev.filter(c => c.id !== id));
      toast.info('Saved comparison deleted.');
    } catch (err) {
      console.error('Failed to delete comparison:', err);
      toast.error('Failed to delete comparison.');
    }
  };

  // Saved Gap Analysis deletion handler
  const handleDeleteGap = async (id) => {
    try {
      await deleteSavedGapAnalysis(id);
      setGaps(prev => prev.filter(g => g.id !== id));
      toast.info('Saved research gap deleted.');
    } catch (err) {
      console.error('Failed to delete gap:', err);
      toast.error('Failed to delete gap.');
    }
  };

  // Quick Action handlers
  const handleQuickNewProject = () => {
    setActiveWorkspaceTab('projects');
    setShowNewProjectForm(true);
  };

  const handleQuickFindPapers = () => {
    if (setActiveTab) {
      setActiveTab('papers');
    } else if (onRunSearch) {
      onRunSearch('');
    }
  };

  const handleQuickStartReview = () => {
    setActiveWorkspaceTab('reviews');
  };

  const handleQuickAnalyzeGap = () => {
    if (setActiveTab) {
      setActiveTab('gaps');
    }
  };

  const tabs = [
    { id: 'reading', label: 'Reading Tracker', count: papers.length },
    { id: 'reviews', label: 'Literature Reviews', count: reviews.length },
    { id: 'teams', label: 'Research Teams', count: teams.length },
    { id: 'projects', label: 'Research Projects', count: projects.length },
    { id: 'searches', label: 'Saved Searches', count: searches.length },
    { id: 'comparisons', label: 'Saved Comparisons', count: comparisons.length },
    { id: 'gaps', label: 'Saved Gap Analyses', count: gaps.length }
  ];

  return (
    <div className="workspace-view">
      {/* 1. Top Dashboard Header & Statistics Cards */}
      <WorkspaceHeader
        currentUser={currentUser}
        papers={papers}
        projects={projects}
        searches={searches}
        gaps={gaps}
        activeTab={activeWorkspaceTab}
        onSelectTab={setActiveWorkspaceTab}
        onOpenAuthModal={onOpenAuthModal}
        bibtexUrl={getWorkspaceBibTeXUrl()}
        csvUrl={getWorkspaceCsvUrl()}
      />

      {/* 2. Quick Actions Bar */}
      <WorkspaceQuickActions
        onNewProject={handleQuickNewProject}
        onFindPapers={handleQuickFindPapers}
        onOpenAiAssistant={() => setActiveTab && setActiveTab('ai')}
        onStartLiteratureReview={handleQuickStartReview}
        onAnalyzeGap={handleQuickAnalyzeGap}
      />

      {/* 3. Sub-Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        borderBottom: '2px solid var(--border-color)',
        marginBottom: '24px',
        overflowX: 'auto',
        scrollbarWidth: 'none'
      }}>
        {tabs.map(t => {
          const isActive = activeWorkspaceTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                fontSize: '13.5px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--text-main)' : '2px solid transparent',
                background: 'none',
                cursor: 'pointer',
                marginBottom: '-2px',
                whiteSpace: 'nowrap',
                transition: 'color 0.15s ease, border-color 0.15s ease'
              }}
              onClick={() => setActiveWorkspaceTab(t.id)}
            >
              <span>{t.label}</span>
              <span className={`tag ${isActive ? 'tag-accent' : ''}`} style={{ fontSize: '10.5px', padding: '1px 6px' }}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Loading state indicator */}
      {loading && (
        <div className="panel" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Loading your research workspace...
        </div>
      )}

      {/* Tab Panels */}
      {!loading && (
        <div>
          {/* Tab 1: Reading Tracker */}
          {activeWorkspaceTab === 'reading' && (
            papers.length === 0 ? (
              <WorkspaceEmptyState
                onFindPapers={handleQuickFindPapers}
                onNewProject={handleQuickNewProject}
              />
            ) : (
              <ReadingTrackerKanban
                papers={papers}
                onSelectPaper={onSelectPaper}
                onStatusChange={handleStatusChange}
                onSaveNotes={handleSaveNotes}
                onRemovePaper={handleRemovePaper}
                onOpenCite={onOpenCite}
              />
            )
          )}

          {/* Tab 1.5: Literature Reviews Generator */}
          {activeWorkspaceTab === 'reviews' && (
            <LiteratureReviewGenerator
              onSelectPaper={onSelectPaper}
              setActiveTab={setActiveTab}
            />
          )}

          {/* Tab 1.8: Research Teams & Collaboration */}
          {activeWorkspaceTab === 'teams' && (
            <ResearchCollaborationView
              onSelectPaper={onSelectPaper}
              currentUser={currentUser}
            />
          )}

          {/* Tab 2: Projects Manager */}
          {activeWorkspaceTab === 'projects' && (
            <ProjectsManager
              projects={projects}
              onCreateProject={handleCreateProject}
              onDeleteProject={handleDeleteProject}
              showNewProjectForm={showNewProjectForm}
              setShowNewProjectForm={setShowNewProjectForm}
            />
          )}

          {/* Tab 3: Saved Searches */}
          {activeWorkspaceTab === 'searches' && (
            <SavedSearchesManager
              searches={searches}
              onRunSearch={onRunSearch || ((q) => { if (setActiveTab) setActiveTab('papers'); })}
              onDeleteSearch={handleDeleteSearch}
            />
          )}

          {/* Tab 4: Saved Comparisons */}
          {activeWorkspaceTab === 'comparisons' && (
            <SavedComparisonsList
              comparisons={comparisons}
              onLoadComparison={onLoadComparison}
              onDeleteComparison={handleDeleteComparison}
            />
          )}

          {/* Tab 5: Saved Gaps */}
          {activeWorkspaceTab === 'gaps' && (
            <SavedGapsList
              gaps={gaps}
              onDeleteGap={handleDeleteGap}
            />
          )}
        </div>
      )}
    </div>
  );
}
