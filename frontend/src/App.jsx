import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import PapersView from './components/PapersView';
import AuthorsView from './components/AuthorsView';
import InstitutionsView from './components/InstitutionsView';
import TopicsView from './components/TopicsView';
import CitationsView from './components/CitationsView';
import ConnectionsView from './components/ConnectionsView';
import PaperDetailModal from './components/PaperDetailModal';
import SavedPapersView from './components/SavedPapersView';
import { fetchLandscape, fetchPaperById } from './api/client';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [currentQuery, setCurrentQuery] = useState('');

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
      />

      <main className="main-content">
        {activeTab === 'dashboard' && (
          <DashboardView 
            summary={summary} 
            loading={loadingSummary}
            onSelectPaper={handleSelectPaper} 
            onSelectTopic={(topicId) => setActiveTab('topics')}
            onSearch={handleGlobalSearch}
          />
        )}

        {activeTab === 'papers' && (
          <PapersView onSelectPaper={handleSelectPaper} />
        )}

        {activeTab === 'saved' && (
          <SavedPapersView onSelectPaper={handleSelectPaper} />
        )}

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

        {activeTab === 'connections' && (
          <ConnectionsView onSelectPaper={handleSelectPaper} />
        )}
      </main>

      <PaperDetailModal 
        paper={selectedPaper} 
        onClose={() => setSelectedPaper(null)} 
        onSelectPaper={handleSelectPaper}
      />
    </div>
  );
}

