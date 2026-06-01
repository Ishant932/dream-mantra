import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, GraduationCap, Mail, Phone, Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import { useLang } from '../context/LanguageContext';
import { programs as programImages } from '../data/content';
import { PARTNER_DISPLAY_ORDER } from '../data/siteLinks';
import { partners as partnerMeta } from '../data/content';
import { animations } from '../utils/animations';

const programAccents = [
  'from-[#C9A84C]/70 to-[#FF6B4A]/50',
  'from-[#FF6B4A]/60 to-[#C9A84C]/50',
  'from-[#013220]/50 to-[#FF6B4A]/45',
  'from-[#FF6B4A]/55 to-[#E8512E]/45',
  'from-[#C9A84C]/65 to-[#013220]/40',
  'from-[#FF6B4A]/50 to-[#C9A84C]/55',
];

const { tabFadeUp, tabScaleIn } = animations;

function PathwaySubTabs({ active, onChange, labels }) {
  return (
    <div className="pathway-subtabs" role="tablist">
      <button
        type="button"
        role="tab"
        aria-selected={active === 'students'}
        className={`pathway-subtab ${active === 'students' ? 'pathway-subtab--active' : ''}`}
        onClick={() => onChange('students')}
      >
        <GraduationCap className="w-4 h-4" />
        {labels.students}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={active === 'institutions'}
        className={`pathway-subtab ${active === 'institutions' ? 'pathway-subtab--active' : ''}`}
        onClick={() => onChange('institutions')}
      >
        <Building2 className="w-4 h-4" />
        {labels.institutions}
      </button>
    </div>
  );
}

