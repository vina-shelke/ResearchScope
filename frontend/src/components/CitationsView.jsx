import React, { useState, useEffect } from 'react';
import { fetchCitationIntelligence } from '../api/client';
import TrendChart from './TrendChart';

export default function CitationsView({ onSelectPaper }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCitationIntelligence()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading citation intelligence metrics...</div>;
  if (!data) return <div style={{ padding: '40px', textAlign: 'center' }}>Unable to load citation data.</div>;

  return (
    <div>
      <div className="section-header">
        <h1 className="section-title">Citation Intelligence & Impact</h1>
        <div className="section-description">Analyze scholarly citations as research-impact indicators and track citation distribution over time</div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">Aggregated Citation Trends</div>
          </div>
          <div className="panel-body">
            <TrendChart data={data.citationTrends} xKey="year" yKey="citations" height={200} />
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">Citation Volume Distribution</div>
          </div>
          <div className="panel-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.citationDistribution.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-main)' }}>
                  <span style={{ fontWeight: 600 }}>{item.range}</span>
                  <span className="tag tag-accent" style={{ fontSize: '13px' }}>{item.count} papers</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Highly Cited Literature</div>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Paper Title</th>
                <th>Year</th>
                <th>Venue</th>
                <th>Citations</th>
                <th>Source</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.mostCitedPapers && data.mostCitedPapers.length > 0 ? (
                data.mostCitedPapers.map((paper) => (
                  <tr key={paper.id}>
                    <td>
                      <span className="table-link" onClick={() => onSelectPaper(paper.id)}>
                        {paper.title}
                      </span>
                    </td>
                    <td>{paper.publicationYear || 'N/A'}</td>
                    <td>{paper.venue || 'N/A'}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{paper.citationCount || 0}</td>
                    <td><span className="tag">{paper.source}</span></td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => onSelectPaper(paper.id)}>
                        View Record
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No citation data recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
