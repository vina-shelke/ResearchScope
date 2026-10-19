import React, { useState, useEffect } from 'react';
import { comparePapers, fetchPapers } from '../api/client';

export default function PaperComparisonView({ comparisonIds = [], onRemoveFromComparison, onClearComparison, onSelectPaper }) {
  const [matrix, setMatrix] = useState(null);
  const [loading, setLoading] = useState(false);
  const [highlightDifferences, setHighlightDifferences] = useState(true);
  const [searchAddQuery, setSearchAddQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (comparisonIds && comparisonIds.length > 0) {
      setLoading(true);
      comparePapers(comparisonIds)
        .then(setMatrix)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setMatrix(null);
    }
  }, [comparisonIds]);

  const handleSearchAdd = (e) => {
    e.preventDefault();
    if (!searchAddQuery.trim()) return;
    setSearching(true);
    fetchPapers({ q: searchAddQuery.trim(), size: 5 })
      .then((data) => setSearchResults(data.content || []))
      .catch(console.error)
      .finally(() => setSearching(false));
  };

  const handleExportCsv = () => {
    if (!comparisonIds || comparisonIds.length === 0) return;
    const url = `/api/paper-comparison/export/csv`;
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paperIds: comparisonIds })
    })
      .then(res => res.blob())
      .then(blob => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = 'research-paper-comparison.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(console.error);
  };

  const dimensions = [
    { key: 'year', label: 'Publication Year', render: (p) => p.publicationYear || 'Not available' },
    { key: 'authors', label: 'Authors', render: (p) => p.authors?.join(', ') || 'Not available' },
    { key: 'venue', label: 'Venue / Conference', render: (p) => p.venue || 'Not available' },
    { key: 'citations', label: 'Citation Count', render: (p) => p.citationCount != null ? p.citationCount : 'Not available' },
    { key: 'oa', label: 'Open Access', render: (p) => p.isOpenAccess ? '✓ Verified Open Access' : 'Subscription / Closed' },
    { key: 'problem', label: 'Research Problem & Objectives', render: (p) => p.researchProblem || 'Not available' },
    { key: 'questions', label: 'Research Questions', render: (p) => p.researchQuestions || 'Not available' },
    { key: 'methods', label: 'Methods & Algorithms', render: (p) => (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {p.methodsAndAlgorithms?.map((m, i) => (
          <span key={i} className="tag tag-accent" style={{ fontSize: '11px' }}>{m}</span>
        ))}
      </div>
    )},
    { key: 'datasets', label: 'Datasets & Sample Size', render: (p) => p.datasetsAndSamples || 'Not available' },
    { key: 'metrics', label: 'Evaluation Metrics', render: (p) => (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {p.evaluationMetrics?.map((m, i) => (
          <span key={i} className="tag" style={{ fontSize: '11px' }}>{m}</span>
        ))}
      </div>
    )},
    { key: 'findings', label: 'Main Findings', render: (p) => p.mainFindings || 'Not available' },
    { key: 'limitations', label: 'Reported Limitations', render: (p) => (
      <div style={{ color: p.limitations !== 'Not available' ? '#b45309' : 'inherit', fontStyle: p.limitations !== 'Not available' ? 'italic' : 'normal' }}>
        {p.limitations}
      </div>
    )},
    { key: 'future', label: 'Future Research Directions', render: (p) => p.futureDirections || 'Not available' },
    { key: 'doi', label: 'DOI / Link', render: (p) => p.doi !== 'Not available' ? (
      <a href={`https://doi.org/${p.doi}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
        {p.doi} ↗
      </a>
    ) : 'Not available' }
  ];

  return (
    <div>
      <div className="section-header">
        <h1 className="section-title">Research Paper Comparison Lab</h1>
        <div className="section-description">
          Conduct structured, side-by-side comparative analysis of selected publications across research problems, methodologies, datasets, findings, and limitations.
        </div>
      </div>

      {/* Control Bar & Tray Header */}
      <div className="panel" style={{ marginBottom: '20px', padding: '14px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontWeight: 700, fontSize: '14px' }}>
              Comparison Tray ({comparisonIds.length} / 5 papers)
            </span>
            {comparisonIds.length > 0 && (
              <button className="btn btn-secondary btn-sm" onClick={onClearComparison}>
                Clear Tray
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={highlightDifferences}
                onChange={(e) => setHighlightDifferences(e.target.checked)}
              />
              Highlight Differences
            </label>

            {comparisonIds.length >= 2 && (
              <button className="btn btn-secondary btn-sm" onClick={handleExportCsv}>
                ⬇ Export Comparison as CSV
              </button>
            )}
          </div>
        </div>

        {/* Search to add paper inline */}
        {comparisonIds.length < 5 && (
          <form onSubmit={handleSearchAdd} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <input
              type="text"
              className="search-input"
              style={{ backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid var(--border-color)', fontSize: '13px', padding: '6px 12px' }}
              placeholder="Search paper title to add to comparison..."
              value={searchAddQuery}
              onChange={(e) => setSearchAddQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary btn-sm" disabled={searching}>
              {searching ? 'Searching...' : '+ Add Paper'}
            </button>
          </form>
        )}

        {/* Search Results Dropdown Preview */}
        {searchResults.length > 0 && (
          <div style={{ marginTop: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', maxHeight: '180px', overflowY: 'auto' }}>
            {searchResults.map((paper) => (
              <div
                key={paper.id}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#ffffff' }}
              >
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', maxWidth: '80%' }}>
                  {paper.title} ({paper.publicationYear})
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '11px', padding: '3px 8px' }}
                  onClick={() => {
                    if (!comparisonIds.includes(paper.id)) {
                      onRemoveFromComparison(null, paper.id); // Add callback
                    }
                    setSearchResults([]);
                    setSearchAddQuery('');
                  }}
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Empty State */}
      {comparisonIds.length === 0 && (
        <div className="panel" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>
            No Papers in Comparison Lab
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 20px auto' }}>
            Add 2 to 5 papers from the <strong>Explore Research</strong> search results or paper details using the <strong>"+ Add to Compare"</strong> action to generate a structured side-by-side comparison matrix.
          </p>
        </div>
      )}

      {loading && (
        <div className="panel" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
            Extracting comparative dimensions, grounding methodologies, and compiling matrix...
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Matrix */}
      {!loading && matrix && matrix.papers && matrix.papers.length > 0 && (
        <div>
          {/* Comparative Synthesis Bar */}
          <div className="panel" style={{ marginBottom: '20px', backgroundColor: '#f8fafc', borderLeft: '4px solid var(--accent)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>Comparative Synthesis</h3>
            <p style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6', marginBottom: '10px' }}>
              {matrix.synthesisSummary}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '12px' }}>
              {matrix.commonMethods && matrix.commonMethods.length > 0 && (
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Shared Methodologies: </span>
                  {matrix.commonMethods.map(m => (
                    <span key={m} className="tag tag-accent" style={{ marginRight: '4px' }}>{m}</span>
                  ))}
                </div>
              )}

              {matrix.commonLimitations && matrix.commonLimitations.length > 0 && (
                <div>
                  <span style={{ fontWeight: 700, color: '#b45309' }}>Recurring Limitations: </span>
                  {matrix.commonLimitations.map((l, i) => (
                    <span key={i} style={{ fontStyle: 'italic', color: '#78350f', marginRight: '8px' }}>• "{l}"</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Structured Table Matrix */}
          <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: '#ffffff' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--primary)', color: '#ffffff' }}>
                  <th style={{ padding: '14px 16px', width: '200px', minWidth: '180px', fontWeight: 700, borderRight: '1px solid #334155' }}>
                    Evaluation Dimension
                  </th>
                  {matrix.papers.map((paper) => (
                    <th key={paper.paperId} style={{ padding: '14px 16px', minWidth: '260px', verticalAlign: 'top', borderRight: '1px solid #334155' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div style={{ fontWeight: 700, fontSize: '14px', lineHeight: '1.4' }}>
                          <button
                            type="button"
                            style={{ background: 'none', border: 'none', padding: 0, color: '#ffffff', textAlign: 'left', cursor: 'pointer', fontWeight: 700 }}
                            onClick={() => onSelectPaper(paper.paperId)}
                          >
                            {paper.title}
                          </button>
                        </div>
                        <button
                          type="button"
                          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}
                          onClick={() => onRemoveFromComparison(paper.paperId)}
                          title="Remove from comparison"
                        >
                          ✕
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {dimensions.map((dim, idx) => (
                  <tr
                    key={dim.key}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc'
                    }}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-main)', borderRight: '1px solid var(--border-color)', backgroundColor: 'var(--bg-alt)' }}>
                      {dim.label}
                    </td>

                    {matrix.papers.map((paper) => (
                      <td
                        key={paper.paperId}
                        style={{
                          padding: '12px 16px',
                          verticalAlign: 'top',
                          lineHeight: '1.5',
                          borderRight: '1px solid var(--border-color)'
                        }}
                      >
                        {dim.render(paper)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
