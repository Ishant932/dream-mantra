import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, Rocket, Sparkles, Target, Zap } from 'lucide-react';

const LAUNCHPAD_PROCESS = [
  { icon: Rocket, title: 'Enrol & pay', desc: 'Confirm AI Career Launchpad and complete payment.' },
  { icon: Target, title: 'Session 1–2', desc: 'Personal brand, LinkedIn, and resume foundations.' },
  { icon: Briefcase, title: 'Session 3–4', desc: 'AI job search, interview prep, and mock drills.' },
  { icon: Zap, title: 'Session 5 + launch', desc: 'Corporate readiness, recruiter connects, and placement push.' },
];

const READINESS_PROCESS = [
  { icon: Rocket, title: 'Enrol combo program', desc: 'Brain + Skill Mapping plus five training sessions.' },
  { icon: Target, title: 'Mapping phase', desc: 'Fingerprint scan and psychometric battery completed.' },
  { icon: Briefcase, title: 'Training pillars', desc: 'Five counselling + skill sessions with certified experts.' },
  { icon: Zap, title: 'Placement support', desc: 'CV, interviews, recruiter handholding till offer.' },
];

const PROCESS_BY_FOCUS = { launchpad: LAUNCHPAD_PROCESS, readiness: READINESS_PROCESS };

const DETAIL_BLOCKS = {
  launchpad: {
    title: 'AI Career Launchpad',
    desc: 'Five AI-powered skill sessions — personal brand, resume, interviews, job search, and corporate readiness.',
    perks: ['5 × 1.5 hr sessions', '20 career parameters', 'Placement story templates', 'Interview mastery labs', 'AI resume & job-search tools', 'Recruiter-style feedback'],
    img: '/images/crp/session-3-resume.png?v=4',
  },
  readiness: {
    title: 'Personalised Career Readiness Program',
    desc: 'Neuroscience + psychometrics + five training sessions + placement assistance — the complete launchpad.',
    perks: ['Brain & Skill Mapping', 'Combined 360° profile', '5 counselling pillars', 'Placement handholding', 'Certified counsellor guidance', 'CV + interview studio access'],
    img: '/images/crp/session-4-interview.png?v=4',
  },
};

export function TrainingProcessStudio({ focus = 'launchpad' }) {
  const steps = PROCESS_BY_FOCUS[focus] || LAUNCHPAD_PROCESS;
  return (
    <div className="dash-studio dash-studio--process">
      <motion.div className="dash-studio__glow" aria-hidden animate={{ opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 4, repeat: Infinity }} />
      <p className="dash-studio__eyebrow"><Sparkles className="w-4 h-4" /> Your training flow</p>
      <h3 className="dash-studio__title">From enrolment to placement-ready</h3>
      <p className="text-sm dash-card-meta mt-2 max-w-2xl">
        {focus === 'readiness'
          ? 'Career Readiness blends neuroscience mapping, structured training, and placement support in one timeline.'
          : 'AI Career Launchpad moves you through five practical sessions designed for job-ready outcomes.'}
      </p>
      <ol className="dash-studio-timeline">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.li
              key={s.title}
              className="dash-studio-timeline__item"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 260 }}
              whileHover={{ x: 6 }}
            >
              <span className="dash-studio-timeline__node"><Icon className="w-4 h-4" /></span>
              <div>
                <p className="font-bold text-theme-primary">{s.title}</p>
                <p className="text-sm dash-card-meta">{s.desc}</p>
              </div>
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
    <div className="dash-studio dash-studio--details">
      <div className="dash-studio-details__grid">
        <motion.div
          className="dash-studio-details__copy"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="dash-studio__eyebrow"><Sparkles className="w-4 h-4" /> Course blueprint</p>
          <h3 className="dash-studio__title">{block.title}</h3>
          <p className="text-sm dash-card-meta mt-3 leading-relaxed">{block.desc}</p>
          <p className="text-sm text-theme-primary mt-3 font-medium">
            {focus === 'readiness'
              ? 'Includes Brain Mapping, Skill Mapping, five live sessions, and end-to-end placement assistance.'
              : 'Five focused sessions covering branding, resume, AI job search, interviews, and corporate launch.'}
          </p>
          <ul className="dash-studio-perks mt-4">
            {block.perks.map((p, i) => (
              <motion.li key={p} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                {p}
              </motion.li>
            ))}
          </ul>
          <Link to={`/crp?tab=${focus}`} className="btn-primary mt-5 inline-flex items-center gap-2">
            Explore full program <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
        <motion.div
          className="dash-studio-details__visual"
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.02, rotate: 1 }}
        >
          <img src={block.img} alt="" className="dash-studio-details__img" />
          <motion.span className="dash-studio-details__orb" animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }} />
        </motion.div>
      </div>
    </div>
  );
}
