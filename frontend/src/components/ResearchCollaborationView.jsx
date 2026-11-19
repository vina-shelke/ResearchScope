import React, { useState, useEffect } from 'react';
import {
  fetchUserTeams,
  createResearchTeam,
  fetchTeamDetails,
  updateResearchTeam,
  deleteResearchTeam,
  addTeamMember,
  updateTeamMemberRole,
  removeTeamMember,
  addTeamPaper,
  updateTeamPaperAssignment,
  removeTeamPaper,
  fetchTeamPaperComments,
  addTeamPaperComment,
  getTeamMatrixCsvUrl,
  fetchPapers
} from '../api/client';
import {
  IconCheck,
  IconClose,
  IconDownload,
  IconExternalLink,
  IconPencil,
  IconPlus,
  IconPaper,
  IconSparkles,
  IconFilter,
  IconClock
} from './Icons';
import { useToast } from './Toast';

export default function ResearchCollaborationView({
  onSelectPaper,
  currentUser
}) {
  const toast = useToast();

  const [teams, setTeams] = useState([]);
  const [activeTeamId, setActiveTeamId] = useState(null);
  const [teamDetails, setTeamDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subTab, setSubTab] = useState('literature'); // 'literature' | 'members'

  // Modals
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [newTeamForm, setNewTeamForm] = useState({ name: '', description: '', institution: '' });

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', name: '', role: 'RESEARCHER' });

  // Notes Modal
  const [editingNotesPaper, setEditingNotesPaper] = useState(null);
  const [notesValue, setNotesValue] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Comments / Discussion Modal
  const [discussionPaper, setDiscussionPaper] = useState(null);
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [newCommentVote, setNewCommentVote] = useState('NONE'); // NONE, AGREE, DISAGREE, NEUTRAL
  const [submittingComment, setSubmittingComment] = useState(false);

  // Search & add paper inline
  const [paperSearchQuery, setPaperSearchQuery] = useState('');
  const [paperSearchResults, setPaperSearchResults] = useState([]);
  const [searchingPapers, setSearchingPapers] = useState(false);

  // Status Filter
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Load user teams
  const loadTeams = (preferredTeamId = null) => {
    setLoading(true);
    fetchUserTeams()
      .then(list => {
        setTeams(list || []);
        if (list && list.length > 0) {
          const targetId = preferredTeamId || activeTeamId || list[0].id;
          setActiveTeamId(targetId);
          loadTeamDetails(targetId);
        } else {
          setActiveTeamId(null);
          setTeamDetails(null);
        }
      })
      .catch(err => {
        console.error('Failed to load teams:', err);
        toast.error('Failed to load research teams.');
      })
      .finally(() => setLoading(false));
  };

  const loadTeamDetails = (id) => {
    if (!id) return;
    fetchTeamDetails(id)
      .then(res => {
        setTeamDetails(res);
      })
      .catch(err => {
        console.error('Failed to load team details:', err);
      });
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const handleSelectTeam = (id) => {
    setActiveTeamId(id);
    loadTeamDetails(id);
  };

  // Create Team
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamForm.name.trim()) {
      toast.error('Please enter a team name');
      return;
    }
    try {
      const created = await createResearchTeam(newTeamForm);
      toast.success(`Team "${created.name}" created successfully.`);
      setShowCreateTeamModal(false);
      setNewTeamForm({ name: '', description: '', institution: '' });
      loadTeams(created.id);
    } catch (err) {
      console.error(err);
      toast.error('Failed to create team.');
    }
  };

  // Invite Member
  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteForm.email.trim()) {
      toast.error('Please enter a valid email address');
      return;
    }
    try {
      await addTeamMember(activeTeamId, inviteForm);
      toast.success(`Added ${inviteForm.email} to research team.`);
      setShowInviteModal(false);
      setInviteForm({ email: '', name: '', role: 'RESEARCHER' });
      loadTeamDetails(activeTeamId);
    } catch (err) {
      console.error(err);
      toast.error('Failed to add team member: ' + err.message);
    }
  };

  // Change Member Role
  const handleRoleChange = async (memberId, newRole) => {
    try {
      await updateTeamMemberRole(activeTeamId, memberId, newRole);
      toast.success('Member role updated.');
      loadTeamDetails(activeTeamId);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update member role.');
    }
  };

  // Remove Member
  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName || 'this member'} from the team?`)) return;
    try {
      await removeTeamMember(activeTeamId, memberId);
      toast.success('Member removed from team.');
      loadTeamDetails(activeTeamId);
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove member.');
    }
  };

  // Search papers to add
  const handleSearchPapers = (e) => {
    e.preventDefault();
    if (!paperSearchQuery.trim()) return;
    setSearchingPapers(true);
    fetchPapers({ q: paperSearchQuery.trim(), size: 5 })
      .then(res => setPaperSearchResults(res.content || []))
      .catch(console.error)
      .finally(() => setSearchingPapers(false));
  };

  // Add paper to team
  const handleAddPaperToTeam = async (paper) => {
    try {
      const authorsStr = (paper.authors && Array.isArray(paper.authors))
        ? paper.authors.map(a => typeof a === 'object' ? a.name : a).join(', ')
        : (paper.authors || 'Unknown');

      await addTeamPaper(activeTeamId, {
        paperId: paper.id,
        title: paper.title,
        authors: authorsStr,
        publicationYear: paper.publicationYear,
        venue: paper.venue,
        doi: paper.doi
      });
      toast.success(`Added "${paper.title.slice(0, 40)}..." to team library.`);
      setPaperSearchResults([]);
      setPaperSearchQuery('');
      loadTeamDetails(activeTeamId);
    } catch (err) {
      console.error(err);
      toast.error('Failed to add paper to team: ' + err.message);
    }
  };

  // Update paper status
  const handleStatusChange = async (teamPaperId, newStatus) => {
    try {
      await updateTeamPaperAssignment(activeTeamId, teamPaperId, { status: newStatus });
      toast.success(`Reading status updated to ${newStatus}.`);
      loadTeamDetails(activeTeamId);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update paper status.');
    }
  };

  // Update paper assigned member
  const handleAssignMember = async (teamPaperId, memberUserId, memberName) => {
    try {
      await updateTeamPaperAssignment(activeTeamId, teamPaperId, {
        assignedToUserId: memberUserId,
        assignedToName: memberName
      });
      toast.success(`Assigned paper to ${memberName}.`);
      loadTeamDetails(activeTeamId);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update paper assignment.');
    }
  };

  // Open Notes Modal
  const handleOpenNotes = (paper) => {
    setEditingNotesPaper(paper);
    setNotesValue(paper.notes || '');
  };

  // Save Notes
  const handleSaveNotes = async () => {
    if (!editingNotesPaper) return;
    setSavingNotes(true);
    try {
      await updateTeamPaperAssignment(activeTeamId, editingNotesPaper.id, { notes: notesValue });
      toast.success('Shared collaborative notes saved.');
      setEditingNotesPaper(null);
      loadTeamDetails(activeTeamId);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save notes.');
    } finally {
      setSavingNotes(false);
    }
  };

  // Open Discussion Modal
  const handleOpenDiscussion = (paper) => {
    setDiscussionPaper(paper);
    setComments([]);
    setNewCommentText('');
    setNewCommentVote('NONE');
    fetchTeamPaperComments(activeTeamId, paper.paperId)
      .then(res => setComments(res || []))
      .catch(console.error);
  };

  // Submit Comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !discussionPaper) return;
    setSubmittingComment(true);
    try {
      const created = await addTeamPaperComment(activeTeamId, discussionPaper.paperId, {
        commentText: newCommentText.trim(),
        consensusVote: newCommentVote
      });
      setComments(prev => [...prev, created]);
      setNewCommentText('');
      setNewCommentVote('NONE');
      toast.success('Comment & consensus vote added.');
      loadTeamDetails(activeTeamId);
    } catch (err) {
      console.error(err);
      toast.error('Failed to add comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Delete Paper from team
  const handleRemovePaper = async (teamPaperId, title) => {
    if (!window.confirm(`Remove "${title}" from team workspace?`)) return;
    try {
      await removeTeamPaper(activeTeamId, teamPaperId);
      toast.success('Paper removed from team library.');
      loadTeamDetails(activeTeamId);
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove paper.');
    }
  };

  // Render consensus pill
  const renderConsensusPill = (consensus) => {
    const c = consensus || 'PENDING';
    let bg = 'rgba(245, 158, 11, 0.12)';
    let color = '#f59e0b';
    let text = 'Pending Review';

    if (c === 'AGREE') {
      bg = 'rgba(16, 185, 129, 0.15)';
      color = '#10b981';
      text = 'Team Consensus: Agree';
    } else if (c === 'DISAGREE') {
      bg = 'rgba(239, 68, 68, 0.15)';
      color = '#ef4444';
      text = 'Consensus: Disagree';
    } else if (c === 'NEUTRAL') {
      bg = 'rgba(59, 130, 246, 0.12)';
      color = '#3b82f6';
      text = 'Neutral / Mixed';
    }

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: '10px',
        fontSize: '11px',
        fontWeight: 700,
        backgroundColor: bg,
        color: color
      }}>
        {c === 'AGREE' && <IconCheck size={11} />}
        {text}
      </span>
    );
  };

  const isAdmin = teamDetails && teamDetails.currentUserRole === 'ADMIN';

  const displayedPapers = (teamDetails && teamDetails.papers)
    ? teamDetails.papers.filter(p => statusFilter === 'ALL' || p.status === statusFilter)
    : [];

  return (
    <div className="research-collaboration-view">
      {/* Top Header & Team Selector */}
      <div className="panel" style={{ marginBottom: '20px', padding: '18px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
              color: 'var(--accent)'
            }}>
              <IconPaper size={18} />
            </span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  Research Teams & Collaborative Workspace
                </h2>
                {teamDetails && (
                  <span className="tag tag-accent" style={{ fontSize: '10.5px', fontWeight: 700 }}>
                    Your Role: {teamDetails.currentUserRole}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
                Coordinate literature review tasks, assign papers to lab members, build collective consensus, and share annotations.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {teams.length > 0 && (
              <select
                value={activeTeamId || ''}
                onChange={(e) => handleSelectTeam(Number(e.target.value))}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                {teams.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} {t.institution ? `(${t.institution})` : ''}
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setShowCreateTeamModal(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <IconPlus size={14} /> New Research Team
            </button>

            {activeTeamId && (
              <a
                href={getTeamMatrixCsvUrl(activeTeamId)}
                download="team-literature-matrix.csv"
                className="btn btn-secondary btn-sm"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                title="Export team literature review matrix with assignments and consensus"
              >
                <IconDownload size={14} /> Export Matrix CSV
              </a>
            )}
          </div>
        </div>

        {/* Team Summary Cards */}
        {teamDetails && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
            gap: '12px',
            marginTop: '18px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-color)'
          }}>
            <div style={{ padding: '12px 16px', backgroundColor: 'var(--bg-alt)', borderRadius: 'var(--radius-sm)', minWidth: 0, boxSizing: 'border-box' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Papers</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>{teamDetails.totalPapers}</div>
            </div>

            <div style={{ padding: '12px 16px', backgroundColor: 'var(--bg-alt)', borderRadius: 'var(--radius-sm)', minWidth: 0, boxSizing: 'border-box' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>Reviewed</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>{teamDetails.reviewedPapers}</div>
            </div>

            <div style={{ padding: '12px 16px', backgroundColor: 'var(--bg-alt)', borderRadius: 'var(--radius-sm)', minWidth: 0, boxSizing: 'border-box' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>In Progress</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent)', marginTop: '2px' }}>{teamDetails.inProgressPapers}</div>
            </div>

            <div style={{ padding: '12px 16px', backgroundColor: 'var(--bg-alt)', borderRadius: 'var(--radius-sm)', minWidth: 0, boxSizing: 'border-box' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>To Read</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>{teamDetails.toReadPapers}</div>
            </div>

            <div style={{ padding: '12px 16px', backgroundColor: 'var(--bg-alt)', borderRadius: 'var(--radius-sm)', minWidth: 0, boxSizing: 'border-box' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Lab Members</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>{teamDetails.members?.length || 0}</div>
            </div>
          </div>
        )}
      </div>

      {/* Sub Tabs: Literature & Assignments vs Members */}
      {teamDetails && (
        <div style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '2px solid var(--border-color)',
          marginBottom: '20px'
        }}>
          <button
            type="button"
            onClick={() => setSubTab('literature')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: subTab === 'literature' ? 700 : 500,
              color: subTab === 'literature' ? 'var(--text-main)' : 'var(--text-muted)',
              border: 'none',
              borderBottom: subTab === 'literature' ? '2px solid var(--text-main)' : '2px solid transparent',
              background: 'none',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            <IconPaper size={15} /> Literature & Review Assignments ({teamDetails.papers?.length || 0})
          </button>

          <button
            type="button"
            onClick={() => setSubTab('members')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: subTab === 'members' ? 700 : 500,
              color: subTab === 'members' ? 'var(--text-main)' : 'var(--text-muted)',
              border: 'none',
              borderBottom: subTab === 'members' ? '2px solid var(--text-main)' : '2px solid transparent',
              background: 'none',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            Team Members & Roles ({teamDetails.members?.length || 0})
          </button>
        </div>
      )}

      {/* Sub-tab 1: Literature & Assignments */}
      {subTab === 'literature' && teamDetails && (
        <div>
          {/* Add Paper Search Panel */}
          <div className="panel" style={{ marginBottom: '20px', padding: '16px 20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>
              Add Research Literature to Team Corpus
            </div>

            <form onSubmit={handleSearchPapers} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="search-input"
                style={{ fontSize: '13px', padding: '8px 14px' }}
                placeholder="Search publications to add to team review library..."
                value={paperSearchQuery}
                onChange={(e) => setPaperSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-secondary btn-sm" disabled={searchingPapers}>
                {searchingPapers ? 'Searching...' : 'Search Papers'}
              </button>
            </form>

            {paperSearchResults.length > 0 && (
              <div style={{ marginTop: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', maxHeight: '200px', overflowY: 'auto' }}>
                {paperSearchResults.map(paper => (
                  <div
                    key={paper.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      borderBottom: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-surface)'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                        {paper.title} ({paper.publicationYear})
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                        {paper.venue || 'Scholarly Publication'} • {paper.citationCount || 0} citations
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAddPaperToTeam(paper)}
                      style={{ fontSize: '11px', padding: '4px 10px' }}
                    >
                      + Add to Team
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Status Filter:</span>
              {['ALL', 'TO_READ', 'IN_PROGRESS', 'REVIEWED', 'REJECTED'].map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: statusFilter === st ? 700 : 500,
                    border: '1px solid var(--border-color)',
                    backgroundColor: statusFilter === st ? 'var(--text-main)' : 'var(--bg-surface)',
                    color: statusFilter === st ? 'var(--bg-surface)' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {st === 'ALL' ? 'All' : st.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Showing {displayedPapers.length} publications
            </div>
          </div>

          {/* Papers Table */}
          {displayedPapers.length === 0 ? (
            <div className="panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                No literature in this team view
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                Use the search bar above to add papers from the scholarly corpus to this team workspace.
              </p>
            </div>
          ) : (
            <div className="panel" style={{ padding: 0, overflowX: 'auto', border: '1px solid var(--border-color)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-alt)', borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '12px 16px', width: '38%' }}>Publication Title</th>
                    <th style={{ padding: '12px 14px' }}>Review Status</th>
                    <th style={{ padding: '12px 14px' }}>Assigned Researcher</th>
                    <th style={{ padding: '12px 14px' }}>Consensus</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedPapers.map(paper => (
                    <tr key={paper.id} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
                      {/* Title & Metadata */}
                      <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                        <div
                          style={{ fontWeight: 700, color: 'var(--text-main)', cursor: onSelectPaper ? 'pointer' : 'default', lineHeight: '1.4' }}
                          onClick={() => onSelectPaper && onSelectPaper(paper.paperId)}
                          title="Click to view detailed paper intelligence"
                        >
                          {paper.title}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {paper.authors} • {paper.publicationYear || 'n.d.'} {paper.venue ? `• ${paper.venue}` : ''}
                        </div>
                        {paper.notes && (
                          <div style={{
                            marginTop: '6px',
                            padding: '6px 10px',
                            backgroundColor: 'var(--bg-alt)',
                            borderRadius: '4px',
                            fontSize: '11.5px',
                            color: 'var(--text-muted)',
                            fontStyle: 'italic',
                            borderLeft: '3px solid var(--accent)'
                          }}>
                            "{paper.notes}"
                          </div>
                        )}
                      </td>

                      {/* Review Status Dropdown */}
                      <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>
                        <select
                          value={paper.status}
                          onChange={(e) => handleStatusChange(paper.id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-main)',
                            color: 'var(--text-main)',
                            fontSize: '11.5px',
                            fontWeight: 600
                          }}
                        >
                          <option value="TO_READ">To Read</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="REVIEWED">Reviewed</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </td>

                      {/* Assigned Researcher Dropdown */}
                      <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>
                        <select
                          value={paper.assignedToUserId || ''}
                          onChange={(e) => {
                            const selectedMember = teamDetails.members.find(m => m.userId === e.target.value);
                            handleAssignMember(
                              paper.id,
                              e.target.value,
                              selectedMember ? selectedMember.name : e.target.value
                            );
                          }}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-main)',
                            color: 'var(--text-main)',
                            fontSize: '11.5px'
                          }}
                        >
                          <option value="">Unassigned</option>
                          {teamDetails.members?.map(m => (
                            <option key={m.id} value={m.userId}>
                              {m.name || m.email} ({m.role})
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Consensus Indicator */}
                      <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>
                        {renderConsensusPill(paper.consensus)}
                      </td>

                      {/* Actions: Notes, Discussion, Delete */}
                      <td style={{ padding: '12px 16px', verticalAlign: 'top', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '11px', padding: '3px 8px' }}
                            onClick={() => handleOpenDiscussion(paper)}
                            title="Open collaborative discussion and consensus voting"
                          >
                            Discussion
                          </button>

                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '11px', padding: '3px 8px' }}
                            onClick={() => handleOpenNotes(paper)}
                            title="Edit shared collaborative notes"
                          >
                            <IconPencil size={11} /> Notes
                          </button>

                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '11px', padding: '3px 8px', color: 'var(--danger)' }}
                            onClick={() => handleRemovePaper(paper.id, paper.title)}
                            title="Remove from team"
                          >
                            <IconClose size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Sub-tab 2: Team Members & Roles */}
      {subTab === 'members' && teamDetails && (
        <div className="panel" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Research Team Members ({teamDetails.members?.length || 0})
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Manage roles, assignments, and permissions for this shared academic workspace.
              </span>
            </div>

            {isAdmin && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setShowInviteModal(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <IconPlus size={14} /> Add Team Member
              </button>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-alt)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '10px 14px' }}>Member Name</th>
                  <th style={{ padding: '10px 14px' }}>Email</th>
                  <th style={{ padding: '10px 14px' }}>Role</th>
                  <th style={{ padding: '10px 14px' }}>Assigned Papers</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teamDetails.members?.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-main)' }}>
                      {m.name || 'Researcher'}
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>
                      {m.email}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {isAdmin && m.userId !== teamDetails.createdBy ? (
                        <select
                          value={m.role}
                          onChange={(e) => handleRoleChange(m.id, e.target.value)}
                          style={{
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-main)',
                            color: 'var(--text-main)',
                            fontSize: '11.5px',
                            fontWeight: 600
                          }}
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="RESEARCHER">RESEARCHER</option>
                          <option value="REVIEWER">REVIEWER</option>
                          <option value="VIEWER">VIEWER</option>
                        </select>
                      ) : (
                        <span className="tag tag-accent" style={{ fontSize: '11px', fontWeight: 700 }}>
                          {m.role}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 600 }}>
                      {m.assignedPapersCount || 0} papers
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      {isAdmin && m.userId !== teamDetails.createdBy && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '11px', padding: '3px 8px', color: 'var(--danger)' }}
                          onClick={() => handleRemoveMember(m.id, m.name)}
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal 1: Create Team */}
      {showCreateTeamModal && (
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
        onClick={() => setShowCreateTeamModal(false)}
        >
          <div className="panel" style={{ width: '100%', maxWidth: '480px', padding: '24px', backgroundColor: 'var(--bg-surface)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Create Research Team
              </h3>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCreateTeamModal(false)}>
                <IconClose size={14} />
              </button>
            </div>

            <form onSubmit={handleCreateTeam}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Team / Lab Name *
                </label>
                <input
                  type="text"
                  required
                  className="search-input"
                  style={{ width: '100%', fontSize: '13px', boxSizing: 'border-box' }}
                  placeholder="e.g. Distributed Systems & AI Lab"
                  value={newTeamForm.name}
                  onChange={(e) => setNewTeamForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Institution / Organization
                </label>
                <input
                  type="text"
                  className="search-input"
                  style={{ width: '100%', fontSize: '13px', boxSizing: 'border-box' }}
                  placeholder="e.g. Stanford University / DeepMind"
                  value={newTeamForm.institution}
                  onChange={(e) => setNewTeamForm(prev => ({ ...prev, institution: e.target.value }))}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Research Mission / Scope
                </label>
                <textarea
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                  placeholder="Summarize the core empirical focus and literature review objectives..."
                  value={newTeamForm.description}
                  onChange={(e) => setNewTeamForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCreateTeamModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Team Member */}
      {showInviteModal && (
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
        onClick={() => setShowInviteModal(false)}
        >
          <div className="panel" style={{ width: '100%', maxWidth: '440px', padding: '24px', backgroundColor: 'var(--bg-surface)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Add Team Member
              </h3>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowInviteModal(false)}>
                <IconClose size={14} />
              </button>
            </div>

            <form onSubmit={handleInviteMember}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Researcher Email *
                </label>
                <input
                  type="email"
                  required
                  className="search-input"
                  style={{ width: '100%', fontSize: '13px', boxSizing: 'border-box' }}
                  placeholder="colleague@university.edu"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Full Name / Title
                </label>
                <input
                  type="text"
                  className="search-input"
                  style={{ width: '100%', fontSize: '13px', boxSizing: 'border-box' }}
                  placeholder="e.g. Dr. Alex Mercer"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Team Role
                </label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '13px',
                    fontWeight: 600
                  }}
                >
                  <option value="RESEARCHER">RESEARCHER (Can review, comment, update status)</option>
                  <option value="REVIEWER">REVIEWER (Can vote on consensus & add critique)</option>
                  <option value="ADMIN">ADMIN (Full management permissions)</option>
                  <option value="VIEWER">VIEWER (Read-only access)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowInviteModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Add to Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Shared Notes */}
      {editingNotesPaper && (
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
        onClick={() => setEditingNotesPaper(null)}
        >
          <div className="panel" style={{ width: '100%', maxWidth: '520px', padding: '24px', backgroundColor: 'var(--bg-surface)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Collaborative Notes
              </h3>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingNotesPaper(null)}>
                <IconClose size={14} />
              </button>
            </div>

            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              <strong>Publication:</strong> {editingNotesPaper.title}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <textarea
                rows={5}
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
                placeholder="Share key methodological observations, benchmark notes, or critique..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingNotesPaper(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={handleSaveNotes} disabled={savingNotes}>
                {savingNotes ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Discussion & Consensus Voting */}
      {discussionPaper && (
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
        onClick={() => setDiscussionPaper(null)}
        >
          <div className="panel" style={{ width: '100%', maxWidth: '580px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: '24px', backgroundColor: 'var(--bg-surface)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  Team Discussion & Consensus
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {discussionPaper.title}
                </span>
              </div>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setDiscussionPaper(null)}>
                <IconClose size={14} />
              </button>
            </div>

            {/* Comment Thread */}
            <div style={{ flex: 1, overflowY: 'auto', margin: '12px 0', paddingRight: '6px' }}>
              {comments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No discussion comments yet. Be the first to share research critique or cast a consensus vote!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {comments.map(c => (
                    <div key={c.id} style={{
                      padding: '10px 14px',
                      backgroundColor: 'var(--bg-alt)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--text-main)' }}>
                          {c.authorName}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {c.consensusVote && c.consensusVote !== 'NONE' && (
                            <span className={`tag ${c.consensusVote === 'AGREE' ? 'tag-accent' : ''}`} style={{ fontSize: '10px', fontWeight: 700 }}>
                              Vote: {c.consensusVote}
                            </span>
                          )}
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-main)', lineHeight: '1.4' }}>
                        {c.commentText}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Comment & Vote Form */}
            <form onSubmit={handleAddComment} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input
                  type="text"
                  required
                  className="search-input"
                  style={{ flex: 1, fontSize: '13px' }}
                  placeholder="Type research critique or evaluation notes..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                />

                <select
                  value={newCommentVote}
                  onChange={(e) => setNewCommentVote(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                  title="Cast your consensus vote on whether this paper meets quality & relevance thresholds"
                >
                  <option value="NONE">No Vote</option>
                  <option value="AGREE">Vote: Agree</option>
                  <option value="DISAGREE">Vote: Disagree</option>
                  <option value="NEUTRAL">Vote: Neutral</option>
                </select>

                <button type="submit" className="btn btn-primary btn-sm" disabled={submittingComment}>
                  Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
