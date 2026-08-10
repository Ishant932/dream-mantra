import { useState, useMemo } from 'react';
import {
  PROFILE_WIZARD_STEPS, profileToWizardForm, wizardFormToProfile, getCareerFieldsForStage,
} from '../../data/testPortalData';
import '../../styles/test-portal.css';

function Field({ field, value, onChange }) {
  const id = `f-${field.key}`;
  if (field.type === 'select') {
    return (
      <div className={`form-field${field.span === 2 ? ' span-2' : ''}`}>
        <label htmlFor={id}>{field.label}</label>
        <select id={id} value={value || ''} onChange={(e) => onChange(field.key, e.target.value)}>
          <option value="">Select…</option>
          {(field.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        {field.help && <p className="help">{field.help}</p>}
      </div>
    );
  }
  if (field.type === 'textarea') {
    return (
      <div className={`form-field${field.span === 2 ? ' span-2' : ''}`}>
        <label htmlFor={id}>{field.label}</label>
        <textarea id={id} rows={3} value={value || ''} onChange={(e) => onChange(field.key, e.target.value)} />
        {field.help && <p className="help">{field.help}</p>}
      </div>
    );
  }
  return (
    <div className={`form-field${field.span === 2 ? ' span-2' : ''}`}>
      <label htmlFor={id}>{field.label}</label>
      <input type={field.type || 'text'} id={id} value={value || ''} onChange={(e) => onChange(field.key, e.target.value)} />
      {field.help && <p className="help">{field.help}</p>}
    </div>
  );
}

export default function ProfileWizardPanel({ user, profile, onSave, saving }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState(() => profileToWizardForm(profile, user));
  const step = PROFILE_WIZARD_STEPS[stepIndex];
  const pct = Math.round(((stepIndex + 1) / PROFILE_WIZARD_STEPS.length) * 100);

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    const profilePatch = wizardFormToProfile(form);
    const name = form.name?.trim();
    await onSave?.({ profile: profilePatch, name: name || undefined });
  };

  const careerFields = useMemo(() => getCareerFieldsForStage(form.academicStage), [form.academicStage]);

  const stepContent = useMemo(() => {
    if (step.id === 'basics') {
      return (
        <div className="wizard-form">
          <div className="form-field">
            <label>Email</label>
            <input value={user?.email || ''} readOnly />
            <p className="help">Login email — set by Admin / Dream Team only</p>
          </div>
          <div className="form-grid">
            {step.fields.map((f) => (
              <Field key={f.key} field={f} value={form[f.key]} onChange={setField} />
            ))}
          </div>
        </div>
      );
    }
    if (step.id === 'review') {
      return (
        <div className="wizard-form">
          <div className="form-grid">
            <div className="form-field">
              <label>Dream Mantra ID</label>
              <input value={user?.user_uid || '—'} readOnly style={{ fontFamily: 'monospace' }} />
              <p className="help">Assigned by Admin / Dream Team — you cannot edit this</p>
            </div>
            <div className="form-field">
              <label>Class / SM package</label>
              <input value={form.academicStage || 'Not assigned yet'} readOnly />
            </div>
          </div>
          <div className="review-summary">
            <h3>Registration summary</h3>
            <div className="review-row"><dt>Name</dt><dd>{form.name || user?.name}</dd></div>
            <div className="review-row"><dt>Email</dt><dd>{user?.email}</dd></div>
            <div className="review-row"><dt>Phone</dt><dd>{form.phone || '—'}</dd></div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: 6 }}>
            🔒 You can update your information anytime from your profile settings.
          </p>
        </div>
      );
    }
    if (step.id === 'career') {
      return (
        <div className="wizard-form">
          {!form.academicStage ? (
            <div className="info-banner"><p>Select your academic / professional stage on the Personal & Contact step first.</p></div>
          ) : (
            <div className="form-grid">
              {careerFields.map((f) => (
                <Field key={f.key} field={f} value={form[f.key]} onChange={setField} />
              ))}
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="wizard-form">
        {(step.fields || []).map((f) => (
          <Field key={f.key} field={f} value={form[f.key]} onChange={setField} />
        ))}
      </div>
    );
  }, [step, form, user, careerFields]);

  return (
    <div className="test-portal-root profile-wizard-dash">
      <div className="stat-grid" style={{ marginBottom: 16 }}>
        <div className="stat-card peach"><p className="k">Dream Mantra ID</p><p className="v mono">{user?.user_uid || '—'}</p></div>
        <div className="stat-card sky"><p className="k">Profile step</p><p className="v">{stepIndex + 1}/{PROFILE_WIZARD_STEPS.length}</p></div>
      </div>
      <div className="wizard-shell">
        <div className="wizard-grid">
          <aside className="wizard-sidebar">
            <div className="wizard-sidebar-head">
              <span>✨</span>
              <div>
                <h1 className="font-display">Create Your Profile</h1>
                <p>Build your profile to personalize your experience and get the best recommendations.</p>
              </div>
            </div>
            <div className="wizard-progress">
              <div className="wizard-progress-row">
                <span>Step {stepIndex + 1} of {PROFILE_WIZARD_STEPS.length}</span>
                <span>{pct}%</span>
              </div>
              <div className="wizard-progress-bg">
                <div className="wizard-progress-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <nav className="wizard-steps">
              {PROFILE_WIZARD_STEPS.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  className={`wizard-step-btn${i === stepIndex ? ' active' : ''}${i < stepIndex ? ' done' : ''}`}
                  onClick={() => setStepIndex(i)}
                >
                  <span className="step-icon">{i < stepIndex ? '✓' : s.icon}</span>
                  <span className="step-text">
                    <span className="t">{s.title}</span>
                    <span className="s">{s.subtitle}</span>
                  </span>
                </button>
              ))}
            </nav>
            <div className="data-safe-box">
              <div className="head">🛡 Your Data is Safe</div>
              <p className="body">We use industry-standard encryption to protect your personal information.</p>
            </div>
          </aside>
          <div className="wizard-main">
            <div className="wizard-step-head">
              <span className="icon">{step.icon}</span>
              <div>
                <h2 className="font-display">{step.title}</h2>
                <p>{step.subtitle}</p>
              </div>
            </div>
            {stepContent}
            <div className="wizard-actions">
              <div className="left">
                {stepIndex > 0 && (
                  <button type="button" className="btn btn-outline" onClick={() => setStepIndex((i) => i - 1)}>← Back</button>
                )}
              </div>
              {stepIndex < PROFILE_WIZARD_STEPS.length - 1 ? (
                <button type="button" className="btn btn-primary" onClick={() => setStepIndex((i) => i + 1)}>Continue →</button>
              ) : (
                <button type="button" className="btn btn-primary" disabled={saving} onClick={handleSave}>
                  {saving ? 'Saving…' : 'Confirm & Save'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
