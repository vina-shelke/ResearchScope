import React, { useState, useEffect } from 'react';
import { fetchTopics, fetchTopicPapers } from '../api/client';

export default function TopicsView({ onSelectPaper }) {
  const [topicsData, setTopicsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15); // Default to 15 rows as requested
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicPapers, setTopicPapers] = useState([]);
  const [loadingPapers, setLoadingPapers] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchTopics({ q: query, page, size: pageSize });
      setTopicsData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, pageSize]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    loadData();
  };

  const handleTopicClick = async (topic) => {
    setSelectedTopic(topic);
    setLoadingPapers(true);
    try {
      const papers = await fetchTopicPapers(topic.id);
      setTopicPapers(papers);
    } catch (err) {
      console.error('Failed to load papers for topic:', err);
    } finally {
      setLoadingPapers(false);
    }
  };

  return (
    <div>
      <div className="section-header">
        <h1 className="section-title">Research Topics Taxonomy</h1>
        <div className="section-description">
          Explore subfields, conceptual classifications, and publication volume per domain. Click any topic to inspect its associated research papers.
        </div>
      </div>

      <div className="panel" style={{ marginBottom: '20px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            className="search-input" 
            style={{ backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid var(--border-color)', flex: 1, minWidth: '220px' }}
            placeholder="Search topic or concept..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Rows:</span>
            <select
              className="search-input"
              style={{ backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid var(--border-color)', width: 'auto', padding: '8px 10px', fontSize: '13px' }}
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
            >
              <option value={15}>15 Rows</option>
              <option value={20}>20 Rows</option>
              <option value={30}>30 Rows</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary">Search Topics</button>
        </form>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading topics taxonomy...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Topic Name</th>
                <th>Category</th>
                <th>Paper Count</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {topicsData && topicsData.content && topicsData.content.length > 0 ? (
                topicsData.content.map((topic) => (
                  <tr key={topic.id}>
                    <td>
                      <span 
                        className="table-link" 
                        onClick={() => handleTopicClick(topic)}
                        style={{ fontSize: '15px', fontWeight: 600 }}
                      >
                        {topic.name}
                      </span>
                    </td>
                    <td><span className="tag">{topic.category || 'Field of Study'}</span></td>
                    <td style={{ fontWeight: 700 }}>{topic.paperCount || 0}</td>
                    <td>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => handleTopicClick(topic)}
                      >
                        View Papers
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No research topics indexed matching search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {topicsData && (
            <div className="pagination">
              <div>Page {topicsData.pageNumber + 1} of {topicsData.totalPages || 1} ({topicsData.totalElements} records)</div>
              <div className="pagination-controls">
                <button 
                  className="btn btn-secondary btn-sm" 
                  disabled={topicsData.pageNumber === 0} 
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </button>
                <button 
                  className="btn btn-secondary btn-sm" 
                  disabled={topicsData.isLast} 
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Topic Papers Modal */}
      {selectedTopic && (
        <div className="modal-overlay" onClick={() => setSelectedTopic(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="tag tag-accent">{selectedTopic.category || 'Field of Study'}</span>
                <h2 className="modal-title" style={{ marginTop: '4px' }}>Topic: {selectedTopic.name}</h2>
              </div>
              <button className="modal-close" onClick={() => setSelectedTopic(null)}>&times;</button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <div className="detail-label">Research Papers for this Topic ({topicPapers.length})</div>
                
                {loadingPapers ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading topic literature...</div>
                ) : topicPapers.length > 0 ? (
                  <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {topicPapers.map((paper) => (
                      <li 
                        key={paper.id}
                        onClick={() => {
                          setSelectedTopic(null);
                          if (onSelectPaper) onSelectPaper(paper.id);
                        }}
                        style={{
                          padding: '12px 16px',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          marginBottom: '10px',
                          cursor: 'pointer',
                          backgroundColor: 'var(--bg-main)',
                          transition: 'border-color 0.15s ease'
                        }}
                      >
                        <div className="table-link" style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>
                          {paper.title}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                          {paper.publicationYear || 'N/A'} &bull; {paper.venue || 'Journal n/a'} &bull; {paper.citationCount || 0} Citations
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '14px', padding: '16px 0' }}>
                    No papers linked to this specific topic yet.
                  </div>
                )}
              </div>
            </div>

            <div className="modal-header" style={{ borderTop: '1px solid var(--border-color)', borderBottom: 'none', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedTopic(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
