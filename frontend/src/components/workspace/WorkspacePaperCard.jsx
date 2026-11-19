import React, { useState } from 'react';
import { 
  IconClose, 
  IconPencil, 
  IconStar, 
  IconPaper,
  IconCheck
} from '../Icons';

export default function WorkspacePaperCard({
  workspacePaper,
  onSelectPaper,
  onStatusChange,
  onSaveNotes,
  onRemovePaper,
  onOpenCite
}) {
  const wp = workspacePaper;
  const paper = wp.paper || {};
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState(wp.notes || '');
  const [isImportant, setIsImportant] = useState(() => {
    try {
      const saved = localStorage.getItem(`rs_paper_imp_${wp.paperId}`);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const toggleImportant = (e) => {
    e.stopPropagation();
    const next = !isImportant;
    setIsImportant(next);
    try {
      localStorage.setItem(`rs_paper_imp_${wp.paperId}`, String(next));
    } catch {}
  };

  const handleSave = () => {
    onSaveNotes(wp.paperId, tempNotes);
    setIsEditingNotes(false);
  };

  const handleCancel = () => {
    setTempNotes(wp.notes || '');
    setIsEditingNotes(false);
  };

  const statusOptions = [
    { id: 'UNREAD', label: 'Not Started' },
    { id: 'READING', label: 'Reading' },
    { id: 'REVIEWED', label: 'Completed' }
  ];

  return (
    <div
      className="workspace-paper-card"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: isImportant ? '1px solid var(--accent)' : '1px solid var(--border-color)',
        borderRadius: 'var(--radius-sm)',
        padding: '14px 16px',
        boxShadow: 'var(--shadow-subtle)',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        position: 'relative',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
      }}
    >
      {/* Top Header: Title, Important Star & Delete Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <button
          type="button"
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            textAlign: 'left',
            fontWeight: 700,
            fontSize: '13.5px',
            color: 'var(--text-main)',
            cursor: 'pointer',
            lineHeight: '1.4',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            flex: 1
          }}
          onClick={() => onSelectPaper && onSelectPaper(wp.paperId)}
          title="Click to view full paper details"
        >
          {paper.title || 'Untitled Academic Paper'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          {/* Important Toggle */}
          <button
            type="button"
            onClick={toggleImportant}
            title={isImportant ? 'Marked as Important' : 'Mark as Important'}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px 4px',
              color: isImportant ? '#eab308' : 'var(--text-subtle)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <IconStar size={14} filled={isImportant} color={isImportant ? '#eab308' : undefined} />
          </button>

          {/* Remove Paper */}
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-subtle)',
              cursor: 'pointer',
              padding: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: 'var(--radius-xs)'
            }}
            onClick={() => onRemovePaper && onRemovePaper(wp.paperId)}
            title="Remove from workspace"
          >
            <IconClose size={13} />
          </button>
        </div>
      </div>

      {/* Metadata Strip: Year, Venue, Collection */}
      <div style={{
        fontSize: '11.5px',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        flexWrap: 'wrap'
      }}>
        <span>{paper.publicationYear || 'n.d.'}</span>
        <span>•</span>
        <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {paper.venue || 'Scholarly Publication'}
        </span>
        <span>•</span>
        <span className="tag" style={{ fontSize: '10px', padding: '1px 6px' }}>
          {wp.collectionName || 'Main Library'}
        </span>
      </div>

      {/* Reading Status Selector Pills */}
      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center' }}>
        {statusOptions.map(st => {
          const isActive = wp.readingStatus === st.id;
          return (
            <button
              key={st.id}
              type="button"
              style={{
                fontSize: '10.5px',
                fontWeight: isActive ? 700 : 500,
                padding: '3px 8px',
                border: isActive ? '1px solid var(--text-main)' : '1px solid var(--border-color)',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: isActive ? 'var(--accent)' : 'var(--bg-main)',
                color: isActive ? 'var(--text-inverse)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onClick={() => onStatusChange && onStatusChange(wp.paperId, st.id)}
            >
              {st.label}
            </button>
          );
        })}

        {onOpenCite && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '10px', padding: '2px 7px', marginLeft: 'auto' }}
            onClick={() => onOpenCite(paper)}
            title="Generate Citation (APA, BibTeX, IEEE)"
          >
            Cite
          </button>
        )}
      </div>

      {/* Personal Scholar Notes Section */}
      {isEditingNotes ? (
        <div style={{ marginTop: '4px' }}>
          <textarea
            style={{
              width: '100%',
              fontSize: '12px',
              padding: '8px 10px',
              border: '1px solid var(--search-input-border)',
              borderRadius: 'var(--radius-xs)',
              height: '70px',
              boxSizing: 'border-box',
              backgroundColor: 'var(--search-input-bg)',
              color: 'var(--search-input-color)',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
            value={tempNotes}
            onChange={(e) => setTempNotes(e.target.value)}
            placeholder="Add personal notes, research questions, or synthesis takeaways..."
            autoFocus
          />
          <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ fontSize: '11px', padding: '2px 10px' }}
              onClick={handleSave}
            >
              Save Notes
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px', padding: '2px 10px' }}
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          style={{
            fontSize: '12px',
            color: wp.notes ? 'var(--text-main)' : 'var(--text-subtle)',
            fontStyle: wp.notes ? 'normal' : 'italic',
            cursor: 'pointer',
            backgroundColor: 'var(--bg-main)',
            border: '1px solid var(--border-color)',
            padding: '7px 10px',
            borderRadius: 'var(--radius-xs)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            wordBreak: 'break-word',
            lineHeight: '1.4'
          }}
          onClick={() => {
            setTempNotes(wp.notes || '');
            setIsEditingNotes(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setTempNotes(wp.notes || '');
              setIsEditingNotes(true);
            }
          }}
          title="Click to write or edit personal research notes"
        >
          <IconPencil size={11} style={{ flexShrink: 0, opacity: 0.7 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {wp.notes ? wp.notes : 'Click to add personal research note...'}
          </span>
        </div>
      )}
    </div>
  );
}
