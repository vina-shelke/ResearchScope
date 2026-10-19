import React, { useState } from 'react';

export default function Header({ activeTab, setActiveTab, onSearch, comparisonCount = 0 }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const primaryNavItems = [
    { id: 'dashboard', label: 'Landscape & Trends' },
    { id: 'papers', label: 'Explore Papers' },
    { id: 'gaps', label: 'Research Gaps' },
    { id: 'connections', label: 'Knowledge Graph' },
    { 
      id: 'comparison', 
      label: 'Comparison Lab',
      badge: comparisonCount > 0 ? comparisonCount : null 
    },
    { id: 'workspace', label: 'Research Workspace' },
  ];

  const secondaryNavItems = [
    { id: 'authors', label: 'Authors' },
    { id: 'institutions', label: 'Institutions' },
    { id: 'topics', label: 'Topics' },
    { id: 'citations', label: 'Citations' },
    { id: 'saved', label: '★ Saved Papers' },
  ];

  return (
    <header className="app-header">
      <div className="header-top">
        <div className="brand-section">
          <div className="brand-title">ResearchScope</div>
          <div className="brand-subtitle">Research Intelligence & Synthesis Platform</div>
        </div>

        <form onSubmit={handleSubmit} className="search-bar-global">
          <input
            type="text"
            className="search-input"
            placeholder="Enter research topic (e.g. Deep Learning in Healthcare)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Analyze Domain</button>
        </form>

        {/* User Workspace Status Indicator */}
        <div 
          onClick={() => setActiveTab('workspace')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-color)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer'
          }}
          title="Open Authenticated Research Workspace"
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
            Dr. Elena Vance
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-main)', padding: '2px 5px', borderRadius: '3px' }}>
            Workspace
          </span>
        </div>
      </div>

      <nav className="nav-bar">
        <div className="nav-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {primaryNavItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
                style={{ position: 'relative' }}
              >
                {item.label}
                {item.badge !== null && item.badge !== undefined && (
                  <span style={{
                    marginLeft: '6px',
                    backgroundColor: activeTab === item.id ? '#ffffff' : 'var(--accent)',
                    color: activeTab === item.id ? 'var(--accent)' : '#ffffff',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: '10px'
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            {secondaryNavItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
                style={{ fontSize: '12px', opacity: activeTab === item.id ? 1 : 0.8 }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
