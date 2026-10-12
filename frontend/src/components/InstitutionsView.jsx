import React, { useState, useEffect } from 'react';
import { fetchInstitutions } from '../api/client';

export default function InstitutionsView() {
  const [institutionsData, setInstitutionsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchInstitutions({ q: query, page, size: 10 });
      setInstitutionsData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    loadData();
  };

  return (
    <div>
      <div className="section-header">
        <h1 className="section-title">Institutional Intelligence Landscape</h1>
        <div className="section-description">Discover research output, geographical activity, and institutional volume</div>
      </div>

      <div className="panel" style={{ marginBottom: '20px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px' }}>
          <input 
            type="text" 
            className="search-input" 
            style={{ backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid var(--border-color)', flex: 1 }}
            placeholder="Search university or research institution..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Search Institutions</button>
        </form>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading institutions registry...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Institution Name</th>
                <th>Country Code</th>
                <th>Paper Volume</th>
                <th>Activity Level</th>
              </tr>
            </thead>
            <tbody>
              {institutionsData && institutionsData.content && institutionsData.content.length > 0 ? (
                institutionsData.content.map((inst) => (
                  <tr key={inst.id}>
                    <td style={{ fontWeight: 600 }}>{inst.name}</td>
                    <td><span className="tag tag-accent">{inst.countryCode || 'Global'}</span></td>
                    <td style={{ fontWeight: 700 }}>{inst.paperCount || 0}</td>
                    <td>
                      <span className="tag">
                        {inst.paperCount > 5 ? 'High Output' : 'Active Contributor'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No institutions indexed yet. Perform a topic search to aggregate institutional affiliations.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {institutionsData && (
            <div className="pagination">
              <div>Page {institutionsData.pageNumber + 1} of {institutionsData.totalPages || 1} ({institutionsData.totalElements} records)</div>
              <div className="pagination-controls">
                <button 
                  className="btn btn-secondary btn-sm" 
                  disabled={institutionsData.pageNumber === 0} 
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </button>
                <button 
                  className="btn btn-secondary btn-sm" 
                  disabled={institutionsData.isLast} 
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
