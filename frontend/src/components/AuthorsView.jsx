import React, { useState, useEffect } from 'react';
import { fetchAuthors, fetchAuthorPapers } from '../api/client';

export default function AuthorsView({ onSelectPaper }) {
  const [authorsData, setAuthorsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [authorPapers, setAuthorPapers] = useState([]);
  const [page, setPage] = useState(0);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchAuthors({ q: query, page, size: 10 });
      setAuthorsData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    loadData();
  };

  const handleAuthorClick = async (author) => {
    setSelectedAuthor(author);
    try {
      const papers = await fetchAuthorPapers(author.id);
      setAuthorPapers(papers);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="section-header">
        <h1 className="section-title">Author Intelligence Explorer</h1>
        <div className="section-description">Analyze scholarly authors, active publication counts, and research impact across institutions</div>
      </div>

      <div className="panel" style={{ marginBottom: '20px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px' }}>
          <input 
            type="text" 
            className="search-input" 
            style={{ backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid var(--border-color)', flex: 1 }}
            placeholder="Search author by name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Search Authors</button>
        </form>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading authors directory...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Author Name</th>
                <th>OpenAlex ID</th>
                <th>Total Papers</th>
                <th>Total Citations</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {authorsData && authorsData.content && authorsData.content.length > 0 ? (
                authorsData.content.map((author) => (
                  <tr key={author.id}>
                    <td>
                      <span className="table-link" onClick={() => handleAuthorClick(author)}>
                        {author.name}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{author.openAlexId || 'N/A'}</td>
                    <td style={{ fontWeight: 700 }}>{author.paperCount || 0}</td>
                    <td style={{ fontWeight: 700 }}>{author.citationCount || 0}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleAuthorClick(author)}>
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No authors found. Import papers from the search bar to populate author entities.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {authorsData && (
            <div className="pagination">
              <div>Page {authorsData.pageNumber + 1} of {authorsData.totalPages || 1} ({authorsData.totalElements} records)</div>
              <div className="pagination-controls">
                <button 
                  className="btn btn-secondary btn-sm" 
                  disabled={authorsData.pageNumber === 0} 
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </button>
                <button 
                  className="btn btn-secondary btn-sm" 
                  disabled={authorsData.isLast} 
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedAuthor && (
        <div className="modal-overlay" onClick={() => setSelectedAuthor(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="tag tag-accent">Author Profile</span>
                <h2 className="modal-title">{selectedAuthor.name}</h2>
              </div>
              <button className="modal-close" onClick={() => setSelectedAuthor(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="metrics-grid" style={{ marginBottom: '20px' }}>
                <div className="metric-card">
                  <div className="metric-label">Published Papers</div>
                  <div className="metric-value">{selectedAuthor.paperCount}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Aggregated Citations</div>
                  <div className="metric-value">{selectedAuthor.citationCount}</div>
                </div>
              </div>

              <div className="detail-section">
                <div className="detail-label">Authored Papers ({authorPapers.length})</div>
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                  {authorPapers.map((paper) => (
                    <li 
                      key={paper.id}
                      onClick={() => { setSelectedAuthor(null); onSelectPaper(paper.id); }}
                      style={{
                        padding: '10px 14px',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '8px',
                        cursor: 'pointer',
                        backgroundColor: 'var(--bg-main)'
                      }}
                    >
                      <div className="table-link">{paper.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {paper.publicationYear} &bull; {paper.venue || 'Journal n/a'} &bull; {paper.citationCount} Citations
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="modal-header" style={{ borderTop: '1px solid var(--border-color)', borderBottom: 'none', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedAuthor(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
