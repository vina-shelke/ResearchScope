import React, { useState, useEffect } from 'react';
import { 
  analyzeMethodology, 
  updateMethodologyField, 
  getMethodologyCsvUrl 
} from '../api/client';
import { 
  IconCheck, 
  IconPencil, 
  IconDownload, 
  IconExternalLink, 
  IconSparkles, 
  IconClose, 
  IconInfo, 
  IconPaper,
  IconFilter
} from './Icons';
import { useToast } from './Toast';
import SourceEvidenceDrawer from './SourceEvidenceDrawer';

export default function MethodologyAnalyzerView({
  paperIds = [],
  onSelectPaper,
  onClose
}) {
  const toast = useToast();
  const [matrix, setMatrix] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('ALL');
  const [highlightDifferences, setHighlightDifferences] = useState(false);

  // Editing state
  const [editingCell, setEditingCell] = useState(null); // { paperId, paperTitle, fieldKey, fieldLabel, currentValue }
  const [editValue, setEditValue] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Evidence Drawer state
  const [evidenceDrawerOpen, setEvidenceDrawerOpen] = useState(false);
  const [selectedEvidenceList, setSelectedEvidenceList] = useState([]);
  const [evidencePaperTitle, setEvidencePaperTitle] = useState('');

  const loadData = () => {
    if (!paperIds || paperIds.length === 0) {
      setMatrix(null);
      return;
    }
    setLoading(true);
    analyzeMethodology(paperIds)
      .then(res => {
        setMatrix(res);
      })
      .catch(err => {
        console.error('Failed to analyze methodology:', err);
        toast.error('Failed to load methodology analysis.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [JSON.stringify(paperIds)]);

  // Handle cell edit trigger
  const handleStartEdit = (paper, fieldKey, fieldLabel) => {
    let currentVal = paper[fieldKey];
    if (Array.isArray(currentVal)) {
      currentVal = currentVal.join(', ');
    }
    setEditingCell({
      paperId: paper.paperId,
      paperTitle: paper.title,
      fieldKey,
      fieldLabel,
      currentValue: currentVal || ''
    });
    setEditValue(currentVal || '');
  };

  // Submit cell edit
  const handleSaveEdit = async () => {
    if (!editingCell) return;
    setSavingEdit(true);
    try {
      const updated = await updateMethodologyField(
        editingCell.paperId,
        editingCell.fieldKey,
        editValue
      );
      // Update local matrix state
      setMatrix(prev => {
        if (!prev || !prev.papers) return prev;
        const newPapers = prev.papers.map(p => {
          if (p.paperId === editingCell.paperId) {
            return {
              ...p,
              [editingCell.fieldKey]: Array.isArray(p[editingCell.fieldKey])
                ? editValue.split(',').map(s => s.trim()).filter(Boolean)
                : editValue,
              confidenceScores: {
                ...p.confidenceScores,
                [editingCell.fieldKey]: 'HIGH (User Verified)'
              },
              manualCorrections: {
                ...p.manualCorrections,
                [editingCell.fieldKey]: editValue
              }
            };
          }
          return p;
        });
        return { ...prev, papers: newPapers };
      });
      toast.success(`Updated ${editingCell.fieldLabel} and marked as User Verified.`);
      setEditingCell(null);
    } catch (err) {
      console.error('Failed to save correction:', err);
      toast.error('Could not save methodology correction.');
    } finally {
      setSavingEdit(false);
    }
  };

  // View grounded evidence for a paper & dimension
  const handleViewEvidence = (paper, fieldKey, fieldLabel) => {
    let val = paper[fieldKey];
    if (Array.isArray(val)) val = val.join(', ');
    
    const evidence = [{
      paperId: paper.paperId,
      paperTitle: paper.title,
      doi: paper.doi,
      citationCount: paper.citationCount,
      sectionName: fieldLabel,
      statementType: paper.confidenceScores?.[fieldKey]?.includes('User') 
        ? 'USER_VERIFIED' 
        : (paper.confidenceScores?.[fieldKey] === 'HIGH' ? 'DIRECTLY_REPORTED' : 'AI_INFERRED'),
      extractedText: val || 'No specific text extract available.',
      confidence: paper.confidenceScores?.[fieldKey] || 'MEDIUM',
      openAccessPdfUrl: null
    }];

    setSelectedEvidenceList(evidence);
    setEvidencePaperTitle(paper.title);
    setEvidenceDrawerOpen(true);
  };

  // Render confidence badge
  const renderConfidenceBadge = (confidence) => {
    const conf = confidence || 'MEDIUM';
    let bg = 'rgba(59, 130, 246, 0.12)';
    let color = 'var(--accent)';
    let text = conf;
    let isVerified = false;

    if (conf.includes('User Verified') || conf.includes('Verified')) {
      bg = 'rgba(16, 185, 129, 0.15)';
      color = '#10b981';
      text = 'User Verified';
      isVerified = true;
    } else if (conf === 'HIGH') {
      bg = 'rgba(16, 185, 129, 0.12)';
      color = '#10b981';
      text = 'High';
    } else if (conf === 'MEDIUM') {
      bg = 'rgba(59, 130, 246, 0.12)';
      color = '#3b82f6';
      text = 'Medium';
    } else if (conf === 'LOW') {
      bg = 'rgba(245, 158, 11, 0.15)';
      color = '#f59e0b';
      text = 'Low';
    } else if (conf === 'NOT_AVAILABLE') {
      bg = 'var(--bg-alt)';
      color = 'var(--text-muted)';
      text = 'N/A';
    }

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 7px',
          borderRadius: '10px',
          fontSize: '10.5px',
          fontWeight: 700,
          backgroundColor: bg,
          color: color,
          letterSpacing: '0.02em',
          userSelect: 'none'
        }}
        title={`Extraction confidence score: ${conf}`}
      >
        {isVerified && <IconCheck size={11} />}
        {text}
      </span>
    );
  };

  // 11 Core Dimensions Configuration
  const dimensions = [
    {
      key: 'methodologyType',
      label: 'Methodology Type',
      description: 'Empirical, Theoretical, Survey, Experimental, Qualitative, Quantitative, or Mixed.',
      renderCell: (val) => (
        <span className="tag tag-accent" style={{ fontWeight: 700, fontSize: '11.5px' }}>
          {val || 'Empirical'}
        </span>
      )
    },
    {
      key: 'researchDesign',
      label: 'Research Design',
      description: 'Study architecture, control protocols, hypothesis formulation, and research setup.',
      renderCell: (val) => val || 'Not specified in publication'
    },
    {
      key: 'datasetUsed',
      label: 'Dataset Used',
      description: 'Primary, secondary, benchmark, or proprietary corpora.',
      renderCell: (val) => (
        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
          {val || 'Benchmark / Not specified'}
        </span>
      )
    },
    {
      key: 'sampleSize',
      label: 'Sample Size',
      description: 'Number of subjects, observations, tokens, or evaluation instances.',
      renderCell: (val) => val || 'Not reported'
    },
    {
      key: 'dataCollectionMethod',
      label: 'Data Collection Method',
      description: 'API ingestion, human evaluation, web crawling, telemetry, or simulation.',
      renderCell: (val) => val || 'Systematic extraction'
    },
    {
      key: 'toolsAndTechnologies',
      label: 'Tools & Technologies',
      description: 'Frameworks, programming languages, libraries, platforms, and compute hardware.',
      renderCell: (val) => {
        const list = Array.isArray(val) ? val : (val ? val.split(',').map(s => s.trim()) : []);
        if (list.length === 0) return <span style={{ color: 'var(--text-muted)' }}>Not specified</span>;
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {list.map((item, idx) => (
              <span key={idx} className="tag" style={{ fontSize: '11px', padding: '2px 6px' }}>
                {item}
              </span>
            ))}
          </div>
        );
      }
    },
    {
      key: 'algorithmsUsed',
      label: 'Algorithms & Models',
      description: 'Machine learning architectures, mathematical optimizers, heuristics, and baselines.',
      renderCell: (val) => {
        const list = Array.isArray(val) ? val : (val ? val.split(',').map(s => s.trim()) : []);
        if (list.length === 0) return <span style={{ color: 'var(--text-muted)' }}>Not specified</span>;
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {list.map((item, idx) => (
              <span key={idx} className="tag tag-accent" style={{ fontSize: '11px', padding: '2px 6px' }}>
                {item}
              </span>
            ))}
          </div>
        );
      }
    },
    {
      key: 'evaluationMetrics',
      label: 'Evaluation Metrics',
      description: 'Quantitative benchmarks, statistical significance, precision, recall, latency, accuracy.',
      renderCell: (val) => {
        const list = Array.isArray(val) ? val : (val ? val.split(',').map(s => s.trim()) : []);
        if (list.length === 0) return <span style={{ color: 'var(--text-muted)' }}>Not specified</span>;
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {list.map((item, idx) => (
              <span key={idx} style={{ 
                fontSize: '11px', 
                padding: '2px 6px', 
                backgroundColor: 'var(--bg-alt)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '4px',
                fontWeight: 600
              }}>
                {item}
              </span>
            ))}
          </div>
        );
      }
    },
    {
      key: 'experimentalSetup',
      label: 'Experimental Setup',
      description: 'Hardware, execution parameters, train/test splitting, and baseline comparison models.',
      renderCell: (val) => val || 'Standard benchmarking protocol'
    },
    {
      key: 'researchResults',
      label: 'Research Results',
      description: 'Key empirical outcomes, metric deltas, and state-of-the-art comparisons.',
      renderCell: (val) => (
        <span style={{ lineHeight: '1.5' }}>
          {val || 'Findings summarized in publication findings.'}
        </span>
      )
    },
    {
      key: 'limitationsAndThreats',
      label: 'Limitations & Validity Threats',
      description: 'Internal, external, construct validity threats, and computational constraints.',
      renderCell: (val) => (
        <span style={{ 
          fontStyle: val && val !== 'Not reported' ? 'italic' : 'normal',
          color: val && val !== 'Not reported' ? 'var(--text-muted)' : 'inherit'
        }}>
          {val || 'No explicit methodology threats declared.'}
        </span>
      )
    }
  ];

  const displayedPapers = (matrix && matrix.papers) 
    ? matrix.papers.filter(p => filterType === 'ALL' || (p.methodologyType && p.methodologyType.toUpperCase() === filterType.toUpperCase()))
    : [];

  return (
    <div className="methodology-analyzer-view">
      {/* Top Banner & Controls */}
      <div className="panel" style={{ marginBottom: '20px', padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                color: 'var(--accent)'
              }}>
                <IconSparkles size={18} />
              </span>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                Research Methodology Analyzer
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, maxWidth: '650px', lineHeight: '1.5' }}>
              In-depth extraction and comparative matrix across 11 empirical dimensions with confidence indicators, grounded source verification, and editable human corrections.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={highlightDifferences}
                onChange={(e) => setHighlightDifferences(e.target.checked)}
              />
              Highlight Differences
            </label>

            {paperIds.length > 0 && (
              <a
                href={getMethodologyCsvUrl(paperIds)}
                download="research-methodology-matrix.csv"
                className="btn btn-secondary btn-sm"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <IconDownload size={14} /> Export CSV
              </a>
            )}

            {onClose && (
              <button className="btn btn-secondary btn-sm" onClick={onClose}>
                <IconClose size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Methodology Type Filter and Stats Bar */}
        {matrix && matrix.papers && matrix.papers.length > 0 && (
          <div style={{ 
            marginTop: '16px', 
            paddingTop: '16px', 
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <IconFilter size={12} /> Filter Type:
              </span>
              {['ALL', 'EMPIRICAL', 'THEORETICAL', 'EXPERIMENTAL', 'SURVEY', 'QUALITATIVE', 'QUANTITATIVE'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFilterType(t)}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: filterType === t ? 700 : 500,
                    border: '1px solid var(--border-color)',
                    backgroundColor: filterType === t ? 'var(--text-main)' : 'var(--bg-surface)',
                    color: filterType === t ? 'var(--bg-surface)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {t === 'ALL' ? 'All Types' : t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Showing {displayedPapers.length} of {matrix.papers.length} publications
            </div>
          </div>
        )}
      </div>

      {/* Aggregate Overview Chips: Datasets & Technologies */}
      {matrix && !loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '16px', marginBottom: '20px' }}>
          {/* Technologies Overview */}
          <div className="panel" style={{ padding: '14px 18px', minWidth: 0, boxSizing: 'border-box' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
              Identified Tools & Technologies
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {matrix.technologyDistribution && Object.keys(matrix.technologyDistribution).length > 0 ? (
                Object.entries(matrix.technologyDistribution).map(([tech, count]) => (
                  <span key={tech} className="tag tag-accent" style={{ fontSize: '11.5px', padding: '3px 8px' }}>
                    {tech} <strong style={{ marginLeft: '4px', opacity: 0.8 }}>({count})</strong>
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Standard academic computation frameworks</span>
              )}
            </div>
          </div>

          {/* Datasets Overview */}
          <div className="panel" style={{ padding: '14px 18px', minWidth: 0, boxSizing: 'border-box' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
              Identified Benchmarks & Datasets
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {matrix.datasetDistribution && Object.keys(matrix.datasetDistribution).length > 0 ? (
                Object.entries(matrix.datasetDistribution).map(([ds, count]) => (
                  <span key={ds} className="tag" style={{ fontSize: '11.5px', padding: '3px 8px' }}>
                    {ds} <strong style={{ marginLeft: '4px', opacity: 0.8 }}>({count})</strong>
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Empirical experimental datasets</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="panel" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <div style={{
            display: 'inline-block',
            width: '28px',
            height: '28px',
            border: '3px solid var(--border-color)',
            borderTopColor: 'var(--accent)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            marginBottom: '16px'
          }} />
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
            Extracting 11 Methodology Dimensions...
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Parsing experimental setups, confidence scores, and empirical validation protocols.
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && (!paperIds || paperIds.length === 0) && (
        <div className="panel" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
            No Papers Selected for Methodology Analysis
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto' }}>
            Select 2 or more research papers from the Explore tab or Paper Comparison Lab to run an automated deep methodology extraction.
          </p>
        </div>
      )}

      {/* 11-Dimension Methodology Table */}
      {!loading && displayedPapers.length > 0 && (
        <div className="panel" style={{ padding: 0, overflowX: 'auto', border: '1px solid var(--border-color)' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '13px',
            minWidth: `${Math.max(750, 240 + displayedPapers.length * 280)}px`
          }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-alt)', borderBottom: '2px solid var(--border-color)' }}>
                {/* Dimension Header */}
                <th style={{
                  padding: '16px 20px',
                  width: '220px',
                  position: 'sticky',
                  left: 0,
                  backgroundColor: 'var(--bg-alt)',
                  zIndex: 2,
                  boxShadow: '2px 0 4px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Methodology Dimension
                  </div>
                </th>

                {/* Paper Columns */}
                {displayedPapers.map(paper => (
                  <th key={paper.paperId} style={{
                    padding: '16px 20px',
                    width: '300px',
                    verticalAlign: 'top',
                    borderLeft: '1px solid var(--border-color)'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div 
                        style={{ 
                          fontSize: '13.5px', 
                          fontWeight: 700, 
                          color: 'var(--text-main)', 
                          cursor: onSelectPaper ? 'pointer' : 'default',
                          lineHeight: '1.4'
                        }}
                        onClick={() => onSelectPaper && onSelectPaper(paper.paperId)}
                        title="Click to view full paper details"
                      >
                        {paper.title}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                        <span>{paper.publicationYear || 'n.d.'}</span>
                        {paper.citationCount != null && (
                          <span>• {paper.citationCount.toLocaleString()} citations</span>
                        )}
                        {paper.doi && (
                          <a 
                            href={`https://doi.org/${paper.doi}`} 
                            target="_blank" 
                            rel="noreferrer"
                            style={{ color: 'var(--accent)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                            title="Open DOI"
                          >
                            DOI <IconExternalLink size={11} />
                          </a>
                        )}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {dimensions.map((dim, dimIdx) => {
                // Check if all papers have distinct values for highlight
                const values = displayedPapers.map(p => {
                  const val = p[dim.key];
                  return Array.isArray(val) ? val.join(',') : (val || '');
                });
                const isDifferent = highlightDifferences && new Set(values).size > 1;

                return (
                  <tr 
                    key={dim.key} 
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      backgroundColor: isDifferent 
                        ? 'rgba(59, 130, 246, 0.04)' 
                        : (dimIdx % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-main)')
                    }}
                  >
                    {/* Dimension Label (Sticky Column) */}
                    <td style={{
                      padding: '16px 20px',
                      position: 'sticky',
                      left: 0,
                      backgroundColor: isDifferent 
                        ? 'rgba(59, 130, 246, 0.06)' 
                        : (dimIdx % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-main)'),
                      zIndex: 1,
                      boxShadow: '2px 0 4px rgba(0,0,0,0.05)',
                      verticalAlign: 'top',
                      borderRight: '1px solid var(--border-color)'
                    }}>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-main)', marginBottom: '4px' }}>
                        {dim.label}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                        {dim.description}
                      </div>
                    </td>

                    {/* Paper Values */}
                    {displayedPapers.map(paper => {
                      const confidence = paper.confidenceScores?.[dim.key] || 'MEDIUM';
                      const isUserVerified = confidence.includes('User Verified');

                      return (
                        <td 
                          key={paper.paperId} 
                          style={{
                            padding: '14px 18px',
                            verticalAlign: 'top',
                            borderLeft: '1px solid var(--border-color)',
                            position: 'relative'
                          }}
                        >
                          {/* Top row: Confidence score and Action buttons */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            {renderConfidenceBadge(confidence)}

                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '2px 6px', fontSize: '11px' }}
                                onClick={() => handleViewEvidence(paper, dim.key, dim.label)}
                                title="Inspect grounded source evidence excerpts"
                              >
                                <IconSparkles size={11} /> Evidence
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '2px 6px', fontSize: '11px' }}
                                onClick={() => handleStartEdit(paper, dim.key, dim.label)}
                                title="Edit & record user verification"
                              >
                                <IconPencil size={11} />
                              </button>
                            </div>
                          </div>

                          {/* Cell Value */}
                          <div style={{ color: 'var(--text-main)', lineHeight: '1.5' }}>
                            {dim.renderCell(paper[dim.key])}
                          </div>

                          {/* User verified indicator */}
                          {isUserVerified && (
                            <div style={{ marginTop: '6px', fontSize: '10.5px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <IconCheck size={11} /> Manually verified by researcher
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Manual Correction Modal */}
      {editingCell && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(3px)',
          zIndex: 1200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
        onClick={() => setEditingCell(null)}
        >
          <div 
            className="panel" 
            style={{ 
              width: '100%', 
              maxWidth: '540px', 
              backgroundColor: 'var(--bg-surface)', 
              boxShadow: 'var(--shadow-skeuo-modal)',
              padding: '24px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                Edit & Verify: {editingCell.fieldLabel}
              </h3>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                onClick={() => setEditingCell(null)}
              >
                <IconClose size={14} />
              </button>
            </div>

            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: '1.4' }}>
              <strong>Publication:</strong> {editingCell.paperTitle}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Corrected Value / Verified Details
              </label>
              <textarea
                rows={4}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter corrected methodology value..."
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Saving this correction updates the database record and sets confidence to <strong>High (User Verified)</strong>.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                onClick={() => setEditingCell(null)}
                disabled={savingEdit}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary btn-sm" 
                onClick={handleSaveEdit}
                disabled={savingEdit}
              >
                {savingEdit ? 'Saving Correction...' : 'Save & Verify'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grounded Source Evidence Drawer */}
      <SourceEvidenceDrawer
        isOpen={evidenceDrawerOpen}
        onClose={() => setEvidenceDrawerOpen(false)}
        evidenceList={selectedEvidenceList}
        citedPapers={[]}
        onSelectPaper={onSelectPaper}
      />
    </div>
  );
}
