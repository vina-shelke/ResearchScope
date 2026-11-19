import React, { useState, useEffect, useRef } from 'react';
import { 
  askAiAssistant, 
  fetchAiSuggestedPrompts, 
  fetchWorkspaceProjects,
  fetchWorkspacePapers 
} from '../api/client';
import { useToast } from './Toast';
import { 
  IconSparkles, 
  IconSearch, 
  IconPaper, 
  IconFolder, 
  IconCheck, 
  IconExternalLink,
  IconAlert,
  IconClose
} from './Icons';
import SourceEvidenceDrawer from './SourceEvidenceDrawer';

export default function AiAssistantView({
  onSelectPaper,
  initialPaper = null,
  initialQuery = '',
  setActiveTab
}) {
  const toast = useToast();
  const [question, setQuestion] = useState(initialQuery || '');
  const [explanationLevel, setExplanationLevel] = useState('ACADEMIC'); // 'BEGINNER', 'ACADEMIC', 'TECHNICAL'
  const [queryMode, setQueryMode] = useState('QUESTION'); // 'QUESTION', 'EXPLAIN', 'SUMMARIZE', 'LIMITATIONS', 'COMPARE', 'QUESTIONS_GEN'
  const [scope, setScope] = useState(initialPaper ? 'PAPER' : 'TOPIC'); // 'TOPIC', 'PAPER', 'PAPERS_SET', 'PROJECT'
  const [selectedPaperId, setSelectedPaperId] = useState(initialPaper?.id || '');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [summaryType, setSummaryType] = useState('DETAILED');

  // History and Results
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState([]);
  const [activeEvidenceResponse, setActiveEvidenceResponse] = useState(null);
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState(false);

  // Scoped Data Lists
  const [workspaceProjects, setWorkspaceProjects] = useState([]);
  const [workspacePapersList, setWorkspacePapersList] = useState([]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchAiSuggestedPrompts()
      .then(prompts => setSuggestedPrompts(prompts || []))
      .catch(() => {});

    fetchWorkspaceProjects()
      .then(p => setWorkspaceProjects(p || []))
      .catch(() => {});

    fetchWorkspacePapers()
      .then(p => setWorkspacePapersList(p || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (initialPaper) {
      setScope('PAPER');
      setSelectedPaperId(initialPaper.id);
    }
  }, [initialPaper]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (overrideQuestion = null, overrideMode = null) => {
    const q = overrideQuestion || question;
    const mode = overrideMode || queryMode;

    if (!q.trim() && mode !== 'SUMMARIZE' && mode !== 'QUESTIONS_GEN') {
      toast.warning('Please enter a research question or topic.');
      return;
    }

    const effectiveQ = q.trim() || (mode === 'SUMMARIZE' ? 'Provide a structured academic summary.' : 'Formulate candidate research questions.');

    const userMessage = {
      role: 'user',
      text: effectiveQ,
      scope,
      explanationLevel,
      queryMode: mode,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);
    setTimeout(scrollToBottom, 50);

    try {
      const payload = {
        question: effectiveQ,
        explanationLevel,
        queryMode: mode,
        scope,
        paperId: scope === 'PAPER' ? selectedPaperId : undefined,
        projectId: scope === 'PROJECT' ? selectedProjectId : undefined,
        summaryType: mode === 'SUMMARIZE' ? summaryType : undefined,
        maxSources: 6
      };

      const result = await askAiAssistant(payload);

      const aiMessage = {
        role: 'assistant',
        data: result,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      console.error('AI Assistant Query Failed:', err);
      toast.error('Failed to get answer from research assistant. Please try again.');
      setMessages(prev => [...prev, {
        role: 'assistant',
        error: true,
        text: 'An error occurred while connecting to the research intelligence service. Please verify your connection.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  const handleOpenEvidence = (responseObj) => {
    setActiveEvidenceResponse(responseObj);
    setIsEvidenceDrawerOpen(true);
  };

  return (
    <div className="ai-assistant-container" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header & Configuration Console */}
      <div className="panel" style={{
        padding: '24px 28px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
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
                <IconSparkles size={18} />
              </span>
              <h1 className="section-title" style={{ margin: 0 }}>AI Research Assistant</h1>
            </div>
            <div className="section-description" style={{ marginTop: '4px' }}>
              Grounded, verifiable literature synthesis and evidence extraction across academic publications.
            </div>
          </div>

          {/* Explanation Level Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Level:</span>
            {[
              { id: 'BEGINNER', label: 'Beginner' },
              { id: 'ACADEMIC', label: 'Academic' },
              { id: 'TECHNICAL', label: 'Technical' }
            ].map(lvl => (
              <button
                key={lvl.id}
                type="button"
                className={explanationLevel === lvl.id ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                style={{ fontSize: '11px', padding: '4px 10px' }}
                onClick={() => setExplanationLevel(lvl.id)}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Research Scope Selector */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          padding: '14px',
          backgroundColor: 'var(--bg-main)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)',
          marginBottom: '18px'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
              Inquiry Scope
            </label>
            <select
              style={{
                width: '100%',
                padding: '7px 10px',
                fontSize: '12.5px',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-xs)'
              }}
              value={scope}
              onChange={(e) => setScope(e.target.value)}
            >
              <option value="TOPIC">Global Scholarly Corpus (by Topic / Query)</option>
              <option value="PAPER">Specific Academic Paper</option>
              <option value="PROJECT">Workspace Literature Review Project</option>
            </select>
          </div>

          {scope === 'PAPER' && (
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                Select Grounding Paper
              </label>
              <select
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  fontSize: '12.5px',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-xs)'
                }}
                value={selectedPaperId}
                onChange={(e) => setSelectedPaperId(e.target.value)}
              >
                <option value="">-- Choose a Paper from Workspace --</option>
                {workspacePapersList.map(wp => (
                  <option key={wp.paperId} value={wp.paperId}>
                    {wp.paper?.title ? wp.paper.title.substring(0, 60) + '...' : wp.paperId}
                  </option>
                ))}
              </select>
            </div>
          )}

          {scope === 'PROJECT' && (
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                Select Workspace Project
              </label>
              <select
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  fontSize: '12.5px',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-xs)'
                }}
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                <option value="">-- Choose a Research Project --</option>
                {workspaceProjects.map(prj => (
                  <option key={prj.id} value={prj.id}>
                    {prj.title} ({prj.paperCount || 0} papers)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
              Query Mode
            </label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { id: 'QUESTION', label: 'Ask Question' },
                { id: 'LIMITATIONS', label: 'Find Limitations' },
                { id: 'COMPARE', label: 'Compare Findings' },
                { id: 'QUESTIONS_GEN', label: 'Research Questions' }
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  className={queryMode === m.id ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                  style={{ fontSize: '11px', padding: '4px 8px' }}
                  onClick={() => setQueryMode(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Input & Ask Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}
        >
          <input
            type="text"
            className="search-input"
            style={{ flex: '1 1 280px', minWidth: 0, fontSize: '13.5px', padding: '10px 14px' }}
            placeholder={
              queryMode === 'LIMITATIONS'
                ? "Enter research domain or topic to extract explicit author limitations..."
                : queryMode === 'COMPARE'
                ? "Enter topic to compare contrasting findings and methodologies..."
                : queryMode === 'QUESTIONS_GEN'
                ? "Enter domain to formulate candidate research hypotheses..."
                : "Ask any research question (e.g., What are the limitations of ML in cloud security?)..."
            }
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0 20px', height: '42px', fontWeight: 700 }}
            disabled={loading}
          >
            <IconSparkles size={16} />
            <span>{loading ? 'Synthesizing...' : 'Analyze'}</span>
          </button>
        </form>

        {/* Suggested Prompt Chips */}
        {suggestedPrompts.length > 0 && messages.length === 0 && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginBottom: '8px' }}>
              Suggested Research Questions:
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {suggestedPrompts.slice(0, 4).map((p, i) => (
                <button
                  key={i}
                  type="button"
                  className="header-topic-chip"
                  style={{ fontSize: '11.5px', padding: '4px 10px' }}
                  onClick={() => handleSubmit(p, 'QUESTION')}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Chat Messages History Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {messages.map((msg, index) => {
          if (msg.role === 'user') {
            return (
              <div
                key={index}
                style={{
                  alignSelf: 'flex-end',
                  maxWidth: 'min(100%, 750px)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 18px',
                  boxShadow: 'var(--shadow-subtle)',
                  wordBreak: 'break-word',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span className="tag tag-accent" style={{ fontSize: '10px' }}>{msg.queryMode}</span>
                    <span className="tag" style={{ fontSize: '10px' }}>{msg.explanationLevel}</span>
                  </div>
                  <span style={{ fontSize: '10.5px', color: 'var(--text-subtle)' }}>{msg.timestamp}</span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', lineHeight: '1.5' }}>
                  {msg.text}
                </div>
              </div>
            );
          }

          // Assistant Response
          const res = msg.data || {};
          const citedPapers = res.citedPapers || [];
          const evidenceList = res.evidenceList || [];
          const suggestedQs = res.suggestedQuestions || [];

          return (
            <div
              key={index}
              className="panel"
              style={{
                padding: '24px 28px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-subtle)'
              }}
            >
              {/* Card Top: Method, Level, Timestamp, and Inspect Evidence Button */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '14px',
                marginBottom: '18px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-color)'
                  }}>
                    <IconSparkles size={13} />
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {res.synthesisMethod || 'Scholarly Grounded Synthesis'}
                  </span>
                  <span className="tag" style={{ fontSize: '10px' }}>
                    {res.explanationLevel || 'Academic'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', padding: '4px 12px' }}
                    onClick={() => handleOpenEvidence(res)}
                  >
                    <IconCheck size={12} />
                    <span>Inspect Source Evidence ({evidenceList.length})</span>
                  </button>
                  <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>{msg.timestamp}</span>
                </div>
              </div>

              {/* Warning message if literature is sparse */}
              {res.warningMessage && (
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: 'var(--bg-main)',
                  borderLeft: '3px solid #f59e0b',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <IconAlert size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
                  <span>{res.warningMessage}</span>
                </div>
              )}

              {/* Synthesized Answer Output */}
              <div
                style={{
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: 'var(--text-main)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {res.answer || msg.text}
              </div>

              {/* Cited Publications Quick Strip */}
              {citedPapers.length > 0 && (
                <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    Cited Supporting Literature ({citedPapers.length})
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: '10px' }}>
                    {citedPapers.map((p, idx) => (
                      <div
                        key={p.id || idx}
                        style={{
                          backgroundColor: 'var(--bg-main)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-xs)',
                          padding: '10px 12px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '6px'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                            [{idx + 1}] {p.publicationYear || 'n.d.'} • {p.venue || 'Publication'}
                          </div>
                          <button
                            type="button"
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              textAlign: 'left',
                              fontSize: '12.5px',
                              fontWeight: 700,
                              color: 'var(--text-main)',
                              cursor: 'pointer',
                              lineHeight: '1.4',
                              marginTop: '2px'
                            }}
                            onClick={() => onSelectPaper && onSelectPaper(p.id)}
                            title="Open paper metadata & citation network"
                          >
                            {p.title}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Follow-up Questions Chips */}
              {suggestedQs.length > 0 && (
                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-subtle)', fontWeight: 600 }}>Explore Further:</span>
                  {suggestedQs.map((sq, sqIdx) => (
                    <button
                      key={sqIdx}
                      type="button"
                      className="header-topic-chip"
                      style={{ fontSize: '11px', padding: '3px 9px' }}
                      onClick={() => handleSubmit(sq, 'QUESTION')}
                    >
                      {sq}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="panel" style={{
            padding: '28px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '2px solid var(--border-color)',
              borderTopColor: 'var(--text-main)',
              animation: 'spin 0.8s linear infinite'
            }} />
            <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-main)' }}>
              Retrieving academic papers, extracting text chunks, and synthesizing grounded findings...
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              Cross-referencing claims and verifying author-reported limitations.
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 5. Shared Source Evidence Drawer */}
      <SourceEvidenceDrawer
        isOpen={isEvidenceDrawerOpen}
        onClose={() => setIsEvidenceDrawerOpen(false)}
        evidenceList={activeEvidenceResponse?.evidenceList || []}
        citedPapers={activeEvidenceResponse?.citedPapers || []}
        onSelectPaper={onSelectPaper}
      />
    </div>
  );
}
