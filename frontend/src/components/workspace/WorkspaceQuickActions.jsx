import React from 'react';
import { 
  IconPlus, 
  IconSearch, 
  IconBookOpen, 
  IconGaps,
  IconSparkles 
} from '../Icons';

export default function WorkspaceQuickActions({
  onNewProject,
  onFindPapers,
  onStartLiteratureReview,
  onAnalyzeGap,
  onOpenAiAssistant
}) {
  const actions = [
    {
      id: 'new-project',
      label: 'New Project',
      description: 'Create a dedicated literature review project',
      icon: IconPlus,
      onClick: onNewProject,
      primary: true
    },
    {
      id: 'find-papers',
      label: 'Find Papers',
      description: 'Discover relevant research across domains',
      icon: IconSearch,
      onClick: onFindPapers
    },
    {
      id: 'ai-assistant',
      label: 'AI Assistant',
      description: 'Ask questions & verify evidence',
      icon: IconSparkles,
      onClick: onOpenAiAssistant
    },
    {
      id: 'literature-review',
      label: 'Start Literature Review',
      description: 'Organize and synthesize saved papers',
      icon: IconBookOpen,
      onClick: onStartLiteratureReview
    },
    {
      id: 'analyze-gap',
      label: 'Analyze Research Gap',
      description: 'Spot unexplored research opportunities',
      icon: IconGaps,
      onClick: onAnalyzeGap
    }
  ];

  return (
    <div className="workspace-quick-actions panel" style={{
      padding: '16px 20px',
      marginBottom: '24px',
      backgroundColor: 'var(--bg-surface)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-subtle)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px'
      }}>
        <div style={{
          fontSize: '12px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--text-muted)'
        }}>
          Quick Actions
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
          Research Workflow Shortcuts
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
        gap: '12px'
      }}>
        {actions.map(act => {
          const IconComponent = act.icon;
          return (
            <button
              key={act.id}
              type="button"
              onClick={act.onClick}
              className={act.primary ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                textAlign: 'left',
                justifyContent: 'flex-start',
                width: '100%',
                minWidth: 0,
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer'
              }}
            >
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <IconComponent size={15} />
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, flex: 1 }}>
                <span style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden'
                }}>
                  {act.label}
                </span>
                <span style={{
                  fontSize: '10.5px',
                  opacity: 0.75,
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden'
                }}>
                  {act.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
