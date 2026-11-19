import React from 'react';
import { 
  IconDownload, 
  IconBookOpen, 
  IconFolder, 
  IconSearch, 
  IconGaps,
  IconWorkspace
} from '../Icons';

export default function WorkspaceHeader({
  currentUser,
  papers = [],
  projects = [],
  searches = [],
  gaps = [],
  activeTab,
  onSelectTab,
  onOpenAuthModal,
  bibtexUrl,
  csvUrl
}) {
  const unreadCount = papers.filter(p => p.readingStatus === 'UNREAD').length;

  const stats = [
    {
      id: 'reading',
      label: 'Papers to Read',
      value: unreadCount,
      subtext: `${papers.length} total in library`,
      icon: IconBookOpen,
      accentColor: '#3b82f6'
    },
    {
      id: 'projects',
      label: 'Research Projects',
      value: projects.length,
      subtext: 'Active literature reviews',
      icon: IconFolder,
      accentColor: '#10b981'
    },
    {
      id: 'searches',
      label: 'Saved Searches',
      value: searches.length,
      subtext: 'Monitored domain queries',
      icon: IconSearch,
      accentColor: '#8b5cf6'
    },
    {
      id: 'gaps',
      label: 'Saved Research Gaps',
      value: gaps.length,
      subtext: 'Candidate opportunities',
      icon: IconGaps,
      accentColor: '#f59e0b'
    }
  ];

  const getInitials = (name) => {
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

  return (
    <div className="workspace-header-container" style={{ marginBottom: '24px' }}>
      {/* Title & Actions Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)'
            }}>
              <IconWorkspace size={18} />
            </span>
            <h1 className="section-title" style={{ margin: 0 }}>Research Workspace</h1>
          </div>
          <div className="section-description" style={{ marginTop: '4px' }}>
            Your personal research command center.
          </div>
        </div>

        {/* Export buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <a
            href={bibtexUrl}
            className="btn btn-secondary btn-sm"
            download="researchscope_library.bib"
            title="Export full workspace bibliography as BibTeX"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <IconDownload size={13} />
            <span>Export BibTeX</span>
          </a>
          <a
            href={csvUrl}
            className="btn btn-secondary btn-sm"
            download="researchscope_library.csv"
            title="Export papers and literature review notes as CSV"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <IconDownload size={13} />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* User Session Banner */}
      <div className="panel" style={{
        marginBottom: '20px',
        padding: '14px 18px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px',
        backgroundColor: 'var(--bg-surface)',
        borderLeft: '4px solid var(--accent)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 240px', minWidth: 'min(100%, 240px)' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-subtle)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '14px',
            letterSpacing: '0.05em',
            flexShrink: 0
          }}>
            {getInitials(currentUser?.username)}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', wordBreak: 'break-word' }}>
                {currentUser?.username || 'Researcher'}
              </span>
              <span className="tag tag-accent" style={{ fontSize: '10px', textTransform: 'capitalize' }}>
                {currentUser?.profession || 'Principal Researcher'}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', wordBreak: 'break-word' }}>
              {currentUser?.email || 'researcher@researchscope.edu'}
              {currentUser?.institution ? ` • ${currentUser.institution}` : ' • Authorized Scholar Session'}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onOpenAuthModal}
          style={{ whiteSpace: 'nowrap' }}
        >
          Switch / Register Account
        </button>
      </div>

      {/* Dynamic Statistics Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 210px), 1fr))',
        gap: '16px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {stats.map(card => {
          const IconComponent = card.icon;
          const isSelected = activeTab === card.id;

          return (
            <div
              key={card.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectTab(card.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectTab(card.id);
                }
              }}
              style={{
                backgroundColor: 'var(--bg-surface)',
                backgroundImage: 'var(--metric-card-bg-gradient)',
                border: isSelected ? '1px solid var(--text-main)' : '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isSelected ? '0 0 0 1px var(--text-main), var(--shadow-subtle)' : 'var(--shadow-subtle)',
                position: 'relative',
                overflow: 'hidden'
              }}
              className="workspace-stat-card"
            >
              {/* Subtle top indicator bar */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                backgroundColor: isSelected ? 'var(--text-main)' : 'transparent',
                transition: 'background-color 0.2s ease'
              }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: isSelected ? 'var(--text-main)' : 'var(--text-muted)'
                }}>
                  {card.label}
                </span>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '30px',
                  height: '30px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)'
                }}>
                  <IconComponent size={15} />
                </span>
              </div>

              <div style={{
                fontSize: '28px',
                fontWeight: 800,
                color: 'var(--text-main)',
                lineHeight: 1.2,
                marginTop: '10px',
                letterSpacing: '-0.02em'
              }}>
                {card.value}
              </div>

              <div style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                marginTop: '4px'
              }}>
                {card.subtext}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
