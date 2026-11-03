import React, { useState } from 'react';
import { 
  IconLogo, 
  IconSearch, 
  IconTrend, 
  IconPaper, 
  IconGaps, 
  IconGraph, 
  IconCompare, 
  IconWorkspace, 
  IconBookmark,
  IconSun,
  IconMoon
} from './Icons';

export default function Header({ activeTab, setActiveTab, onSearch, comparisonCount = 0, theme = 'dark', onToggleTheme }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleQuickTopic = (topic) => {
    setQuery(topic);
    onSearch(topic);
  };

  const primaryNavItems = [
    { id: 'dashboard', label: 'Landscape & Trends', icon: IconTrend },
    { id: 'papers', label: 'Explore Papers', icon: IconPaper },
    { id: 'gaps', label: 'Research Gaps', icon: IconGaps },
    { id: 'connections', label: 'Knowledge Graph', icon: IconGraph },
    { 
      id: 'comparison', 
      label: 'Comparison Lab',
      icon: IconCompare,
      badge: comparisonCount > 0 ? comparisonCount : null 
    },
    { id: 'workspace', label: 'Research Workspace', icon: IconWorkspace },
  ];

  const secondaryNavItems = [
    { id: 'authors', label: 'Authors' },
    { id: 'institutions', label: 'Institutions' },
    { id: 'topics', label: 'Topics' },
    { id: 'citations', label: 'Citations' },
    { id: 'saved', label: 'Saved Papers', icon: IconBookmark },
  ];

  const quickTopics = [
    'Deep Learning',
    'CRISPR Gene Editing',
    'Quantum Computing',
    'Transformer Architectures'
  ];

  return (
    <header className="app-header">
      <div className="header-top">
        {/* Brand Section */}
        <div className="brand-section" onClick={() => setActiveTab('dashboard')} title="ResearchScope Home">
          <IconLogo size={36} />
          <div>
            <div className="brand-title">
              ResearchScope
            </div>
            <div className="brand-subtitle">
              Academic Paper Analytics & Literature Intelligence Platform
            </div>
          </div>
        </div>

        {/* Global Search Bar (Prominent & Spacious) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, maxWidth: '620px' }}>
          <form onSubmit={handleSubmit} className="search-bar-global">
            <div className="search-input-wrapper">
              <span className="search-icon-inside">
                <IconSearch size={18} />
              </span>
              <input
                type="text"
                className="search-input"
                placeholder="Search research topic, paper title, or author (e.g., Deep Learning in Oncology)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0 20px', height: '44px' }}>
              Analyze Domain
            </button>
          </form>

          {/* Quick Domain Suggestions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Trending:
            </span>
            {quickTopics.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => handleQuickTopic(topic)}
                className="header-topic-chip"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Header Right Actions: Theme Toggle & Workspace Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Dark / Light Mode Switcher (Crisp Rectangular Button) */}
          <button 
            type="button" 
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <IconMoon size={14} /> : <IconSun size={14} />}
            <span className="theme-toggle-label">
              {theme === 'dark' ? 'Dark' : 'Light'}
            </span>
          </button>

          {/* User Workspace Status Indicator */}
          <div 
            className="header-workspace-badge"
            onClick={() => setActiveTab('workspace')}
            title="Open Authenticated Research Workspace"
          >
            <div className="status-dot-pulse" />
            <div>
              <div className="workspace-user-name">
                Dr. Elena Vance
              </div>
              <div className="workspace-user-role">
                Lead Research Scientist
              </div>
            </div>
            <span className="workspace-status-tag">
              Workspace
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="nav-bar">
        <div className="nav-container">
          <div className="nav-group">
            {primaryNavItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  {IconComp && <IconComp size={15} />}
                  <span>{item.label}</span>
                  {item.badge !== null && item.badge !== undefined && (
                    <span className={`nav-badge ${isActive ? 'nav-badge-active' : 'nav-badge-inactive'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="nav-group">
            <div className="nav-divider" />
            {secondaryNavItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                  style={{ fontSize: '12.5px' }}
                >
                  {IconComp && <IconComp size={14} />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
}
