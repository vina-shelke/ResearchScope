import React, { useState, useEffect } from 'react';
import { fetchPapers } from '../api/client';

export default function PapersView({ onSelectPaper }) {
  const [papersData, setPapersData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [year, setYear] = useState('');
  const [source, setSource] = useState('');
  const [minCitations, setMinCitations] = useState('');
  const [sortBy, setSortBy] = useState('publicationYear');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(0);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchPapers({
        q: query,
        year: year ? parseInt(year) : null,
        source,
        minCitations: minCitations ? parseInt(minCitations) : null,
        sortBy,
        sortDir,
        page,
        size: 10
      });
      setPapersData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, sortBy, sortDir]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    loadData();
  };

  return (
    <div>
      <div className="section-header">
        <h1 className="section-title">Scholarly Papers Explorer</h1>
        <div className="section-description">Browse, filter, and inspect normalized research papers from OpenAlex, Crossref, and Semantic Scholar</div>
      </div>

      <div className="panel" style={{ marginBottom: '20px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Keyword / Title</label>
            <input 
              type="text" 
              className="search-input" 
              style={{ backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid var(--border-color)' }}
              placeholder="e.g. Generative AI"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Publication Year</label>
            <input 
              type="number" 
              className="search-input" 
              style={{ backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid var(--border-color)' }}
              placeholder="e.g. 2025"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Min Citations</label>
            <input 
              type="number" 
              className="search-input" 
              style={{ backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid var(--border-color)' }}
              placeholder="e.g. 10"
              value={minCitations}
              onChange={(e) => setMinCitations(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Source</label>
            <select 
              className="search-input" 
              style={{ backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid var(--border-color)' }}
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              <option value="">All Sources</option>
              <option value="OpenAlex">OpenAlex</option>
              <option value="Crossref">Crossref</option>
              <option value="Semantic Scholar">Semantic Scholar</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Sort By</label>
            <select 
              className="search-input" 
              style={{ backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid var(--border-color)' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="publicationYear">Publication Year</option>
              <option value="citationCount">Citation Count</option>
              <option value="title">Title</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Apply Filters</button>
          </div>
        </form>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading papers database...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Paper Title & Authors</th>
                <th>Year</th>
                <th>Venue / Journal</th>
                <th>Citations</th>
                <th>Topics</th>
                <th>Source</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {papersData && papersData.content && papersData.content.length > 0 ? (
                papersData.content.map((p) => (
                  <tr key={p.id}>
                    <td style={{ maxWidth: '380px' }}>
                      <div className="table-link" onClick={() => onSelectPaper(p.id)} style={{ fontSize: '14px', marginBottom: '4px' }}>
                        {p.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {p.authors && p.authors.length > 0 ? p.authors.map(a => a.name).join(', ') : 'Authors n/a'}
                      </div>
                    </td>
                    <td>{p.publicationYear || 'N/A'}</td>
                    <td style={{ fontSize: '12px' }}>{p.venue || 'N/A'}</td>
                    <td style={{ fontWeight: 700 }}>{p.citationCount || 0}</td>
                    <td>
                      {p.topics && p.topics.slice(0, 2).map((t, idx) => (
                        <span key={idx} className="tag">{t.name}</span>
                      ))}
                    </td>
                    <td><span className="tag tag-accent">{p.source}</span></td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => onSelectPaper(p.id)}>
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No research papers matched your search parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {papersData && (
            <div className="pagination">
              <div>Page {papersData.pageNumber + 1} of {papersData.totalPages || 1} ({papersData.totalElements} records)</div>
              <div className="pagination-controls">
                <button 
                  className="btn btn-secondary btn-sm" 
                  disabled={papersData.pageNumber === 0} 
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </button>
                <button 
                  className="btn btn-secondary btn-sm" 
                  disabled={papersData.isLast} 
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
