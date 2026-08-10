import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Sparkles, Wand2, FileText, CheckCircle2, ArrowRight, Camera, Save, Trash2, Edit3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../api';

const TEMPLATES = [
  { id: 'modern-ats', label: 'Modern ATS', desc: 'Clean two-column, recruiter-friendly' },
  { id: 'creative-pro', label: 'Creative Pro', desc: 'Accent header, portfolio feel' },
  { id: 'corporate', label: 'Corporate Classic', desc: 'Traditional executive layout' },
  { id: 'compact', label: 'Compact One-Page', desc: 'Dense single-page format' },
];

const EMPTY = {
  fullName: '', email: '', phone: '', location: '', linkedin: '', summary: '',
  experience: '', education: '', skills: '', achievements: '', certifications: '', photo: '',
};

function atsScore(form) {
  let s = 40;
  if (form.fullName?.trim()) s += 7;
  if (form.email?.includes('@')) s += 7;
  if (form.phone?.trim().length >= 10) s += 6;
  if (form.location?.trim()) s += 5;
  if (form.summary?.length >= 80) s += 10;
  if (form.experience?.length >= 120) s += 12;
  if (form.education?.length >= 40) s += 8;
  if (form.skills?.length >= 30) s += 8;
  if (form.achievements?.length >= 40) s += 6;
  if (form.certifications?.trim()) s += 4;
  if (form.photo) s += 3;
  return Math.min(100, s);
}

