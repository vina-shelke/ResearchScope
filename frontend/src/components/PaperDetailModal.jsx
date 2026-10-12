import React from 'react';

export default function PaperDetailModal({ paper, onClose }) {
  if (!paper) return null;

  // Determine official publisher page or verified source URL
  const targetUrl = paper.doi && paper.doi.trim() 
    ? (paper.doi.startsWith('http') ? paper.doi : `https://doi.org/${paper.doi.trim()}`)
    : (paper.url && paper.url.trim() ? paper.url.trim() : null);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="tag tag-accent" style={{ marginBottom: '8px' }}>{paper.source || 'Scholarly Record'}</span>
            <h2 className="modal-title">{paper.title}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <div className="detail-section">
            <div className="detail-label">Authors</div>
            <div>
              {paper.authors && paper.authors.length > 0 ? (
                paper.authors.map((a, idx) => (
                  <span key={a.id || idx} style={{ fontWeight: 600, marginRight: '12px', display: 'inline-block' }}>
                    {a.name}
                  </span>
                ))
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>Authors not listed</span>
              )}
            </div>
          </div>

          <div className="detail-section" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div>
              <div className="detail-label">Publication Year</div>
              <div style={{ fontWeight: 600 }}>{paper.publicationYear || 'N/A'}</div>
            </div>
            <div>
              <div className="detail-label">Journal / Venue</div>
              <div style={{ fontWeight: 600 }}>{paper.venue || 'N/A'}</div>
            </div>
            <div>
              <div className="detail-label">Citation Count</div>
              <div style={{ fontWeight: 700, color: 'var(--accent)' }}>{paper.citationCount ?? 0}</div>
            </div>
            {paper.doi && (
              <div>
                <div className="detail-label">DOI</div>
                <a 
                  href={paper.doi.startsWith('http') ? paper.doi : `https://doi.org/${paper.doi}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="table-link"
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

          <div className="detail-section">
            <div className="detail-label">Full Abstract</div>
            <p style={{ color: 'var(--text-main)', lineHeight: '1.6', fontSize: '14px', backgroundColor: 'var(--bg-main)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              {paper.abstractText || 'No abstract available for this record.'}
            </p>
          </div>

          {paper.topics && paper.topics.length > 0 && (
            <div className="detail-section">
              <div className="detail-label">Topics & Concepts</div>
              <div>
                {paper.topics.map((t, idx) => (
                  <span key={t.id || idx} className="tag">{t.name}</span>
                ))}
              </div>
            </div>
          )}

          {paper.institutions && paper.institutions.length > 0 && (
            <div className="detail-section">
              <div className="detail-label">Affiliated Institutions</div>
              <div>
                {paper.institutions.map((inst, idx) => (
                  <span key={inst.id || idx} className="tag tag-accent">{inst.name}</span>
                ))}
              </div>
            </div>
          )}

          {paper.relatedPapers && paper.relatedPapers.length > 0 && (
            <div className="detail-section">
              <div className="detail-label">Related Research</div>
              <ul style={{ listStyleType: 'disc', paddingLeft: '20px', fontSize: '14px' }}>
                {paper.relatedPapers.map((rel, idx) => (
                  <li key={rel.id || idx} style={{ marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600 }}>{rel.title}</span> ({rel.publicationYear || 'N/A'})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="modal-header" style={{ borderTop: '1px solid var(--border-color)', borderBottom: 'none', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {targetUrl ? (
              <a 
                href={targetUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-primary"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                View Original Paper ↗
              </a>
            ) : (
              <button className="btn btn-secondary" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                Original Source URL Unavailable
              </button>
            )}
          </div>
          <button className="btn btn-secondary" onClick={onClose}>Close Record</button>
        </div>
      </div>
    </div>
  );
}
