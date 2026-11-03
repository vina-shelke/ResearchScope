import React from 'react';

export function SkeletonMetricCard() {
  return (
    <div className="metric-card skeleton-card" aria-hidden="true">
      <div className="skeleton-bar" style={{ width: '40%', height: '11px', marginBottom: '8px' }} />
      <div className="skeleton-bar" style={{ width: '65%', height: '24px', marginBottom: '6px' }} />
      <div className="skeleton-bar" style={{ width: '50%', height: '11px' }} />
    </div>
  );
}

export function SkeletonPaperCard() {
  return (
    <div className="paper-card skeleton-card" aria-hidden="true" style={{ padding: '16px 20px', minHeight: '130px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '10px' }}>
        <div className="skeleton-bar" style={{ width: '75%', height: '18px' }} />
        <div className="skeleton-bar" style={{ width: '60px', height: '16px' }} />
      </div>
      <div className="skeleton-bar" style={{ width: '45%', height: '13px', marginBottom: '12px' }} />
      <div className="skeleton-bar" style={{ width: '100%', height: '12px', marginBottom: '6px' }} />
      <div className="skeleton-bar" style={{ width: '85%', height: '12px', marginBottom: '14px' }} />
      <div style={{ display: 'flex', gap: '8px' }}>
        <div className="skeleton-bar" style={{ width: '70px', height: '20px', borderRadius: '4px' }} />
        <div className="skeleton-bar" style={{ width: '90px', height: '20px', borderRadius: '4px' }} />
      </div>
    </div>
  );
}

export function SkeletonTableRow({ columns = 5 }) {
  return (
    <tr className="skeleton-row" aria-hidden="true">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} style={{ padding: '12px 14px' }}>
          <div className="skeleton-bar" style={{ width: i === 0 ? '80%' : '50%', height: '14px' }} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`skeleton-container ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton-bar"
          style={{
            width: i === lines - 1 ? '60%' : '100%',
            height: '13px',
            marginBottom: i === lines - 1 ? 0 : '8px'
          }}
        />
      ))}
    </div>
  );
}
