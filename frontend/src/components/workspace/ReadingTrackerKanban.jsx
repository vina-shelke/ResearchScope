import React, { useState, useMemo } from 'react';
import WorkspacePaperCard from './WorkspacePaperCard';
import { IconSearch, IconFilter, IconCheck, IconBookOpen } from '../Icons';

export default function ReadingTrackerKanban({
  papers = [],
  onSelectPaper,
  onStatusChange,
  onSaveNotes,
  onRemovePaper,
  onOpenCite
}) {
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedColumnFilter, setSelectedColumnFilter] = useState('ALL'); // ALL, UNREAD, READING, REVIEWED, IMPORTANT

  const total = papers.length;
  const unreadPapers = papers.filter(p => p.readingStatus === 'UNREAD');
  const readingPapers = papers.filter(p => p.readingStatus === 'READING');
  const reviewedPapers = papers.filter(p => p.readingStatus === 'REVIEWED');
  
  const completionPercentage = total > 0 ? Math.round((reviewedPapers.length / total) * 100) : 0;

  // Filtered papers by keyword and column
  const filteredPapers = useMemo(() => {
    return papers.filter(wp => {
      const p = wp.paper || {};
      const q = filterQuery.toLowerCase().trim();

      const matchesText = !q || (
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.venue && p.venue.toLowerCase().includes(q)) ||
        (wp.notes && wp.notes.toLowerCase().includes(q)) ||
        (wp.collectionName && wp.collectionName.toLowerCase().includes(q))
      );

      if (!matchesText) return false;

      if (selectedColumnFilter === 'ALL') return true;
      if (selectedColumnFilter === 'UNREAD') return wp.readingStatus === 'UNREAD';
      if (selectedColumnFilter === 'READING') return wp.readingStatus === 'READING';
      if (selectedColumnFilter === 'REVIEWED') return wp.readingStatus === 'REVIEWED';
      if (selectedColumnFilter === 'IMPORTANT') {
        try {
          return localStorage.getItem(`rs_paper_imp_${wp.paperId}`) === 'true';
        } catch {
          return false;
        }
      }
      return true;
    });
  }, [papers, filterQuery, selectedColumnFilter]);

  const columns = [
    {
      id: 'UNREAD',
      title: 'Not Started / Unread',
      items: filteredPapers.filter(p => p.readingStatus === 'UNREAD'),
      color: '#71717a',
      badgeClass: ''
    },
    {
      id: 'READING',
      title: 'Currently Reading',
      items: filteredPapers.filter(p => p.readingStatus === 'READING'),
      color: '#3b82f6',
      badgeClass: 'tag-accent'
    },
    {
      id: 'REVIEWED',
      title: 'Completed & Synthesized',
      items: filteredPapers.filter(p => p.readingStatus === 'REVIEWED'),
      color: '#10b981',
      badgeClass: 'tag-accent'
    }
  ];

  return (
    <div className="reading-tracker-section">
      {/* Reading Progress Tracker Bar */}
      <div className="panel" style={{
        padding: '16px 20px',
        marginBottom: '20px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '10px'
        }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
              Literature Review Progress
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              {reviewedPapers.length} of {total} publications fully reviewed and synthesized
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
                {completionPercentage}%
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px' }}>
                Complete
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar Track */}
        <div style={{
          width: '100%',
          height: '6px',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${completionPercentage}%`,
            backgroundColor: 'var(--accent)',
            borderRadius: '3px',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '18px'
      }}>
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '360px' }}>
          <span style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-subtle)',
            display: 'flex',
            alignItems: 'center'
          }}>
            <IconSearch size={14} />
          </span>
          <input
            type="text"
            className="search-input"
            style={{
              paddingLeft: '32px',
              height: '34px',
              fontSize: '12.5px',
              width: '100%'
            }}
            placeholder="Search papers, venues, notes..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: `All (${total})` },
            { id: 'UNREAD', label: `Not Started (${unreadPapers.length})` },
            { id: 'READING', label: `Reading (${readingPapers.length})` },
            { id: 'REVIEWED', label: `Completed (${reviewedPapers.length})` }
          ].map(f => (
            <button
              key={f.id}
              type="button"
              className={selectedColumnFilter === f.id ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
              style={{ fontSize: '11px', padding: '4px 10px', height: '30px' }}
              onClick={() => setSelectedColumnFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3-Column Kanban Board */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
        gap: '20px'
      }}>
        {columns.map(col => (
          <div
            key={col.id}
            style={{
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0
            }}
          >
            {/* Column Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '14px',
              borderBottom: `2px solid ${col.color}`,
              paddingBottom: '8px'
            }}>
              <span style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-main)' }}>
                {col.title}
              </span>
              <span className={`tag ${col.badgeClass}`} style={{ fontSize: '11px', fontWeight: 700 }}>
                {col.items.length}
              </span>
            </div>

            {/* Column Cards List */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              minHeight: '120px'
            }}>
              {col.items.length === 0 ? (
                <div style={{
                  padding: '24px 12px',
                  textAlign: 'center',
                  fontSize: '12px',
                  color: 'var(--text-subtle)',
                  fontStyle: 'italic',
                  backgroundColor: 'var(--bg-alt)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px dashed var(--border-color)'
                }}>
                  {filterQuery ? 'No matching papers' : 'No papers in this column'}
                </div>
              ) : (
                col.items.map(wp => (
                  <WorkspacePaperCard
                    key={wp.id}
                    workspacePaper={wp}
                    onSelectPaper={onSelectPaper}
                    onStatusChange={onStatusChange}
                    onSaveNotes={onSaveNotes}
                    onRemovePaper={onRemovePaper}
                    onOpenCite={onOpenCite}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
