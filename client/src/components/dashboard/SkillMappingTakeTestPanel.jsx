import { useMemo, useState } from 'react';
import { SKILL_MAPPING_INSTRUMENTS, instrumentLabel } from '../../data/testPortalData';
import '../../styles/test-portal.css';

const PAGE_SIZE = 15;

function statusLabel(status) {
  if (status === 'completed') return 'Completed';
  if (status === 'in_progress') return 'In progress';
  return 'Not started';
}

function ProgressRing({ pct, complete }) {
  return (
    <div className="progress-ring-wrap">
      <svg viewBox="0 0 36 36" aria-hidden>
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="#ECECEC" strokeWidth="3" />
        <circle
          cx="18"
          cy="18"
          r="15.5"
          fill="none"
          stroke="#FF6A3D"
          strokeWidth="3"
          strokeDasharray={`${pct} 100`}
          strokeLinecap="round"
        />
      </svg>
      <div className="progress-ring-label">
        <p className="pct">{pct}%</p>
        {complete && <p className="done">Completed</p>}
      </div>
    </div>
  );
}

function buildQuestions(instrument) {
  return Array.from({ length: instrument.total }, (_, i) => ({
    id: i + 1,
    text: instrument.question,
    options: instrument.options,
  }));
}

export default function SkillMappingTakeTestPanel({ user, profile, instrumentIds = null }) {
  const allowed = instrumentIds?.length ? new Set(instrumentIds.map((id) => String(id).toUpperCase())) : null;
  const baseInstruments = SKILL_MAPPING_INSTRUMENTS.filter((i) => !allowed || allowed.has(i.id));
  const [activeId, setActiveId] = useState(null);
  const [instruments, setInstruments] = useState(() =>
    baseInstruments.map((i) => ({ ...i, status: 'not_started', answers: {} })),
  );
  const [pageStart, setPageStart] = useState(0);

  const academicStage = profile?.academicStage || profile?.classLevel || '';
  const active = instruments.find((i) => i.id === activeId);
  const questions = useMemo(() => (active ? buildQuestions(active) : []), [active]);
  const answeredCount = active ? Object.keys(active.answers).length : 0;
  const pct = active ? Math.round((answeredCount / active.total) * 100) : 0;
  const pageEnd = Math.min(pageStart + PAGE_SIZE, questions.length);
  const pageQuestions = questions.slice(pageStart, pageEnd);
  const isComplete = active && answeredCount >= active.total;

  const openInstrument = (id) => {
    setActiveId(id);
    setPageStart(0);
    setInstruments((list) => list.map((i) => (
      i.id === id && i.status === 'not_started' ? { ...i, status: 'in_progress' } : i
    )));
  };

  const setAnswer = (qId, optIndex) => {
    if (!active) return;
    setInstruments((list) => list.map((i) => {
      if (i.id !== active.id) return i;
      const answers = { ...i.answers, [qId]: optIndex };
      const count = Object.keys(answers).length;
      return {
        ...i,
        answers,
        status: count >= i.total ? 'completed' : 'in_progress',
      };
    }));
  };

  const jumpToQuestion = (idx) => {
    const page = Math.floor(idx / PAGE_SIZE) * PAGE_SIZE;
    setPageStart(page);
    document.getElementById(`sm-q-${idx + 1}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (active) {
    const userInitial = (user?.name || 'U').trim().charAt(0).toUpperCase();
    return (
      <div className="test-portal-root">
        <button type="button" className="btn btn-outline btn-pill" style={{ marginBottom: 12 }} onClick={() => setActiveId(null)}>← All tests</button>
        <div className="sm-screen">
          <div className="sm-grid">
            <aside className="sm-sidebar">
              <div className="sm-sidebar-header">
                <p className="name font-display">DREAM MANTRA</p>
                <p className="tag">Test Portal</p>
              </div>
              <div className="sm-sidebar-body">
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Your Progress</p>
                  <ProgressRing pct={pct} complete={isComplete} />
                  <p className="q-count">{answeredCount} / {active.total} Questions</p>
                </div>
                <div className="overview-box">
                  <p className="label">Question Overview</p>
                  <div className="q-dots-grid">
                    {questions.map((q, idx) => {
                      const answered = active.answers[q.id] != null;
                      const isCurrent = idx === answeredCount && !isComplete;
                      let cls = 'q-dot';
                      if (answered) cls += ' q-dot--done';
                      else if (isCurrent) cls += ' q-dot--current';
                      return (
                        <button
                          key={q.id}
                          type="button"
                          className={cls}
                          title={`Question ${q.id}`}
                          onClick={() => jumpToQuestion(idx)}
                        >
                          {q.id}
                        </button>
                      );
                    })}
                  </div>
                  <ul style={{ marginTop: 12 }}>
                    <li><span className="k">✓ Answered</span><span className="v">{answeredCount}</span></li>
                    <li><span className="k">⏱ Remaining</span><span className="v">{active.total - answeredCount}</span></li>
                  </ul>
                </div>
                <div className="important-box">
                  <p className="title">Important</p>
                  <ul>
                    <li>✓ There are no right or wrong answers</li>
                    <li>✓ Be authentic — honest responses help us understand you better</li>
                    <li>✓ Your responses are confidential</li>
                  </ul>
                </div>
              </div>
            </aside>
            <div className="sm-main">
              <div className="sm-topcard">
                <div className="sm-topcard-row">
                  <div>
                    <h1 className="sm-title font-display">{instrumentLabel(active)}</h1>
                    <p className="sm-tag">{active.tag}</p>
                    <p className="sm-hint">{active.hint}</p>
                  </div>
                  <div className="sm-meta">
                    <div className="range-chip">
                      Questions {pageStart + 1}–{pageEnd} of {active.total}
                    </div>
                    <div className="user-chip">
                      <div className="user-avatar">{userInitial}</div>
                      <div>
                        <p className="n">{user?.name || 'Student'}</p>
                        <p className="l">EN</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="candidate-box">
                <p className="title">Candidate Information</p>
                <div className="candidate-grid">
                  <div className="field"><label>Name</label><input readOnly value={user?.name || ''} /></div>
                  <div className="field"><label>Dream Mantra ID</label><input readOnly value={user?.user_uid || '—'} /></div>
                </div>
              </div>
              {isComplete ? (
                <div className="question-card" style={{ textAlign: 'center', padding: 32 }}>
                  <p className="font-display" style={{ fontSize: 20, fontWeight: 700 }}>Test completed!</p>
                  <p className="sm-hint">Your responses have been saved. Continue with other assessments.</p>
                </div>
              ) : (
                <div className="sm-questions-page">
                  {pageQuestions.map((q) => (
                    <div key={q.id} id={`sm-q-${q.id}`} className="question-card">
                      <div className="q-number">{String(q.id).padStart(2, '0')}</div>
                      <div className="q-body">
                        <p className="q-prompt">{q.text}</p>
                        <div className="q-options">
                          {q.options.map((opt, i) => (
                            <button
                              key={opt}
                              type="button"
                              className={`q-option${active.answers[q.id] === i ? ' selected' : ''}`}
                              onClick={() => setAnswer(q.id, i)}
                            >
                              <span className="q-letter">{String.fromCharCode(65 + i)}</span>
                              <span className="q-option-label">{opt}</span>
                              <span className={`q-check${active.answers[q.id] === i ? ' on' : ''}`}>{active.answers[q.id] === i ? '✓' : ''}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="sm-footer">
            <div className="sm-footer-inner">
              <div className="progress-track">
                <p>{answeredCount} / {active.total} Answered</p>
                <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${pct}%` }} /></div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-outline" onClick={() => setActiveId(null)}>Save & Exit</button>
                {pageStart > 0 && (
                  <button type="button" className="btn btn-outline" onClick={() => setPageStart((p) => Math.max(0, p - PAGE_SIZE))}>← Previous</button>
                )}
                {pageEnd < active.total && !isComplete && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setPageStart((p) => p + PAGE_SIZE)}
                  >
                    Next page →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="test-portal-root">
      <h1 className="page-title font-display">Take test</h1>
      <p className="page-subtitle">Start or continue your Skill Mapping tests. Status shows only here.</p>
      {!academicStage ? (
        <div className="info-banner" style={{ marginTop: 12 }}>
          <p>Pick your academic / professional stage on your profile to set your class.</p>
        </div>
      ) : (
        <p className="page-subtitle" style={{ marginTop: 12 }}>Your class: <strong>{academicStage}</strong></p>
      )}
      <div className="dreamz-banner" style={{ marginTop: 12 }}>
        Dream Mantra ID: <span className="val">{user?.user_uid || '—'}</span>
        <span className="sep">·</span> Your Dream Mantra ID is used on the test form.
      </div>
      <div className="sm-subtabs" style={{ marginTop: 16 }}>
        {instruments.map((i) => (
          <button key={i.id} type="button" className="sm-subtab" onClick={() => openInstrument(i.id)}>
            {instrumentLabel(i)}
          </button>
        ))}
      </div>
      <div className="instrument-grid" style={{ marginTop: 16 }}>
        {instruments.map((i) => (
          <div key={i.id} className={`instrument-card status-${i.status}`}>
            <h2>{instrumentLabel(i)}</h2>
            <p className="hint">{i.hint}</p>
            <div className="instrument-footer">
              <span className={`badge ${i.status}`}>{statusLabel(i.status)}</span>
              <button type="button" className={`btn ${i.status === 'not_started' ? 'btn-primary' : 'btn-outline'}`} onClick={() => openInstrument(i.id)}>
                {i.status === 'completed' ? 'Open' : i.status === 'in_progress' ? 'Continue' : 'Start test'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
