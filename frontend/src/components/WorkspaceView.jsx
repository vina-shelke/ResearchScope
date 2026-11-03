import React, { useState, useEffect } from 'react';
import {
  fetchWorkspaceProjects,
  createWorkspaceProject,
  deleteWorkspaceProject,
  fetchWorkspacePapers,
  updatePaperReadingStatus,
  removePaperFromWorkspace,
  fetchSavedSearches,
  deleteSavedSearch,
  fetchSavedComparisons,
  deleteSavedComparison,
  fetchSavedGapAnalyses,
  deleteSavedGapAnalysis,
  getWorkspaceBibTeXUrl,
  getWorkspaceCsvUrl
} from '../api/client';
import { IconDownload, IconClose, IconPencil, IconBookmark } from './Icons';
import { useToast } from './Toast';

export default function WorkspaceView({ onSelectPaper, onRunSearch, onLoadComparison, onOpenAuthModal, currentUser }) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('reading'); // reading, projects, searches, comparisons, gaps
  const [papers, setPapers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [searches, setSearches] = useState([]);
  const [comparisons, setComparisons] = useState([]);
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [tempNotes, setTempNotes] = useState('');

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetchWorkspacePapers(),
      fetchWorkspaceProjects(),
      fetchSavedSearches(),
      fetchSavedComparisons(),
      fetchSavedGapAnalyses()
    ])
      .then(([pList, prjList, sList, cList, gList]) => {
        setPapers(pList || []);
        setProjects(prjList || []);
        setSearches(sList || []);
        setComparisons(cList || []);
        setGaps(gList || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (paperId, newStatus) => {
    try {
      await updatePaperReadingStatus(paperId, { readingStatus: newStatus });
      setPapers(prev => prev.map(p => p.paperId === paperId ? { ...p, readingStatus: newStatus } : p));
      toast.success(`Reading status updated to ${newStatus}.`);
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error('Failed to update status.');
    }
  };

  const handleSaveNotes = async (paperId) => {
    try {
      await updatePaperReadingStatus(paperId, { notes: tempNotes });
      setPapers(prev => prev.map(p => p.paperId === paperId ? { ...p, notes: tempNotes } : p));
      setEditingNotesId(null);
      toast.success('Notes saved successfully.');
    } catch (err) {
      console.error('Failed to save notes:', err);
      toast.error('Failed to save notes.');
    }
  };

  const handleRemovePaper = async (paperId) => {
    try {
      await removePaperFromWorkspace(paperId);
      setPapers(prev => prev.filter(p => p.paperId !== paperId));
      toast.info('Paper removed from workspace.');
    } catch (err) {
      console.error('Failed to remove paper:', err);
      toast.error('Failed to remove paper.');
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;
    try {
      const created = await createWorkspaceProject({
        title: newProjectTitle.trim(),
        description: newProjectDesc.trim()
      });
      setProjects(prev => [created, ...prev]);
      setNewProjectTitle('');
      setNewProjectDesc('');
      setShowNewProjectForm(false);
      toast.success('Research project created.');
    } catch (err) {
      console.error('Failed to create project:', err);
      toast.error('Failed to create project.');
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await deleteWorkspaceProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      toast.info('Project deleted.');
    } catch (err) {
      console.error('Failed to delete project:', err);
      toast.error('Failed to delete project.');
    }
  };

  const unreadPapers = papers.filter(p => p.readingStatus === 'UNREAD');
  const readingPapers = papers.filter(p => p.readingStatus === 'READING');
  const reviewedPapers = papers.filter(p => p.readingStatus === 'REVIEWED');

  return (
    <div>
      {/* Workspace Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h1 className="section-title">Research Workspace</h1>
          <div className="section-description">
            Organize your literature reviews, reading workflows, research projects, and private scholar notes.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <a href={getWorkspaceBibTeXUrl()} className="btn btn-secondary btn-sm" download>
            <IconDownload size={13} /> Export BibTeX
          </a>
          <a href={getWorkspaceCsvUrl()} className="btn btn-secondary btn-sm" download>
            <IconDownload size={13} /> Export CSV
          </a>
        </div>
      </div>

      {/* User Session Banner */}
      <div className="panel" style={{ marginBottom: '20px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-alt)', borderLeft: '4px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-subtle)', color: 'var(--text-main)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>
            EV
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
              {currentUser?.username || 'Dr. Elena Vance'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {currentUser?.email || 'researcher@researchscope.edu'} • Authorized Researcher Session
            </div>
          </div>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={onOpenAuthModal}>
          Switch / Register Account
        </button>
      </div>

      {/* Sub-Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid var(--border-color)', marginBottom: '24px' }}>
        {[
          { id: 'reading', label: `Reading Tracker (${papers.length})` },
          { id: 'projects', label: `Research Projects (${projects.length})` },
          { id: 'searches', label: `Saved Searches (${searches.length})` },
          { id: 'comparisons', label: `Saved Comparisons (${comparisons.length})` },
          { id: 'gaps', label: `Saved Gap Analyses (${gaps.length})` }
        ].map(t => (
          <button
            key={t.id}
            style={{
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: activeTab === t.id ? 700 : 500,
              color: activeTab === t.id ? 'var(--text-main)' : 'var(--text-muted)',
              border: 'none',
              borderBottom: activeTab === t.id ? '2px solid var(--text-main)' : '2px solid transparent',
              background: 'none',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="panel" style={{ textAlign: 'center', padding: '30px' }}>
          Loading your research workspace...
        </div>
      )}

      {/* 1. Reading Tracker Kanban Tab */}
      {!loading && activeTab === 'reading' && (
        <div>
          {papers.length === 0 ? (
            <div className="panel" style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Your Workspace Library is Empty</div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Bookmark papers from <strong>Explore Research</strong> or Paper Details to track reading status, add research notes, and assign them to projects.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {[
                { title: 'Unread Queue', status: 'UNREAD', items: unreadPapers, color: '#71717a' },
                { title: 'In Progress / Reading', status: 'READING', items: readingPapers, color: '#8e8e93' },
                { title: 'Reviewed & Synthesized', status: 'REVIEWED', items: reviewedPapers, color: '#4d6b53' }
              ].map(col => (
                <div key={col.status} style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: `2px solid ${col.color}`, paddingBottom: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>{col.title}</span>
                    <span className="tag" style={{ fontSize: '11px', fontWeight: 700 }}>{col.items.length}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {col.items.map(wp => (
                      <div key={wp.id} style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '14px', boxShadow: 'var(--shadow-subtle)', boxSizing: 'border-box' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <button
                            type="button"
                            style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', fontWeight: 600, fontSize: '13px', color: 'var(--text-main)', cursor: 'pointer', lineHeight: '1.4', wordBreak: 'break-word', overflowWrap: 'break-word', flex: 1 }}
                            onClick={() => onSelectPaper(wp.paperId)}
                          >
                            {wp.paper?.title || 'Untitled Paper'}
                          </button>
                          <button
                            type="button"
                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                            onClick={() => handleRemovePaper(wp.paperId)}
                            title="Remove from workspace"
                          >
                            <IconClose size={12} />
                          </button>
                        </div>

                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '6px 0', wordBreak: 'break-word' }}>
                          {wp.paper?.publicationYear || 'n.d.'} • {wp.paper?.venue || 'Venue'} • {wp.collectionName || 'Favorites'}
                        </div>

                        {/* Status switcher pills */}
                        <div style={{ display: 'flex', gap: '4px', margin: '8px 0', flexWrap: 'wrap' }}>
                          {['UNREAD', 'READING', 'REVIEWED'].map(st => (
                            <button
                              key={st}
                              type="button"
                              style={{
                                fontSize: '10px',
                                padding: '3px 7px',
                                border: '1px solid var(--border-color)',
                                borderRadius: '3px',
                                background: wp.readingStatus === st ? 'var(--accent)' : 'var(--bg-main)',
                                color: wp.readingStatus === st ? 'var(--accent-text)' : 'var(--text-muted)',
                                cursor: 'pointer'
                              }}
                              onClick={() => handleStatusChange(wp.paperId, st)}
                            >
                              {st === 'UNREAD' ? 'Unread' : st === 'READING' ? 'Reading' : 'Reviewed'}
                            </button>
                          ))}
                        </div>

                        {/* Personal Notes */}
                        {editingNotesId === wp.id ? (
                          <div style={{ marginTop: '8px' }}>
                            <textarea
                              style={{ width: '100%', fontSize: '12px', padding: '6px', border: '1px solid var(--border-color)', borderRadius: '3px', height: '60px', boxSizing: 'border-box' }}
                              value={tempNotes}
                              onChange={(e) => setTempNotes(e.target.value)}
                              placeholder="Add personal notes or literature review thoughts..."
                            />
                            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                              <button className="btn btn-primary btn-sm" style={{ fontSize: '11px', padding: '2px 8px' }} onClick={() => handleSaveNotes(wp.paperId)}>
                                Save
                              </button>
                              <button className="btn btn-secondary btn-sm" style={{ fontSize: '11px', padding: '2px 8px' }} onClick={() => setEditingNotesId(null)}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            style={{ fontSize: '12px', color: wp.notes ? 'var(--text-main)' : 'var(--text-muted)', fontStyle: wp.notes ? 'normal' : 'italic', cursor: 'pointer', background: 'var(--bg-alt)', padding: '6px 8px', borderRadius: '3px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '5px', wordBreak: 'break-word' }}
                            onClick={() => {
                              setEditingNotesId(wp.id);
                              setTempNotes(wp.notes || '');
                            }}
                          >
                            {wp.notes ? wp.notes : (<><IconPencil size={11} /> Click to add research note...</>)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Projects Tab */}
      {!loading && activeTab === 'projects' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Literature Review Projects</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowNewProjectForm(!showNewProjectForm)}>
              {showNewProjectForm ? 'Cancel' : '+ New Research Project'}
            </button>
          </div>

          {showNewProjectForm && (
            <form onSubmit={handleCreateProject} className="panel" style={{ marginBottom: '20px', padding: '20px 24px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Create Named Project</h4>
              <input
                type="text"
                className="search-input"
                style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-color)', marginBottom: '10px' }}
                placeholder="Project title (e.g. Adversarial Robustness in LLMs Dissertation Chapter)..."
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
              />
              <textarea
                style={{ width: '100%', fontSize: '13px', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', marginBottom: '10px', height: '60px', backgroundColor: 'var(--bg-surface)', color: 'var(--text-main)', boxSizing: 'border-box' }}
                placeholder="Project objectives, research questions, or scope..."
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm">Create Project</button>
            </form>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {projects.map(prj => (
              <div key={prj.id} className="panel" style={{ padding: '18px 22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px 0' }}>{prj.title}</h4>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                    onClick={() => handleDeleteProject(prj.id)}
                    title="Delete project"
                  >
                    <IconClose size={12} />
                  </button>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', margin: '6px 0 12px 0' }}>
                  {prj.description || 'No description provided.'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                  <span className="tag tag-accent">{prj.paperCount} Papers Assigned</span>
                  <span style={{ color: 'var(--text-muted)' }}>Updated {new Date(prj.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Saved Searches Tab */}
      {!loading && activeTab === 'searches' && (
        <div className="panel" style={{ padding: '20px 24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>Saved Search Queries</h3>
          {searches.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No saved searches yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {searches.map(s => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>"{s.queryText}"</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '10px' }}>Saved on {new Date(s.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => onRunSearch(s.queryText)}>
                      Run Query
                    </button>
                    <button className="btn btn-sm" style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }} onClick={() => deleteSavedSearch(s.id).then(loadData)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Saved Comparisons Tab */}
      {!loading && activeTab === 'comparisons' && (
        <div className="panel" style={{ padding: '20px 24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>Saved Paper Comparisons</h3>
          {comparisons.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No saved paper comparisons yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {comparisons.map(c => (
                <div key={c.id} style={{ padding: '12px 16px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 700, fontSize: '15px' }}>{c.title}</span>
                    <button className="btn btn-sm" style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }} onClick={() => deleteSavedComparison(c.id).then(loadData)}>
                      <IconClose size={12} />
                    </button>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    {c.papers?.length || 0} Publications • Saved {new Date(c.createdAt).toLocaleDateString()}
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => onLoadComparison(c.papers?.map(p => p.id) || [])}>
                    Open in Comparison Lab
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Saved Gap Analyses Tab */}
      {!loading && activeTab === 'gaps' && (
        <div className="panel" style={{ padding: '20px 24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>Saved Research Gap Analyses</h3>
          {gaps.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No saved research gap analyses yet. Use the "Save Gap" button on any candidate gap in the Research Gap Intelligence tab.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {gaps.map(g => {
                let parsedGap = {};
                try { parsedGap = JSON.parse(g.gapsDataJson); } catch (e) {}
                return (
                  <div key={g.id} style={{ padding: '12px 16px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span className="tag" style={{ fontSize: '11px', marginBottom: '4px' }}>Topic: {g.topicQuery}</span>
                        <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '4px 0' }}>{parsedGap.title || 'Candidate Research Gap'}</h4>
                      </div>
                      <button className="btn btn-sm" style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }} onClick={() => deleteSavedGapAnalysis(g.id).then(loadData)}>
                        <IconClose size={12} />
                      </button>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', margin: '6px 0' }}>
                      {parsedGap.explanation}
                    </p>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Confidence: {parsedGap.confidenceScore} • Saved {new Date(g.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
