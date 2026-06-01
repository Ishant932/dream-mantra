import { motion } from 'framer-motion';
import { ArrowDown, CheckCircle2 } from 'lucide-react';

export default function CareerRoadmapFlow({ steps, title }) {
  if (!steps?.length) return null;

  return (
    <div className="infigon-card p-8 overflow-x-auto">
      <h2 className="font-display text-xl font-bold mb-2">Career Roadmap — {title}</h2>
      <p className="text-sm text-sand-500 mb-8">Step-by-step flowchart from school to your dream role</p>
      <div className="flex flex-col items-center min-w-[280px] max-w-2xl mx-auto">
        {steps.map((s, i) => (
          <div key={s.step} className="flex flex-col items-center w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="w-full relative"
            >
              <div className="flex gap-4 p-5 rounded-2xl border-2 border-amber-200 dark:border-amber-700 bg-gradient-to-r from-amber-50 to-[var(--bg-base)] dark:from-amber-900/20 dark:to-[#434d22] shadow-sm hover:shadow-md hover:border-amber-400 transition-all">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-amber-600 to-orange-500 text-amber-50 flex items-center justify-center font-bold text-lg shadow-lg">
                  {s.step}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-sand-900 dark:text-amber-50">{s.title}</h3>
                    {s.duration && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-medium">
                        {s.duration}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-sand-600 dark:text-sand-300 leading-relaxed">{s.description}</p>
                  {s.milestone && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {s.milestone}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
            {i < steps.length - 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 + 0.04 }}
                className="flex flex-col items-center py-2 text-amber-400"
              >
                <div className="w-0.5 h-6 bg-gradient-to-b from-amber-400 to-amber-600" />
                <ArrowDown className="w-5 h-5" />
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
