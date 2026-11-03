import React, { useState, useEffect } from 'react';
import { comparePapers, fetchPapers } from '../api/client';
import { IconDownload, IconExternalLink, IconClose } from './Icons';
import { useToast } from './Toast';

export default function PaperComparisonView({ 
  comparisonIds: propComparisonIds,
  initialPaperIds,
  onRemoveFromComparison,
  onRemovePaper,
  onClearComparison,
  onClearAll,
  onSelectPaper 
}) {
  const toast = useToast();
  const comparisonIds = propComparisonIds || initialPaperIds || [];
  const handleRemove = onRemoveFromComparison || onRemovePaper;
  const handleClear = onClearComparison || onClearAll;

  const [matrix, setMatrix] = useState(null);
  const [loading, setLoading] = useState(false);
  const [highlightDifferences, setHighlightDifferences] = useState(true);
  const [searchAddQuery, setSearchAddQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSynthesis, setShowSynthesis] = useState(false);

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
        toast.success('Comparison matrix exported to CSV.');
      })
      .catch(err => {
        console.error(err);
        toast.error('Failed to export CSV.');
      });
  };

  // Generate structured literature review synthesis text
  const generateSynthesisText = () => {
    if (!matrix || !matrix.papers || matrix.papers.length === 0) return '';
    const papers = matrix.papers;
    const titles = papers.map(p => `"${p.title}" (${p.publicationYear || 'n.d.'})`).join(', ');
    
    let text = `# Literature Review Synthesis\n\n`;
    text += `## 1. Domain Corpus & Focus\n`;
    text += `This synthesis evaluates ${papers.length} scholarly investigations in this research space: ${titles}.\n\n`;
    
    text += `## 2. Methodological Divergence & Empirical Approaches\n`;
    papers.forEach(p => {
      const methods = (p.methodsAndAlgorithms && p.methodsAndAlgorithms.length > 0)
        ? p.methodsAndAlgorithms.join(', ')
        : 'heuristic approaches';
      const datasets = p.datasetsAndSamples || 'empirical benchmarks';
      text += `- **${p.title}** (${p.publicationYear}): Utilizes ${methods} evaluated against ${datasets}.\n`;
    });
    text += `\n`;

    if (matrix.commonMethods && matrix.commonMethods.length > 0) {
      text += `Shared technical foundations across the reviewed literature include: ${matrix.commonMethods.join(', ')}.\n\n`;
    }

    text += `## 3. Comparative Findings & Critical Gaps\n`;
    papers.forEach(p => {
      if (p.mainFindings && p.mainFindings !== 'Not available') {
        text += `- **${p.title}**: Demonstrated that ${p.mainFindings}.\n`;
      }
      if (p.limitations && p.limitations !== 'Not available') {
        text += `  - *Limitation*: ${p.limitations}\n`;
      }
    });
    text += `\n`;

    if (matrix.synthesisSummary) {
      text += `## 4. Overall Consensus\n`;
      text += `${matrix.synthesisSummary}\n`;
    }

    return text;
  };

  const handleCopySynthesis = () => {
    const text = generateSynthesisText();
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Literature review synthesis copied to clipboard.');
    }).catch(() => {
      toast.error('Failed to copy text to clipboard.');
    });
  };

  const handleDownloadSynthesis = () => {
    const text = generateSynthesisText();
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `literature-review-synthesis-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast.success('Literature review markdown downloaded.');
  };

  const dimensions = [
    { key: 'year', label: 'Publication Year', render: (p) => p.publicationYear || 'Not available' },
    { key: 'authors', label: 'Authors', render: (p) => p.authors?.join(', ') || 'Not available' },
    { key: 'venue', label: 'Venue / Conference', render: (p) => p.venue || 'Not available' },
    { key: 'citations', label: 'Citation Count', render: (p) => p.citationCount != null ? p.citationCount : 'Not available' },
    { key: 'oa', label: 'Open Access', render: (p) => p.isOpenAccess ? 'Verified Open Access' : 'Subscription / Closed' },
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
      <div style={{ color: p.limitations !== 'Not available' ? 'var(--text-muted)' : 'inherit', fontStyle: p.limitations !== 'Not available' ? 'italic' : 'normal' }}>
        {p.limitations}
      </div>
    )},
    { key: 'future', label: 'Future Research Directions', render: (p) => p.futureDirections || 'Not available' },
    { key: 'doi', label: 'DOI / Link', render: (p) => p.doi !== 'Not available' ? (
      <a href={`https://doi.org/${p.doi}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        {p.doi} <IconExternalLink size={12} />
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
            {comparisonIds.length > 0 && handleClear && (
              <button className="btn btn-secondary btn-sm" onClick={handleClear}>
                Clear Tray
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={highlightDifferences}
                onChange={(e) => setHighlightDifferences(e.target.checked)}
              />
              Highlight Differences
            </label>

            {comparisonIds.length >= 2 && (
              <>
                <button 
                  className={`btn btn-sm ${showSynthesis ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setShowSynthesis(prev => !prev)}
                >
                  {showSynthesis ? 'Hide Synthesis' : 'Synthesize Literature Review'}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={handleExportCsv}>
                  <IconDownload size={14} /> Export CSV
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search to add paper inline */}
        {comparisonIds.length < 5 && (
          <form onSubmit={handleSearchAdd} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <input
              type="text"
              className="search-input"
              style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '13px', padding: '6px 12px' }}
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
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}
              >
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', maxWidth: '80%' }}>
                  {paper.title} ({paper.publicationYear})
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '11px', padding: '3px 8px' }}
                  onClick={() => {
                    if (handleRemove && !comparisonIds.includes(paper.id)) {
                      handleRemove(null, paper.id);
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

      {/* Literature Review Synthesis Panel */}
      {showSynthesis && matrix && matrix.papers && (
        <div className="synthesis-card fade-in" style={{ marginBottom: '24px' }}>
          <div className="synthesis-header">
            <div>
              <h3 className="synthesis-title">Synthesized Literature Review</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Cross-comparative synthesis derived from {matrix.papers.length} selected studies
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary btn-sm" onClick={handleCopySynthesis}>
                Copy Markdown
              </button>
              <button className="btn btn-secondary btn-sm" onClick={handleDownloadSynthesis}>
                <IconDownload size={13} /> Export .md
              </button>
            </div>
          </div>

          <div className="synthesis-body">
            <div className="synthesis-section">
              <div className="synthesis-label">Core Thematic Focus</div>
              <p style={{ margin: 0 }}>
                {matrix.synthesisSummary || 'The evaluated publications explore synergistic methodologies in this topic domain.'}
              </p>
            </div>

            <div className="synthesis-section">
              <div className="synthesis-label">Methodological Cross-Comparison</div>
              <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
                {matrix.papers.map(p => (
                  <li key={p.paperId} style={{ marginBottom: '6px' }}>
                    <strong>{p.title}</strong> ({p.publicationYear}): Employed {p.methodsAndAlgorithms?.join(', ') || 'specialized methodology'} tested on {p.datasetsAndSamples || 'designated benchmarks'}.
                  </li>
                ))}
              </ul>
            </div>

            <div className="synthesis-section">
              <div className="synthesis-label">Open Challenges & Limitations</div>
              <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
                {matrix.papers.map(p => (
                  p.limitations && p.limitations !== 'Not available' ? (
                    <li key={p.paperId} style={{ marginBottom: '4px' }}>
                      <em>{p.title}</em>: {p.limitations}
                    </li>
                  ) : null
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

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
          <div className="panel" style={{ marginBottom: '20px', backgroundColor: 'var(--bg-alt)', borderLeft: '4px solid var(--accent)', padding: '18px 24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>Comparative Synthesis</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '10px' }}>
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
                  <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Recurring Limitations: </span>
                  {matrix.commonLimitations.map((l, i) => (
                    <span key={i} style={{ fontStyle: 'italic', color: 'var(--text-subtle)', marginRight: '8px' }}>• "{l}"</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Structured Table Matrix */}
          <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--table-th-bg)', color: 'var(--text-main)' }}>
                  <th style={{ padding: '14px 16px', width: '200px', minWidth: '180px', fontWeight: 700, borderRight: '1px solid var(--border-color)' }}>
                    Evaluation Dimension
                  </th>
                  {matrix.papers.map((paper) => (
                    <th key={paper.paperId} style={{ padding: '14px 16px', minWidth: '260px', verticalAlign: 'top', borderRight: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div style={{ fontWeight: 700, fontSize: '14px', lineHeight: '1.4' }}>
                          <button
                            type="button"
                            style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-main)', textAlign: 'left', cursor: 'pointer', fontWeight: 700 }}
                            onClick={() => onSelectPaper && onSelectPaper(paper.paperId)}
                          >
                            {paper.title}
                          </button>
                        </div>
                        {handleRemove && (
                          <button
                            type="button"
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                            onClick={() => handleRemove(paper.paperId)}
                            title="Remove from comparison"
                          >
                            <IconClose size={13} />
                          </button>
                        )}
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
                      backgroundColor: idx % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-alt)'
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
