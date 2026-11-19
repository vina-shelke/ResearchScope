import React, { useState, useRef, useEffect } from 'react';
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
  IconMoon,
  IconSparkles,
  IconAlert
} from './Icons';
import { fetchUserAlerts } from '../api/client';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  onSearch, 
  comparisonCount = 0, 
  theme = 'dark', 
  onToggleTheme,
  onOpenCommandPalette,
  currentUser = null,
  onOpenAuthModal,
  onLogout
}) {
  const [query, setQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const userMenuRef = useRef(null);

  // Compute initials accurately: e.g. "Vina Shelke" -> "VS"
  const getUserInitials = (user) => {
    if (!user) return 'VS';
    const name = user.username || user.name || user.email || '';
    if (!name) return 'VS';
    let parts = name.includes('@') ? name.split('@')[0].split(/[\s._-]+/) : name.trim().split(/[\s._-]+/);
    parts = parts.filter(p => !['dr', 'dr.', 'prof', 'prof.', 'mr', 'mr.', 'ms', 'ms.'].includes(p.toLowerCase()));
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    if (parts.length === 1 && parts[0].length >= 2) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || 'VS';
  };

  useEffect(() => {
    fetchUserAlerts()
      .then(alerts => setAlertCount(alerts ? alerts.length : 0))
      .catch(() => {});
  }, []);

  // Close user dropdown menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

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
    { id: 'dashboard', label: 'Landscape', icon: IconTrend },
    { id: 'papers', label: 'Papers', icon: IconPaper },
    { id: 'ai', label: 'AI Assistant', icon: IconSparkles },
    { id: 'gaps', label: 'Research Gaps', icon: IconGaps },
    { id: 'connections', label: 'Knowledge Graph', icon: IconGraph },
    { 
      id: 'comparison', 
      label: 'Comparison Lab',
      icon: IconCompare,
      badge: comparisonCount > 0 ? comparisonCount : null 
    },
    { id: 'workspace', label: 'Workspace', icon: IconWorkspace },
  ];

  const secondaryNavItems = [
    { id: 'authors', label: 'Authors' },
    { id: 'institutions', label: 'Institutions' },
    { id: 'topics', label: 'Topics' },
    { id: 'citations', label: 'Citations' },
    { id: 'saved', label: 'Saved', icon: IconBookmark },
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
              Academic Paper Intelligence & Analytics
            </div>
          </div>
        </div>

        {/* Global Search Bar (Prominent & Spacious) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, maxWidth: '580px' }}>
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
            <button type="submit" className="btn btn-primary" style={{ padding: '0 18px', height: '42px' }}>
              Analyze Domain
            </button>
          </form>

          {/* Quick Domain Suggestions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none' }}>
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

        {/* Header Right Actions: Command Palette, Theme Toggle & Workspace Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {/* Global Command Palette Trigger Button */}
          {onOpenCommandPalette && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onOpenCommandPalette}
              title="Open Scholarly Command Palette (⌘K or Ctrl+K)"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                height: '36px',
                padding: '0 10px',
                fontWeight: 600
              }}
            >
              <kbd style={{
                fontSize: '10.5px',
                fontFamily: 'inherit',
                padding: '1px 5px',
                background: 'var(--bg-recessed)',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)'
              }}>
                ⌘K
              </kbd>
              <span>Commands</span>
            </button>
          )}

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

          {/* Topic Alerts Indicator Button */}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={() => setActiveTab('dashboard')}
            title={`${alertCount} Active Topic Alert Subscriptions`}
            style={{ position: 'relative' }}
          >
            <IconAlert size={14} />
            <span className="theme-toggle-label">Alerts</span>
            {alertCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: 'var(--accent)',
                color: '#ffffff',
                fontSize: '9px',
                fontWeight: 800,
                padding: '1px 5px',
                borderRadius: '10px',
                lineHeight: '1.2'
              }}>
                {alertCount}
              </span>
            )}
          </button>

          {/* User Profile Circular Avatar Section */}
          {currentUser ? (
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                className="header-avatar-circle"
                onClick={() => setUserMenuOpen(prev => !prev)}
                title={`${currentUser.username || 'User'} (Click for profile & account)`}
                aria-label="User Account Menu"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent) 0%, #2563eb 100%)',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--border-highlight, rgba(255,255,255,0.3))',
                  boxShadow: 'var(--shadow-skeuo-sm), 0 0 0 1px var(--border-color)',
                  cursor: 'pointer',
                  padding: 0,
                  flexShrink: 0,
                  userSelect: 'none',
                  position: 'relative',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                <span>{getUserInitials(currentUser)}</span>
                {/* Status pulse dot */}
                <span style={{
                  position: 'absolute',
                  bottom: '-1px',
                  right: '-1px',
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  border: '2px solid var(--header-bg, #141418)',
                  boxShadow: '0 0 4px rgba(16, 185, 129, 0.7)'
                }} />
              </button>

              {/* Skeuomorphic User Profile Dropdown Menu */}
              {userMenuOpen && (
                <div 
                  className="fade-in"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    width: '280px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderTop: '1px solid var(--border-highlight)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-skeuo-modal)',
                    zIndex: 1000,
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  {/* User Profile Header Card */}
                  <div style={{
                    padding: '12px',
                    backgroundColor: 'var(--bg-main)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--accent) 0%, #2563eb 100%)',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: 'var(--shadow-skeuo-sm)'
                    }}>
                      {getUserInitials(currentUser)}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '13.5px', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {currentUser.username || 'Researcher'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {currentUser.email || currentUser.phoneNumber || 'Authenticated Scholar'}
                      </div>
                      <div style={{ marginTop: '4px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        <span className="tag tag-accent" style={{ fontSize: '9.5px', fontWeight: 700, padding: '1px 5px' }}>
                          {currentUser.profession || 'Researcher'}
                        </span>
                        {currentUser.institution && (
                          <span className="tag" style={{ fontSize: '9.5px', padding: '1px 5px' }}>
                            {currentUser.institution}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Navigation Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ justifyContent: 'flex-start', textAlign: 'left', height: '34px', fontSize: '12px', gap: '8px' }}
                      onClick={() => {
                        setActiveTab('workspace');
                        setUserMenuOpen(false);
                      }}
                    >
                      <IconWorkspace size={14} /> Open Research Workspace
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ justifyContent: 'flex-start', textAlign: 'left', height: '34px', fontSize: '12px', gap: '8px' }}
                      onClick={() => {
                        setActiveTab('saved');
                        setUserMenuOpen(false);
                      }}
                    >
                      <IconBookmark size={14} /> Saved Papers & Library
                    </button>
                    {onOpenAuthModal && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ justifyContent: 'flex-start', textAlign: 'left', height: '34px', fontSize: '12px', gap: '8px' }}
                        onClick={() => {
                          onOpenAuthModal('profile');
                          setUserMenuOpen(false);
                        }}
                      >
                        <IconPaper size={14} /> Edit Profile & Role
                      </button>
                    )}
                  </div>

                  <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '2px 0' }} />

                  {/* Sign Out Action */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {onOpenAuthModal && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1, fontSize: '11.5px', height: '32px' }}
                        onClick={() => {
                          onOpenAuthModal('login');
                          setUserMenuOpen(false);
                        }}
                      >
                        Switch User
                      </button>
                    )}
                    {onLogout && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1, fontSize: '11.5px', height: '32px', color: 'var(--danger)' }}
                        onClick={() => {
                          onLogout();
                          setUserMenuOpen(false);
                        }}
                      >
                        Sign Out
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {onOpenAuthModal && (
                <>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onOpenAuthModal('login')}
                    style={{ fontSize: '12px', height: '36px', padding: '0 12px', fontWeight: 600 }}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => onOpenAuthModal('signup')}
                    style={{ fontSize: '12px', height: '36px', padding: '0 12px', fontWeight: 700 }}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          )}
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
