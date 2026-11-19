import React from 'react';
import { IconGaps, IconClose } from '../Icons';

export default function SavedGapsList({
  gaps = [],
  onDeleteGap
}) {
  return (
    <div className="panel" style={{
      padding: '24px',
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-subtle)'
    }}>
      <div style={{ marginBottom: '18px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-main)' }}>
          Saved Research Gap Analyses
        </h3>
        <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
          High-priority scholarly opportunities and blind spots flagged for future investigation.
        </div>
      </div>

      {gaps.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '36px 20px',
          backgroundColor: 'var(--bg-main)',
          borderRadius: 'var(--radius-sm)',
          border: '1px dashed var(--border-color)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            margin: '0 auto 10px auto',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)'
          }}>
            <IconGaps size={18} />
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            No saved research gap analyses yet. Use the "Save Gap" button on candidate gaps in the Research Gap Intelligence tab.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {gaps.map(g => {
            let parsedGap = {};
            try {
              parsedGap = JSON.parse(g.gapsDataJson);
            } catch (e) {
              parsedGap = { title: g.topicQuery, explanation: 'Analysis data saved.' };
            }

            return (
              <div
                key={g.id}
                style={{
                  padding: '16px 18px',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  borderLeft: '4px solid var(--accent)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span className="tag" style={{ fontSize: '10.5px', marginBottom: '6px' }}>
                      Topic: {g.topicQuery}
                    </span>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '4px 0', color: 'var(--text-main)', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                      {parsedGap.title || 'Candidate Research Gap'}
                    </h4>
                  </div>

                  <button
                    type="button"
                    style={{
                      border: 'none',
                      background: 'none',
                      color: 'var(--text-subtle)',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: 'var(--radius-xs)'
                    }}
                    onClick={() => onDeleteGap && onDeleteGap(g.id)}
                    title="Delete saved gap analysis"
                  >
                    <IconClose size={13} />
                  </button>
                </div>

                <p style={{
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  lineHeight: '1.5',
                  margin: '4px 0 8px 0',
                  wordBreak: 'break-word'
                }}>
                  {parsedGap.explanation}
                </p>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '11.5px',
                  color: 'var(--text-subtle)',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '8px'
                }}>
                  <span>Confidence Score: {parsedGap.confidenceScore ?? 'High'}</span>
                  <span>Saved on {new Date(g.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
