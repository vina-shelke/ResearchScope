import React, { useState, useEffect } from 'react';
import { fetchResearchGaps, saveGapAnalysis } from '../api/client';
import { IconCheck, IconBookmark } from './Icons';

export default function ResearchGapsView({ onSelectPaper, initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery || 'Generative AI in Education');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeEvidenceModal, setActiveEvidenceModal] = useState(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const suggestedTopics = [
    'Generative AI in Education',
    'Cybersecurity in Generative AI',
    'Adversarial Attacks on LLMs',
    'Healthcare Machine Learning Privacy',
    'Quantum Computing & Cryptography'
  ];

  const loadGaps = (searchTopic) => {
    setLoading(true);
    setError(null);
    setSaveSuccessMsg('');
    fetchResearchGaps(searchTopic, 30)
      .then((data) => {
        setAnalysis(data);
      })
      .catch((err) => {
        console.error('Failed to load research gaps:', err);
        setError('Unable to analyze research gaps for this topic. Please try another query.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadGaps(query);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      loadGaps(query.trim());
    }
  };

  const handleSaveGap = async (gap) => {
    try {
      await saveGapAnalysis({
        topicQuery: analysis.topicQuery,
        gapsDataJson: JSON.stringify(gap)
      });
      setSaveSuccessMsg(`Saved "${gap.title.substring(0, 32)}..." to your Research Workspace.`);
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to save gap:', err);
    }
  };

  const getConfidenceBadge = (confidence) => {
    if (confidence === 'HIGH') {
      return <span className="tag tag-success">High Confidence</span>;
    } else if (confidence === 'MEDIUM') {
      return <span className="tag tag-warning">Moderate Confidence</span>;
    }
    return <span className="tag">Preliminary Signal</span>;
  };

  return (
    <div>
      <div className="section-header">
        <h1 className="section-title">Research Gap Intelligence</h1>
        <div className="section-description">
          Detect potentially underexplored academic avenues, methodological imbalances, and candidate research voids backed by scholarly literature.
        </div>
      </div>

      {/* Topic Query Bar */}
      <div className="panel" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
          <input
            type="text"
            className="search-input"
            style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '14px' }}
            placeholder="Enter research topic to discover gaps (e.g., Cybersecurity in Generative AI)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Analyzing Literature...' : 'Discover Gaps'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Suggested Inquiries:</span>
          {suggestedTopics.map((topic) => (
            <button
              key={topic}
              type="button"
              className="tag tag-accent"
              style={{ cursor: 'pointer', border: 'none', background: 'var(--bg-alt)' }}
              onClick={() => {
                setQuery(topic);
                loadGaps(topic);
              }}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="panel" style={{ backgroundColor: 'var(--success-light)', borderColor: 'var(--success-border)', color: 'var(--success)', marginBottom: '16px', padding: '10px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <IconCheck size={14} />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {error && (
        <div className="panel" style={{ backgroundColor: 'var(--danger-light)', borderColor: 'var(--danger-border)', color: 'var(--danger)', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {loading && (
        <div className="panel" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Retrieving scholarly publications, clustering thematic vectors, and extracting boundary cues...
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Analyzing methodology distributions and literature limitations</div>
        </div>
      )}

      {!loading && analysis && (
        <div>
          {/* Summary Stats Grid */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Analyzed Publications</div>
              <div className="metric-value">{analysis.totalPapersAnalyzed}</div>
              <div className="metric-subtext">Corpus sample for "{analysis.topicQuery}"</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Thematic Clusters</div>
              <div className="metric-value">{analysis.themes?.length || 0}</div>
              <div className="metric-subtext">Dominant research domains</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Identified Gaps</div>
              <div className="metric-value">{analysis.gapCandidates?.length || 0}</div>
              <div className="metric-subtext">Candidate research voids</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Corpus Coverage</div>
              <div className="metric-value" style={{ fontSize: '16px', textTransform: 'capitalize' }}>
                {analysis.coverageAssessment === 'REPRESENTATIVE_SAMPLE' ? 'Representative' : 'Sampled Review'}
              </div>
              <div className="metric-subtext">
                {analysis.coverageAssessment === 'REPRESENTATIVE_SAMPLE'
                  ? 'Sufficient publication density'
                  : 'Candidate gaps for further review'}
              </div>
            </div>
          </div>

          {/* Methodology Distribution & Themes Overview */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div className="panel" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                Methodology Distribution
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {analysis.methodologyDistribution && Object.entries(analysis.methodologyDistribution).map(([method, count]) => {
                  const pct = analysis.totalPapersAnalyzed > 0 ? Math.round((count / analysis.totalPapersAnalyzed) * 100) : 0;
                  return (
                    <div key={method}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600 }}>{method}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{count} papers ({pct}%)</span>
                      </div>
                      <div style={{ height: '6px', backgroundColor: 'var(--bg-alt)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', backgroundColor: 'var(--accent)' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="panel" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                Key Research Themes
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {analysis.themes?.map((t) => (
                  <div key={t.name} style={{ background: 'var(--bg-alt)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '13px' }}>
                    <span style={{ fontWeight: 600 }}>{t.name}</span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>({t.paperCount})</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Note: Candidates reflect underexplored intersections in literature, distinct from total corpus size.
              </div>
            </div>
          </div>

          {/* Candidate Research Gaps List */}
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px', color: 'var(--text-main)' }}>
            Candidate Research Gaps ({analysis.gapCandidates?.length || 0})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {analysis.gapCandidates?.map((gap, idx) => (
              <div key={gap.id || idx} className="panel" style={{ borderLeft: '4px solid var(--accent)', padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Candidate Gap #{idx + 1}
                      </span>
                      {getConfidenceBadge(gap.confidenceScore)}
                      <span className="tag" style={{ fontSize: '11px' }}>{gap.identificationMethod}</span>
                    </div>
                    <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)', margin: '4px 0' }}>
                      {gap.title}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setActiveEvidenceModal(gap)}
                    >
                      Inspect Evidence ({gap.supportingPapers?.length || 0})
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleSaveGap(gap)}
                    >
                      <IconBookmark size={13} /> Save Gap
                    </button>
                  </div>
                </div>

                <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.6', marginBottom: '12px' }}>
                  {gap.explanation}
                </p>

                {/* Extracted Limitations Callout */}
                {gap.extractedLimitations && gap.extractedLimitations.length > 0 && (
                  <div style={{ backgroundColor: 'var(--bg-alt)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', borderLeft: '3px solid var(--border-color)', marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Literature Boundary & Limitation Evidence
                    </div>
                    {gap.extractedLimitations.map((lim, lIdx) => (
                      <div key={lIdx} style={{ fontSize: '13px', color: 'var(--text-main)', fontStyle: 'italic', marginBottom: '2px' }}>
                        "{lim}"
                      </div>
                    ))}
                  </div>
                )}

                {/* Supporting Papers Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span style={{ fontWeight: 600 }}>Supporting Evidence:</span>
                  {gap.supportingPapers?.slice(0, 3).map((paper) => (
                    <button
                      key={paper.id}
                      type="button"
                      style={{ background: 'none', border: 'none', padding: 0, color: 'var(--accent)', textDecoration: 'underline', cursor: 'pointer', textAlign: 'left' }}
                      onClick={() => onSelectPaper(paper.id)}
                    >
                      {paper.title.length > 40 ? paper.title.substring(0, 38) + '...' : paper.title} ({paper.publicationYear})
                    </button>
                  ))}
                  {gap.supportingPapers && gap.supportingPapers.length > 3 && (
                    <span>+{gap.supportingPapers.length - 3} more</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deep-dive Evidence Modal */}
      {activeEvidenceModal && (
        <div className="modal-backdrop" onClick={() => setActiveEvidenceModal(null)}>
          <div className="modal-content" style={{ maxWidth: '800px', maxHeight: '85vh', overflowY: 'auto', padding: '24px 28px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <span className="tag tag-accent" style={{ marginBottom: '6px' }}>Evidence Dossier</span>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '4px 0' }}>{activeEvidenceModal.title}</h2>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {activeEvidenceModal.identificationMethod} • {activeEvidenceModal.coverageCaveat}
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveEvidenceModal(null)}>Close</button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>Detailed Explanation</h4>
              <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.6' }}>{activeEvidenceModal.explanation}</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Supporting Publications in Dataset</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activeEvidenceModal.supportingPapers?.map((p) => (
                  <div key={p.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', backgroundColor: 'var(--bg-main)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <a
                        href="#"
                        style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveEvidenceModal(null);
                          onSelectPaper(p.id);
                        }}
                      >
                        {p.title}
                      </a>
                      <span className="tag" style={{ fontSize: '11px' }}>{p.publicationYear}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0' }}>
                      {p.authors?.map(a => a.name).join(', ') || 'Scholarly Authors'} • {p.venue || 'Academic Venue'} • {p.citationCount || 0} citations
                    </div>
                    {p.abstractText && !p.abstractText.startsWith('Abstract not available') && (
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', marginTop: '6px' }}>
                        {p.abstractText.length > 200 ? p.abstractText.substring(0, 197) + '...' : p.abstractText}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {activeEvidenceModal.extractedFutureWork && activeEvidenceModal.extractedFutureWork.length > 0 && (
              <div style={{ backgroundColor: 'var(--bg-alt)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '12px 16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Recommended Research Directions
                </h4>
                <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  {activeEvidenceModal.extractedFutureWork.map((fw, i) => (
                    <li key={i}>{fw}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
