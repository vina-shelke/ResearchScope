import React, { useState, useEffect } from 'react';
import { 
  fetchPapers, 
  savePaper, 
  removeSavedPaper,
  getPapersCsvExportUrl, 
  getPapersBibTeXExportUrl 
} from '../api/client';

export default function PapersView({ onSelectPaper }) {
  const [papersData, setPapersData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [author, setAuthor] = useState('');
  const [institution, setInstitution] = useState('');
  const [year, setYear] = useState('');
  const [source, setSource] = useState('');
  const [minCitations, setMinCitations] = useState('');
  const [isOpenAccess, setIsOpenAccess] = useState('');
  const [paperType, setPaperType] = useState('');
  const [sortBy, setSortBy] = useState('publicationYear');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(0);
  const [savedMap, setSavedMap] = useState({});

  const filterParams = {
    q: query,
    author,
    institution,
    year: year ? parseInt(year) : null,
    source,
    minCitations: minCitations ? parseInt(minCitations) : null,
    isOpenAccess: isOpenAccess === '' ? null : (isOpenAccess === 'true'),
    paperType: paperType || null,
    sortBy,
    sortDir,
    page,
    size: 10
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchPapers(filterParams);
      setPapersData(res);
      // Initialize saved map from returned papers
      const map = {};
      if (res && res.content) {
        res.content.forEach(p => {
          if (p.isSaved) map[p.id] = true;
        });
      }
      setSavedMap(prev => ({ ...prev, ...map }));
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

  const handleToggleBookmark = async (paper) => {
    const isCurrentlySaved = Boolean(savedMap[paper.id]);
    try {
      if (isCurrentlySaved) {
        await removeSavedPaper(paper.id);
        setSavedMap(prev => ({ ...prev, [paper.id]: false }));
      } else {
        await savePaper(paper.id, { collectionName: 'Favorites' });
        setSavedMap(prev => ({ ...prev, [paper.id]: true }));
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const totalResults = papersData ? papersData.totalElements : 0;
  const currentCount = papersData && papersData.content ? papersData.content.length : 0;

  return (
    <div>
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="section-title">Scholarly Papers Explorer</h1>
          <div className="section-description">
            Search, filter, and inspect research papers with Open Access links, author affiliations, and citation metrics
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <a 
            href={getPapersCsvExportUrl(filterParams)}
            download="research-papers.csv"
            className="btn btn-secondary btn-sm"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <span>↓</span> Export Results (CSV)
          </a>
          <a 
            href={getPapersBibTeXExportUrl(filterParams)}
            download="research-papers.bib"
            className="btn btn-secondary btn-sm"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <span>↓</span> Export Results (BibTeX)
          </a>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: '20px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Keyword / Title</label>
            <input 
              type="text" 
              className="search-input" 
              style={{ backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid var(--border-color)', width: '100%' }}
              placeholder="e.g. Generative AI"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Author Name</label>
            <input 
              type="text" 
              className="search-input" 
              style={{ backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid var(--border-color)', width: '100%' }}
              placeholder="e.g. Smith"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Institution</label>
            <input 
              type="text" 
              className="search-input" 
              style={{ backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid var(--border-color)', width: '100%' }}
              placeholder="e.g. Stanford"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Publication Year</label>
            <input 
              type="number" 
              className="search-input" 
              style={{ backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid var(--border-color)', width: '100%' }}
              placeholder="e.g. 2024"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Open Access</label>
            <select 
              className="search-input" 
              style={{ backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid var(--border-color)', width: '100%' }}
              value={isOpenAccess}
              onChange={(e) => setIsOpenAccess(e.target.value)}
            >
              <option value="">All Access Types</option>
              <option value="true">Open Access Only</option>
              <option value="false">Subscription / Closed</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Paper Type</label>
            <select 
              className="search-input" 
              style={{ backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid var(--border-color)', width: '100%' }}
              value={paperType}
              onChange={(e) => setPaperType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="article">Article / Journal</option>
              <option value="book-chapter">Book Chapter</option>
              <option value="proceedings-article">Conference / Proceeding</option>
              <option value="preprint">Preprint</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Source Provider</label>
            <select 
              className="search-input" 
              style={{ backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid var(--border-color)', width: '100%' }}
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
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Min Citations</label>
            <input 
              type="number" 
              className="search-input" 
              style={{ backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid var(--border-color)', width: '100%' }}
              placeholder="e.g. 5"
              value={minCitations}
              onChange={(e) => setMinCitations(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Sort By</label>
            <select 
              className="search-input" 
              style={{ backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid var(--border-color)', width: '100%' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="publicationYear">Publication Year</option>
              <option value="citationCount">Citation Count</option>
              <option value="title">Title</option>
            </select>
          </div>

          <div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Apply Filters</button>
          </div>
        </form>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
          Showing {currentCount} of {totalResults} matching papers
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading papers database...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '36px' }}>Save</th>
                <th>Paper Title & Authors</th>
                <th>Year</th>
                <th>Venue / Journal</th>
                <th>Citations</th>
                <th>Access</th>
                <th>Topics</th>
                <th>Source</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {papersData && papersData.content && papersData.content.length > 0 ? (
                papersData.content.map((p) => {
                  const saved = Boolean(savedMap[p.id]);
                  return (
                    <tr key={p.id}>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleBookmark(p)}
                          title={saved ? "Remove from Library" : "Save to Library"}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '18px',
                            color: saved ? '#eab308' : '#cbd5e1',
                            padding: '4px',
                            transition: 'color 0.15s ease'
                          }}
                        >
                          {saved ? '★' : '☆'}
                        </button>
                      </td>
                      <td style={{ maxWidth: '360px' }}>
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
                        {p.isOpenAccess ? (
                          <span className="tag" style={{ backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                            OA
                          </span>
                        ) : (
                          <span className="tag" style={{ opacity: 0.6 }}>Sub</span>
                        )}
                      </td>
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
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
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
