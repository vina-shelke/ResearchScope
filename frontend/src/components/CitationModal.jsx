import React, { useState } from 'react';
import { getPaperBibTeXUrl, getPaperRisUrl } from '../api/client';
import { useToast } from './Toast';

// Formats authors for standard citation styles
function formatAuthors(authors, style) {
  if (!authors || authors.length === 0) return 'Anonymous';
  const names = authors.map(a => (typeof a === 'string' ? a : a.name || 'Anonymous'));

  if (style === 'apa' || style === 'harvard') {
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]}, & ${names[1]}`;
    return `${names[0]}, et al.`;
  }
  if (style === 'mla') {
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]}, and ${names[1]}`;
    return `${names[0]}, et al.`;
  }
  if (style === 'ieee') {
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} and ${names[1]}`;
    return `${names[0]} et al.`;
  }
  if (style === 'chicago') {
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]}, and ${names[1]}`;
    return `${names[0]} et al.`;
  }
  return names.join(' and ');
}

// Generate citation text by style
export function generateCitation(paper, style) {
  if (!paper) return '';
  const title = (paper.title || 'Untitled Publication').replace(/\.$/, '');
  const year = paper.publicationYear || 'n.d.';
  const venue = paper.venue || paper.publisher || 'Scholarly Repository';
  const doi = paper.doi ? (paper.doi.startsWith('http') ? paper.doi : `https://doi.org/${paper.doi}`) : null;
  const doiText = doi ? ` ${doi}` : '';

  switch (style) {
    case 'apa':
      return `${formatAuthors(paper.authors, 'apa')} (${year}). ${title}. ${venue}.${doiText}`;
    case 'mla':
      return `${formatAuthors(paper.authors, 'mla')} "${title}." ${venue}, ${year}.${doiText}`;
    case 'chicago':
      return `${formatAuthors(paper.authors, 'chicago')} ${year}. "${title}." ${venue}.${doiText}`;
    case 'ieee':
      return `[1] ${formatAuthors(paper.authors, 'ieee')}, "${title}," ${venue}, ${year}.${doi ? ` doi: ${paper.doi}.` : ''}`;
    case 'harvard':
      return `${formatAuthors(paper.authors, 'harvard')}, ${year}. ${title}. ${venue}.${doiText}`;
    case 'bibtex': {
      const firstAuthor = paper.authors && paper.authors.length > 0
        ? (typeof paper.authors[0] === 'string' ? paper.authors[0] : paper.authors[0].name || 'Author')
        : 'Author';
      const cleanAuthorKey = firstAuthor.split(' ').pop().toLowerCase().replace(/[^a-z0-9]/g, '');
      const key = `${cleanAuthorKey}${year}${title.slice(0, 10).toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      const authorList = (paper.authors || []).map(a => (typeof a === 'string' ? a : a.name)).join(' and ') || 'Anonymous';

      return `@article{${key},
  title = {${title}},
  author = {${authorList}},
  journal = {${venue}},
  year = {${year}}${paper.doi ? `,\n  doi = {${paper.doi}}` : ''}${paper.publisher ? `,\n  publisher = {${paper.publisher}}` : ''}
}`;
    }
    default:
      return '';
  }
}

// COinS (ContextObjects in Spans) generator for Zotero and Mendeley browser extensions
export function generateCOinS(paper) {
  if (!paper) return '';
  const params = new URLSearchParams();
  params.set('ctx_ver', 'Z39.88-2004');
  params.set('rft_val_fmt', 'info:ofi/fmt:kev:mtx:journal');
  params.set('rft.genre', 'article');
  params.set('rft.atitle', paper.title || '');
  if (paper.venue) params.set('rft.jtitle', paper.venue);
  if (paper.publicationYear) params.set('rft.date', String(paper.publicationYear));
  if (paper.doi) params.set('rft_id', `info:doi/${paper.doi}`);

  if (paper.authors && Array.isArray(paper.authors)) {
    paper.authors.forEach(a => {
      const name = typeof a === 'string' ? a : a.name;
      if (name) params.append('rft.au', name);
    });
  }

  return params.toString();
}

export default function CitationModal({ paper, onClose }) {
  const toast = useToast();
  const [activeFormat, setActiveFormat] = useState('apa');

  if (!paper) return null;

  const citationText = generateCitation(paper, activeFormat);
  const coinsData = generateCOinS(paper);

  const handleCopy = () => {
    if (!citationText) return;
    navigator.clipboard.writeText(citationText)
      .then(() => {
        toast.success(`Copied ${activeFormat.toUpperCase()} citation to clipboard.`);
      })
      .catch(() => {
        toast.error('Failed to copy to clipboard.');
      });
  };

  const formats = [
    { key: 'apa', label: 'APA 7th' },
    { key: 'mla', label: 'MLA 9th' },
    { key: 'chicago', label: 'Chicago (Author-Date)' },
    { key: 'ieee', label: 'IEEE' },
    { key: 'harvard', label: 'Harvard' },
    { key: 'bibtex', label: 'BibTeX' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '680px', padding: '0', overflow: 'hidden' }}
      >
        {/* Hidden COinS tag for automatic Zotero & Mendeley detection */}
        <span className="Z3988" title={coinsData} style={{ display: 'none' }} />

        {/* Modal Header */}
        <div className="modal-header" style={{ padding: '18px 24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="tag tag-accent">Academic Citation</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Zotero & Mendeley Ready</span>
            </div>
            <h2 className="modal-title" style={{ fontSize: '18px', lineHeight: 1.35 }}>
              Cite This Publication
            </h2>
          </div>
          <button className="modal-close" onClick={onClose} title="Close dialog">&times;</button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px' }}>
          {/* Format Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {formats.map(fmt => (
              <button
                key={fmt.key}
                type="button"
                className={`btn btn-sm ${activeFormat === fmt.key ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveFormat(fmt.key)}
                style={{ fontSize: '12px' }}
              >
                {fmt.label}
              </button>
            ))}
          </div>

          {/* Citation Preview Box */}
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <pre
              style={{
                backgroundColor: 'var(--bg-recessed)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px',
                fontFamily: activeFormat === 'bibtex' ? 'var(--font-mono, monospace)' : 'inherit',
                fontSize: activeFormat === 'bibtex' ? '12px' : '13.5px',
                lineHeight: '1.6',
                color: 'var(--text-main)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxHeight: '220px',
                overflowY: 'auto',
                margin: 0
              }}
            >
              {citationText}
            </pre>
          </div>

          {/* Paper Quick Metadata Strip */}
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '14px', flexWrap: 'wrap', borderTop: '1px solid var(--border-color)', paddingTop: '14px', marginBottom: '16px' }}>
            <span>Year: <strong>{paper.publicationYear || 'N/A'}</strong></span>
            <span>Venue: <strong>{paper.venue || 'N/A'}</strong></span>
            {paper.doi && <span>DOI: <code>{paper.doi}</code></span>}
          </div>

          {/* Actions Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <a
                href={getPaperBibTeXUrl(paper.id)}
                download={`paper-${paper.id}.bib`}
                className="btn btn-secondary btn-sm"
                style={{ textDecoration: 'none' }}
              >
                Download .BIB
              </a>
              <a
                href={getPaperRisUrl(paper.id)}
                download={`paper-${paper.id}.ris`}
                className="btn btn-secondary btn-sm"
                style={{ textDecoration: 'none' }}
              >
                Download .RIS (EndNote)
              </a>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleCopy}
                style={{ fontWeight: 600 }}
              >
                Copy to Clipboard
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onClose}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
