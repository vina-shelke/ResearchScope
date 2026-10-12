import React, { useState } from 'react';

export default function Header({ activeTab, setActiveTab, onSearch }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'papers', label: 'Papers' },
    { id: 'authors', label: 'Authors' },
    { id: 'institutions', label: 'Institutions' },
    { id: 'topics', label: 'Topics' },
    { id: 'citations', label: 'Citations' },
    { id: 'connections', label: 'Research Connections' },
  ];

  return (
    <header className="app-header">
      <div className="header-top">
        <div className="brand-section">
          <div className="brand-title">ResearchScope</div>
          <div className="brand-subtitle">Research Intelligence Platform</div>
        </div>

        <form onSubmit={handleSubmit} className="search-bar-global">
          <input
            type="text"
            className="search-input"
            placeholder="Enter research topic (e.g. Generative AI in Education)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Analyze Topic</button>
        </form>
      </div>

      <nav className="nav-bar">
        <div className="nav-container">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}
