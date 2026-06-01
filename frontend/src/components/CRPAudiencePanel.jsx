import { motion } from 'framer-motion';
import { AlertCircle, BookOpen, Target, Quote } from 'lucide-react';

const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

export default function CRPAudiencePanel({ audience }) {
  if (!audience) return null;

  return (
    <div className="crp-audience-panel space-y-8 max-w-4xl mx-auto text-left">
      {audience.quote && (
        <motion.blockquote
          {...fade}
          className="crp-audience-quote relative pl-5 border-l-4 border-amber-500"
        >
          <Quote className="w-6 h-6 text-amber-500/60 absolute -left-1 -top-1" aria-hidden />
          <p className="text-lg font-semibold text-theme-primary italic leading-relaxed">{audience.quote}</p>
          {audience.tagline && <p className="text-sm text-theme-muted mt-2">{audience.tagline}</p>}
        </motion.blockquote>
      )}

      <motion.div {...fade} transition={{ delay: 0.05 }} className="crp-audience-block">
        <h3 className="crp-audience-block__title">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          Everyday problems you face
        </h3>
        <ul className="space-y-2.5">
          {audience.problems?.map((item, i) => (
            <motion.li
              key={item}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 + i * 0.05 }}
              className="crp-audience-list-item"
            >
              {item}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <motion.div {...fade} transition={{ delay: 0.1 }} className="crp-audience-block crp-audience-block--sessions">
        <h3 className="crp-audience-block__title">
          <BookOpen className="w-5 h-5 text-amber-600" />
          What we cover in 5 sessions
        </h3>
        <ul className="space-y-2.5">
          {audience.sessionsCovered?.map((item, i) => (
            <motion.li
              key={item}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 + i * 0.05 }}
              className="crp-audience-list-item crp-audience-list-item--session"
            >
              {item}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <motion.div {...fade} transition={{ delay: 0.15 }} className="crp-audience-block crp-audience-block--outcomes">
        <h3 className="crp-audience-block__title">
          <Target className="w-5 h-5 text-emerald-600" />
          What you walk away with
        </h3>
        <ul className="grid sm:grid-cols-2 gap-2.5">
          {audience.expectedOutcomes?.map((item, i) => (
            <motion.li
              key={item}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 + i * 0.05 }}
              whileHover={{ y: -3 }}
              className="crp-audience-outcome-card"
            >
              {item}
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
