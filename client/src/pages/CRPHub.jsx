import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import {
  ArrowRight,
  Calendar,
  ClipboardList,
  LogIn,
  Target,
} from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import CRPExplorePage from './CRPExplorePage';
import CRPLaunchPage from './CRPLaunchPage';

const TAB_ICONS = {
  pathways: Target,
  launchpad: ClipboardList,
};

const TAB_GUIDE = {
  pathways: {
    title: 'Age Wise Pathways',
  },
  launchpad: {
    title: 'AI Career Launchpad',
  },
};

const AUDIENCE_IDS = new Set(['college-students', 'freshers', 'working-professionals']);

function splitHubTitle(title) {
  const raw = title || 'Training & Placement';
  const parts = raw.split(/\s*&\s*/);
  if (parts.length < 2) {
    return { lead: raw, accent: '' };
  }
  return { lead: `${parts[0]} &`, accent: parts.slice(1).join(' & ') };
}

export default function CRPHub() {
  const { d } = useLang();
  const crpTabs = d('data.crpTabs') || [
    { id: 'pathways', label: 'Age Pathways' },
    { id: 'launchpad', label: 'AI Career Launchpad' },
  ];
  const hub = d('pages.crp.hub') || {};
  const fg = d('freeGuidance') || {};
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  let tab = params.get('tab') || 'launchpad';

  if (AUDIENCE_IDS.has(tab)) tab = 'pathways';
  if (tab === 'overview') tab = 'launchpad';

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const raw = p.get('tab');
    if (raw && AUDIENCE_IDS.has(raw)) {
      p.set('tab', 'pathways');
      p.set('audience', raw);
      navigate({ pathname: '/crp', search: `?${p.toString()}` }, { replace: true, preventScrollReset: true });
      return;
    }
    if (raw === 'overview' || !raw) {
      p.set('tab', 'launchpad');
      navigate({ pathname: '/crp', search: `?${p.toString()}` }, { replace: true, preventScrollReset: true });
    }
  }, [location.search, navigate]);

  const setTab = (tabId) => {
    const next = new URLSearchParams();
    next.set('tab', tabId);
    if (tabId === 'pathways') {
      const audience = params.get('audience') || 'college-students';
      next.set('audience', audience);
    }
    navigate({ pathname: '/crp', search: `?${next.toString()}` }, { replace: true, preventScrollReset: true });
  };

  const { lead, accent } = splitHubTitle(hub.title || 'Training & Placement');

  return (
    <div className={`crp-studio crp-studio--${tab} no-reveal`}>
      <header className="crp-studio__masthead">
        <div className="crp-studio__masthead-glow" aria-hidden />
        <div className="crp-studio__masthead-orb crp-studio__masthead-orb--a" aria-hidden />
        <div className="crp-studio__masthead-orb crp-studio__masthead-orb--b" aria-hidden />
        <motion.div
          className="crp-studio__masthead-inner"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="crp-studio__masthead-copy">
            <motion.h1
              className="crp-studio__title font-accent"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16, duration: 0.5 }}
            >
              {lead}{' '}
              {accent ? <span className="crp-studio__title-accent">{accent}</span> : null}
            </motion.h1>
            <motion.p
              className="crp-studio__subtitle"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.45 }}
            >
              {hub.subtitle || 'From learning to landing your dream job.'}
            </motion.p>
            <motion.div
              className="crp-studio__masthead-actions"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.45 }}
            >
              <Link to="/contact#guidance" className="crp-studio__btn crp-studio__btn--primary">
                <Calendar className="w-4 h-4" aria-hidden />
                {hub.cta || fg.cta || 'Book a free guidance call'}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/signup" className="crp-studio__btn crp-studio__btn--ghost">
                <LogIn className="w-4 h-4" aria-hidden />
                {fg.login || 'Sign in to know more'}
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </header>

      <motion.nav
        className="crp-studio__switch"
        aria-label="Training and placement sections"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32, duration: 0.5 }}
      >
        {crpTabs.map((item, i) => {
          const Icon = TAB_ICONS[item.id] || ClipboardList;
          const active = tab === item.id;
          return (
            <motion.button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={`crp-studio__switch-item crp-studio__switch-item--${item.id}${active ? ' is-active' : ''}`}
              onClick={() => setTab(item.id)}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              <span className="crp-studio__switch-icon" aria-hidden>
                <Icon className="w-5 h-5" />
              </span>
              <span className="crp-studio__switch-text">
                <span className="crp-studio__switch-label">{TAB_GUIDE[item.id]?.title || item.label}</span>
              </span>
            </motion.button>
          );
        })}
      </motion.nav>

      <div className="crp-studio__canvas" role="tabpanel">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 28, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -16, filter: 'blur(3px)' }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {tab === 'pathways' ? <CRPLaunchPage compact /> : <CRPExplorePage compact />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
