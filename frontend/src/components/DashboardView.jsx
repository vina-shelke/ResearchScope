import React, { useState, useEffect } from 'react';
import TrendChart from './TrendChart';
import { fetchPapers } from '../api/client';

export default function DashboardView({ summary, loading, onSelectPaper, onSelectTopic, onSearch }) {
  const [topicPapersData, setTopicPapersData] = useState(null);
  const [loadingPapers, setLoadingPapers] = useState(false);
  const [sortBy, setSortBy] = useState('publicationYear');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Fetch paginated research papers matching the current search topic query
  useEffect(() => {
    if (summary) {
      setLoadingPapers(true);
      fetchPapers({
        q: summary.query || '',
        sortBy,
        sortDir,
        page,
        size: pageSize
      })
        .then(setTopicPapersData)
        .catch(console.error)
        .finally(() => setLoadingPapers(false));
    }
  }, [summary, summary?.query, sortBy, sortDir, page, pageSize]);

  if (loading && !summary) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        Ingesting and normalizing scholarly data from OpenAlex, Crossref & Semantic Scholar...
      </div>
    );
  }

  if (!summary) return <div style={{ padding: '40px', textAlign: 'center' }}>No research landscape data available.</div>;

  return (
    <div>
      {loading && (
        <div style={{ padding: '8px 16px', marginBottom: '16px', backgroundColor: 'var(--accent-light)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', color: 'var(--accent)', fontSize: '13px', fontWeight: 600 }}>
          Fetching & deduplicating live scholarly literature across providers...
        </div>
      )}

      {/* 1. Header & Topic Overview */}
      <div className="section-header">
        <h1 className="section-title">Research Landscape</h1>
        <div className="section-description">
          {summary.query ? `Landscape analysis for '${summary.query}'` : 'Global scholarly activity and entity distribution across OpenAlex, Crossref, and Semantic Scholar'}
        </div>
      </div>

      {/* 2. Research Statistics Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Total Papers</div>
          <div className="metric-value">{summary.totalPapers.toLocaleString()}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Authors</div>
          <div className="metric-value">{summary.totalAuthors.toLocaleString()}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Institutions</div>
          <div className="metric-value">{summary.totalInstitutions.toLocaleString()}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Countries</div>
          <div className="metric-value">{summary.totalCountries.toLocaleString()}</div>
        </div>
      </div>

      {/* 3. Research Papers Section (Directly Below Statistics) */}
      <div className="panel" style={{ marginBottom: '28px' }}>
        <div className="panel-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div className="panel-title">
              Research Papers {summary.query ? `for "${summary.query}"` : 'in Database'}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Normalized papers retrieved from OpenAlex, Crossref & Semantic Scholar
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Sort:</span>
              <select
                className="search-input"
                style={{ backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid var(--border-color)', padding: '6px 10px', fontSize: '13px', width: 'auto' }}
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(0); }}
              >
                <option value="publicationYear">Publication Year</option>
                <option value="citationCount">Citation Count</option>
                <option value="title">Title</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <select
                className="search-input"
                style={{ backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid var(--border-color)', padding: '6px 10px', fontSize: '13px', width: 'auto' }}
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
              </select>
            </div>
          </div>
        </div>

        {loadingPapers ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading topic papers...</div>
        ) : topicPapersData && topicPapersData.content && topicPapersData.content.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Paper Details & Abstract Preview</th>
                  <th>Publication Info</th>
                  <th>DOI</th>
                  <th>Citations</th>
                  <th>Access</th>
                  <th>Source</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {topicPapersData.content.map((paper) => {
                  const abstractSnippet = paper.abstractText
                    ? (paper.abstractText.length > 180 ? paper.abstractText.substring(0, 180) + '...' : paper.abstractText)
                    : 'Abstract not available.';
                  
                  const authorsList = paper.authors && paper.authors.length > 0
                    ? paper.authors.map(a => a.name).join(', ')
                    : 'Authors n/a';

                  return (
                    <tr key={paper.id}>
                      <td style={{ maxWidth: '420px' }}>
                        <div 
                          className="table-link" 
                          onClick={() => onSelectPaper(paper.id)} 
                          style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px', lineHeight: '1.3' }}
                        >
                          {paper.title}
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                          Authors: <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>{authorsList}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4', backgroundColor: 'var(--bg-main)', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}>
                          {abstractSnippet}
                        </div>
                      </td>

                      <td style={{ fontSize: '13px', minWidth: '150px' }}>
                        <div style={{ fontWeight: 700 }}>{paper.publicationYear || 'N/A'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {paper.venue || 'Journal / Conference n/a'}
                        </div>
                      </td>

                      <td style={{ fontSize: '13px', minWidth: '130px' }}>
                        {paper.doi ? (
                          <a 
                            href={paper.doi.startsWith('http') ? paper.doi : `https://doi.org/${paper.doi}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="table-link"
                            style={{ fontSize: '12px', wordBreak: 'break-all' }}
                          >
                            {paper.doi}
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>N/A</span>
                        )}
                      </td>

                      <td style={{ fontWeight: 700, fontSize: '15px', color: 'var(--accent)' }}>
                        {paper.citationCount ?? 0}
                      </td>

                      <td>
                        {paper.isOpenAccess ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span className="tag" style={{ backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                              Open Access
                            </span>
                            {paper.pdfUrl && (
                              <a 
                                href={paper.pdfUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                style={{ fontSize: '11px', color: '#047857', textDecoration: 'none', fontWeight: 600 }}
                              >
                                PDF ↗
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="tag" style={{ opacity: 0.6 }}>Sub</span>
                        )}
                      </td>

                      <td>
                        <span className="tag tag-accent">{paper.source || 'Scholar'}</span>
                      </td>

                      <td>
                        <button 
                          className="btn btn-secondary btn-sm" 
                          onClick={() => onSelectPaper(paper.id)}
                          style={{ fontWeight: 600 }}
                        >
                          Inspect Record
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="pagination">
              <div>
                Page {topicPapersData.pageNumber + 1} of {topicPapersData.totalPages || 1} ({topicPapersData.totalElements} retrieved papers)
              </div>
              <div className="pagination-controls">
                <button 
                  className="btn btn-secondary btn-sm" 
                  disabled={topicPapersData.pageNumber === 0} 
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </button>
                <button 
                  className="btn btn-secondary btn-sm" 
                  disabled={topicPapersData.isLast} 
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', padding: '30px', textAlign: 'center' }}>
            No research papers found for this topic. Type a research topic into the top search bar to analyze and import scholarly literature.
          </div>
        )}
      </div>

      {/* 4. Publication Trends & Prominent Topics Grid */}
      <div className="grid-2">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">Publication Trend Over Time</div>
          </div>
          <TrendChart data={summary.publicationTrend} xKey="year" yKey="count" />
        </div>

        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">Prominent Research Topics</div>
          </div>
          {summary.topTopics && summary.topTopics.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {summary.topTopics.slice(0, 7).map((topic, idx) => (
                <div 
                  key={topic.id || idx}
                  onClick={() => onSelectTopic(topic.id)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    backgroundColor: 'var(--bg-main)'
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: '13px' }}>{topic.name}</span>
                  <span className="tag tag-accent">{topic.paperCount || 0} papers</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No topics recorded yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
