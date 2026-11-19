import React, { useState, useEffect, useRef } from 'react';
import { fetchPapers } from '../api/client';
import { IconSearch } from './Icons';

export default function CommandPalette({
  isOpen,
  onClose,
  onNavigateTab,
  onSelectPaper,
  onToggleTheme,
  currentTheme
}) {
  const [query, setQuery] = useState('');
  const [paperResults, setPaperResults] = useState([]);
  const [loadingPapers, setLoadingPapers] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef(null);

  // Static navigation and quick commands
  const navigationItems = [
    { type: 'nav', id: 'dashboard', label: 'Go to Research Dashboard', meta: 'Overview & Collaboration KPIs', tab: 'dashboard' },
    { type: 'nav', id: 'papers', label: 'Browse Papers Catalog', meta: 'Deduplicated Corpus & Advanced Filters', tab: 'papers' },
    { type: 'nav', id: 'connections', label: 'Open Knowledge Graph', meta: 'Interactive Scholarly Topology', tab: 'connections' },
    { type: 'nav', id: 'comparison', label: 'Open Paper Comparison Lab', meta: 'Multi-Paper Synthesis Matrix', tab: 'comparison' },
    { type: 'nav', id: 'gaps', label: 'Explore Research Gaps & White Spaces', meta: 'Unresolved Scholarly Frontiers', tab: 'gaps' },
    { type: 'nav', id: 'workspace', label: 'Open Workspace & Library', meta: 'Saved Papers & Annotated Collections', tab: 'workspace' },
    { type: 'nav', id: 'authors', label: 'View Scholarly Authors', meta: 'Co-authorship Network & H-Index', tab: 'authors' },
    { type: 'nav', id: 'institutions', label: 'View Research Institutions', meta: 'Academic & Corporate Affiliations', tab: 'institutions' },
    { type: 'nav', id: 'topics', label: 'View Research Taxonomy', meta: 'Subject Ontologies & Growth Rates', tab: 'topics' },
    { type: 'action', id: 'theme', label: `Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} Mode`, meta: 'Toggle Design Theme', action: onToggleTheme }
  ];

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setPaperResults([]);
      setSelectedIndex(0);
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    }
  }, [isOpen]);

  // Live search papers when user types query
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setPaperResults([]);
      setLoadingPapers(false);
      return;
    }

    setLoadingPapers(true);
    const timer = setTimeout(() => {
      fetchPapers({ q: query.trim(), size: 5 })
        .then(data => {
          setPaperResults((data.content || []).map(p => ({
            type: 'paper',
            id: p.id,
            label: p.title,
            meta: `${p.publicationYear || 'n.d.'} • ${p.venue || 'Venue N/A'} • ${p.citationCount || 0} citations`,
            paperId: p.id
          })));
        })
        .catch(console.error)
        .finally(() => setLoadingPapers(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  // Filter commands based on query
  const filteredNav = query.trim()
    ? navigationItems.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.meta.toLowerCase().includes(query.toLowerCase())
      )
    : navigationItems;

  const allItems = [...filteredNav, ...paperResults];

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(allItems.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + allItems.length) % Math.max(allItems.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = allItems[selectedIndex];
      if (selected) {
        executeItem(selected);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const executeItem = (item) => {
    if (item.type === 'nav') {
      onNavigateTab(item.tab);
    } else if (item.type === 'paper') {
      onSelectPaper(item.paperId);
    } else if (item.type === 'action' && item.action) {
      item.action();
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000, alignItems: 'flex-start', paddingTop: '10vh' }}>
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{
          maxWidth: '640px',
          padding: '0',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-skeuo-modal)',
          borderRadius: 'var(--radius-md)'
        }}
      >
        {/* Search Input Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-surface)'
        }}>
          <div style={{ color: 'var(--text-muted)', marginRight: '12px' }}>
            <IconSearch size={18} />
          </div>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: '15px',
              padding: '0',
              outline: 'none',
              color: 'var(--text-main)'
            }}
            placeholder="Type a paper title, DOI, or navigation command..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <kbd style={{
            fontSize: '11px',
            backgroundColor: 'var(--bg-alt)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xs)',
            padding: '2px 6px',
            color: 'var(--text-muted)',
            fontFamily: 'inherit'
          }}>
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '8px 0' }}>
          {filteredNav.length > 0 && (
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '8px 20px 4px 20px'
            }}>
              Navigation & Actions
            </div>
          )}

          {filteredNav.map((item, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <div
                key={item.id}
                onClick={() => executeItem(item)}
                style={{
                  padding: '10px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? 'var(--bg-surface-elevated)' : 'transparent',
                  borderLeft: isSelected ? '3px solid var(--accent)' : '3px solid transparent',
                  transition: 'background-color 0.1s ease'
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-main)' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    {item.meta}
                  </div>
                </div>
                {isSelected && (
                  <kbd style={{ fontSize: '11px', color: 'var(--text-muted)' }}>↵ Enter</kbd>
                )}
              </div>
            );
          })}

          {/* Paper Search Section */}
          {query.trim().length >= 2 && (
            <>
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '12px 20px 4px 20px',
                borderTop: '1px solid var(--border-color)',
                marginTop: '6px'
              }}>
                Matching Papers {loadingPapers && '(Searching...)'}
              </div>

              {paperResults.length === 0 && !loadingPapers ? (
                <div style={{ padding: '12px 20px', fontSize: '12.5px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No indexed publications found for "{query}".
                </div>
              ) : (
                paperResults.map((item, idx) => {
                  const globalIdx = filteredNav.length + idx;
                  const isSelected = selectedIndex === globalIdx;
                  return (
                    <div
                      key={item.id}
                      onClick={() => executeItem(item)}
                      style={{
                        padding: '10px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? 'var(--bg-surface-elevated)' : 'transparent',
                        borderLeft: isSelected ? '3px solid #3b82f6' : '3px solid transparent',
                        transition: 'background-color 0.1s ease'
                      }}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                    >
                      <div style={{ flex: 1, minWidth: 0, marginRight: '12px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {item.meta}
                        </div>
                      </div>
                      {isSelected && (
                        <kbd style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Inspect ↵</kbd>
                      )}
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts tip */}
        <div style={{
          padding: '10px 20px',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-alt)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11.5px',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', gap: '14px' }}>
            <span><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span>
            <span><kbd>↵</kbd> Select</span>
            <span><kbd>ESC</kbd> Close</span>
          </div>
          <div>ResearchScope Command Surface</div>
        </div>
      </div>
    </div>
  );
}
