import { motion } from 'framer-motion';
import {
  AlertCircle,
  BookOpen,
  Briefcase,
  CalendarDays,
  FileText,
  Handshake,
  Linkedin,
  MessageCircle,
  Mic,
  Quote,
  Sparkles,
  Target,
} from 'lucide-react';

const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const problemIcons = [Target, Linkedin, Briefcase, FileText, MessageCircle];
const sessionIcons = [Sparkles, Linkedin, FileText, Mic, Handshake];
const outcomeIcons = [FileText, MessageCircle, Target, Briefcase, CalendarDays];

export default function CRPAudiencePanel({ audience, compact = false }) {
  if (!audience) return null;

  const sessionNumber = (item, index) => {
    const match = String(item).match(/Session\s+(\d+)/i);
    return match?.[1] || String(index + 1).padStart(2, '0');
  };
  const sessionText = (item) => String(item).replace(/^Session\s+\d+\s*[—-]\s*/i, '');

  return (
    <div className={compact ? 'crp-audience-studio' : 'crp-audience-panel space-y-8 max-w-4xl mx-auto text-left'}>
      {audience.quote && (
        <motion.blockquote
          {...fade}
          className={compact ? 'crp-audience-studio__quote' : 'crp-audience-quote relative pl-5 border-l-4 border-amber-500'}
        >
          <div className={compact ? 'crp-audience-studio__quote-main' : ''}>
            <Quote className="w-5 h-5 opacity-50" aria-hidden />
            <p className={compact ? 'crp-audience-studio__quote-text' : 'text-lg font-semibold text-theme-primary italic leading-relaxed'}>
              {audience.quote}
            </p>
          </div>
          {audience.tagline && <p className={compact ? 'crp-audience-studio__quote-tagline' : 'text-sm text-theme-muted mt-2'}>{audience.tagline}</p>}
        </motion.blockquote>
      )}

      <div className={compact ? 'crp-audience-studio__grid' : 'space-y-8'}>
        <motion.div {...fade} transition={{ delay: 0.05 }} className={compact ? 'crp-audience-studio__col crp-audience-studio__col--warn' : 'crp-audience-block'}>
          <h3 className={compact ? 'crp-audience-studio__title' : 'crp-audience-block__title'}>
            <AlertCircle className="w-4 h-4" />
            Everyday problems you face
          </h3>
          <ul className={compact ? 'crp-audience-studio__list' : 'space-y-2.5'}>
            {audience.problems?.map((item, index) => {
              const Icon = problemIcons[index % problemIcons.length];
              return (
                <li
                  key={item}
                  className={compact ? `crp-audience-studio__tone crp-audience-studio__tone--${(index % 5) + 1}` : undefined}
                >
                  {compact ? (
                    <span className="crp-audience-studio__item-icon" aria-hidden>
                      <Icon className="w-5 h-5" />
                    </span>
                  ) : null}
                  <span>{item}</span>
                </li>
              );
            })}
          </ul>
        </motion.div>

        <motion.div {...fade} transition={{ delay: 0.1 }} className={compact ? 'crp-audience-studio__col crp-audience-studio__col--learn' : 'crp-audience-block crp-audience-block--sessions'}>
          <h3 className={compact ? 'crp-audience-studio__title' : 'crp-audience-block__title'}>
            <BookOpen className="w-4 h-4" />
            What we cover in 5 sessions
          </h3>
          <ul className={compact ? 'crp-audience-studio__sessions' : 'space-y-2.5'}>
            {audience.sessionsCovered?.map((item, index) => {
              const Icon = sessionIcons[index % sessionIcons.length];
              const tone = (index % 5) + 1;
              return (
                <li
                  key={item}
                  className={compact ? `crp-audience-studio__tone crp-audience-studio__tone--${tone}` : undefined}
                >
                  <span className="crp-audience-studio__session-num">{sessionNumber(item, index)}</span>
                  <span className="crp-audience-studio__item-icon" aria-hidden>
                    <Icon className="w-5 h-5" />
                  </span>
                  <span>
                    <strong>Session {index + 1}</strong>
                    <span>{sessionText(item)}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </motion.div>

        <motion.div {...fade} transition={{ delay: 0.15 }} className={compact ? 'crp-audience-studio__col crp-audience-studio__col--win' : 'crp-audience-block crp-audience-block--outcomes'}>
          <h3 className={compact ? 'crp-audience-studio__title' : 'crp-audience-block__title'}>
            <Target className="w-4 h-4" />
            What you walk away with
          </h3>
          <ul className={compact ? 'crp-audience-studio__chips' : 'grid sm:grid-cols-2 gap-2.5'}>
            {audience.expectedOutcomes?.map((item, index) => {
              const Icon = outcomeIcons[index % outcomeIcons.length];
              return (
                <li
                  key={item}
                  className={
                    compact
                      ? `crp-audience-studio__tone crp-audience-studio__tone--${(index % 5) + 1}`
                      : 'crp-audience-outcome-card'
                  }
                >
                  {compact ? (
                    <span className="crp-audience-studio__item-icon" aria-hidden>
                      <Icon className="w-5 h-5" />
                    </span>
                  ) : null}
                  <span>{item}</span>
                </li>
              );
            })}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
