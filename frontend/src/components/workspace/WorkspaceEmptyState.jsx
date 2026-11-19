import React from 'react';
import { 
  IconSearch, 
  IconPlus, 
  IconBookmark, 
  IconBookOpen, 
  IconTrend, 
  IconPencil,
  IconStar
} from '../Icons';

export default function WorkspaceEmptyState({ onFindPapers, onNewProject }) {
  return (
    <div className="panel" style={{
      padding: '40px 32px',
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-subtle)',
      marginBottom: '28px'
    }}>
      {/* Top Academic Illustration & Hero Header */}
      <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 36px auto' }}>
        <div style={{
          width: '64px',
          height: '64px',
          margin: '0 auto 20px auto',
          borderRadius: '16px',
          backgroundColor: 'var(--bg-subtle)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-main)',
          boxShadow: 'var(--shadow-skeuo-sm)'
        }}>
          {/* Pure SVG academic stack icon */}
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            <polyline points="10 6 14 6" />
            <polyline points="10 10 14 10" />
          </svg>
        </div>

        <h2 style={{
          fontSize: '24px',
          fontWeight: 800,
          color: 'var(--text-main)',
          marginBottom: '10px',
          letterSpacing: '-0.02em'
        }}>
          Your Research Journey Starts Here
        </h2>

        <p style={{
          fontSize: '14.5px',
          color: 'var(--text-muted)',
          lineHeight: '1.6',
          margin: '0 0 24px 0'
        }}>
          Build your personal research library. Save academic papers, organize literature reviews, track reading progress, and discover meaningful research connections.
        </p>

        {/* Primary & Secondary Call to Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onFindPapers}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              fontWeight: 700
            }}
          >
            <IconSearch size={15} />
            <span>Explore Research Papers</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onNewProject}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              fontWeight: 600
            }}
          >
            <IconPlus size={15} />
            <span>Create Research Project</span>
          </button>
        </div>
      </div>

      {/* 3-Step Getting Started Guide */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
        gap: '20px',
        marginBottom: '36px',
        borderTop: '1px solid var(--border-color)',
        paddingTop: '32px'
      }}>
        {/* Step 1 */}
        <div style={{
          backgroundColor: 'var(--bg-main)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          position: 'relative',
          minWidth: 0,
          boxSizing: 'border-box'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '10px'
          }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)'
            }}>
              STEP 1
            </span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
              Discover Research
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0, wordBreak: 'break-word' }}>
            Explore academic papers across different domains, citation networks, and trending research topics.
          </p>
        </div>

        {/* Step 2 */}
        <div style={{
          backgroundColor: 'var(--bg-main)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          position: 'relative',
          minWidth: 0,
          boxSizing: 'border-box'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '10px'
          }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)'
            }}>
              STEP 2
            </span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
              Save Papers
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0, wordBreak: 'break-word' }}>
            Bookmark interesting papers and organize them into your personal research library and project folders.
          </p>
        </div>

        {/* Step 3 */}
        <div style={{
          backgroundColor: 'var(--bg-main)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          position: 'relative',
          minWidth: 0,
          boxSizing: 'border-box'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '10px'
          }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)'
            }}>
              STEP 3
            </span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
              Track Progress
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0, wordBreak: 'break-word' }}>
            Update reading status, write literature review notes, and monitor your personal synthesis progress.
          </p>
        </div>
      </div>

      {/* Example Preview Card */}
      <div style={{
        maxWidth: '560px',
        margin: '0 auto',
        padding: '16px 20px',
        backgroundColor: 'var(--bg-alt)',
        border: '1px dashed var(--border-hover)',
        borderRadius: 'var(--radius-md)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px'
        }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--text-subtle)'
          }}>
            Preview: How saved papers appear in your workspace
          </span>
          <span className="tag" style={{ fontSize: '10px' }}>Example</span>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          padding: '14px',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-main)' }}>
              Attention Is All You Need
            </div>
            <span style={{ color: 'var(--text-muted)' }}>
              <IconStar size={13} filled={true} color="#eab308" />
            </span>
          </div>

          <div style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '6px 0' }}>
            2017 • NeurIPS • Vaswani et al. • Foundational Architecture
          </div>

          <div style={{ display: 'flex', gap: '6px', margin: '8px 0', flexWrap: 'wrap' }}>
            <span className="tag tag-accent" style={{ fontSize: '10px', padding: '2px 8px' }}>
              Reading
            </span>
            <span className="tag" style={{ fontSize: '10px', padding: '2px 8px' }}>
              Deep Learning Project
            </span>
          </div>

          <div style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            backgroundColor: 'var(--bg-main)',
            padding: '8px 10px',
            borderRadius: 'var(--radius-xs)',
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            border: '1px solid var(--border-color)'
          }}>
            <IconPencil size={11} />
            <span>Key takeaway: Replaces recurrence and convolutions entirely with self-attention.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
