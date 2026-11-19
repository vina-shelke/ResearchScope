import React, { useState, useEffect } from 'react';
import {
  fetchPersonalizedRecommendations,
  fetchUserAlerts,
  subscribeAlert,
  deleteAlert,
  savePaperToWorkspace
} from '../api/client';
import {
  IconCheck,
  IconClose,
  IconSparkles,
  IconPaper,
  IconBookmark,
  IconExternalLink,
  IconPlus,
  IconAlert
} from './Icons';
import { useToast } from './Toast';

export default function SmartRecommendationsView({
  onSelectPaper,
  onOpenCite,
  onAddToComparison
}) {
  const toast = useToast();

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [newAlertQuery, setNewAlertQuery] = useState('');
  const [newAlertFreq, setNewAlertFreq] = useState('WEEKLY');
  const [subscribing, setSubscribing] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetchPersonalizedRecommendations(12),
      fetchUserAlerts().catch(() => [])
    ])
      .then(([recs, alertList]) => {
        setRecommendations(recs || []);
        setAlerts(alertList || []);
      })
      .catch(err => {
        console.error('Failed to load recommendations:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveToWorkspace = async (paper) => {
    try {
      await savePaperToWorkspace({
        paperId: paper.paperId,
        title: paper.title,
        collectionName: 'Recommended',
        readingStatus: 'TO_READ'
      });
      setRecommendations(prev => prev.map(p => p.paperId === paper.paperId ? { ...p, savedInWorkspace: true } : p));
      toast.success(`Saved "${paper.title.slice(0, 35)}..." to reading list.`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save paper to workspace.');
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!newAlertQuery.trim()) return;
    setSubscribing(true);
    try {
      const created = await subscribeAlert({
        query: newAlertQuery.trim(),
        frequency: newAlertFreq
      });
      setAlerts(prev => [created, ...prev]);
      setNewAlertQuery('');
      toast.success(`Subscribed to alerts for "${created.query}".`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to subscribe: ' + err.message);
    } finally {
      setSubscribing(false);
    }
  };

  const handleDeleteAlert = async (alertId) => {
    try {
      await deleteAlert(alertId);
      setAlerts(prev => prev.filter(a => a.id !== alertId));
      toast.success('Alert subscription removed.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove alert.');
    }
  };

  return (
    <div className="smart-recommendations-view" style={{ marginBottom: '32px' }}>
      {/* Header Banner */}
      <div className="panel" style={{ marginBottom: '20px', padding: '18px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                color: 'var(--accent)'
              }}>
                <IconSparkles size={16} />
              </span>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Recommended For Your Research
              </h2>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
              Grounded multi-signal recommendations based on your saved papers, reading interests, and citation velocity.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowAlertModal(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <IconAlert size={14} /> Topic Alerts ({alerts.length})
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={loadData}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      {loading ? (
        <div className="panel" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{
            display: 'inline-block',
            width: '24px',
            height: '24px',
            border: '3px solid var(--border-color)',
            borderTopColor: 'var(--accent)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            marginBottom: '10px'
          }} />
          <div style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
            Calculating multi-signal academic recommendations...
          </div>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
            No recommendations generated yet
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Save papers to your reading list or create research projects to personalize your recommendation feed.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '16px'
        }}>
          {recommendations.map(paper => (
            <div
              key={paper.paperId}
              className="panel"
              style={{
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid var(--border-color)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                minWidth: 0,
                boxSizing: 'border-box'
              }}
            >
              <div>
                {/* Reason Banner & Score */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--accent)',
                    backgroundColor: 'rgba(59, 130, 246, 0.08)',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    lineHeight: '1.3',
                    flex: 1,
                    minWidth: 0,
                    wordBreak: 'break-word'
                  }}>
                    {paper.matchedReason}
                  </div>

                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    padding: '2px 7px',
                    borderRadius: '10px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}>
                    {paper.relevanceScore}% Match
                  </span>
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    lineHeight: '1.4',
                    margin: '0 0 6px 0',
                    cursor: onSelectPaper ? 'pointer' : 'default',
                    wordBreak: 'break-word',
                    overflowWrap: 'anywhere'
                  }}
                  onClick={() => onSelectPaper && onSelectPaper(paper.paperId)}
                  title="Click to view publication details"
                >
                  {paper.title}
                </h3>

                {/* Metadata */}
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '10px', wordBreak: 'break-word' }}>
                  {paper.authors?.slice(0, 3).join(', ')}
                  {paper.authors?.length > 3 ? ' et al.' : ''} • {paper.publicationYear || 'n.d.'}
                  {paper.venue ? ` • ${paper.venue}` : ''}
                </div>

                {/* Topics / Keywords */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                  {paper.citationCount != null && (
                    <span className="tag" style={{ fontSize: '10.5px' }}>
                      {paper.citationCount.toLocaleString()} citations
                    </span>
                  )}
                  {paper.isOpenAccess && (
                    <span className="tag tag-accent" style={{ fontSize: '10.5px' }}>
                      Open Access
                    </span>
                  )}
                  {paper.matchingTopics?.map((topic, i) => (
                    <span key={i} style={{
                      fontSize: '10.5px',
                      padding: '1px 6px',
                      backgroundColor: 'var(--bg-alt)',
                      borderRadius: '4px',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-muted)'
                    }}>
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '11px', padding: '3px 8px' }}
                    onClick={() => handleSaveToWorkspace(paper)}
                    disabled={paper.savedInWorkspace}
                  >
                    {paper.savedInWorkspace ? <><IconCheck size={11} /> Saved</> : <><IconBookmark size={11} /> Save</>}
                  </button>

                  {onOpenCite && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '11px', padding: '3px 8px' }}
                      onClick={() => onOpenCite(paper)}
                    >
                      Cite
                    </button>
                  )}
                </div>

                {onAddToComparison && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '11px', padding: '3px 8px' }}
                    onClick={() => onAddToComparison(paper.paperId)}
                  >
                    + Compare
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Topic Alert Subscriptions */}
      {showAlertModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(3px)',
          zIndex: 1200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
        onClick={() => setShowAlertModal(false)}
        >
          <div className="panel" style={{ width: '100%', maxWidth: '500px', padding: '24px', backgroundColor: 'var(--bg-surface)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  Topic Alert Subscriptions
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Receive notifications when high-impact literature is published in your fields.
                </span>
              </div>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAlertModal(false)}>
                <IconClose size={14} />
              </button>
            </div>

            {/* Subscribe Form */}
            <form onSubmit={handleSubscribe} style={{ marginBottom: '18px', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                required
                className="search-input"
                style={{ flex: 1, fontSize: '13px' }}
                placeholder="Topic, method, or author keyword..."
                value={newAlertQuery}
                onChange={(e) => setNewAlertQuery(e.target.value)}
              />

              <select
                value={newAlertFreq}
                onChange={(e) => setNewAlertFreq(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              >
                <option value="WEEKLY">Weekly</option>
                <option value="DAILY">Daily</option>
                <option value="REALTIME">Immediate</option>
              </select>

              <button type="submit" className="btn btn-primary btn-sm" disabled={subscribing}>
                {subscribing ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>

            {/* Subscribed List */}
            <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
              {alerts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No active topic subscriptions. Subscribe above to track emerging literature.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {alerts.map(a => (
                    <div
                      key={a.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 14px',
                        backgroundColor: 'var(--bg-alt)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-main)' }}>
                          {a.query}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Digest frequency: {a.frequency}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '11px', padding: '3px 8px', color: 'var(--danger)' }}
                        onClick={() => handleDeleteAlert(a.id)}
                      >
                        Unsubscribe
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
