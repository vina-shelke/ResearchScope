import React, { useState, useEffect } from 'react';
import { 
  generateLiteratureReview, 
  fetchUserLiteratureReviews, 
  fetchLiteratureReviewById, 
  updateLiteratureReviewSection, 
  regenerateLiteratureReviewSection, 
  deleteLiteratureReview,
  getLiteratureReviewExportUrl,
  fetchWorkspacePapers,
  fetchWorkspaceProjects
} from '../api/client';
import { useToast } from './Toast';
import { 
  IconBookOpen, 
  IconPlus, 
  IconCheck, 
  IconPencil, 
  IconDownload, 
  IconClose, 
  IconSearch, 
  IconFolder, 
  IconSparkles,
  IconAlert
} from './Icons';
import SourceEvidenceDrawer from './SourceEvidenceDrawer';

export default function LiteratureReviewGenerator({ onSelectPaper, setActiveTab }) {
  const toast = useToast();
  const [activeSubTab, setActiveSubTab] = useState('generator'); // 'generator', 'history'
  const [reviewsList, setReviewsList] = useState([]);
  const [activeReview, setActiveReview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [topicQuery, setTopicQuery] = useState('');
  const [style, setStyle] = useState('ACADEMIC'); // 'ACADEMIC', 'SIMPLE', 'TECHNICAL'
  const [selectedPaperIds, setSelectedPaperIds] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');

  // Workspace datasets
  const [workspacePapers, setWorkspacePapers] = useState([]);
  const [workspaceProjects, setWorkspaceProjects] = useState([]);
  const [paperFilterQuery, setPaperFilterQuery] = useState('');

  // Editing and Regenerating Section State
  const [editingSectionKey, setEditingSectionKey] = useState(null);
  const [tempSectionContent, setTempSectionContent] = useState('');
  const [savingSection, setSavingSection] = useState(false);
  const [regeneratingKey, setRegeneratingKey] = useState(null);
  const [regenInstructions, setRegenInstructions] = useState('');
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [targetRegenKey, setTargetRegenKey] = useState(null);

  // Evidence Drawer State
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState(false);

  const loadReviews = () => {
    fetchUserLiteratureReviews()
      .then(list => setReviewsList(list || []))
      .catch(() => {});
  };

  useEffect(() => {
    loadReviews();
    fetchWorkspacePapers()
      .then(list => setWorkspacePapers(list || []))
      .catch(() => {});
    fetchWorkspaceProjects()
      .then(p => setWorkspaceProjects(p || []))
      .catch(() => {});
  }, []);

  const handleTogglePaperSelect = (paperId) => {
    setSelectedPaperIds(prev => {
      if (prev.includes(paperId)) {
        return prev.filter(id => id !== paperId);
      } else {
        if (prev.length >= 15) {
          toast.warning('Maximum 15 papers can be synthesized in a single literature review draft.');
          return prev;
        }
        return [...prev, paperId];
      }
    });
  };

  const handleSelectAllWorkspacePapers = () => {
    const allIds = workspacePapers.map(wp => wp.paperId).slice(0, 15);
    setSelectedPaperIds(allIds);
    toast.info(`Selected ${allIds.length} papers from workspace.`);
  };

  const handleClearSelectedPapers = () => {
    setSelectedPaperIds([]);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (selectedPaperIds.length === 0) {
      toast.warning('Please select at least 1 paper to ground the literature review.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim() || undefined,
        topicQuery: topicQuery.trim() || undefined,
        style,
        paperIds: selectedPaperIds,
        projectId: selectedProjectId || undefined
      };

      const result = await generateLiteratureReview(payload);
      setActiveReview(result);
      loadReviews();
      toast.success('Literature review synthesized successfully across 10 academic sections.');
    } catch (err) {
      console.error('Literature Review Generation Failed:', err);
      toast.error('Failed to generate literature review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = async (reviewId) => {
    setLoading(true);
    try {
      const r = await fetchLiteratureReviewById(reviewId);
      setActiveReview(r);
      setActiveSubTab('generator');
    } catch (err) {
      console.error('Failed to load review:', err);
      toast.error('Failed to load literature review draft.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this literature review draft permanently?')) return;
    try {
      await deleteLiteratureReview(reviewId);
      if (activeReview?.id === reviewId) {
        setActiveReview(null);
      }
      loadReviews();
      toast.info('Literature review deleted.');
    } catch (err) {
      console.error('Failed to delete review:', err);
      toast.error('Failed to delete literature review.');
    }
  };

  const handleStartEditSection = (section) => {
    setEditingSectionKey(section.sectionKey);
    setTempSectionContent(section.content || '');
  };

  const handleSaveSectionEdits = async (sectionKey) => {
    if (!activeReview) return;
    setSavingSection(true);
    try {
      const updated = await updateLiteratureReviewSection(activeReview.id, sectionKey, tempSectionContent);
      setActiveReview(prev => ({
        ...prev,
        sections: prev.sections.map(s => s.sectionKey === sectionKey ? { ...s, content: updated.content, isUserEdited: true } : s)
      }));
      setEditingSectionKey(null);
      toast.success('Section updated.');
    } catch (err) {
      console.error('Failed to save section edits:', err);
      toast.error('Failed to save section edits.');
    } finally {
      setSavingSection(false);
    }
  };

  const handleOpenRegenModal = (sectionKey) => {
    setTargetRegenKey(sectionKey);
    setRegenInstructions('');
    setShowRegenModal(true);
  };

  const handleExecuteRegenerate = async () => {
    if (!activeReview || !targetRegenKey) return;
    setRegeneratingKey(targetRegenKey);
    setShowRegenModal(false);
    try {
      const regenerated = await regenerateLiteratureReviewSection(activeReview.id, targetRegenKey, regenInstructions);
      setActiveReview(prev => ({
        ...prev,
        sections: prev.sections.map(s => s.sectionKey === targetRegenKey ? { ...s, content: regenerated.content, isUserEdited: false } : s)
      }));
      toast.success(`Section regenerated.`);
    } catch (err) {
      console.error('Failed to regenerate section:', err);
      toast.error('Failed to regenerate section.');
    } finally {
      setRegeneratingKey(null);
      setTargetRegenKey(null);
    }
  };

  const handleCopyToClipboard = () => {
    if (!activeReview?.fullDraftMarkdown) return;
    navigator.clipboard.writeText(activeReview.fullDraftMarkdown);
    toast.success('Full literature review copied to clipboard.');
  };

  const filteredPapers = workspacePapers.filter(wp => {
    const q = paperFilterQuery.toLowerCase().trim();
    if (!q) return true;
    const titleMatch = wp.paper?.title && wp.paper.title.toLowerCase().includes(q);
    const venueMatch = wp.paper?.venue && wp.paper.venue.toLowerCase().includes(q);
    return titleMatch || venueMatch;
  });

  return (
    <div className="literature-review-module" style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header & Navigation */}
      <div className="panel" style={{
        padding: '24px 28px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-subtle)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)'
              }}>
                <IconBookOpen size={18} />
              </span>
              <h1 className="section-title" style={{ margin: 0 }}>Automated Literature Review Generator</h1>
            </div>
            <div className="section-description" style={{ marginTop: '4px' }}>
              Synthesize 10 structured academic sections from selected papers with rigorous in-text citations and verification.
            </div>
          </div>

          {/* Subtabs */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className={activeSubTab === 'generator' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
              onClick={() => setActiveSubTab('generator')}
            >
              {activeReview ? 'Active Review' : 'Create Review'}
            </button>
            <button
              type="button"
              className={activeSubTab === 'history' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
              onClick={() => setActiveSubTab('history')}
            >
              Saved Drafts ({reviewsList.length})
            </button>
          </div>
        </div>

        {/* 2. Review Setup Wizard (when in generator tab and no active review loaded) */}
        {activeSubTab === 'generator' && !activeReview && (
          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Step 1: Select Papers */}
            <div style={{
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px 18px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 7px', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)', marginRight: '8px' }}>
                    STEP 1
                  </span>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)' }}>
                    Select Publications to Synthesize ({selectedPaperIds.length} Selected)
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '11px', padding: '3px 8px' }}
                    onClick={handleSelectAllWorkspacePapers}
                    disabled={workspacePapers.length === 0}
                  >
                    Select All ({workspacePapers.length})
                  </button>
                  {selectedPaperIds.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '11px', padding: '3px 8px' }}
                      onClick={handleClearSelectedPapers}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Papers Input */}
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }}>
                  <IconSearch size={13} />
                </span>
                <input
                  type="text"
                  className="search-input"
                  style={{ paddingLeft: '30px', height: '34px', fontSize: '12.5px', width: '100%' }}
                  placeholder="Filter workspace publications by title, venue..."
                  value={paperFilterQuery}
                  onChange={(e) => setPaperFilterQuery(e.target.value)}
                />
              </div>

              {/* Papers Grid */}
              {workspacePapers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '12.5px' }}>
                  No papers saved in your workspace yet. Bookmark papers from <strong>Papers Explorer</strong> to synthesize literature reviews.
                </div>
              ) : (
                <div style={{
                  maxHeight: '220px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  paddingRight: '4px'
                }}>
                  {filteredPapers.map(wp => {
                    const isChecked = selectedPaperIds.includes(wp.paperId);
                    return (
                      <div
                        key={wp.paperId}
                        onClick={() => handleTogglePaperSelect(wp.paperId)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          backgroundColor: isChecked ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                          border: isChecked ? '1px solid var(--accent)' : '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-xs)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          style={{ cursor: 'pointer' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {wp.paper?.title || 'Untitled Paper'}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {wp.paper?.publicationYear || 'n.d.'} • {wp.paper?.venue || 'Venue'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 2: Title, Topic, and Style Settings */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
              gap: '14px',
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px 18px',
              boxSizing: 'border-box'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Review Title
                </label>
                <input
                  type="text"
                  className="search-input"
                  style={{ width: '100%', fontSize: '13px' }}
                  placeholder="e.g. A Comprehensive Survey of Adversarial Robustness in Deep Learning"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Target Domain / Research Scope
                </label>
                <input
                  type="text"
                  className="search-input"
                  style={{ width: '100%', fontSize: '13px' }}
                  placeholder="e.g. Deep Learning, Cloud Security, Computer Vision"
                  value={topicQuery}
                  onChange={(e) => setTopicQuery(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                  Writing Style
                </label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'ACADEMIC', label: 'Academic Research Style' },
                    { id: 'SIMPLE', label: 'Simple Academic English' },
                    { id: 'TECHNICAL', label: 'Technical Research Style' }
                  ].map(s => (
                    <button
                      key={s.id}
                      type="button"
                      className={style === s.id ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                      onClick={() => setStyle(s.id)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '10px 22px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                disabled={loading || selectedPaperIds.length === 0}
              >
                <IconSparkles size={16} />
                <span>{loading ? 'Synthesizing 10 Sections...' : 'Generate Literature Review Draft'}</span>
              </button>
            </div>
          </form>
        )}

        {/* 3. Active Generated Review Workspace */}
        {activeSubTab === 'generator' && activeReview && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Active Header & Export Controls */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              paddingBottom: '14px',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    {activeReview.title}
                  </h2>
                  <span className="tag tag-accent" style={{ fontSize: '10.5px' }}>
                    {activeReview.style} Style
                  </span>
                  <span className="tag" style={{ fontSize: '10.5px' }}>
                    {activeReview.papers?.length || 0} Publications
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Draft saved to workspace • Updated {new Date(activeReview.updatedAt || Date.now()).toLocaleDateString()}
                </div>
              </div>

              {/* Action Toolbar */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <a
                  href={getLiteratureReviewExportUrl(activeReview.id, 'latex')}
                  className="btn btn-secondary btn-sm"
                  download
                  title="Export complete review as ready-to-compile LaTeX (.tex)"
                >
                  <IconDownload size={12} /> Export LaTeX
                </a>
                <a
                  href={getLiteratureReviewExportUrl(activeReview.id, 'markdown')}
                  className="btn btn-secondary btn-sm"
                  download
                  title="Export complete review as Markdown (.md)"
                >
                  <IconDownload size={12} /> Export Markdown
                </a>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleCopyToClipboard}
                  title="Copy full text draft"
                >
                  Copy Text
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsEvidenceDrawerOpen(true)}
                  title="Inspect supporting evidence and passages"
                >
                  <IconCheck size={12} /> Grounding
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setActiveReview(null)}
                  title="Create a new literature review"
                >
                  New Draft
                </button>
              </div>
            </div>

            {/* 10 Sections Accordion List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {activeReview.sections?.map(sec => {
                const isEditing = editingSectionKey === sec.sectionKey;
                const isRegenerating = regeneratingKey === sec.sectionKey;

                return (
                  <div
                    key={sec.id || sec.sectionKey}
                    style={{
                      backgroundColor: 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '16px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    {/* Section Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-main)' }}>
                          {sec.sectionTitle}
                        </span>
                        {sec.isUserEdited && (
                          <span className="tag" style={{ fontSize: '10px' }}>User Edited</span>
                        )}
                      </div>

                      {/* Section Action Controls */}
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {!isEditing && sec.sectionKey !== 'REFERENCES' && (
                          <>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '11px', padding: '3px 8px' }}
                              onClick={() => handleStartEditSection(sec)}
                            >
                              <IconPencil size={11} /> Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '11px', padding: '3px 8px' }}
                              onClick={() => handleOpenRegenModal(sec.sectionKey)}
                              disabled={isRegenerating}
                            >
                              <IconSparkles size={11} /> {isRegenerating ? 'Rewriting...' : 'Regenerate'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Section Content / Editor */}
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <textarea
                          style={{
                            width: '100%',
                            minHeight: '140px',
                            fontSize: '13px',
                            lineHeight: '1.6',
                            padding: '10px 14px',
                            backgroundColor: 'var(--bg-surface)',
                            color: 'var(--text-main)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-xs)',
                            fontFamily: 'inherit',
                            resize: 'vertical',
                            boxSizing: 'border-box'
                          }}
                          value={tempSectionContent}
                          onChange={(e) => setTempSectionContent(e.target.value)}
                        />
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => handleSaveSectionEdits(sec.sectionKey)}
                            disabled={savingSection}
                          >
                            {savingSection ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => setEditingSectionKey(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        fontSize: '13.5px',
                        lineHeight: '1.7',
                        color: 'var(--text-main)',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}>
                        {sec.content}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Saved Reviews History Archive */}
        {activeSubTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 10px 0', color: 'var(--text-main)' }}>
              Saved Literature Review Drafts
            </h3>

            {reviewsList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)', fontSize: '13px', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                No saved literature review drafts yet. Use the <strong>Create Review</strong> tab to synthesize your first draft.
              </div>
            ) : (
              reviewsList.map(r => (
                <div
                  key={r.id}
                  style={{
                    backgroundColor: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
                        {r.title}
                      </span>
                      <span className="tag tag-accent" style={{ fontSize: '10.5px' }}>{r.style}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {r.topicQuery ? `Domain: ${r.topicQuery} • ` : ''}Updated on {new Date(r.updatedAt || Date.now()).toLocaleDateString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleOpenReview(r.id)}
                    >
                      Open Review
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#ef4444' }}
                      onClick={() => handleDeleteReview(r.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 5. Custom Regeneration Instructions Modal */}
      {showRegenModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowRegenModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              boxShadow: 'var(--shadow-skeuo-modal)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
                Regenerate Section
              </h3>
              <button
                type="button"
                onClick={() => setShowRegenModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <IconClose size={14} />
              </button>
            </div>

            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Optional: provide custom author instructions or areas of emphasis to guide the synthesis:
            </p>

            <textarea
              style={{
                width: '100%',
                height: '80px',
                fontSize: '12.5px',
                padding: '8px 10px',
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-xs)',
                color: 'var(--text-main)',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                marginBottom: '16px'
              }}
              placeholder="e.g. Focus more specifically on empirical benchmarks and sample size limitations..."
              value={regenInstructions}
              onChange={(e) => setRegenInstructions(e.target.value)}
              autoFocus
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowRegenModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleExecuteRegenerate}
              >
                Regenerate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Universal Source Evidence Drawer */}
      <SourceEvidenceDrawer
        isOpen={isEvidenceDrawerOpen}
        onClose={() => setIsEvidenceDrawerOpen(false)}
        evidenceList={activeReview?.sourceEvidence || []}
        citedPapers={activeReview?.papers || []}
        onSelectPaper={onSelectPaper}
      />
    </div>
  );
}
