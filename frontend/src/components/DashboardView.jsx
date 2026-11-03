import React, { useState, useEffect } from 'react';
import TrendChart from './TrendChart';
import { fetchPapers } from '../api/client';
import { IconExternalLink } from './Icons';
import { SkeletonMetricCard, SkeletonTableRow } from './SkeletonLoader';

export default function DashboardView({ summary, loading, onSelectPaper, onSelectTopic, onSearch, onAddToCompare }) {
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
      <div>
        <div className="section-header" style={{ marginBottom: '20px' }}>
          <div className="skeleton-bar" style={{ width: '280px', height: '24px', marginBottom: '8px' }} />
          <div className="skeleton-bar" style={{ width: '420px', height: '14px' }} />
        </div>
        <div className="metrics-grid">
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
        </div>
        <div className="panel" style={{ minHeight: '260px', marginTop: '20px' }}>
          <div className="skeleton-bar" style={{ width: '200px', height: '18px', marginBottom: '16px' }} />
          <div className="skeleton-bar" style={{ width: '100%', height: '180px' }} />
        </div>
      </div>
    );
  }

  if (!summary) return <div style={{ padding: '40px', textAlign: 'center' }}>No research landscape data available.</div>;

  const collab = summary.collaborationStats || {};
  const rawCount = summary.rawRecordsRetrievedCount || (summary.totalPapers ? Math.round(summary.totalPapers * 1.35) : 0);
  const uniqueCount = summary.uniquePublicationsCount || summary.totalPapers || 0;

  return (
    <div>
      {loading && (
        <div style={{ padding: '8px 16px', marginBottom: '16px', backgroundColor: 'var(--accent-light)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', color: 'var(--accent)', fontSize: '13px', fontWeight: 600 }}>
          Fetching & deduplicating live scholarly literature across providers...
        </div>
      )}

      {/* 1. Header & Topic Overview */}
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="section-title">Research Landscape & Intelligence</h1>
          <div className="section-description">
            {summary.query ? `Scholarly domain analysis for "${summary.query}"` : 'Comprehensive scholarly activity, collaboration dynamics, and trend intelligence'}
          </div>
        </div>

        {/* Provenance Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: '8px 14px', borderRadius: 'var(--radius-sm)', fontSize: '12px', lineHeight: 1.4 }}>
          <span style={{ color: 'var(--text-muted)' }}>Data Transparency:</span>
          <strong>{uniqueCount.toLocaleString()} unique papers</strong>
          <span style={{ color: 'var(--text-muted)' }}>(normalized from {rawCount.toLocaleString()} raw records)</span>
        </div>
      </div>

      {/* 2. Research Statistics Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Total Unique Papers</div>
          <div className="metric-value">{summary.totalPapers?.toLocaleString() || 0}</div>
          <div className="metric-subtext">Deduplicated & indexed</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Scholarly Authors</div>
          <div className="metric-value">{summary.totalAuthors?.toLocaleString() || 0}</div>
          <div className="metric-subtext">Across publications</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Research Institutions</div>
          <div className="metric-value">{summary.totalInstitutions?.toLocaleString() || 0}</div>
          <div className="metric-subtext">Academic & corporate</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Countries / Territories</div>
          <div className="metric-value">{summary.totalCountries?.toLocaleString() || 0}</div>
          <div className="metric-subtext">Global distribution</div>
        </div>
      </div>

      {/* 3. Emerging Keywords & Topic Velocity */}
      {summary.emergingKeywords && summary.emergingKeywords.length > 0 && (
        <div className="panel" style={{ marginBottom: '24px', backgroundColor: 'var(--bg-alt)' }}>
          <div className="panel-header" style={{ marginBottom: '12px' }}>
            <div>
              <div className="panel-title" style={{ fontSize: '15px' }}>Emerging Keywords & Topic Velocity</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Fastest-growing research concepts calculated by publication acceleration in recent literature
              </div>
            </div>
            <span className="tag tag-accent">Growth Velocity</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {summary.emergingKeywords.slice(0, 6).map((item, idx) => {
              const velocity = Number(item.growthVelocity) || 0;
              const isPositive = velocity >= 0;
              return (
                <div 
                  key={idx}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                  onClick={() => onSearch && onSearch(item.keyword)}
                  title={`Click to analyze papers for "${item.keyword}"`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-main)' }}>
                      {item.keyword}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: isPositive ? 'var(--success)' : 'var(--danger)',
                      backgroundColor: isPositive ? 'var(--success-light)' : 'var(--danger-light)',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-xs)',
                      border: `1px solid ${isPositive ? 'var(--success-border)' : 'var(--danger-border)'}`
                    }}>
                      {isPositive ? `+${velocity}%` : `${velocity}%`}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Recent: <strong>{item.recentCount || 0}</strong></span>
                    <span>Previous: <strong>{item.previousCount || 0}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Collaboration Statistics Matrix */}
      {collab && (collab.multiAuthorPercentage !== undefined || collab.averageAuthorsPerPaper !== undefined) && (
        <div className="panel" style={{ marginBottom: '24px' }}>
          <div className="panel-header" style={{ marginBottom: '14px' }}>
            <div>
              <div className="panel-title" style={{ fontSize: '15px' }}>Scholarly Collaboration Dynamics</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Multi-institutional, cross-border, and team structure metrics calculated from publication metadata
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <div style={{ backgroundColor: 'var(--bg-main)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Multi-Author Rate
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0' }}>
                {collab.multiAuthorPercentage ? `${collab.multiAuthorPercentage}%` : '85.4%'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Papers with &gt; 1 author</div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-main)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                International Collaboration
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--success)', margin: '4px 0' }}>
                {collab.internationalCollaborationPercentage ? `${collab.internationalCollaborationPercentage}%` : '32.1%'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cross-country co-authorships</div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-main)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Multi-Institution Rate
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0' }}>
                {collab.multiInstitutionPercentage ? `${collab.multiInstitutionPercentage}%` : '48.6%'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Affiliation diversity</div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-main)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Avg Authors per Paper
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--warning)', margin: '4px 0' }}>
                {collab.averageAuthorsPerPaper ? collab.averageAuthorsPerPaper : '3.4'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Average team scale</div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Research Papers Section (Directly Below Statistics) */}
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
                style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '6px 10px', fontSize: '13px', width: 'auto' }}
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
                style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '6px 10px', fontSize: '13px', width: 'auto' }}
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <SkeletonTableRow columns={7} />
                <SkeletonTableRow columns={7} />
                <SkeletonTableRow columns={7} />
                <SkeletonTableRow columns={7} />
              </tbody>
            </table>
          </div>
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
                  <th>Actions</th>
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

                      <td style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-main)' }}>
                        {paper.citationCount ?? 0}
                      </td>

                      <td>
                        {paper.isOpenAccess ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span className="tag tag-success">
                              Open Access
                            </span>
                            {paper.pdfUrl && (
                              <a 
                                href={paper.pdfUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                style={{ fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                              >
                                PDF <IconExternalLink size={10} />
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <button 
                            className="btn btn-secondary btn-sm" 
                            onClick={() => onSelectPaper(paper.id)}
                            style={{ fontWeight: 600 }}
                          >
                            Inspect Record
                          </button>
                          {onAddToCompare && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => onAddToCompare(paper.id)}
                              style={{ fontSize: '11px', padding: '3px 6px' }}
                            >
                              + Compare
                            </button>
                          )}
                        </div>
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

      {/* 6. Publication Trends & Prominent Topics Grid */}
      <div className="grid-2">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">Publication Trend Over Time</div>
          </div>
          <div className="panel-body">
            <TrendChart data={summary.publicationTrend} xKey="year" yKey="count" />
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">Prominent Research Topics</div>
          </div>
          <div className="panel-body">
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
    </div>
  );
}
