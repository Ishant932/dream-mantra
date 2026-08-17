import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Loader2, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import PageHero from '../components/PageHero';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import PasswordInput from '../components/PasswordInput';
import { MODULE_CATALOG, resolveCounsellingAddon } from '../data/moduleCatalog';
import { paymentsApi, userApi } from '../api';
import { IMAGES } from '../data/content';

const COUNSELLING_CATALOG_SLUGS = ['dmit', 'psychometric', 'dmit-psychometric'];
const TRAINING_CATALOG_SLUGS = ['crp-test', 'career-readiness'];

function formatPrice(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}

function BookNowModuleCard({ module, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`guidance-modal__module w-full text-left rounded-xl border-2 p-3 transition-all ${
        selected ? 'border-amber-500 bg-amber-50/80 shadow-md' : 'border-sand-200/80 bg-white hover:border-amber-300'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">{module.icon}</span>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm text-theme-primary">{module.title}</p>
          <p className="text-xs dash-card-meta mt-0.5 line-clamp-2">{module.description}</p>
          {module.includesCounselling && (
            <p className="text-xs text-emerald-700 font-semibold mt-1 inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Counselling included
            </p>
          )}
        </div>
        <span className="font-bold text-amber-700 text-sm shrink-0">{formatPrice(module.price)}</span>
      </div>
    </button>
  );
}

export default function BookNowPage() {
  const { register, user, token } = useAuth();
  const { d } = useLang();
  const navigate = useNavigate();
  const fg = d('freeGuidance') || {};

  const [vertical, setVertical] = useState('counselling');
  const [step, setStep] = useState('modules');
  const [catalog, setCatalog] = useState(MODULE_CATALOG);
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [addCounselling, setAddCounselling] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const bookableModules = useMemo(
    () => catalog.filter((m) => !m.followUpOnly),
    [catalog],
  );

  const counsellingModules = useMemo(
    () => bookableModules.filter((m) => COUNSELLING_CATALOG_SLUGS.includes(m.slug)),
    [bookableModules],
  );

  const trainingModules = useMemo(
    () => bookableModules.filter((m) => TRAINING_CATALOG_SLUGS.includes(m.slug)),
    [bookableModules],
  );

  const verticalModules = vertical === 'counselling' ? counsellingModules : trainingModules;

  const selectedModule = useMemo(
    () => bookableModules.find((m) => m.slug === selectedSlug) || null,
    [bookableModules, selectedSlug],
  );

  const selection = useMemo(() => {
    if (!selectedModule) return null;
    const withCounselling = !!(addCounselling && selectedModule.optionalCounselling);
    const lineItems = [{ label: selectedModule.title, amount: selectedModule.price, slug: selectedModule.slug, type: 'module' }];
    if (withCounselling) {
      const addon = resolveCounsellingAddon(selectedModule);
      lineItems.push({ label: addon.title, amount: addon.price, type: 'counselling', description: addon.description });
    }
    const total = lineItems.reduce((s, i) => s + i.amount, 0);
    const addon = resolveCounsellingAddon(selectedModule);
    return {
      slug: selectedModule.slug,
      moduleTitle: selectedModule.title,
      lineItems,
      addCounselling: withCounselling,
      total,
      displayTitle: withCounselling ? `${selectedModule.title} + ${addon.title}` : selectedModule.title,
      moduleSlug: selectedModule.slug,
    };
  }, [selectedModule, addCounselling]);

  useEffect(() => {
    paymentsApi.products()
      .then((res) => {
        if (Array.isArray(res.products) && res.products.length) setCatalog(res.products);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedSlug) return;
    const inVertical = verticalModules.some((m) => m.slug === selectedSlug);
    if (!inVertical) {
      setSelectedSlug(null);
      setAddCounselling(false);
    }
  }, [vertical, verticalModules, selectedSlug]);

  const goCheckout = async (authToken) => {
    if (!selection || !authToken) return;
    setLoading(true);
    setError('');
    try {
      const res = await userApi.bookAssessment(authToken, {
        productSlug: selection.slug,
        addCounselling: selection.addCounselling,
        amount: selection.total,
        lineItems: selection.lineItems,
        selectionTitle: selection.displayTitle,
      });
      navigate(`/payment/${res.assessment.id}`, { state: { selection } });
    } catch (err) {
      setError(err.message || 'Could not start checkout');
    } finally {
      setLoading(false);
    }
  };

  const handleModulesNext = async () => {
    setError('');
    if (!selectedSlug) {
      setError('Please select a program to continue');
      return;
    }
    if (user && token) {
      await goCheckout(token);
      return;
    }
    setStep('signup');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() && !phone.trim()) {
      setError('Enter email or phone');
      return;
    }
    const phoneDigits = phone.replace(/\D/g, '');
    const mobile = phoneDigits.length === 12 && phoneDigits.startsWith('91')
      ? phoneDigits.slice(2)
      : phoneDigits.length === 11 && phoneDigits.startsWith('0')
        ? phoneDigits.slice(1)
        : phoneDigits;
    if (phone.trim() && !/^[6-9]\d{9}$/.test(mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!phone.trim()) {
      setError('Mobile number is required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const data = await register({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: mobile,
        password,
        whatsappOptIn: true,
        signupInterest: vertical === 'training' ? 'training' : 'counselling',
      });
      await goCheckout(data.token);
    } catch (err) {
      setError(err.message || 'Could not create account');
      setLoading(false);
    }
  };

  return (
    <>
      <PageHero
        title="Book Now"
        subtitle="Choose counselling assessments or training & placement programs — then continue to secure checkout."
        image={IMAGES.marketplace || IMAGES.skills || IMAGES.professional}
        cta={fg.cta || 'Book a free guidance call'}
        ctaLink="/contact#guidance"
      />

      <section className="py-10 sm:py-12 max-w-3xl mx-auto px-4 no-reveal">
        <div className="book-now-page">
          <div className="book-now-page__head">
            <span className="guidance-modal__badge guidance-modal__badge--pro">
              <Calendar className="w-3.5 h-3.5 inline" /> Book now
            </span>
            <h2 className="book-now-page__title">
              {step === 'modules' ? 'Choose your program' : 'Create your account'}
            </h2>
            <p className="book-now-page__sub">
              {step === 'modules'
                ? 'Pick Counselling or Training & Placement, select a module, then checkout.'
                : 'Sign up to complete payment for your selected program.'}
            </p>
          </div>

          {step === 'modules' && (
            <>
              <div
                className="dash-product-path-rail dash-product-path-rail--inline dash-product-path-rail--center dash-product-path-rail--lg mb-6"
                role="tablist"
                aria-label="Program category"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={vertical === 'counselling'}
                  className={`dash-product-path-rail__chip${vertical === 'counselling' ? ' dash-product-path-rail__chip--active' : ''}`}
                  onClick={() => setVertical('counselling')}
                >
                  Counselling
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={vertical === 'training'}
                  className={`dash-product-path-rail__chip${vertical === 'training' ? ' dash-product-path-rail__chip--active' : ''}`}
                  onClick={() => setVertical('training')}
                >
                  Training & Placement
                </button>
              </div>

              <p className="text-sm dash-card-meta mb-4 text-center">
                {vertical === 'counselling'
                  ? 'Brain Mapping, Skill Mapping, and Brain + Skill Mapping assessments.'
                  : 'AI Career Launchpad and Personalised Career Readiness Program.'}
              </p>

              <div className="space-y-2 mb-4">
                {verticalModules.length > 0 ? (
                  verticalModules.map((mod) => (
                    <BookNowModuleCard
                      key={mod.slug}
                      module={mod}
                      selected={selectedSlug === mod.slug}
                      onSelect={() => {
                        setSelectedSlug(mod.slug);
                        if (mod.optionalCounselling) setAddCounselling(true);
                        else setAddCounselling(false);
                      }}
                    />
                  ))
                ) : (
                  <p className="text-sm text-center dash-card-meta py-6">No programs available in this category right now.</p>
                )}
              </div>

              {selectedModule?.optionalCounselling && (
                <button
                  type="button"
                  onClick={() => setAddCounselling((v) => !v)}
                  className={`w-full text-left rounded-xl border p-3 text-sm mb-4 ${addCounselling ? 'border-amber-500 bg-amber-50/70' : 'border-sand-200'}`}
                >
                  <span className="font-bold">{resolveCounsellingAddon(selectedModule).title}</span>
                  <span className="dash-card-meta"> · +{formatPrice(resolveCounsellingAddon(selectedModule).price)}</span>
                  <span className="float-right font-semibold">{addCounselling ? 'Added ✓' : 'Add'}</span>
                </button>
              )}

              {selection && (
                <p className="text-sm font-bold text-amber-800 text-center mb-3">
                  Total: {formatPrice(selection.total)}
                </p>
              )}
              {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
              <button
                type="button"
                disabled={loading || !selectedSlug}
                onClick={handleModulesNext}
                className="btn-primary w-full !py-3 inline-flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? 'Starting checkout…' : user ? 'Continue to checkout' : 'Next — sign up'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </>
          )}

          {step === 'signup' && (
            <form onSubmit={handleSubmit} className="space-y-3">
              {selection && (
                <div className="rounded-xl border border-amber-200/70 bg-amber-50/60 px-3 py-2 text-sm">
                  <p className="font-bold text-theme-primary">{selection.displayTitle}</p>
                  <p className="dash-card-meta">Total: {formatPrice(selection.total)}</p>
                </div>
              )}
              <input className="input-field w-full" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
              <input className="input-field w-full" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input className="input-field w-full" type="tel" placeholder="10-digit mobile number *" value={phone} onChange={(e) => setPhone(e.target.value)} required inputMode="numeric" />
              <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="input-field w-full" />
              <PasswordInput value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password" className="input-field w-full" />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-2">
                <button type="button" className="btn-outline flex-1 !py-3 inline-flex items-center justify-center gap-1" onClick={() => setStep('modules')} disabled={loading}>
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-[2] !py-3 inline-flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {loading ? 'Creating account…' : 'Sign up & checkout'}
                </button>
              </div>
              <p className="text-xs text-center opacity-60">{fg.loginHint || 'Already have an account? Sign in from the menu.'}</p>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
