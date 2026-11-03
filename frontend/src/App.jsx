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
import { useToast } from './components/Toast';

export default function App() {
  const toast = useToast();

  // Read URL query parameters on initial mount
  const getInitialUrlState = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      return {
        tab: params.get('tab') || 'dashboard',
        query: params.get('q') || ''
      };
    } catch {
      return { tab: 'dashboard', query: '' };
    }
  };

  const initialUrlState = getInitialUrlState();
  const [activeTab, setActiveTab] = useState(initialUrlState.tab);
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [currentQuery, setCurrentQuery] = useState(initialUrlState.query);

  // Sync state to URL without reloading
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (activeTab && activeTab !== 'dashboard') {
        params.set('tab', activeTab);
      } else {
        params.delete('tab');
      }

      if (currentQuery && currentQuery.trim()) {
        params.set('q', currentQuery.trim());
      } else {
        params.delete('q');
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
      window.history.replaceState({ tab: activeTab, q: currentQuery }, '', newUrl);
    } catch {
      // ignore
    }
  }, [activeTab, currentQuery]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (e) => {
      const params = new URLSearchParams(window.location.search);
      const targetTab = params.get('tab') || 'dashboard';
      const targetQuery = params.get('q') || '';
      setActiveTab(targetTab);
      setCurrentQuery(targetQuery);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Dark / Light Theme state
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('researchscope_theme');
      if (saved) return saved;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('researchscope_theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

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
        toast.info('Removed paper from comparison tray.');
        return prev.filter(id => id !== idStr);
      } else {
        if (prev.length >= 4) {
          toast.warning('Comparison limit reached: maximum 4 papers can be evaluated concurrently.');
          return prev;
        }
        toast.success(`Paper added to comparison tray (${prev.length + 1}/4).`);
        return [...prev, idStr];
      }
    });
  };

  const handleRemoveFromCompare = (paperId) => {
    const idStr = String(paperId);
    setComparisonIds(prev => prev.filter(id => id !== idStr));
    toast.info('Paper removed from comparison.');
  };

  const handleClearCompare = () => {
    setComparisonIds([]);
    toast.info('Comparison tray cleared.');
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
        theme={theme}
        onToggleTheme={handleToggleTheme}
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
        <div className="floating-comparison-tray">
          <div>
            <span style={{ fontWeight: 700, fontSize: '13px' }}>
              Comparison Tray: {comparisonIds.length} / 4 papers selected
            </span>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setActiveTab('comparison')}
          >
            Open Comparison Lab
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleClearCompare}
            style={{ color: 'var(--text-muted)', borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-alt)' }}
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
