import React from 'react';
import { IconSearch, IconClose } from '../Icons';

export default function SavedSearchesManager({
  searches = [],
  onRunSearch,
  onDeleteSearch
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
          Saved Search Queries
        </h3>
        <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
          Quickly rerun targeted scholarly queries across the entire academic index.
        </div>
      </div>

      {searches.length === 0 ? (
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
            <IconSearch size={18} />
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            No saved searches yet. Save any query from the search bar or Papers Explorer to monitor domain literature.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {searches.map(s => (
            <div
              key={s.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                padding: '12px 16px',
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                transition: 'border-color 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                <span style={{ color: 'var(--text-subtle)', flexShrink: 0 }}>
                  <IconSearch size={14} />
                </span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)', wordBreak: 'break-word' }}>
                    "{s.queryText}"
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)', marginTop: '2px' }}>
                    Saved on {new Date(s.createdAt || Date.now()).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => onRunSearch && onRunSearch(s.queryText)}
                  style={{ fontSize: '12px', padding: '4px 12px' }}
                >
                  Run Query
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{
                    border: 'none',
                    background: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '12px',
                    padding: '4px 8px'
                  }}
                  onClick={() => onDeleteSearch && onDeleteSearch(s.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
