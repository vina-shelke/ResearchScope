import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import PapersView from './components/PapersView';
import ResearchGapsView from './components/ResearchGapsView';
import PaperComparisonView from './components/PaperComparisonView';
import ConnectionsView from './components/ConnectionsView';
import WorkspaceView from './components/WorkspaceView';
import AuthorsView from './components/AuthorsView';
import InstitutionsView from './components/InstitutionsView';
import TopicsView from './components/TopicsView';
import CitationsView from './components/CitationsView';
import SavedPapersView from './components/SavedPapersView';
import PaperDetailModal from './components/PaperDetailModal';
import { fetchLandscape, fetchPaperById } from './api/client';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [currentQuery, setCurrentQuery] = useState('');

  // Comparison tray state: store selected paper IDs for side-by-side comparison
  const [comparisonIds, setComparisonIds] = useState(() => {
    try {
      const saved = localStorage.getItem('researchscope_comparison_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('researchscope_comparison_ids', JSON.stringify(comparisonIds));
    } catch {
      // ignore
    }
  }, [comparisonIds]);

  const handleToggleCompare = (paperId) => {
    const idStr = String(paperId);
    setComparisonIds(prev => {
      if (prev.includes(idStr)) {
        return prev.filter(id => id !== idStr);
      } else {
        if (prev.length >= 4) {
          alert('You can compare up to 4 research papers simultaneously.');
          return prev;
        }
        return [...prev, idStr];
      }
    });
  };

  const handleRemoveFromCompare = (paperId) => {
    const idStr = String(paperId);
    setComparisonIds(prev => prev.filter(id => id !== idStr));
  };

  const handleClearCompare = () => {
    setComparisonIds([]);
  };

  const loadLandscape = (query = '') => {
    setLoadingSummary(true);
    fetchLandscape(query)
      .then((data) => {
        setSummary(data);
      })
      .catch((err) => console.error('Failed to load research landscape:', err))
      .finally(() => setLoadingSummary(false));
  };

  useEffect(() => {
    // Initial page load reads existing database landscape immediately
    loadLandscape('');
  }, []);

  const handleGlobalSearch = (query) => {
    setCurrentQuery(query);
    loadLandscape(query);
    setActiveTab('dashboard');
  };

  const handleSelectPaper = async (paperId) => {
    try {
      const paper = await fetchPaperById(paperId);
      setSelectedPaper(paper);
    } catch (err) {
      console.error('Failed to load paper detail:', err);
    }
  };

  return (
    <div className="app-container">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onSearch={handleGlobalSearch} 
        comparisonCount={comparisonIds.length}
      />

      <main className="main-content">
        {/* 1. Overview & Trends */}
        {activeTab === 'dashboard' && (
          <DashboardView 
            summary={summary} 
            loading={loadingSummary}
            onSelectPaper={handleSelectPaper} 
            onSelectTopic={() => setActiveTab('topics')}
            onSearch={handleGlobalSearch}
            onAddToCompare={handleToggleCompare}
          />
        )}

        {/* 2. Papers Explorer */}
        {activeTab === 'papers' && (
          <PapersView 
            onSelectPaper={handleSelectPaper} 
            onAddToCompare={handleToggleCompare}
            comparisonIds={comparisonIds}
          />
        )}

        {/* 3. Research Gap Intelligence */}
        {activeTab === 'gaps' && (
          <ResearchGapsView 
            onSelectPaper={handleSelectPaper} 
          />
        )}

        {/* 4. Interactive Knowledge Graph */}
        {activeTab === 'connections' && (
          <ConnectionsView 
            onSelectPaper={handleSelectPaper} 
            onAddToCompare={handleToggleCompare}
          />
        )}

        {/* 5. Paper Comparison Lab */}
        {activeTab === 'comparison' && (
          <PaperComparisonView 
            initialPaperIds={comparisonIds}
            onSelectPaper={handleSelectPaper}
            onRemovePaper={handleRemoveFromCompare}
            onClearAll={handleClearCompare}
          />
        )}

        {/* 6. Authenticated Workspace */}
        {activeTab === 'workspace' && (
          <WorkspaceView 
            onSelectPaper={handleSelectPaper} 
          />
        )}

        {/* Supporting Views (Preserved 100%) */}
        {activeTab === 'authors' && (
          <AuthorsView onSelectPaper={handleSelectPaper} />
        )}

        {activeTab === 'institutions' && (
          <InstitutionsView />
        )}

        {activeTab === 'topics' && (
          <TopicsView />
        )}

        {activeTab === 'citations' && (
          <CitationsView onSelectPaper={handleSelectPaper} />
        )}

        {activeTab === 'saved' && (
          <SavedPapersView onSelectPaper={handleSelectPaper} />
        )}
      </main>

      {/* Floating Comparison Tray Shortcut when papers are selected and not currently on comparison tab */}
      {comparisonIds.length > 0 && activeTab !== 'comparison' && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          zIndex: 900
        }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: '13px' }}>
              Comparison Tray: {comparisonIds.length} / 4 papers selected
            </span>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setActiveTab('comparison')}
          >
            Open Comparison Lab →
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleClearCompare}
            style={{ color: '#94a3b8', borderColor: '#334155', backgroundColor: '#1e293b' }}
          >
            Clear
          </button>
        </div>
      )}

      {/* Detailed Paper Modal */}
      <PaperDetailModal 
        paper={selectedPaper} 
        onClose={() => setSelectedPaper(null)} 
        onSelectPaper={handleSelectPaper}
        onAddToCompare={handleToggleCompare}
        comparisonIds={comparisonIds}
      />
    </div>
  );
}
