import React, { useState, useEffect } from 'react';
import { savePaper, removeSavedPaper, fetchPaperReferences, getPaperBibTeXUrl } from '../api/client';

export default function PaperDetailModal({ paper, onClose, onSelectPaper }) {
  if (!paper) return null;

  const [isSaved, setIsSaved] = useState(Boolean(paper.isSaved));
  const [collectionName, setCollectionName] = useState(paper.savedCollection || 'Favorites');
  const [notes, setNotes] = useState(paper.savedNotes || '');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [savingStatus, setSavingStatus] = useState('');
  const [references, setReferences] = useState(paper.references || []);
  const [loadingRefs, setLoadingRefs] = useState(false);

  useEffect(() => {
    setIsSaved(Boolean(paper.isSaved));
    setCollectionName(paper.savedCollection || 'Favorites');
    setNotes(paper.savedNotes || '');
    setShowSaveForm(false);
    setSavingStatus('');

    // Fetch references if not already present
    if (paper.id && (!paper.references || paper.references.length === 0)) {
      setLoadingRefs(true);
      fetchPaperReferences(paper.id)
        .then(refs => setReferences(refs))
        .catch(err => console.error('Error fetching paper references:', err))
        .finally(() => setLoadingRefs(false));
    } else {
      setReferences(paper.references || []);
    }
  }, [paper.id]);

  const handleToggleSave = async () => {
    if (isSaved) {
      try {
        setSavingStatus('Removing...');
        await removeSavedPaper(paper.id);
        setIsSaved(false);
        setSavingStatus('Removed from library');
        setTimeout(() => setSavingStatus(''), 2000);
      } catch (err) {
        console.error('Failed to remove saved paper:', err);
        setSavingStatus('Error removing');
      }
    } else {
      setShowSaveForm(true);
    }
  };

  const handleConfirmSave = async (e) => {
    e.preventDefault();
    try {
      setSavingStatus('Saving...');
      await savePaper(paper.id, {
        collectionName: collectionName.trim() || 'Favorites',
        notes: notes.trim()
      });
      setIsSaved(true);
      setShowSaveForm(false);
      setSavingStatus('Saved to library');
      setTimeout(() => setSavingStatus(''), 2000);
    } catch (err) {
      console.error('Failed to save paper:', err);
      setSavingStatus('Error saving');
    }
  };

  // Determine official publisher page or verified source URL
  const targetUrl = paper.doi && paper.doi.trim() 
    ? (paper.doi.startsWith('http') ? paper.doi : `https://doi.org/${paper.doi.trim()}`)
    : (paper.url && paper.url.trim() ? paper.url.trim() : null);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px', maxHeight: '90vh' }}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span className="tag tag-accent">{paper.source || 'Scholarly Record'}</span>
              
              {paper.isOpenAccess ? (
                <span className="tag" style={{ backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                  ✓ Open Access
                </span>
              ) : (
                <span className="tag" style={{ opacity: 0.7 }}>
                  Subscription
                </span>
              )}

              {paper.paperType && (
                <span className="tag" style={{ textTransform: 'capitalize' }}>
                  {paper.paperType.replace('_', ' ')}
                </span>
              )}

              {isSaved && (
                <span className="tag" style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
                  ★ In Library ({collectionName})
                </span>
              )}
            </div>

            <h2 className="modal-title" style={{ fontSize: '20px', lineHeight: 1.35 }}>{paper.title}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        {/* Retraction Warning Banner */}
        {paper.isRetracted && (
          <div style={{
            backgroundColor: '#fef2f2',
            color: '#991b1b',
            border: '1px solid #fecaca',
            padding: '12px 16px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600
          }}>
            <span>⚠️ NOTICE: This scientific publication has been formally retracted by the publisher or authors.</span>
          </div>
        )}

        {/* Save/Bookmark Inline Form */}
        {showSaveForm && (
          <div style={{
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid var(--border-color)',
            padding: '14px 20px'
          }}>
            <form onSubmit={handleConfirmSave} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-main)' }}>
                Add to Research Library
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Collection</label>
                  <input
                    type="text"
                    className="search-input"
                    style={{ backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid var(--border-color)', width: '100%' }}
                    placeholder="e.g. Favorites, Read Later"
                    value={collectionName}
                    onChange={(e) => setCollectionName(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Personal Note (optional)</label>
                  <input
                    type="text"
                    className="search-input"
                    style={{ backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid var(--border-color)', width: '100%' }}
                    placeholder="Key insight or study relevance..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowSaveForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Paper
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="modal-body" style={{ overflowY: 'auto' }}>
          {/* Authors List with ORCID */}
          <div className="detail-section">
            <div className="detail-label">Authors & Affiliations</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {paper.authors && paper.authors.length > 0 ? (
                paper.authors.map((a, idx) => (
                  <span 
                    key={a.id || idx} 
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '4px',
                      backgroundColor: 'var(--bg-main)', 
                      padding: '4px 8px', 
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      fontSize: '13px'
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{a.name}</span>
                    {a.orcid && (
                      <a 
                        href={`https://orcid.org/${a.orcid}`} 
                        target="_blank" 
                        rel="noreferrer"
                        title={`ORCID: ${a.orcid}`}
                        style={{ color: '#a6ce39', textDecoration: 'none', fontWeight: 700, fontSize: '11px', border: '1px solid #a6ce39', borderRadius: '3px', padding: '1px 3px' }}
                      >
                        iD
                      </a>
                    )}
                  </span>
                ))
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>Authors not listed</span>
              )}
            </div>
          </div>

          {/* Key Publication Metrics */}
          <div className="detail-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px', backgroundColor: 'var(--bg-main)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <div>
              <div className="detail-label">Publication Year</div>
              <div style={{ fontWeight: 600 }}>{paper.publicationYear || 'N/A'}</div>
            </div>
            <div>
              <div className="detail-label">Journal / Venue</div>
              <div style={{ fontWeight: 600 }}>{paper.venue || 'N/A'}</div>
            </div>
            {paper.publisher && (
              <div>
                <div className="detail-label">Publisher</div>
                <div style={{ fontWeight: 600 }}>{paper.publisher}</div>
              </div>
            )}
            <div>
              <div className="detail-label">Citation Count</div>
              <div style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '16px' }}>{paper.citationCount ?? 0}</div>
            </div>
            {paper.doi && (
              <div>
                <div className="detail-label">DOI</div>
                <a 
                  href={paper.doi.startsWith('http') ? paper.doi : `https://doi.org/${paper.doi}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="table-link"
                  style={{ wordBreak: 'break-all' }}
                >
                  {paper.doi}
                </a>
              </div>
            )}
            <div>
              <div className="detail-label">Source Provider</div>
              <div><span className="tag">{paper.source || 'N/A'}</span></div>
            </div>
          </div>

          {/* Full Abstract */}
          <div className="detail-section">
            <div className="detail-label">Full Abstract</div>
            <p style={{ color: 'var(--text-main)', lineHeight: '1.6', fontSize: '14px', backgroundColor: '#ffffff', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              {paper.abstractText || 'No abstract available for this record.'}
            </p>
          </div>

          {/* Topics & Concepts */}
          {paper.topics && paper.topics.length > 0 && (
            <div className="detail-section">
              <div className="detail-label">Topics & Fields of Study</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {paper.topics.map((t, idx) => (
                  <span key={t.id || idx} className="tag">{t.name}</span>
                ))}
              </div>
            </div>
          )}

          {/* Affiliated Institutions with ROR */}
          {paper.institutions && paper.institutions.length > 0 && (
            <div className="detail-section">
              <div className="detail-label">Affiliated Institutions</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {paper.institutions.map((inst, idx) => (
                  <span key={inst.id || idx} className="tag tag-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span>{inst.name}</span>
                    {inst.rorId && (
                      <a 
                        href={`https://ror.org/${inst.rorId}`} 
                        target="_blank" 
                        rel="noreferrer"
                        title={`ROR ID: ${inst.rorId}`}
                        style={{ color: '#0284c7', fontSize: '10px', textDecoration: 'none', fontWeight: 'bold' }}
                      >
                        [ROR]
                      </a>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* References Section */}
          <div className="detail-section">
            <div className="detail-label">References & Cited Works ({references.length})</div>
            {loadingRefs ? (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading references...</div>
            ) : references.length > 0 ? (
              <ul style={{ listStyleType: 'decimal', paddingLeft: '20px', fontSize: '13px', margin: 0 }}>
                {references.map((ref, idx) => (
                  <li key={ref.id || idx} style={{ marginBottom: '6px' }}>
                    <span 
                      className="table-link"
                      onClick={() => onSelectPaper && onSelectPaper(ref.id)}
                      style={{ fontWeight: 600 }}
                    >
                      {ref.title}
                    </span>
                    {ref.publicationYear ? ` (${ref.publicationYear})` : ''}
                    {ref.venue ? ` — ${ref.venue}` : ''}
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No explicit reference records indexed in database for this paper yet.
              </div>
            )}
          </div>

          {/* Related Research */}
          {paper.relatedPapers && paper.relatedPapers.length > 0 && (
            <div className="detail-section">
              <div className="detail-label">Related Research ({paper.relatedPapers.length})</div>
              <ul style={{ listStyleType: 'disc', paddingLeft: '20px', fontSize: '13px', margin: 0 }}>
                {paper.relatedPapers.map((rel, idx) => (
                  <li key={rel.id || idx} style={{ marginBottom: '6px' }}>
                    <span 
                      className="table-link" 
                      onClick={() => onSelectPaper && onSelectPaper(rel.id)}
                      style={{ fontWeight: 600 }}
                    >
                      {rel.title}
                    </span> ({rel.publicationYear || 'N/A'})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="modal-header" style={{ borderTop: '1px solid var(--border-color)', borderBottom: 'none', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {targetUrl ? (
              <a 
                href={targetUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-primary btn-sm"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                View Original Paper ↗
              </a>
            ) : (
              <button className="btn btn-secondary btn-sm" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                Publisher Link Unavailable
              </button>
            )}

            {paper.pdfUrl ? (
              <a 
                href={paper.pdfUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-secondary btn-sm"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#047857', borderColor: '#a7f3d0', backgroundColor: '#f0fdf4' }}
              >
                View / Download PDF ↗
              </a>
            ) : null}

            <a 
              href={getPaperBibTeXUrl(paper.id)}
              download={`paper-${paper.id}.bib`}
              className="btn btn-secondary btn-sm"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              Export BibTeX
            </a>

            <button 
              type="button" 
              className={`btn btn-sm ${isSaved ? 'btn-secondary' : 'btn-secondary'}`}
              onClick={handleToggleSave}
              style={isSaved ? { color: '#b91c1c', borderColor: '#fca5a5' } : {}}
            >
              {isSaved ? '★ Remove from Library' : '☆ Save to Library'}
            </button>

            {savingStatus && (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{savingStatus}</span>
            )}
          </div>

          <button className="btn btn-secondary btn-sm" onClick={onClose}>Close Record</button>
        </div>
      </div>
    </div>
  );
}
