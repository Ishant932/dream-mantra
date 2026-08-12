import { Link, useLocation, useNavigate } from 'react-router-dom';
import GuidanceCTA from '../components/GuidanceCTA';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { ArrowRight, Calendar, ClipboardList, LogIn, Map, Target } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { crpPath, parseCrpPath } from '../utils/pathRoutes';
import CmsPageSections from '../components/CmsPageSections';
import { cmsText, usePageCatalog } from '../hooks/usePageCatalog';
import CRPExplorePage from './CRPExplorePage';
import CRReadinessPage from './CRReadinessPage';
import CRPLaunchPage from './CRPLaunchPage';

const TAB_ICONS = { launchpad: ClipboardList, readiness: Target, pathways: Map };
const TAB_GUIDE = {
  launchpad: { title: 'AI Career Launchpad' },
  readiness: { title: 'Personalised Career Readiness Program' },
  pathways: { title: 'Age Pathways' },
};
const AUDIENCE_IDS = ['college-students', 'freshers', 'working-professionals'];

function splitHubTitle(title) {
  const raw = title || 'Training & Placement';
  const parts = raw.split(/\s*&\s*/);
  if (parts.length < 2) return { lead: raw, accent: '' };
  return { lead: `${parts[0]} &`, accent: parts.slice(1).join(' & ') };
}

export default function CRPHub() {
  const { d } = useLang();
  const crpTabs = d('data.crpTabs') || [];
  const hub = d('pages.crp.hub') || {};
  const cms = usePageCatalog('crp');
  const fg = d('freeGuidance') || {};
  const location = useLocation();
  const navigate = useNavigate();
  const parsed = parseCrpPath(location.pathname, location.search);
  let tab = parsed.tab || 'launchpad';
  const audience = parsed.audience || 'college-students';

  useEffect(() => {
    if (parsed.redirect) {
      navigate(parsed.redirect, { replace: true, preventScrollReset: true });
    }
  }, [parsed.redirect, navigate]);

  if (AUDIENCE_IDS.includes(tab)) tab = 'pathways';

  const setTab = (tabId) => {
    navigate(crpPath(tabId, { audience: tabId === 'pathways' ? audience : undefined }), {
      replace: true,
      preventScrollReset: true,
    });
  };

  const { lead, accent } = splitHubTitle(cmsText(cms, 'heroTitle', hub.title || 'Training & Placement'));
  const hubSubtitle = cmsText(cms, 'heroSubtitle', hub.subtitle || 'From learning to landing your dream job.');

  return (
    <div className={`crp-studio crp-studio--${tab} no-reveal`}>
      <header className="crp-studio__masthead">
        <div className="crp-studio__masthead-glow" aria-hidden />
        <motion.div className="crp-studio__masthead-inner" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="crp-studio__masthead-copy">
            <motion.h1 className="crp-studio__title font-accent">{lead} {accent ? <span className="crp-studio__title-accent">{accent}</span> : null}</motion.h1>
            <motion.p className="crp-studio__subtitle">{hubSubtitle}</motion.p>
            <motion.div className="crp-studio__masthead-actions">
              <GuidanceCTA className="crp-studio__btn crp-studio__btn--primary">
                <Calendar className="w-4 h-4" /> {hub.cta || fg.cta || 'Book a free guidance call'} <ArrowRight className="w-4 h-4" />
              </GuidanceCTA>
              <Link to="/signup" className="crp-studio__btn crp-studio__btn--ghost"><LogIn className="w-4 h-4" /> {fg.login || 'Sign in'}</Link>
            </motion.div>
          </div>
        </motion.div>
      </header>

      <nav className="crp-studio__tabbar" aria-label="Training sections" role="tablist">
        <div className="crp-studio__tabbar-inner">
          {crpTabs.map((item) => {
            const Icon = TAB_ICONS[item.id] || ClipboardList;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`crp-studio__tab crp-studio__tab--${item.id}${active ? ' is-active' : ''}`}
                onClick={() => setTab(item.id)}
              >
                <Icon className="w-4 h-4" aria-hidden />
                <span>{TAB_GUIDE[item.id]?.title || item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <CmsPageSections cms={cms} className="!py-6" />
      <div className="crp-studio__canvas" role="tabpanel">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            {tab === 'pathways' ? <CRPLaunchPage compact /> : tab === 'readiness' ? <CRReadinessPage compact /> : <CRPExplorePage compact />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
