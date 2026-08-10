import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, Rocket, Sparkles, Target, Zap, Users, Brain, FileText, Calendar } from 'lucide-react';
import { READINESS_SESSIONS, READINESS_INCLUDED } from '../../data/crReadinessContent';

const LAUNCHPAD_SESSIONS = [
  { n: 1, title: 'Personal Brand & LinkedIn', desc: 'Position yourself professionally online.', icon: Rocket },
  { n: 2, title: 'Resume & Portfolio', desc: 'ATS-friendly resume and standout portfolio.', icon: FileText },
  { n: 3, title: 'AI Job Search', desc: 'Smart tools to find and shortlist roles.', icon: Target },
  { n: 4, title: 'Interview Mastery', desc: 'Mock drills, HR & technical prep.', icon: Briefcase },
  { n: 5, title: 'Corporate Readiness & Launch', desc: 'Recruiter connects and placement push.', icon: Zap },
];

const LAUNCHPAD_PROCESS = LAUNCHPAD_SESSIONS.map((s) => ({ icon: s.icon, title: `Session ${s.n}: ${s.title}`, desc: s.desc }));
const READINESS_PROCESS = READINESS_SESSIONS.map((s, i) => ({
  icon: [Rocket, Target, Briefcase, Zap, Brain, Users, Calendar, Sparkles][i] || Sparkles,
  title: `Session ${s.number}: ${s.title}`,
  desc: s.subtitle,
}));

const PROCESS_BY_FOCUS = { launchpad: LAUNCHPAD_PROCESS, readiness: READINESS_PROCESS };

const DETAIL_BLOCKS = {
  launchpad: {
    title: 'AI Career Launchpad',
    desc: 'Five live AI-powered sessions — personal brand, resume, interviews, job search, and corporate readiness. Community access, resources, and CV Maker included.',
    perks: ['5 × 1.5 hr live sessions', 'Admin community link (batch-wise)', '20 career parameters', 'Interview mastery labs', 'AI resume & job-search tools', 'CV Maker in dashboard'],
    stats: [{ k: 'Sessions', v: '5' }, { k: 'Live hours', v: '7.5+' }, { k: 'Career params', v: '20' }],
    img: '/images/crp/session-3-resume.png?v=4',
    sessions: LAUNCHPAD_SESSIONS,
  },
  readiness: {
    title: 'Personalised Career Readiness Program',
    desc: 'An 8-session live journey — self-discovery to offer evaluation and career launch. Schedule all sessions in one booking flow.',
    perks: READINESS_INCLUDED.slice(0, 8),
    stats: [{ k: 'Sessions', v: '8' }, { k: 'Format', v: 'Live' }, { k: 'Outcome', v: 'Job-ready' }],
    img: '/images/crp/session-4-interview.png?v=4',
    sessions: READINESS_SESSIONS,
  },
};

export function TrainingProcessStudio({ focus = 'launchpad' }) {
  const steps = PROCESS_BY_FOCUS[focus] || LAUNCHPAD_PROCESS;
  return (
    <div className="dash-studio dash-studio--process">
      <motion.div className="dash-studio__glow" aria-hidden animate={{ opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 4, repeat: Infinity }} />
      <p className="dash-studio__eyebrow"><Sparkles className="w-4 h-4" /> Your training flow</p>
      <h3 className="dash-studio__title">From enrolment to placement-ready</h3>
      <ol className="dash-studio-timeline">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.li key={s.title} className="dash-studio-timeline__item" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <span className="dash-studio-timeline__node"><Icon className="w-4 h-4" /></span>
              <div><p className="font-bold text-theme-primary">{s.title}</p><p className="text-sm dash-card-meta">{s.desc}</p></div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}

export function TrainingDetailsStudio({ focus = 'launchpad' }) {
  const block = DETAIL_BLOCKS[focus] || DETAIL_BLOCKS.launchpad;
  return (
    <div className="dash-studio dash-studio--details dash-studio--details-full">
      <div className="dash-studio-details__hero">
        <img src={block.img} alt="" className="dash-studio-details__hero-img" />
        <div className="dash-studio-details__hero-copy">
          <p className="dash-studio__eyebrow"><Sparkles className="w-4 h-4" /> Course blueprint</p>
          <h3 className="dash-studio__title">{block.title}</h3>
          <p className="text-sm dash-card-meta mt-2 leading-relaxed">{block.desc}</p>
          <div className="dash-studio-stats">
            {block.stats.map((s) => (
              <div key={s.k} className="dash-studio-stat"><span className="dash-studio-stat__v">{s.v}</span><span className="dash-studio-stat__k">{s.k}</span></div>
            ))}
          </div>
        </div>
      </div>
      <div className="dash-studio-details__body">
        <h4 className="font-bold mb-2">What&apos;s included</h4>
        <ul className="dash-studio-perks dash-studio-perks--grid">
          {block.perks.map((p) => <li key={p}>{p}</li>)}
        </ul>
        <h4 className="font-bold mt-5 mb-3">Session breakdown</h4>
        <div className="dash-studio-session-grid">
          {(block.sessions || []).map((s) => (
            <div key={s.number || s.n} className="dash-studio-session-card">
              <p className="text-xs font-bold text-amber-700">Session {s.number || s.n}</p>
              <p className="font-bold">{s.title}</p>
              <p className="text-sm dash-card-meta mt-1">{s.subtitle || s.desc}</p>
              {s.intro && <p className="text-xs dash-card-meta mt-2">{s.intro}</p>}
              {s.output && <p className="text-xs mt-2"><strong>Output:</strong> {s.output}</p>}
              {s.duration && <p className="text-xs dash-card-meta mt-1">{s.duration}</p>}
            </div>
          ))}
        </div>
        <Link to={`/crp?tab=${focus}`} className="btn-primary mt-5 inline-flex items-center gap-2">
          Explore full program <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
