import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, LogIn } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { publicApi } from '../api';

const INTENT_PREFIX = {
  counselling: 'I want counselling guidance',
  training: 'I want Training & Placement guidance',
  partner: 'I want to partner with Dream Mantra',
  other: 'I need help choosing the right path',
};

export default function FreeGuidanceForm({
  className = '',
  showLoginHint = true,
  id = 'guidance',
}) {
  const { d } = useLang();
  const fg = d('freeGuidance') || {};
  const contact = d('pages.contact') || {};
  const [searchParams] = useSearchParams();
  const intents = fg.intents || [];

  const initialIntent = useMemo(() => {
    const fromUrl = searchParams.get('intent');
    if (fromUrl && intents.some((i) => i.id === fromUrl)) return fromUrl;
    return intents[0]?.id || 'counselling';
  }, [searchParams, intents]);

  const [intent, setIntent] = useState(initialIntent);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setIntent(initialIntent);
  }, [initialIntent]);

  const applyIntentPrefill = (nextIntent) => {
    setIntent(nextIntent);
    const prefix = INTENT_PREFIX[nextIntent] || INTENT_PREFIX.other;
    setForm((f) => {
      const isEmptyOrPrefill =
        !f.message.trim() ||
        Object.values(INTENT_PREFIX).some((p) => f.message.startsWith(p));
      if (!isEmptyOrPrefill) return f;
      return { ...f, message: `${prefix}. ` };
    });
  };

  useEffect(() => {
    applyIntentPrefill(initialIntent);
    // Prefill once when intent from URL / first mount settles
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialIntent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const intentLabel = intents.find((i) => i.id === intent)?.label || intent;
      const payload = {
        ...form,
        message: `[${intentLabel}] ${form.message}`.trim(),
      };
      const res = await publicApi.submitContact(payload);
      setSuccess(res.message || fg.thankYou || contact.thankYou);
      setForm({ name: '', email: '', phone: '', message: '' });
      applyIntentPrefill(intent);
    } catch (err) {
      setError(err.message || fg.error || 'Could not send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      id={id}
      className={`free-guidance-form ${className}`.trim()}
      onSubmit={handleSubmit}
    >
      <h3 className="font-display text-xl font-bold mb-2 text-theme-primary">
        {fg.formTitle || contact.formTitle}
      </h3>
      <p className="text-sm text-theme-muted mb-5">{fg.formSubtitle}</p>

      {intents.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5" role="group" aria-label={fg.intentLabel}>
          {intents.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => applyIntentPrefill(item.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                intent === item.id
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'border-amber-200 text-theme-muted hover:border-amber-400'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-sm border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>
      )}

      <div className="space-y-4">
        <input
          className="input-field"
          placeholder={contact.namePlaceholder}
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <input
          className="input-field"
          type="email"
          placeholder={contact.emailPlaceholder}
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
        <input
          className="input-field"
          placeholder={contact.phonePlaceholder}
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
        />
        <textarea
          className="input-field min-h-[120px]"
          placeholder={fg.messagePlaceholder || contact.messagePlaceholder}
          required
          minLength={10}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
        />
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full inline-flex items-center justify-center gap-2"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {submitting ? fg.sending || 'Sending…' : fg.submit || contact.submit}
        </button>
      </div>

      {showLoginHint && (
        <p className="mt-4 text-sm text-theme-muted text-center">
          <Link to="/signup" className="text-amber-700 font-semibold inline-flex items-center gap-1 hover:underline">
            <LogIn className="w-3.5 h-3.5" /> {fg.authCta || fg.login || 'Sign in to know more'}
          </Link>
        </p>
      )}
    </form>
  );
}
