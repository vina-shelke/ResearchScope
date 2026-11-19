import React from 'react';
import { 
  IconClose, 
  IconPaper, 
  IconCheck, 
  IconExternalLink, 
  IconDownload,
  IconInfo
} from './Icons';

export default function SourceEvidenceDrawer({
  isOpen,
  onClose,
  evidenceList = [],
  citedPapers = [],
  onSelectPaper
}) {
  if (!isOpen) return null;

  const directlyReportedCount = evidenceList.filter(e => e.statementType === 'DIRECTLY_REPORTED').length;
  const inferredCount = evidenceList.filter(e => e.statementType === 'AI_INFERRED').length;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 1100,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          height: '100%',
          backgroundColor: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-skeuo-modal)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          backgroundColor: 'var(--bg-main)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '26px',
                height: '26px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--bg-subtle)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)'
              }}>
                <IconCheck size={14} />
              </span>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                Research Evidence & Source Verification
              </h3>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Verifiable excerpts, section passages, and author attribution
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: 'var(--radius-xs)'
            }}
            title="Close Evidence Drawer"
          >
            <IconClose size={16} />
          </button>
        </div>

        {/* Verification Summary Bar */}
        <div style={{
          padding: '12px 24px',
          backgroundColor: 'var(--bg-alt)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '11.5px'
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="tag tag-accent" style={{ fontSize: '10.5px' }}>
              {directlyReportedCount} Author-Reported
            </span>
            {inferredCount > 0 && (
              <span className="tag" style={{ fontSize: '10.5px' }}>
                {inferredCount} AI-Inferred
              </span>
            )}
          </div>
          <div style={{ color: 'var(--text-muted)' }}>
            {citedPapers.length} Grounded Publications
          </div>
        </div>

        {/* Content Body */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {evidenceList.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: 'var(--text-muted)',
              fontSize: '13px'
            }}>
              <IconInfo size={24} style={{ marginBottom: '8px', opacity: 0.6 }} />
              <div>No specific passages extracted for this response.</div>
              <div style={{ fontSize: '11.5px', marginTop: '4px' }}>
                Review cited publications below for complete bibliographic records.
              </div>
            </div>
          ) : (
            evidenceList.map((item, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                {/* Header: Title and Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
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
                      flex: 1
                    }}
                    onClick={() => onSelectPaper && item.paperId && onSelectPaper(item.paperId)}
                    title="Inspect complete paper metadata and citation network"
                  >
                    {item.title || 'Scholarly Work'}
                  </button>

                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: item.statementType === 'DIRECTLY_REPORTED' ? 'var(--bg-subtle)' : 'var(--bg-alt)',
                      color: item.statementType === 'DIRECTLY_REPORTED' ? '#10b981' : '#3b82f6',
                      border: '1px solid var(--border-color)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {item.statementType === 'DIRECTLY_REPORTED' ? 'Author Reported' : 'AI Inferred'}
                  </span>
                </div>

                {/* Metadata strip */}
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span>{item.authors && item.authors.length > 0 ? item.authors.slice(0, 2).join(', ') + (item.authors.length > 2 ? ' et al.' : '') : 'Authors'}</span>
                  <span>•</span>
                  <span>{item.year || 'n.d.'}</span>
                  <span>•</span>
                  <span>{item.venue || 'Publication Venue'}</span>
                  {item.section && (
                    <>
                      <span>•</span>
                      <span className="tag" style={{ fontSize: '10px', padding: '1px 5px' }}>
                        Section: {item.section}
                      </span>
                    </>
                  )}
                </div>

                {/* Supporting Excerpt Passage */}
                <div style={{
                  fontSize: '12px',
                  color: 'var(--text-main)',
                  backgroundColor: 'var(--bg-surface)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-xs)',
                  borderLeft: '3px solid var(--accent)',
                  lineHeight: '1.5',
                  fontStyle: 'normal'
                }}>
                  "{item.passage}"
                </div>

                {/* Direct Action Links */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '2px', fontSize: '11px' }}>
                  {item.doi && (
                    <a
                      href={`https://doi.org/${item.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                      title="Open Official DOI resolver"
                    >
                      <IconExternalLink size={11} />
                      <span>DOI: {item.doi}</span>
                    </a>
                  )}

                  {item.pdfUrl && (
                    <a
                      href={item.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#3b82f6', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', marginLeft: 'auto' }}
                      title="Direct Open Access PDF"
                    >
                      <IconDownload size={11} />
                      <span>Open Access PDF</span>
                    </a>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Full Bibliography List of Grounded Papers */}
          {citedPapers.length > 0 && (
            <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Complete Bibliographic References ({citedPapers.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {citedPapers.map((paper, i) => (
                  <div
                    key={paper.id || i}
                    style={{
                      fontSize: '11.5px',
                      padding: '8px 10px',
                      backgroundColor: 'var(--bg-main)',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ flex: 1, paddingRight: '10px' }}>
                      <span style={{ fontWeight: 700, marginRight: '4px' }}>[{i + 1}]</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{paper.title}</span>
                      <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>
                        ({paper.publicationYear || 'n.d.'})
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '10.5px', padding: '2px 8px' }}
                      onClick={() => onSelectPaper && onSelectPaper(paper.id)}
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
