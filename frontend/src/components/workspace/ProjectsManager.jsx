import React, { useState } from 'react';
import { 
  IconPlus, 
  IconClose, 
  IconFolder, 
  IconCheck, 
  IconClock 
} from '../Icons';

export default function ProjectsManager({
  projects = [],
  onCreateProject,
  onDeleteProject,
  showNewProjectForm,
  setShowNewProjectForm
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectStatus, setProjectStatus] = useState('In Progress');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onCreateProject({
        title: title.trim(),
        description: description.trim()
      });
      setTitle('');
      setDescription('');
      setShowNewProjectForm(false);
    } catch (err) {
      console.error('Failed to create project:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusTags = {
    'Planning': { bg: 'var(--bg-subtle)', color: 'var(--text-muted)' },
    'In Progress': { bg: 'var(--bg-subtle)', color: '#3b82f6' },
    'Completed': { bg: 'var(--bg-subtle)', color: '#10b981' }
  };

  return (
    <div className="projects-manager-section">
      {/* Top Section Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-main)' }}>
            Literature Review Projects
          </h3>
          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
            Organize academic papers, research questions, and structured synthesis by research theme.
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setShowNewProjectForm(!showNewProjectForm)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          {showNewProjectForm ? <IconClose size={13} /> : <IconPlus size={13} />}
          <span>{showNewProjectForm ? 'Cancel' : 'New Research Project'}</span>
        </button>
      </div>

      {/* New Project Creation Form / Card */}
      {showNewProjectForm && (
        <form
          onSubmit={handleSubmit}
          className="panel"
          style={{
            marginBottom: '24px',
            padding: '20px 24px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <IconFolder size={18} />
            <h4 style={{ fontSize: '14.5px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
              Create Named Research Project
            </h4>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>
              Project Title *
            </label>
            <input
              type="text"
              className="search-input"
              style={{ width: '100%' }}
              placeholder="e.g. Adversarial Robustness in LLMs Dissertation Chapter"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>
              Scope, Research Questions & Objectives
            </label>
            <textarea
              style={{
                width: '100%',
                fontSize: '13px',
                padding: '10px 14px',
                border: '1px solid var(--search-input-border)',
                borderRadius: 'var(--radius-sm)',
                height: '80px',
                backgroundColor: 'var(--search-input-bg)',
                color: 'var(--search-input-color)',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
              placeholder="Outline research scope, target hypothesis, or domain questions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={isSubmitting || !title.trim()}
              style={{ padding: '6px 16px' }}
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowNewProjectForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="panel" style={{
          textAlign: 'center',
          padding: '40px 20px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--border-color)'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            margin: '0 auto 12px auto',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)'
          }}>
            <IconFolder size={20} />
          </div>
          <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
            No literature review projects yet
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 16px auto' }}>
            Create structured folders to group papers for literature reviews, thesis chapters, and comparative surveys.
          </p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setShowNewProjectForm(true)}
          >
            Create Your First Project
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
          gap: '18px'
        }}>
          {projects.map(prj => {
            const paperCount = prj.paperCount || 0;
            // Approximate progress indicator based on papers assigned
            const progress = Math.min(100, Math.max(15, paperCount * 20));

            return (
              <div
                key={prj.id}
                className="panel"
                style={{
                  padding: '20px 22px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'border-color 0.2s ease, transform 0.2s ease',
                  minWidth: 0,
                  boxSizing: 'border-box'
                }}
              >
                <div>
                  {/* Card Header: Title & Delete */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', minWidth: 0, flex: 1 }}>
                      <span style={{ color: 'var(--text-muted)', marginTop: '2px', flexShrink: 0 }}>
                        <IconFolder size={16} />
                      </span>
                      <h4 style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        margin: 0,
                        lineHeight: '1.4',
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere'
                      }}>
                        {prj.title}
                      </h4>
                    </div>

                    <button
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-subtle)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: 'var(--radius-xs)'
                      }}
                      onClick={() => {
                        if (window.confirm(`Delete research project "${prj.title}"?`)) {
                          onDeleteProject(prj.id);
                        }
                      }}
                      title="Delete project"
                    >
                      <IconClose size={13} />
                    </button>
                  </div>

                  {/* Description */}
                  <p style={{
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    lineHeight: '1.5',
                    margin: '10px 0 16px 0',
                    wordBreak: 'break-word'
                  }}>
                    {prj.description || 'No description or objectives provided.'}
                  </p>
                </div>

                {/* Progress bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '5px' }}>
                    <span>Research Synthesis</span>
                    <span>{progress}%</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '4px',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    marginBottom: '14px'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${progress}%`,
                      backgroundColor: 'var(--accent)',
                      borderRadius: '2px'
                    }} />
                  </div>

                  {/* Card Footer */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '12px',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '10px'
                  }}>
                    <span className="tag tag-accent" style={{ fontSize: '11px', fontWeight: 600 }}>
                      {paperCount} {paperCount === 1 ? 'Paper Assigned' : 'Papers Assigned'}
                    </span>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-subtle)' }}>
                      Updated {new Date(prj.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
