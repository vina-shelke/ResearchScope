import React, { useState, useEffect } from 'react';
import { comparePapers, fetchPapers } from '../api/client';
import { IconDownload, IconExternalLink, IconClose, IconSparkles, IconCompare } from './Icons';
import { useToast } from './Toast';
import MethodologyAnalyzerView from './MethodologyAnalyzerView';

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
  const [showLatexModal, setShowLatexModal] = useState(false);
  const [comparisonMode, setComparisonMode] = useState('synthesis'); // 'synthesis' | 'methodology'

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

  // Generate publication-ready LaTeX tabular code for Overleaf and paper submissions
  const generateLatexTableCode = () => {
    if (!matrix || !matrix.papers || matrix.papers.length === 0) return '';
    const currentYear = new Date().getFullYear();

    let latex = `% ==========================================================\n`;
    latex += `% Comparative Literature Review Matrix\n`;
    latex += `% Generated by ResearchScope Academic Platform\n`;
    latex += `% ==========================================================\n`;
    latex += `\\begin{table*}[htbp]\n`;
    latex += `\\centering\n`;
    latex += `\\small\n`;
    latex += `\\caption{Comparative Synthesis of Evaluated Publications}\n`;
    latex += `\\label{tab:literature-review-comparison}\n`;
    latex += `\\begin{tabular}{p{4.2cm}ccclp{5.5cm}}\n`;
    latex += `\\hline\\hline\n`;
    latex += `\\textbf{Publication} & \\textbf{Year} & \\textbf{Citations} & \\textbf{Velocity} & \\textbf{Open Access} & \\textbf{Methodological Focus / Benchmark} \\\\\n`;
    latex += `\\hline\n`;

    matrix.papers.forEach(p => {
      const cleanTitle = (p.title || 'Untitled')
        .replace(/&/g, '\\&')
        .replace(/_/g, '\\_')
        .replace(/%/g, '\\%')
        .replace(/#/g, '\\#')
        .slice(0, 48);
      const year = p.publicationYear || 'n.d.';
      const citations = p.citationCount || 0;
      const yearsElapsed = Math.max(1, currentYear - (p.publicationYear || currentYear));
      const velocity = Math.round(citations / yearsElapsed);
      const oa = p.isOpenAccess ? 'Yes' : 'No';
      const methods = (p.methodsAndAlgorithms && p.methodsAndAlgorithms.length > 0)
        ? p.methodsAndAlgorithms.join(', ').replace(/&/g, '\\&').slice(0, 55)
        : (p.researchProblem || 'Empirical Study').replace(/&/g, '\\&').slice(0, 55);

      latex += `${cleanTitle}... & ${year} & ${citations} & ${velocity}/yr & ${oa} & ${methods} \\\\\n`;
    });

    latex += `\\hline\\hline\n`;
    latex += `\\end{tabular}\n`;
    latex += `\\end{table*}\n`;
    return latex;
  };

  const handleCopyLatex = () => {
    const code = generateLatexTableCode();
    navigator.clipboard.writeText(code).then(() => {
      toast.success('LaTeX table code copied to clipboard for Overleaf.');
    }).catch(() => {
      toast.error('Failed to copy LaTeX code.');
    });
  };

  const handleDownloadLatex = () => {
    const code = generateLatexTableCode();
    const blob = new Blob([code], { type: 'text/x-tex;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `literature-matrix-${new Date().toISOString().slice(0, 10)}.tex`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast.success('LaTeX table (.tex) downloaded.');
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
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => setShowLatexModal(true)}
                  title="Generate LaTeX tabular code for Overleaf and scientific papers"
                >
                  Export LaTeX Table
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search to add paper inline */}
        {comparisonIds.length < 5 && (
          <form onSubmit={handleSearchAdd} style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="search-input"
              style={{ flex: '1 1 240px', minWidth: 0, fontSize: '12.5px', padding: '6px 14px' }}
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

      {/* Mode Switcher Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        borderBottom: '2px solid var(--border-color)',
        marginBottom: '20px'
      }}>
        <button
          type="button"
          onClick={() => setComparisonMode('synthesis')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: comparisonMode === 'synthesis' ? 700 : 500,
            color: comparisonMode === 'synthesis' ? 'var(--text-main)' : 'var(--text-muted)',
            border: 'none',
            borderBottom: comparisonMode === 'synthesis' ? '2px solid var(--text-main)' : '2px solid transparent',
            background: 'none',
            cursor: 'pointer',
            marginBottom: '-2px'
          }}
        >
          <IconCompare size={15} /> Comparative Synthesis & Matrix
        </button>

        <button
          type="button"
          onClick={() => setComparisonMode('methodology')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: comparisonMode === 'methodology' ? 700 : 500,
            color: comparisonMode === 'methodology' ? 'var(--accent)' : 'var(--text-muted)',
            border: 'none',
            borderBottom: comparisonMode === 'methodology' ? '2px solid var(--accent)' : '2px solid transparent',
            background: 'none',
            cursor: 'pointer',
            marginBottom: '-2px'
          }}
        >
          <IconSparkles size={15} /> Methodology Analyzer (11 Dimensions)
        </button>
      </div>

      {comparisonMode === 'methodology' ? (
        <MethodologyAnalyzerView
          paperIds={comparisonIds}
          onSelectPaper={onSelectPaper}
        />
      ) : (
        <>
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

      {/* LaTeX Table Export Modal */}
      {showLatexModal && (
        <div className="modal-overlay" onClick={() => setShowLatexModal(false)}>
          <div 
            className="modal-card" 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '780px', padding: '0', overflow: 'hidden' }}
          >
            <div className="modal-header" style={{ padding: '18px 24px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="tag tag-accent">LaTeX Export</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Overleaf & TeX Ready</span>
                </div>
                <h2 className="modal-title" style={{ fontSize: '18px', lineHeight: 1.35 }}>
                  Comparative Synthesis Table Code
                </h2>
              </div>
              <button className="modal-close" onClick={() => setShowLatexModal(false)} title="Close dialog">&times;</button>
            </div>

            <div style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>
                Paste this table snippet directly into your LaTeX or Overleaf manuscript. Special characters are pre-escaped.
              </p>

              <pre
                style={{
                  backgroundColor: 'var(--bg-recessed)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '11.5px',
                  lineHeight: '1.5',
                  color: 'var(--text-main)',
                  whiteSpace: 'pre',
                  overflowX: 'auto',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  margin: '0 0 20px 0'
                }}
              >
                {generateLatexTableCode()}
              </pre>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleDownloadLatex}
                >
                  <IconDownload size={14} /> Download .TEX File
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleCopyLatex}
                    style={{ fontWeight: 600 }}
                  >
                    Copy LaTeX Code
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowLatexModal(false)}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