function StudentsPathways({ localizedPrograms, tabsCopy }) {
  return (
    <>
      <motion.div {...tabFadeUp} className="text-center max-w-2xl mx-auto mb-14 px-4">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(201,168,76,0.15)] text-[#C9A84C] text-sm font-semibold mb-5 border border-[rgba(201,168,76,0.3)]">
          <Sparkles className="w-4 h-4" /> {tabsCopy.badge}
        </span>
        <h2 className="section-title mb-4">{tabsCopy.title}</h2>
        <p className="text-sand-600 text-lg leading-relaxed">{tabsCopy.desc}</p>
      </motion.div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
        {localizedPrograms.map((p, i) => (
          <motion.div
            key={p.slug}
            {...tabScaleIn}
            transition={{ delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -10, scale: 1.02 }}
          >
            <Link
              to={`/programs/${p.slug}`}
              className="group block h-full rounded-3xl overflow-hidden bg-[var(--bg-elevated)] border border-sand-100 shadow-lg shadow-sand-200/50 hover:shadow-2xl hover:shadow-[rgba(255,107,74,0.15)] transition-all duration-500 glow-card"
            >
              <div className="relative h-44 overflow-hidden">
                <motion.img
                  src={p.image}
                  alt=""
                  className="h-full w-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${programAccents[i % programAccents.length]} opacity-40 group-hover:opacity-55 transition-opacity duration-500`} />
                <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-[var(--bg-elevated)]/90 backdrop-blur flex items-center justify-center shadow-md">
                  <GraduationCap className="w-5 h-5 text-[#C9A84C]" />
                </div>
              </div>
              <div className="p-7 lg:p-8">
                <h3 className="font-display text-xl font-bold group-hover:text-[#FF6B4A] transition-colors">{p.title}</h3>
                <p className="text-[#C9A84C] font-medium mt-2 mb-5">{p.subtitle}</p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#013220] dark:text-[#E8C96A] group-hover:gap-3 transition-all">
                  {tabsCopy.exploreProgram} <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </>
  );
}

function InstitutionsPathways({ institutionsCopy, partners }) {
  return (
    <>
      <motion.div {...tabFadeUp} className="text-center max-w-3xl mx-auto mb-12 px-4">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(1,50,32,0.08)] text-[#013220] dark:text-[#E8C96A] text-sm font-semibold mb-5 border border-[rgba(1,50,32,0.15)]">
          <Building2 className="w-4 h-4" /> {institutionsCopy.badge}
        </span>
        <h2 className="section-title mb-4">{institutionsCopy.title}</h2>
        <p className="text-sand-600 text-lg leading-relaxed">{institutionsCopy.desc}</p>
        <p className="text-sand-500 text-sm mt-4">{institutionsCopy.chooseCategory}</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-14">
        {partners.map((p, i) => (
          <motion.div
            key={p.slug}
            {...tabScaleIn}
            transition={{ delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -8, scale: 1.02 }}
          >
            <Link
              to={`/partner/${p.slug}`}
              className="group block h-full rounded-2xl overflow-hidden bg-[var(--bg-elevated)] border border-sand-100 shadow-md hover:shadow-xl hover:border-[rgba(255,107,74,0.25)] transition-all duration-300 glow-card"
            >
              <div className="relative h-36 overflow-hidden">
                <img src={p.image} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className="absolute bottom-3 left-4 text-3xl drop-shadow">{p.icon}</span>
              </div>
              <div className="p-6">
                <h3 className="font-display text-lg font-bold group-hover:text-[#FF6B4A] transition-colors">{p.title}</h3>
                <p className="text-sm text-sand-600 dark:text-sand-400 mt-2 leading-relaxed line-clamp-3">{p.desc}</p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#013220] dark:text-[#E8C96A] mt-4 group-hover:gap-3 transition-all">
                  {institutionsCopy.explorePartnership} <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div
        {...tabFadeUp}
        className="rounded-2xl border border-sand-200 dark:border-sand-700 bg-sand-50/80 dark:bg-sand-900/40 p-8 lg:p-10 text-center max-w-2xl mx-auto"
      >
        <h3 className="font-display text-xl font-bold mb-2">{institutionsCopy.getInTouch}</h3>
        <p className="text-sand-600 text-sm mb-6">{institutionsCopy.getInTouchDesc}</p>
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <a href="tel:9680102276" className="inline-flex items-center gap-2 font-semibold text-[#013220] dark:text-[#E8C96A] hover:text-[#FF6B4A] transition-colors">
            <Phone className="w-4 h-4" /> 9680102276
          </a>
          <a href="mailto:info@dreammantra.in" className="inline-flex items-center gap-2 font-semibold text-[#013220] dark:text-[#E8C96A] hover:text-[#FF6B4A] transition-colors">
            <Mail className="w-4 h-4" /> info@dreammantra.in
          </a>
        </div>
        <p className="text-xs text-sand-500 mt-4">{institutionsCopy.hours}</p>
        <Link to="/contact" className="btn-primary mt-6 inline-flex">{institutionsCopy.contactCta}</Link>
      </motion.div>
    </>
  );
}

export default function AgePathwaysSection() {
  const { d } = useLang();
  const [searchParams, setSearchParams] = useSearchParams();
  const pathway = searchParams.get('pathway') === 'institutions' ? 'institutions' : 'students';

  const tabsCopy = d('pages.counselling.tabs.programs');
  const institutionsCopy = tabsCopy.institutions || {};
  const subTabLabels = tabsCopy.subTabs || { students: 'Students', institutions: 'Institutions' };

  const localizedPrograms = useMemo(
    () => d('programs').map((p, i) => ({ ...programImages[i], ...p })),
    [d],
  );

  const partners = useMemo(() => {
    const localized = d('data.partners').map((p, i) => ({ ...partnerMeta[i], ...p }));
    return PARTNER_DISPLAY_ORDER.map((slug) => localized.find((p) => p.slug === slug)).filter(Boolean);
  }, [d]);

  const setPathway = (next) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', 'programs');
    if (next === 'institutions') params.set('pathway', 'institutions');
    else params.delete('pathway');
    setSearchParams(params, { replace: true });
  };

  return (
    <div>
      <PathwaySubTabs active={pathway} onChange={setPathway} labels={subTabLabels} />
      {pathway === 'students' ? (
        <StudentsPathways localizedPrograms={localizedPrograms} tabsCopy={tabsCopy} />
      ) : (
        <InstitutionsPathways institutionsCopy={institutionsCopy} partners={partners} />
      )}
    </div>
  );
}
