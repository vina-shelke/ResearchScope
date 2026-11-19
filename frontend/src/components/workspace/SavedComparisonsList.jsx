import React from 'react';
import { IconCompare, IconClose } from '../Icons';

export default function SavedComparisonsList({
  comparisons = [],
  onLoadComparison,
  onDeleteComparison
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
          Saved Paper Comparisons
        </h3>
        <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
          Side-by-side methodology, dataset, and metric evaluations previously conducted.
        </div>
      </div>

      {comparisons.length === 0 ? (
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
            <IconCompare size={18} />
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            No saved paper comparisons yet. Add papers to the Comparison Tray and click "Save Comparison Set" in the Comparison Lab.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {comparisons.map(c => {
            const paperIds = c.papers?.map(p => p.id || p.paperId) || [];
            return (
              <div
                key={c.id}
                style={{
                  padding: '16px 18px',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                    <IconCompare size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-main)', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                      {c.title || 'Untitled Comparison'}
                    </span>
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
                    onClick={() => onDeleteComparison && onDeleteComparison(c.id)}
                    title="Delete comparison"
                  >
                    <IconClose size={13} />
                  </button>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {c.papers?.length || 0} Publications evaluated • Saved on {new Date(c.createdAt || Date.now()).toLocaleDateString()}
                </div>

                <div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onLoadComparison && onLoadComparison(paperIds)}
                    style={{ fontSize: '12px', padding: '4px 14px' }}
                  >
                    Open in Comparison Lab
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