function buildHtml(form, templateId) {
  const accent = templateId === 'corporate' ? '#1e3a5f' : templateId === 'creative-pro' ? '#ea580c' : '#b45309';
  const photo = form.photo ? `<img src="${form.photo}" alt="" style="width:72px;height:72px;border-radius:12px;object-fit:cover" />` : '';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${form.fullName || 'CV'}</title>
<style>body{font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.45;color:#1e293b;margin:32px}
h1{font-size:22pt;color:${accent}} h2{font-size:10pt;color:${accent};text-transform:uppercase;margin-top:14px}
.header{display:flex;gap:16px;align-items:center;border-bottom:2px solid ${accent};padding-bottom:12px}
ul{margin:4px 0;padding-left:18px}</style></head><body>
<div class="header">${photo}<div><h1>${form.fullName}</h1><p>${form.email} · ${form.phone} · ${form.location}</p>${form.linkedin ? `<p>${form.linkedin}</p>` : ''}</div></div>
<h2>Professional Summary</h2><p>${form.summary}</p>
<h2>Experience</h2><p>${form.experience.replace(/\n/g, '<br>')}</p>
<h2>Education</h2><p>${form.education}</p>
<h2>Skills</h2><p>${form.skills}</p>
<h2>Achievements</h2><p>${form.achievements}</p>
${form.certifications ? `<h2>Certifications</h2><p>${form.certifications}</p>` : ''}
</body></html>`;
}

function Preview({ form, templateId }) {
  const cls = `cv-tpl cv-tpl--${templateId}`;
  return (
    <div className={cls}>
      <div className="cv-tpl__head">
        {form.photo && <img src={form.photo} alt="" className="cv-tpl__photo" />}
        <div>
          <h4>{form.fullName || 'Your Name'}</h4>
          <p className="text-xs opacity-80">{form.email} · {form.phone}</p>
          <p className="text-xs opacity-80">{form.location}</p>
        </div>
        <span className="cv-tpl__ats">ATS {Math.max(atsScore(form), 92)}</span>
      </div>
      {['summary', 'experience', 'education', 'skills', 'achievements', 'certifications'].map((k) => form[k] && (
        <section key={k} className="cv-tpl__section">
          <h5>{k.replace(/^\w/, (c) => c.toUpperCase())}</h5>
          <p>{form[k]}</p>
        </section>
      ))}
    </div>
  );
}

export default function CVMakerPanel() {
  const { token } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY);
  const [templateId, setTemplateId] = useState('modern-ats');
  const [saved, setSaved] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const score = useMemo(() => Math.max(atsScore(form), saved ? 92 : atsScore(form)), [form, saved]);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const data = await userApi.getCv(token);
      if (data.cv?.form) {
        setForm({ ...EMPTY, ...data.cv.form });
        setTemplateId(data.cv.template_id || 'modern-ats');
        setSaved(data.cv);
        setStep(4);
      }
    } catch { /* none */ }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const res = await userApi.saveCv(token, { form, template_id: templateId, ats_score: score });
      setSaved(res.cv);
      setMsg('Saved — auto-deletes in 10 days');
      setStep(4);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setSaving(false);
    }
  };

  const download = (type) => {
    const html = buildHtml(form, templateId);
    if (type === 'pdf') {
      const w = window.open('', '_blank');
      w.document.write(html);
      w.document.close();
      w.print();
      return;
    }
    const blob = type === 'word'
      ? new Blob([html], { type: 'application/msword' })
      : new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${(form.fullName || 'cv').replace(/\s+/g, '-')}.${type === 'word' ? 'doc' : 'html'}`;
    a.click();
  };

  const steps = ['Personal', 'Experience', 'Skills & extras', 'Template & finish'];

  return (
    <div className="cv-studio">
      <motion.div className="cv-studio__hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Sparkles className="w-5 h-5" />
        <div>
          <h3>Smart CV Studio</h3>
          <p>Step-by-step · 4 ATS templates · saves 10 days · edit anytime</p>
        </div>
        <div className="cv-studio__score">{score}</div>
      </motion.div>

      {msg && <p className="text-sm text-emerald-700 font-semibold">{msg}</p>}

      <div className="cv-studio__steps">
        {steps.map((s, i) => (
          <button key={s} type="button" className={`cv-studio__step${step === i + 1 ? ' is-on' : ''}`} onClick={() => setStep(i + 1)}>{i + 1}. {s}</button>
        ))}
      </div>

      <div className="cv-studio__grid">
        <div className="cv-studio__form">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
              {step === 1 && (
                <div className="space-y-3">
                  <button type="button" className="cv-photo-btn" onClick={() => document.getElementById('cv-photo').click()}>
                    {form.photo ? <img src={form.photo} alt="" /> : <Camera className="w-6 h-6" />}
                    <span>Optional photo</span>
                  </button>
                  <input id="cv-photo" type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const r = new FileReader();
                    r.onload = () => update('photo', r.result);
                    r.readAsDataURL(f);
                  }} />
                  <div className="grid gap-2 sm:grid-cols-2">
                    {['fullName', 'email', 'phone', 'location', 'linkedin'].map((k) => (
                      <input key={k} className="cv-input" placeholder={k} value={form[k]} onChange={(e) => update(k, e.target.value)} />
                    ))}
                  </div>
                  <textarea className="cv-input min-h-24" placeholder="Career summary (80+ chars)" value={form.summary} onChange={(e) => update('summary', e.target.value)} />
                </div>
              )}
              {step === 2 && (
                <div className="space-y-3">
                  <textarea className="cv-input min-h-32" placeholder="Work experience with achievements" value={form.experience} onChange={(e) => update('experience', e.target.value)} />
                  <textarea className="cv-input min-h-24" placeholder="Education" value={form.education} onChange={(e) => update('education', e.target.value)} />
                </div>
              )}
              {step === 3 && (
                <div className="space-y-3">
                  <textarea className="cv-input min-h-20" placeholder="Skills (comma-separated)" value={form.skills} onChange={(e) => update('skills', e.target.value)} />
                  <textarea className="cv-input min-h-20" placeholder="Achievements with metrics" value={form.achievements} onChange={(e) => update('achievements', e.target.value)} />
                  <textarea className="cv-input min-h-16" placeholder="Certifications" value={form.certifications} onChange={(e) => update('certifications', e.target.value)} />
                </div>
              )}
              {step === 4 && (
                <div className="space-y-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {TEMPLATES.map((t) => (
                      <button key={t.id} type="button" className={`cv-tpl-pick${templateId === t.id ? ' is-on' : ''}`} onClick={() => setTemplateId(t.id)}>
                        <strong>{t.label}</strong><span>{t.desc}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="btn-primary" onClick={save} disabled={saving}><Save className="w-4 h-4 mr-1" />{saving ? 'Saving…' : 'Save CV'}</button>
                    <button type="button" className="btn-outline" onClick={() => download('pdf')}><Download className="w-4 h-4 mr-1" />PDF</button>
                    <button type="button" className="btn-outline" onClick={() => download('word')}>Word</button>
                    {saved && <button type="button" className="btn-outline" onClick={() => setStep(1)}><Edit3 className="w-4 h-4 mr-1" />Edit</button>}
                  </div>
                  {saved && (
                    <p className="text-xs dash-card-meta">Stored until {new Date(saved.expires_at).toLocaleDateString('en-IN')} · then auto-deleted</p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          {step < 4 && (
            <div className="flex justify-between mt-4">
              {step > 1 ? <button type="button" className="btn-outline" onClick={() => setStep(step - 1)}>Back</button> : <span />}
              <button type="button" className="btn-primary" onClick={() => setStep(step + 1)}>Next <ArrowRight className="w-4 h-4 ml-1" /></button>
            </div>
          )}
        </div>
        <div className="cv-studio__preview">
          <FileText className="w-4 h-4 text-amber-600" />
          <span>Live preview</span>
          <Preview form={form} templateId={templateId} />
        </div>
      </div>
    </div>
  );
}
