import { useLang } from '../context/LanguageContext';
import { pillars as pillarMeta } from '../data/pillars';
import { IMAGES, managementTeam as mgmtBase, founder as founderBase, certifications as certBase } from '../data/content';
import {
  navAssessmentRoutes,
  navAssessmentIcons,
  navProgramRoutes,
  navProgramIcons,
  navCrpRoutes,
  navCrpIcons,
  navCrpProgramRoutes,
  navCrpProgramIcons,
  whoWeGuideRoutes,
  zipNavLinks,
} from './navRoutes';

export function useSiteNav() {
  const { d } = useLang();
  const mega = d('navMega');

  return {
    counsellingMega: [
      {
        title: mega.assessments.title,
        links: zipNavLinks(mega.assessments.links, navAssessmentRoutes, navAssessmentIcons),
      },
      {
        title: mega.programs.title,
        links: zipNavLinks(mega.programs.links, navProgramRoutes, navProgramIcons),
      },
    ],
    crpMega: [
      {
        title: mega.crp.title,
        links: zipNavLinks(mega.crp.links, navCrpRoutes, navCrpIcons),
      },
      {
        title: mega.crpPrograms.title,
        links: zipNavLinks(mega.crpPrograms.links, navCrpProgramRoutes, navCrpProgramIcons),
      },
    ],
    quickLinks: d('quickLinks'),
  };
}

export function useHomeContent() {
  const { t, d, lang } = useLang();
  const home = d('home');
  const statsLabels = d('stats');

  const stats = [
    { value: 7000, suffix: '+', label: statsLabels.clientsServed },
    { value: 950, suffix: '+', label: statsLabels.careersMapped },
    { value: 30, suffix: '+', label: statsLabels.countriesValidated },
    { value: 7, suffix: '', label: statsLabels.pillarFramework },
  ];

  const pillarIcons = pillarMeta.map((p) => ({ icon: p.icon, color: p.color, link: p.link }));
  const localizedPillars = d('pillars').map((p, i) => ({ ...pillarIcons[i], ...p }));

  const toolkitIcons = ['📚', '🤖', '🧠', '🗺️'];
  const toolkitLinks = ['/careers', '/marketplace?tab=ai', '/assessments/psychometric', '/counselling?tab=book'];
  const toolkitServices = d('data.toolkitServices').map((s, i) => ({
    ...s,
    icon: toolkitIcons[i],
    link: toolkitLinks[i],
  }));

  const whoWeGuide = d('data.whoWeGuide').map((w, i) => ({
    ...w,
    link: whoWeGuideRoutes[i],
  }));

  const portraitList = [null, null, null, null, null, null, null, null];
  const testimonials = d('data.testimonials').map((item, i) => ({
    ...item,
    image: portraitList[i] || null,
  }));

  const locMgmt = d('data.managementTeam');
  const managementTeam = mgmtBase.map((p, i) => {
    const loc = locMgmt[i];
    if (!loc) return p;
    return {
      ...p,
      name: loc.name ?? p.name,
      role: loc.role ?? p.role,
      tagline: loc.tagline ?? p.tagline,
      bio: loc.bio ?? p.bio,
      before: loc.before ?? p.before,
      insight: loc.insight ?? p.insight,
      vision: loc.vision ?? p.vision,
      responsibilities: loc.responsibilities ?? p.responsibilities,
      certs: loc.certs ?? p.certs,
    };
  });

  const locCerts = d('data.certifications');
  const certifications = certBase.map((c) => {
    const loc = locCerts.find((x) => x.id === c.id);
    return {
      ...c,
      title: loc?.title ?? c.id,
      issuer: loc?.issuer ?? '',
    };
  });

  return {
    t,
    lang,
    home,
    stats,
    pillars: localizedPillars,
    seventhPillar: { ...d('seventhPillar'), link: '/crp/explore' },
    processSteps: d('data.processSteps'),
    faqs: d('data.faqs').slice(0, 4),
    whyCards: d('data.whyCards').map((c, i) => ({
      ...c,
      image: [IMAGES.career, IMAGES.professional, IMAGES.students][i],
    })),
    toolkitServices,
    premiumServices: d('data.premiumServices').map((s, i) => ({
      ...s,
      image: [IMAGES.internship, IMAGES.skills, IMAGES.profile, IMAGES.mentorship, IMAGES.handholding][i],
    })),
    whoWeGuide,
    testimonials,
    managementTeam,
    certifications,
    partners: d('partners'),
  };
}

export function useAboutContent() {
  const { t, d } = useLang();
  const about = d('pages.about');
  const missionVision = d('data.missionVision');
  const founderLoc = d('data.founder');

  const founder = {
    ...founderBase,
    role: founderLoc.role ?? founderBase.role,
    quote: founderLoc.quote ?? founderBase.quote,
    longNote: founderLoc.longNote ?? founderBase.longNote,
    certs: founderLoc.certs ?? founderBase.certs,
  };

  const locMgmt = d('data.managementTeam');
  const managementTeam = mgmtBase.map((p, i) => {
    const loc = locMgmt[i];
    if (!loc) return p;
    return {
      ...p,
      name: loc.name ?? p.name,
      role: loc.role ?? p.role,
      tagline: loc.tagline ?? p.tagline,
      bio: loc.bio ?? p.bio,
      before: loc.before ?? p.before,
      insight: loc.insight ?? p.insight,
      vision: loc.vision ?? p.vision,
      responsibilities: loc.responsibilities ?? p.responsibilities,
      certs: loc.certs ?? p.certs,
    };
  });

  return { t, d, about, missionVision, founder, managementTeam, leadership: d('data.leadership') || {}, homeLeadership: d('data.homeLeadership') || {} };
}
