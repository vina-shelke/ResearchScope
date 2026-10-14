import React, { useState, useEffect } from 'react';
import { 
  fetchSavedPapers, 
  fetchSavedCollections, 
  removeSavedPaper,
  getSavedPapersCsvUrl,
  getSavedPapersBibTeXUrl
} from '../api/client';

export default function SavedPapersView({ onSelectPaper }) {
  const [savedPapers, setSavedPapers] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [papers, cols] = await Promise.all([
        fetchSavedPapers(selectedCollection === 'all' ? '' : selectedCollection),
        fetchSavedCollections()
      ]);
      setSavedPapers(papers);
      setCollections(cols);
    } catch (err) {
      console.error('Failed to load saved papers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCollection]);

  const handleRemove = async (paperId, title) => {
    try {
      await removeSavedPaper(paperId);
      setSavedPapers(prev => prev.filter(p => p.paperId !== paperId));
      setNotification(`Removed "${title.substring(0, 40)}..." from library.`);
      setTimeout(() => setNotification(null), 3500);
    } catch (err) {
      console.error('Failed to remove saved paper:', err);
    }
  };

  return (
    <div>
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="section-title">Saved Papers & Library</h1>
          <div className="section-description">
            Your curated research library and reading list with notes, collections, and citation exports
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <a 
            href={getSavedPapersCsvUrl(selectedCollection === 'all' ? '' : selectedCollection)}
            download="saved-papers.csv"
            className="btn btn-secondary btn-sm"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <span>↓</span> Export CSV
          </a>
          <a 
            href={getSavedPapersBibTeXUrl(selectedCollection === 'all' ? '' : selectedCollection)}
            download="saved-papers.bib"
            className="btn btn-secondary btn-sm"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <span>↓</span> Export BibTeX
          </a>
        </div>
      </div>

      {notification && (
        <div style={{
          backgroundColor: '#eff6ff',
          color: '#1e40af',
          padding: '10px 16px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '16px',
          border: '1px solid #bfdbfe',
          fontSize: '13px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{notification}</span>
          <button 
            onClick={() => setNotification(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1e40af', fontWeight: 'bold' }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Collection Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          className={`btn btn-sm ${selectedCollection === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setSelectedCollection('all')}
        >
          All Saved ({savedPapers.length})
        </button>
        {collections.map((col) => (
          <button
            key={col}
            className={`btn btn-sm ${selectedCollection === col ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedCollection(col)}
          >
            {col}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading saved research library...
        </div>
      ) : savedPapers.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📚</div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
            No papers saved in this collection
          </h3>
          <p style={{ maxWidth: '480px', margin: '0 auto', fontSize: '14px', lineHeight: 1.5 }}>
            You can bookmark papers from the <strong>Dashboard</strong> or <strong>Papers Explorer</strong> by clicking "Save to Library" on any paper record.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title & Authors</th>
                <th>Collection</th>
                <th>Year</th>
                <th>Venue</th>
                <th>Citations</th>
                <th>Access</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {savedPapers.map((item) => {
                const p = item.paper;
                if (!p) return null;
                return (
                  <tr key={item.id}>
                    <td style={{ maxWidth: '380px' }}>
                      <div 
                        className="table-link" 
                        onClick={() => onSelectPaper(p.id)}
                        style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}
                      >
                        {p.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {p.authors && p.authors.length > 0 
                          ? p.authors.map(a => a.name).join(', ') 
                          : 'Authors not listed'}
                      </div>
                      {item.notes && (
                        <div style={{ marginTop: '6px', fontSize: '12px', fontStyle: 'italic', color: '#475569', backgroundColor: '#f8fafc', padding: '4px 8px', borderRadius: '4px', borderLeft: '3px solid var(--accent)' }}>
                          Note: {item.notes}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="tag tag-accent">{item.collectionName || 'Favorites'}</span>
                    </td>
                    <td>{p.publicationYear || 'N/A'}</td>
                    <td style={{ fontSize: '12px' }}>{p.venue || 'N/A'}</td>
                    <td style={{ fontWeight: 700 }}>{p.citationCount ?? 0}</td>
                    <td>
                      {p.isOpenAccess ? (
                        <span className="tag" style={{ backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                          Open Access
                        </span>
                      ) : (
                        <span className="tag" style={{ opacity: 0.7 }}>Closed</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          className="btn btn-secondary btn-sm" 
                          onClick={() => onSelectPaper(p.id)}
                        >
                          Inspect
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#b91c1c', borderColor: '#fca5a5' }}
                          onClick={() => handleRemove(p.id, p.title)}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
