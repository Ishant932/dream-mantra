import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Sparkles, MessageCircle, Rocket, TrendingUp, Zap, ArrowRight } from 'lucide-react';

const nodes = [
  { x: '12%', y: '22%', delay: 0 },
  { x: '78%', y: '18%', delay: 0.4 },
  { x: '85%', y: '62%', delay: 0.8 },
  { x: '18%', y: '72%', delay: 1.2 },
  { x: '50%', y: '12%', delay: 0.6 },
  { x: '42%', y: '78%', delay: 1 },
];

const cards = [
  { icon: Brain, title: 'AI Career Matcher', desc: '10-question quiz → personalised paths', color: 'from-amber-500/20 to-orange-500/10' },
  { icon: TrendingUp, title: 'Stream Predictor', desc: 'PCM · PCB · Commerce · Arts insights', color: 'from-green-600/15 to-emerald-500/10' },
  { icon: Rocket, title: 'AI Career Launchpad', desc: '5 skill sprints to first job', color: 'from-orange-500/20 to-red-500/10' },
];

const typingLines = [
  'Analysing your strengths…',
  'Matching 950+ careers…',
  'Building your roadmap…',
];

export default function HomeAIShowcase() {
  return (
    <section className="home-ai-section relative py-20 lg:py-28 overflow-hidden">
      <div className="home-ai-mesh" aria-hidden />
      <div className="home-ai-grid" aria-hidden />
      {nodes.map((n) => (
        <motion.span
          key={`${n.x}-${n.y}`}
          className="home-ai-node"
          style={{ left: n.x, top: n.y }}
          animate={{ opacity: [0.25, 0.9, 0.25], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 3 + (n.delay % 2), repeat: Infinity, delay: n.delay }}
          aria-hidden
        />
      ))}
      <motion.div
        className="home-ai-scan"
        animate={{ top: ['10%', '90%', '10%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        aria-hidden
      />

      <div className="max-w-7xl mx-auto px-4 relative z-[1]">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="home-ai-badge inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-5">
              <Sparkles className="w-4 h-4" />
              AI-Powered Guidance
            </span>
            <h2 className="section-title mb-4">
              Meet <span className="gradient-text">Esh</span> — Your AI Career Partner
            </h2>
            <p className="text-secondary-theme text-lg leading-relaxed mb-8 max-w-lg">
              Stream advice, Mind Mapping insights, AI Career Launchpad, dashboard tools &amp; 950+ careers — all in one intelligent experience.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/signup" className="btn-primary">
                Start Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/marketplace" className="btn-outline">Explore Marketplace</Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="home-ai-console relative"
          >
            <div className="home-ai-console-header">
              <span className="home-ai-console-dot" />
              <span className="home-ai-console-dot" />
              <span className="home-ai-console-dot" />
              <span className="text-xs font-semibold ml-2 opacity-70">Esh · Live AI</span>
            </div>
            <div className="home-ai-console-body p-5 space-y-3">
              {typingLines.map((line, i) => (
                <motion.div
                  key={line}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.25 }}
                  className="home-ai-msg home-ai-msg-bot"
                >
                  <MessageCircle className="w-4 h-4 shrink-0 text-[var(--orange)]" />
                  <motion.span
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  >
                    {line}
                  </motion.span>
                </motion.div>
              ))}
              <motion.div
                className="home-ai-msg home-ai-msg-user"
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.9 }}
              >
                Which stream fits creative + analytical skills?
              </motion.div>
              <motion.div
                className="home-ai-msg home-ai-msg-bot home-ai-msg-highlight"
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1.1 }}
              >
                <Zap className="w-4 h-4 shrink-0 text-[var(--gold)]" />
                PCM + Design tech paths score 92% — book free counselling to confirm.
              </motion.div>
            </div>
          </motion.div>
        </div>

        <div className="grid sm:grid-cols-3 gap-5 mt-14">
          {cards.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className={`home-ai-card bg-gradient-to-br ${c.color}`}
            >
              <motion.span
                className="home-ai-card-icon"
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
              >
                <c.icon className="w-5 h-5" />
              </motion.span>
              <h3 className="font-bold text-sm mt-3">{c.title}</h3>
              <p className="text-xs text-secondary-theme mt-1">{c.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
